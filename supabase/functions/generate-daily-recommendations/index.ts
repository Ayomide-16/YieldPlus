// Generate Daily Recommendations Edge Function
// Runs daily for each active farm to generate contextual recommendations

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Crop growth stages configuration
const CROP_STAGES: Record<string, { name: string; startDay: number; endDay: number }[]> = {
    'maize': [
        { name: 'germination', startDay: 0, endDay: 7 },
        { name: 'seedling', startDay: 8, endDay: 21 },
        { name: 'vegetative', startDay: 22, endDay: 50 },
        { name: 'tasseling', startDay: 51, endDay: 60 },
        { name: 'silking', startDay: 61, endDay: 70 },
        { name: 'grain_filling', startDay: 71, endDay: 85 },
        { name: 'maturation', startDay: 86, endDay: 95 },
    ],
    'rice': [
        { name: 'germination', startDay: 0, endDay: 10 },
        { name: 'seedling', startDay: 11, endDay: 25 },
        { name: 'tillering', startDay: 26, endDay: 50 },
        { name: 'stem_elongation', startDay: 51, endDay: 70 },
        { name: 'booting', startDay: 71, endDay: 85 },
        { name: 'heading', startDay: 86, endDay: 95 },
        { name: 'ripening', startDay: 96, endDay: 120 },
    ],
    'tomato': [
        { name: 'germination', startDay: 0, endDay: 10 },
        { name: 'seedling', startDay: 11, endDay: 25 },
        { name: 'vegetative', startDay: 26, endDay: 40 },
        { name: 'flowering', startDay: 41, endDay: 55 },
        { name: 'fruiting', startDay: 56, endDay: 70 },
        { name: 'ripening', startDay: 71, endDay: 85 },
    ],
    'default': [
        { name: 'germination', startDay: 0, endDay: 10 },
        { name: 'vegetative', startDay: 11, endDay: 45 },
        { name: 'reproductive', startDay: 46, endDay: 75 },
        { name: 'maturation', startDay: 76, endDay: 100 },
    ],
};

