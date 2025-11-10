import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MarketPriceSchema = z.object({
  cropType: z.string().min(1).max(50).regex(/^[a-zA-Z\s-]+$/, 'Only letters, spaces and hyphens allowed'),
  expectedYield: z.number().min(0).optional(),
  yieldUnit: z.string().max(20).optional(),
  farmSize: z.number().min(0.1).max(10000),
  location: z.object({
    country: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    localGovernment: z.string().min(1).max(100)
  }),
  harvestDate: z.string()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Input validation
    const body = await req.json();
    const validatedData = MarketPriceSchema.parse(body);
    const { cropType, expectedYield, yieldUnit, farmSize, location, harvestDate } = validatedData;
    
    console.log('Estimating market prices for:', { cropType, expectedYield, yieldUnit, farmSize, location, harvestDate, userId: user.id });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Determine local currency
    const currencyMap: Record<string, string> = {
      'Nigeria': '₦',
      'Kenya': 'KSh',
      'Ghana': '₵',
      'South Africa': 'R',
      'Tanzania': 'TSh',
      'Uganda': 'USh',
      'Ethiopia': 'Br',
      'default': '$'
    };
    const currency = currencyMap[location?.country] || currencyMap.default;

    const systemPrompt = `You are an expert agricultural economist and market analyst with deep expertise in price forecasting and trend analysis. You have access to FAO, World Bank, national agricultural market databases, and climate data from NASA POWER and NOAA NCEI.

**Your Role**: Provide PREDICTIVE market intelligence and strategic guidance, not just historical data reporting.

**Core Principles**:
1. ANALYZE trends and patterns in historical data to make forward-looking predictions
2. IDENTIFY seasonal cycles, supply-demand dynamics, and market forces
3. SYNTHESIZE multiple data sources (local historical + global market trends + climate factors)
4. PROVIDE actionable insights and strategic recommendations
5. EXPLAIN your reasoning and confidence levels

**Critical**: This is a DECISION-SUPPORT tool. Farmers need guidance on optimal selling strategies based on predicted future prices, not just current/past prices. Use ${currency} for all price calculations.

If the crop type is invalid, return an error with suggestions for valid crops.`;

    // Query historical price data - fuzzy search for related crop varieties
    console.log('Querying historical market prices...');
    const { data: historicalData, error: dbError } = await supabase
      .from('market_prices')
      .select('date, state, lga, food_item, uprice, sector, outlet_type')
      .ilike('food_item', `%${cropType}%`)
      .eq('state', location.state)
      .order('date', { ascending: false })
      .limit(2000);

    if (dbError) {
      console.error('Error fetching historical data:', dbError);
    }

    // Group data by food_item varieties and calculate trends
    const varietiesFound = historicalData ? [...new Set(historicalData.map(r => r.food_item))] : [];
    const pricesByDate = historicalData ? historicalData.reduce((acc, record) => {
      const dateKey = record.date;
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(record.uprice);
      return acc;
    }, {} as Record<string, number[]>) : {};

    const historicalContext = historicalData && historicalData.length > 0
      ? `\n\n**HISTORICAL MARKET DATA FOR ANALYSIS** (${historicalData.length} records):
      
**Crop Varieties Found**: ${varietiesFound.join(', ')}

**Recent Price Samples** (last 20 records for ${cropType} in ${location.state}):
${historicalData.slice(0, 20).map(record => 
  `- ${record.date}: ${currency}${record.uprice}/kg (${record.food_item}) in ${record.lga} - ${record.outlet_type}`
).join('\n')}

**Statistical Analysis**:
- Latest Recorded Price: ${currency}${historicalData[0]?.uprice || 'N/A'}/kg (${historicalData[0]?.date})
- Average Price (recent 100 records): ${currency}${(historicalData.slice(0, 100).reduce((sum, r) => sum + r.uprice, 0) / Math.min(100, historicalData.length)).toFixed(2)}/kg
- Minimum Price: ${currency}${Math.min(...historicalData.map(r => r.uprice))}/kg
- Maximum Price: ${currency}${Math.max(...historicalData.map(r => r.uprice))}/kg
- LGAs with data: ${[...new Set(historicalData.map(r => r.lga))].slice(0, 10).join(', ')}

**YOUR TASK**: 
1. Analyze the TRENDS in this historical data (not just the last price)
2. Identify seasonal patterns and price movements over time
3. Consider the different varieties found (${varietiesFound.join(', ')})
4. Make INTELLIGENT PREDICTIONS based on:
   - Historical price trends and patterns
   - Seasonal factors affecting the harvest date (${harvestDate})
   - Current market conditions and online data sources
   - Supply and demand dynamics
5. Provide FORWARD-LOOKING insights, not just historical data copy-paste
6. If you see price increases/decreases over time, explain why and predict future movements

**CRITICAL**: This is a GUIDANCE tool. Users need predictive analysis and recommendations, not just historical data regurgitation.`
      : '\n\n**Note**: No historical price data found in database for this crop and location. Use general market knowledge and online sources to provide predictions.';

    const userPrompt = `**MARKET ANALYSIS REQUEST**:
    
**Crop Details**:
- Crop Type: ${cropType}
- ${expectedYield ? `Expected Yield: ${expectedYield} ${yieldUnit}` : `Farm Size: ${farmSize} hectares`}
- Location: ${location.country}, ${location.state}, ${location.localGovernment}
- Expected Harvest Date: ${harvestDate}
- Currency: ${currency}

${historicalContext}

**ANALYSIS REQUIREMENTS**:

1. **Crop Validation**: First verify if "${cropType}" is a valid agricultural crop. If NOT valid, return:
   {
     "error": "The crop '${cropType}' is not recognized. Valid examples: Maize, Rice, Beans, Cassava, Yam, Soybeans, Tomatoes, etc."
   }

2. **Trend Analysis** (if valid crop):
   - Review ALL crop varieties found in the historical data
   - Identify price trends over time (increasing, decreasing, stable, seasonal)
   - Calculate growth rates and seasonal patterns
   - Compare different market outlets and sectors

3. **Predictive Modeling**:
   - Forecast prices for the harvest date based on:
     * Historical seasonal patterns
     * Recent price movements and momentum
     * Supply-demand dynamics
     * Climate and weather factors
     * Market channel differences
   - Provide confidence intervals for predictions

4. **Strategic Recommendations**:
   - Optimal selling timing (immediate vs. storage)
   - Best market channels for maximum revenue
   - Risk mitigation strategies
   - Price negotiation insights

**OUTPUT FORMAT**: Comprehensive JSON analysis with these exact keys:
{
  "summary": "Predictive market overview with trend analysis",
  "priceEstimate": {
    "lowPrice": "${currency}X/kg", 
    "averagePrice": "${currency}X/kg", 
    "highPrice": "${currency}X/kg",
    "forecastAccuracy": "85%",
    "totalRevenue": "${currency}X",
    "pricePerTon": "${currency}X/ton",
    "trendDirection": "Increasing/Decreasing/Stable",
    "confidenceLevel": "High/Medium/Low"
  },
  "historicalPrices": [{"month": "Jan", "price": 450, "demand": 75}, ...12 months],
  "marketTrends": [{"factor": "Factor", "impact": "Impact analysis", "trend": "Upward/Downward", "confidence": "High"}],
  "demandAnalysis": {"currentDemand": "High", "seasonalPattern": "Pattern", "competitionLevel": "Medium", "supplyGap": "Analysis"},
  "seasonalClimateImpact": {
    "harvestSeasonWeather": "Weather predictions for harvest period",
    "storageConditions": "Climate-based storage recommendations",
    "transportRecommendations": "Timing considerations"
  },
  "priceForecast": [{"period": "Next Month", "estimatedPrice": "${currency}X/kg", "confidence": "85%", "climateFactors": "Impact analysis"}],
  "sellingStrategy": "Comprehensive strategy with optimal timing and rationale",
  "marketChannels": [{"channel": "Channel name", "priceRange": "${currency}X-Y/kg", "volume": "X tons", "paymentTerms": "Terms", "recommendation": "High/Medium/Low"}],
  "riskFactors": [{"risk": "Risk description", "probability": "High/Medium/Low", "impact": "High/Medium/Low", "mitigation": "Strategy"}],
  "profitabilityAnalysis": {"grossRevenue": "${currency}X", "estimatedCosts": "${currency}X", "netProfit": "${currency}X", "profitMargin": "X%", "breakEvenPoint": "X kg"},
  "dataSources": [{"name": "Source", "url": "URL"}]
}

**Remember**: Provide PREDICTIVE insights based on trend analysis, not just copy-paste of last known prices.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    console.log('Market price estimation completed successfully');

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.error('Error in estimate-market-price function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});