// Harvest Advisory Edge Function
// Provides intelligent harvest timing and selling strategy recommendations

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Harvest maturity indicators per crop
const HARVEST_INDICATORS: Record<string, { days: number; signs: string[] }> = {
    'maize': {
        days: 90,
        signs: [
            'Husks turn dry and brown',
            'Kernels dent when pressed',
            'Milk line moved to kernel base',
            'Grain moisture around 25-30%',
        ],
    },
    'rice': {
        days: 120,
        signs: [
            'Grains turn golden yellow',
            '80% of panicles have matured',
            'Straw starts turning yellow',
            'Grain moisture around 20-25%',
        ],
    },
    'tomato': {
        days: 75,
        signs: [
            'Fruits turn fully red',
            'Firm but slightly soft to press',
            'Easy separation from vine',
            'Uniform color on entire fruit',
        ],
    },
    'pepper': {
        days: 90,
        signs: [
            'Full color development (red/yellow)',
            'Fruits are firm and glossy',
            'Easy snap from plant',
            'Seeds inside are mature',
        ],
    },
    'cassava': {
        days: 270,
        signs: [
            'Leaves turn yellow and fall',
            'Stems become woody',
            'Tuber skin cracks when pressed',
            'Starch content test (iodine)',
        ],
    },
    'yam': {
        days: 240,
        signs: [
            'Vines turn yellow and dry',
            'Tubers feel firm when touched',
            'Skin is thick and brown',
            'No more active growth visible',
        ],
    },
    'default': {
        days: 90,
        signs: [
            'Crop shows physical maturity signs',
            'Growth has stopped',
            'Optimal moisture content reached',
        ],
    },
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Verify user
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            throw new Error('Unauthorized');
        }

        const body = await req.json();
        const { farm_id, user_observations } = body;

        if (!farm_id) {
            throw new Error('farm_id is required');
        }

        // Fetch farm data
        const { data: farm, error: farmError } = await supabase
            .from('active_farms')
            .select('*')
            .eq('id', farm_id)
            .eq('user_id', user.id)
            .single();

        if (farmError || !farm) {
            throw new Error('Farm not found');
        }

        // Calculate days since planting
        const today = new Date();
        const plantingDate = new Date(farm.planting_date);
        const daysSincePlanting = Math.floor(
            (today.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Get crop-specific indicators
        const cropInfo = HARVEST_INDICATORS[farm.crop.toLowerCase()] || HARVEST_INDICATORS['default'];
        const expectedHarvestDay = cropInfo.days;
        const daysToExpectedHarvest = expectedHarvestDay - daysSincePlanting;

        // Fetch weather forecast
        let weatherData = null;
        try {
            const weatherResponse = await fetch(`${supabaseUrl}/functions/v1/fetch-weather-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({
                    state: farm.location.state,
                    lga: farm.location.lga,
                }),
            });

            const result = await weatherResponse.json();
            if (result.success) {
                weatherData = result.data;
            }
        } catch (e) {
            console.warn('Weather fetch failed:', e);
        }

        // Fetch market prices
        const { data: marketPrices } = await supabase
            .from('market_price_history')
            .select('*')
            .eq('crop_name', farm.crop.toLowerCase())
            .eq('state', farm.location.state)
            .order('price_date', { ascending: false })
            .limit(30);

        // Calculate price trends
        let currentPrice = 0;
        let avgPrice = 0;
        let priceTrend = 'stable';
        let priceChange = 0;

        if (marketPrices && marketPrices.length > 0) {
            currentPrice = marketPrices[0].price;
            avgPrice = marketPrices.reduce((sum, p) => sum + p.price, 0) / marketPrices.length;

            if (marketPrices.length >= 7) {
                const recentAvg = marketPrices.slice(0, 7).reduce((sum, p) => sum + p.price, 0) / 7;
                const olderAvg = marketPrices.slice(-7).reduce((sum, p) => sum + p.price, 0) / Math.min(7, marketPrices.length);
                priceChange = ((recentAvg - olderAvg) / olderAvg) * 100;
                priceTrend = priceChange > 5 ? 'rising' : priceChange < -5 ? 'falling' : 'stable';
            }
        }

        // Determine harvest readiness
        let biologicalMaturity: 'not_ready' | 'approaching' | 'ready' | 'overdue' = 'not_ready';
        let harvestUrgency: 'low' | 'medium' | 'high' = 'low';

        if (daysToExpectedHarvest <= 0) {
            biologicalMaturity = daysSincePlanting > expectedHarvestDay + 14 ? 'overdue' : 'ready';
            harvestUrgency = biologicalMaturity === 'overdue' ? 'high' : 'medium';
        } else if (daysToExpectedHarvest <= 14) {
            biologicalMaturity = 'approaching';
            harvestUrgency = 'medium';
        }

        // Get AI-powered advisory
        let aiAdvisory = null;
        if (geminiApiKey) {
            const prompt = `
Provide harvest advisory for a Nigerian farmer:

FARM DETAILS:
- Crop: ${farm.crop}${farm.crop_variety ? ` (${farm.crop_variety})` : ''}
- Location: ${farm.location.state}, Nigeria
- Days since planting: ${daysSincePlanting}
- Expected harvest day: ${expectedHarvestDay}
- Current stage: ${farm.current_growth_stage}
- Farm size: ${farm.farm_size} ${farm.size_unit}
- Expected yield: ${farm.expected_yield || 'unknown'} kg

MATURITY INDICATORS FOR ${farm.crop.toUpperCase()}:
${cropInfo.signs.map((s, i) => `${i + 1}. ${s}`).join('\n')}

${user_observations ? `USER OBSERVATIONS: ${user_observations}` : ''}

WEATHER FORECAST (next 7 days):
${weatherData?.forecast ? weatherData.forecast.slice(0, 7).map((d: any) =>
                `${d.date}: ${d.conditions}, Rain: ${d.rainfallProbability}%`
            ).join('\n') : 'Not available'}

MARKET DATA:
- Current price: ₦${currentPrice}/kg
- Average price (30 days): ₦${avgPrice.toFixed(0)}/kg
- Price trend: ${priceTrend} (${priceChange > 0 ? '+' : ''}${priceChange.toFixed(1)}%)

Generate a JSON response:
{
  "harvestRecommendation": "harvest_now" | "wait" | "monitor",
  "harvestWindow": {
    "optimalStartDate": "YYYY-MM-DD",
    "optimalEndDate": "YYYY-MM-DD"
  },
  "reasoning": "Brief explanation of harvest timing recommendation",
  "weatherAlert": "Any weather concerns for harvesting" | null,
  "sellingStrategy": {
    "recommendation": "sell_immediately" | "store_short" | "store_medium",
    "reasoning": "Why this strategy",
    "expectedPrice": number,
    "optimalSaleWindow": "Description of best time to sell"
  },
  "profitProjection": {
    "immediateSellingRevenue": number,
    "storedSellingRevenue": number,
    "storageCostEstimate": number,
    "recommendation": "Brief recommendation"
  },
  "postHarvestTips": ["tip1", "tip2", "tip3"],
  "warnings": ["Any critical warnings"]
}`;

            try {
                const geminiResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ role: 'user', parts: [{ text: prompt }] }],
                            generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
                        }),
                    }
                );

                if (geminiResponse.ok) {
                    const geminiData = await geminiResponse.json();
                    let text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

                    try {
                        aiAdvisory = JSON.parse(text);
                    } catch {
                        console.warn('Failed to parse AI response');
                    }
                }
            } catch (e) {
                console.error('AI advisory failed:', e);
            }
        }

        // Build response
        const response = {
            farmId: farm_id,
            crop: farm.crop,
            daysSincePlanting,
            expectedHarvestDay,
            daysToExpectedHarvest,

            harvestReadiness: {
                biologicalMaturity,
                confidence: biologicalMaturity === 'ready' ? 0.85 : 0.7,
                indicators: {
                    expected: cropInfo.signs,
                    observed: user_observations || 'Not provided - check maturity indicators',
                    assessment: biologicalMaturity === 'ready'
                        ? 'Crop appears ready for harvest based on timeline'
                        : biologicalMaturity === 'approaching'
                            ? 'Monitor closely - harvest approaching'
                            : biologicalMaturity === 'overdue'
                                ? 'Harvest may be overdue - check immediately'
                                : 'Continue monitoring - not yet ready',
                },
            },

            harvestTiming: {
                recommendation: aiAdvisory?.harvestRecommendation ||
                    (biologicalMaturity === 'ready' || biologicalMaturity === 'overdue' ? 'harvest_now' : 'wait'),
                optimalWindow: aiAdvisory?.harvestWindow || {
                    startDate: farm.expected_harvest_date ||
                        new Date(plantingDate.getTime() + expectedHarvestDay * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    endDate: new Date(plantingDate.getTime() + (expectedHarvestDay + 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                },
                urgency: harvestUrgency,
                weatherConsiderations: aiAdvisory?.weatherAlert ||
                    (weatherData?.forecast?.some((d: any) => d.rainfallProbability > 60)
                        ? 'Rain expected - plan harvest around dry days'
                        : 'Weather looks favorable for harvesting'),
                reasoning: aiAdvisory?.reasoning ||
                    `Based on ${daysSincePlanting} days since planting and typical ${farm.crop} harvest timeline.`,
            },

            sellingStrategy: aiAdvisory?.sellingStrategy || {
                recommendation: priceTrend === 'rising' ? 'store_short' : 'sell_immediately',
                reasoning: priceTrend === 'rising'
                    ? 'Prices are rising - consider short-term storage for better returns'
                    : 'Current prices are favorable - sell soon after harvest',
                currentPrice,
                historicalAverage: avgPrice,
                percentageDifference: ((currentPrice - avgPrice) / avgPrice * 100).toFixed(1),
                trend: priceTrend,
            },

            profitProjection: aiAdvisory?.profitProjection || {
                expectedYield: farm.expected_yield || farm.farm_size * 2000,
                currentPriceRevenue: (farm.expected_yield || farm.farm_size * 2000) * currentPrice,
                notes: 'Actual results may vary based on harvest quality and market conditions',
            },

            postHarvestTips: aiAdvisory?.postHarvestTips || [
                'Dry produce to optimal moisture content before storage',
                'Sort by quality grades for better pricing',
                'Store in clean, ventilated facility',
                'Consider value-addition for higher returns',
            ],

            warnings: aiAdvisory?.warnings || [],

            generatedAt: new Date().toISOString(),
        };

        return new Response(
            JSON.stringify({
                success: true,
                data: response,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error) {
        console.error('Harvest advisory error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
