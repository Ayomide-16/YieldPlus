// Initialize Farm Session Edge Function
// Creates an active farm record and generates the initial plan

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const FarmInputSchema = z.object({
    farm_name: z.string().min(1),
    location: z.object({
        country: z.string(),
        state: z.string(),
        lga: z.string().optional(),
        lat: z.number().optional(),
        lon: z.number().optional(),
    }),
    farm_size: z.number().positive(),
    size_unit: z.string().default('hectares'),
    crop: z.string(),
    crop_variety: z.string().optional(),
    water_access: z.enum(['none', 'well', 'borehole', 'river', 'municipal', 'rainwater']),
    irrigation_method: z.enum(['none', 'drip', 'sprinkler', 'flood', 'manual']),
    planting_date: z.string(),
    soil_profile: z.object({
        type: z.string(),
        color: z.string().optional(),
        texture: z.string().optional(),
        pH: z.number().optional(),
        healthScore: z.number().optional(),
        nutrients: z.object({
            nitrogen: z.number().optional(),
            phosphorus: z.number().optional(),
            potassium: z.number().optional(),
            organicMatter: z.number().optional(),
        }).optional(),
    }).optional(),
    budget: z.number().optional(),
    notes: z.string().optional(),
    weather_data: z.object({
        current: z.any(),
        forecast: z.array(z.any()),
        climate: z.any().optional(),
    }),
    market_data: z.object({
        current_price: z.number().optional(),
        historical_prices: z.array(z.any()).optional(),
    }).optional(),
});

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Get authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Verify user
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            throw new Error('Unauthorized');
        }

        // Parse and validate input
        const body = await req.json();
        const input = FarmInputSchema.parse(body);

        // Calculate expected harvest date based on crop
        const cropDurations: Record<string, number> = {
            'maize': 90,
            'rice': 120,
            'tomato': 75,
            'pepper': 90,
            'cassava': 270,
            'yam': 240,
            'groundnut': 120,
            'beans': 90,
            'soybean': 100,
            'sorghum': 110,
            'millet': 90,
            'wheat': 120,
            'cowpea': 70,
            'default': 90,
        };

        const duration = cropDurations[input.crop.toLowerCase()] || cropDurations['default'];
        const plantingDate = new Date(input.planting_date);
        const expectedHarvestDate = new Date(plantingDate);
        expectedHarvestDate.setDate(expectedHarvestDate.getDate() + duration);

        // Create the active farm record
        const { data: farm, error: farmError } = await supabase
            .from('active_farms')
            .insert({
                user_id: user.id,
                farm_name: input.farm_name,
                location: input.location,
                farm_size: input.farm_size,
                size_unit: input.size_unit,
                crop: input.crop,
                crop_variety: input.crop_variety,
                water_access: input.water_access,
                irrigation_method: input.irrigation_method,
                planting_date: input.planting_date,
                expected_harvest_date: expectedHarvestDate.toISOString().split('T')[0],
                current_growth_stage: 'pre-planting',
                soil_profile: input.soil_profile,
                budget: input.budget,
                notes: input.notes,
                status: 'active',
            })
            .select()
            .single();

        if (farmError) {
            throw new Error(`Failed to create farm: ${farmError.message}`);
        }

        // Generate comprehensive plan using Gemini
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
        if (!geminiApiKey) {
            throw new Error('Gemini API key not configured');
        }

        const systemPrompt = `You are an expert agricultural consultant creating a comprehensive farm plan.
You have access to LIVE weather and climate data - DO NOT modify or estimate these values.
Focus on practical, actionable recommendations specific to the farmer's situation.
All costs should be in Nigerian Naira (₦).`;

        const userPrompt = `Create a comprehensive farm plan for:

FARM DETAILS:
- Farm Name: ${input.farm_name}
- Location: ${input.location.state}, ${input.location.lga || 'Nigeria'}
- Farm Size: ${input.farm_size} ${input.size_unit}
- Crop: ${input.crop}${input.crop_variety ? ` (${input.crop_variety})` : ''}
- Planting Date: ${input.planting_date}
- Expected Harvest: ${expectedHarvestDate.toISOString().split('T')[0]}
- Water Access: ${input.water_access}
- Irrigation: ${input.irrigation_method}
${input.soil_profile ? `- Soil: ${input.soil_profile.type}, pH: ${input.soil_profile.pH || 'unknown'}` : ''}
${input.budget ? `- Budget: ₦${input.budget.toLocaleString()}` : ''}

WEATHER DATA (LIVE - DO NOT MODIFY):
Current: ${JSON.stringify(input.weather_data.current)}
7-Day Forecast: ${JSON.stringify(input.weather_data.forecast)}
${input.weather_data.climate ? `Climate Patterns: ${JSON.stringify(input.weather_data.climate)}` : ''}

${input.market_data?.current_price ? `MARKET DATA: Current price ₦${input.market_data.current_price}/kg` : ''}

Generate a JSON response with this structure:
{
  "executive_summary": {
    "overview": "Brief overview of the farm plan",
    "total_investment": number,
    "expected_revenue": number,
    "expected_profit": number,
    "roi_percentage": number,
    "key_success_factors": ["factor1", "factor2"],
    "main_risks": ["risk1", "risk2"]
  },
  "growth_stages": [
    {
      "stage_name": "Pre-planting",
      "duration_days": 14,
      "start_day": 0,
      "end_day": 14,
      "key_activities": ["activity1", "activity2"],
      "indicators": ["indicator1"]
    }
  ],
  "irrigation_schedule": {
    "frequency": "every 3 days",
    "amount_per_hectare": "liters per application",
    "notes": "Adjust based on rainfall"
  },
  "fertilization_schedule": [
    {
      "application": "Basal",
      "day": 0,
      "type": "NPK 15-15-15",
      "quantity_per_hectare": "50 kg",
      "method": "broadcasting",
      "cost_estimate": 15000
    }
  ],
  "pest_prevention": [
    {
      "pest_name": "Stem borer",
      "risk_period": "Week 4-8",
      "prevention": "Regular inspection",
      "treatment_if_detected": "Apply appropriate pesticide"
    }
  ],
  "harvest_guidance": {
    "maturity_indicators": ["indicator1", "indicator2"],
    "optimal_conditions": "Clear weather, low humidity",
    "post_harvest": "Dry within 48 hours"
  },
  "financial_projection": {
    "costs": {
      "seeds": number,
      "fertilizers": number,
      "pesticides": number,
      "labor": number,
      "irrigation": number,
      "miscellaneous": number,
      "total": number
    },
    "revenue": {
      "expected_yield_kg": number,
      "price_per_kg": number,
      "total": number
    }
  },
  "weekly_tasks": [
    {
      "week": 1,
      "tasks": ["task1", "task2"],
      "observations": ["what to look for"]
    }
  ]
}`;

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 8192,
                    },
                }),
            }
        );

        if (!geminiResponse.ok) {
            throw new Error('Failed to generate plan from AI');
        }

        const geminiData = await geminiResponse.json();
        let planText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Clean JSON response
        planText = planText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let plan;
        try {
            plan = JSON.parse(planText);
        } catch {
            throw new Error('Failed to parse AI response');
        }

        // Save the plan to comprehensive_plans
        const { data: savedPlan, error: planError } = await supabase
            .from('comprehensive_plans')
            .insert({
                user_id: user.id,
                farm_id: farm.id,
                farm_data: {
                    ...input,
                    expected_harvest_date: expectedHarvestDate.toISOString().split('T')[0],
                },
                plan_content: plan,
                climate_data: input.weather_data.climate,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (planError) {
            console.error('Failed to save plan:', planError);
        }

        // Update farm with plan reference
        if (savedPlan) {
            await supabase
                .from('active_farms')
                .update({
                    plan_id: savedPlan.id,
                    expected_yield: plan.financial_projection?.revenue?.expected_yield_kg,
                    expected_revenue: plan.financial_projection?.revenue?.total,
                })
                .eq('id', farm.id);
        }

        // Generate initial recommendations for today
        const today = new Date();
        const daysSincePlanting = Math.floor(
            (today.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const initialRecommendations = [];

        // If planting date is today or in the future
        if (daysSincePlanting <= 0) {
            initialRecommendations.push({
                id: crypto.randomUUID(),
                type: 'planting',
                priority: daysSincePlanting === 0 ? 'critical' : 'normal',
                action: `Prepare for planting ${input.crop} on ${input.planting_date}`,
                reasoning: 'Ensure all inputs (seeds, fertilizers) are ready before planting date.',
                resources: ['Seeds', 'NPK fertilizer for basal application', 'Planting tools'],
                estimatedCost: plan.financial_projection?.costs?.seeds || 0,
            });
        }

        // Save initial daily recommendation
        await supabase
            .from('daily_recommendations')
            .insert({
                farm_id: farm.id,
                recommendation_date: today.toISOString().split('T')[0],
                days_since_planting: Math.max(0, daysSincePlanting),
                current_stage: 'pre-planting',
                briefing: `Your ${input.crop} farm is set up! Review your plan and prepare for the upcoming planting date.`,
                recommendations: initialRecommendations,
                weather_data: input.weather_data,
                farm_status: {
                    isOnTrack: true,
                    statusSummary: 'Farm successfully created and plan generated.',
                    concerns: [],
                    positives: ['Comprehensive plan created', 'Weather data integrated'],
                },
            });

        return new Response(
            JSON.stringify({
                success: true,
                data: {
                    farm: {
                        ...farm,
                        expected_harvest_date: expectedHarvestDate.toISOString().split('T')[0],
                    },
                    plan,
                    initialRecommendations,
                },
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error) {
        console.error('Error:', error);
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