function getCurrentStage(crop: string, daysSincePlanting: number): string {
    const stages = CROP_STAGES[crop.toLowerCase()] || CROP_STAGES['default'];

    for (const stage of stages) {
        if (daysSincePlanting >= stage.startDay && daysSincePlanting <= stage.endDay) {
            return stage.name;
        }
    }

    // If beyond all stages, return last stage
    return stages[stages.length - 1].name;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

        const supabase = createClient(supabaseUrl, supabaseKey);

        const body = await req.json();
        const { farm_id } = body;

        if (!farm_id) {
            throw new Error('farm_id is required');
        }

        // Fetch farm data
        const { data: farm, error: farmError } = await supabase
            .from('active_farms')
            .select('*')
            .eq('id', farm_id)
            .eq('status', 'active')
            .single();

        if (farmError || !farm) {
            throw new Error('Farm not found or not active');
        }

        // Calculate days since planting
        const today = new Date();
        const plantingDate = new Date(farm.planting_date);
        const daysSincePlanting = Math.floor(
            (today.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Determine current growth stage
        const currentStage = getCurrentStage(farm.crop, daysSincePlanting);

        // Fetch weather data (call our weather function or get from cache)
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
                    lat: farm.location.lat,
                    lon: farm.location.lon,
                }),
            });

            const weatherResult = await weatherResponse.json();
            if (weatherResult.success) {
                weatherData = weatherResult.data;
            }
        } catch (e) {
            console.warn('Failed to fetch weather:', e);
        }

        // Fetch recent activities
        const { data: recentActivities } = await supabase
            .from('farm_activities')
            .select('*')
            .eq('farm_id', farm_id)
            .order('activity_date', { ascending: false })
            .limit(10);

        // Fetch recent feedback
        const { data: recentFeedback } = await supabase
            .from('farm_feedback')
            .select('*')
            .eq('farm_id', farm_id)
            .order('created_at', { ascending: false })
            .limit(5);

        // Fetch farm plan
        const { data: farmPlan } = await supabase
            .from('comprehensive_plans')
            .select('plan_content')
            .eq('id', farm.plan_id)
            .single();

        // Build context for AI
        const farmContext = {
            farm_name: farm.farm_name,
            location: farm.location,
            farm_size: farm.farm_size,
            size_unit: farm.size_unit,
            crop: farm.crop,
            crop_variety: farm.crop_variety,
            planting_date: farm.planting_date,
            days_since_planting: daysSincePlanting,
            current_stage: currentStage,
            expected_harvest_date: farm.expected_harvest_date,
            water_access: farm.water_access,
            irrigation_method: farm.irrigation_method,
            soil_profile: farm.soil_profile,
            budget: farm.budget,
            budget_spent: farm.budget_spent,
        };

        // Calculate days to harvest
        const harvestDate = new Date(farm.expected_harvest_date);
        const daysToHarvest = Math.floor(
            (harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Generate recommendations using Gemini
        if (!geminiApiKey) {
            throw new Error('Gemini API key not configured');
        }

        const systemPrompt = `You are an intelligent farm advisor providing daily contextual guidance.
You have access to LIVE weather data - use it exactly as provided, do not modify.
Base all recommendations on the specific farm situation and current conditions.
Focus on actionable, practical advice for Nigerian farmers.
Costs should be in Nigerian Naira (₦).`;

        const userPrompt = `Generate today's farm briefing and recommendations.

FARM CONTEXT:
${JSON.stringify(farmContext, null, 2)}

WEATHER DATA (LIVE - DO NOT MODIFY):
${weatherData ? JSON.stringify(weatherData, null, 2) : 'Weather data unavailable'}

RECENT ACTIVITIES (Last 10):
${JSON.stringify(recentActivities || [], null, 2)}

RECENT FEEDBACK:
${JSON.stringify(recentFeedback || [], null, 2)}

FARM PLAN REFERENCE:
${farmPlan ? JSON.stringify(farmPlan.plan_content, null, 2) : 'No plan available'}

TODAY'S DATE: ${today.toISOString().split('T')[0]}
DAYS SINCE PLANTING: ${daysSincePlanting}
CURRENT STAGE: ${currentStage}
DAYS TO HARVEST: ${daysToHarvest}

Generate a JSON response with this exact structure:
{
  "briefing": "2-3 sentence summary of farm status and today's focus",
  "recommendations": [
    {
      "id": "unique-id",
      "type": "irrigation" | "fertilization" | "inspection" | "pest_treatment" | "weeding" | "other",
      "priority": "critical" | "high" | "normal" | "low",
      "action": "Specific action in simple language",
      "reasoning": "Why this is needed now (reference specific data)",
      "resources": ["list of materials needed"],
      "estimatedCost": 0,
      "estimatedTime": "X hours"
    }
  ],
  "farmStatus": {
    "isOnTrack": true,
    "statusSummary": "Brief assessment",
    "concerns": ["Any issues to watch"],
    "positives": ["What's going well"]
  },
  "nextMilestone": {
    "milestone": "Next significant event",
    "expectedDate": "YYYY-MM-DD",
    "daysAway": 0
  }
}

IMPORTANT:
- If no actions are needed today, return empty recommendations array
- Maximum 5 recommendations
- Prioritize truly critical actions
- Reference the live weather data provided
- Consider what activities have already been done recently`;

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
                        maxOutputTokens: 4096,
                    },
                }),
            }
        );

        if (!geminiResponse.ok) {
            throw new Error('Failed to generate recommendations from AI');
        }

        const geminiData = await geminiResponse.json();
        let responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Clean JSON response
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let recommendations;
        try {
            recommendations = JSON.parse(responseText);
        } catch {
            // Fallback if parsing fails
            recommendations = {
                briefing: `Your ${farm.crop} farm is on day ${daysSincePlanting}. Monitor conditions and follow your plan.`,
                recommendations: [],
                farmStatus: {
                    isOnTrack: true,
                    statusSummary: 'Unable to generate detailed assessment',
                    concerns: [],
                    positives: [],
                },
                nextMilestone: {
                    milestone: 'Harvest',
                    expectedDate: farm.expected_harvest_date,
                    daysAway: daysToHarvest,
                },
            };
        }

        // Ensure recommendation IDs
        if (recommendations.recommendations) {
            recommendations.recommendations = recommendations.recommendations.map((rec: any, idx: number) => ({
                ...rec,
                id: rec.id || crypto.randomUUID(),
            }));
        }

        // Save to database
        const recommendationDate = today.toISOString().split('T')[0];

        const { data: savedRec, error: saveError } = await supabase
            .from('daily_recommendations')
            .upsert({
                farm_id,
                recommendation_date: recommendationDate,
                days_since_planting: daysSincePlanting,
                current_stage: currentStage,
                briefing: recommendations.briefing,
                recommendations: recommendations.recommendations || [],
                weather_data: weatherData || {},
                farm_status: recommendations.farmStatus || {},
                user_viewed: false,
            }, {
                onConflict: 'farm_id,recommendation_date',
            })
            .select()
            .single();

        if (saveError) {
            console.error('Failed to save recommendations:', saveError);
        }

        // Update farm's current stage
        await supabase
            .from('active_farms')
            .update({
                current_growth_stage: currentStage,
                last_activity: new Date().toISOString(),
            })
            .eq('id', farm_id);

        return new Response(
            JSON.stringify({
                success: true,
                data: {
                    ...recommendations,
                    weatherData,
                    daysSincePlanting,
                    currentStage,
                    daysToHarvest,
                },
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
