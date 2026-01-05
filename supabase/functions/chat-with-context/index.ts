// Chat with Context Edge Function
// Provides AI-powered chat with farm-specific context

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

        if (!geminiApiKey) {
            throw new Error('Gemini API key not configured');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Verify user if auth header present
        let userId = null;
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const { data: { user } } = await supabase.auth.getUser(token);
            userId = user?.id;
        }

        const body = await req.json();
        const { message, farm_id, farm_context } = body;

        if (!message) {
            throw new Error('Message is required');
        }

        // Build comprehensive context if farm_id provided
        let fullContext = '';
        let farmData = null;

        if (farm_id) {
            // Fetch farm data
            const { data: farm } = await supabase
                .from('active_farms')
                .select('*')
                .eq('id', farm_id)
                .single();

            if (farm) {
                farmData = farm;
                const plantingDate = new Date(farm.planting_date);
                const today = new Date();
                const daysSincePlanting = Math.floor(
                    (today.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                const harvestDate = farm.expected_harvest_date ? new Date(farm.expected_harvest_date) : null;
                const daysToHarvest = harvestDate
                    ? Math.floor((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                // Fetch recent weather
                const { data: weatherCache } = await supabase
                    .from('weather_cache')
                    .select('weather_data')
                    .eq('location_key', `ng_${farm.location.state.toLowerCase().replace(/\s+/g, '_')}_${(farm.location.lga || 'default').toLowerCase().replace(/\s+/g, '_')}`)
                    .eq('weather_type', 'current_and_forecast')
                    .single();

                // Fetch recent activities
                const { data: recentActivities } = await supabase
                    .from('farm_activities')
                    .select('*')
                    .eq('farm_id', farm_id)
                    .order('activity_date', { ascending: false })
                    .limit(5);

                // Fetch market prices
                const { data: marketPrices } = await supabase
                    .from('market_price_history')
                    .select('*')
                    .eq('crop_name', farm.crop.toLowerCase())
                    .eq('state', farm.location.state)
                    .order('price_date', { ascending: false })
                    .limit(5);

                fullContext = `
FARM DETAILS:
- Farm Name: ${farm.farm_name}
- Location: ${farm.location.state}${farm.location.lga ? `, ${farm.location.lga}` : ''}, Nigeria
- Farm Size: ${farm.farm_size} ${farm.size_unit}
- Crop: ${farm.crop}${farm.crop_variety ? ` (${farm.crop_variety})` : ''}
- Planting Date: ${farm.planting_date} (Day ${daysSincePlanting} since planting)
- Current Growth Stage: ${farm.current_growth_stage}
${farm.expected_harvest_date ? `- Expected Harvest: ${farm.expected_harvest_date} (${daysToHarvest} days remaining)` : ''}
- Water Access: ${farm.water_access}
- Irrigation: ${farm.irrigation_method}
${farm.soil_profile ? `- Soil: ${farm.soil_profile.type || 'Unknown'}${farm.soil_profile.pH ? `, pH ${farm.soil_profile.pH}` : ''}` : ''}
${farm.budget ? `- Budget: ₦${farm.budget.toLocaleString()} (Spent: ₦${(farm.budget_spent || 0).toLocaleString()})` : ''}

${weatherCache?.weather_data ? `
CURRENT WEATHER (Live Data):
- Temperature: ${weatherCache.weather_data.current?.temperature?.toFixed(1)}°C
- Conditions: ${weatherCache.weather_data.current?.conditions}
- Humidity: ${weatherCache.weather_data.current?.humidity}%
- Forecast: ${weatherCache.weather_data.forecast?.slice(0, 3).map((d: any) =>
                    `${new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}: ${d.conditions}, ${d.rainfallProbability > 40 ? d.rainfallProbability + '% rain' : 'No rain'}`
                ).join('; ')}
` : ''}

${recentActivities?.length ? `
RECENT ACTIVITIES:
${recentActivities.map(a => `- ${a.activity_date}: ${a.activity_type} (${a.status})`).join('\n')}
` : ''}

${marketPrices?.length ? `
CURRENT MARKET PRICE:
- ${farm.crop}: ₦${marketPrices[0].price} per ${marketPrices[0].unit} (as of ${marketPrices[0].price_date})
` : ''}`;
            }
        } else if (farm_context) {
            fullContext = farm_context;
        }

        // Build prompt
        const systemPrompt = `You are an expert agricultural advisor for Nigerian farmers.
Your role is to provide helpful, practical farming advice.

CRITICAL RULES:
1. Base your answers on the provided farm context when available
2. Give specific, actionable advice
3. Consider local Nigerian conditions and resources
4. Use simple language that farmers can understand
5. Mention costs in Nigerian Naira (₦) when relevant
6. If you don't have enough information, ask clarifying questions
7. For weather or market-related questions, use the provided live data
8. Keep responses concise but comprehensive

${fullContext}`;

        const userPrompt = `Farmer's Question: ${message}

Provide a helpful, practical response based on the farm context above.`;

        // Call Gemini API
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
                        maxOutputTokens: 2048,
                    },
                }),
            }
        );

        if (!geminiResponse.ok) {
            throw new Error('Failed to get response from AI');
        }

        const geminiData = await geminiResponse.json();
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I apologize, but I couldn't generate a response. Please try again.";

        // Save to chat history if user authenticated
        if (userId && farm_id) {
            await supabase.from('chat_history').insert({
                user_id: userId,
                farm_id: farm_id,
                message: message,
                response: responseText,
                farm_context: farmData ? { farm: farmData } : null,
            });
        }

        return new Response(
            JSON.stringify({
                success: true,
                response: responseText,
                farmContext: farmData ? {
                    name: farmData.farm_name,
                    crop: farmData.crop,
                    stage: farmData.current_growth_stage,
                } : null,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error) {
        console.error('Chat error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                response: "I'm sorry, I'm having trouble processing your question right now. Please try again.",
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Return 200 to handle gracefully in frontend
            }
        );
    }
});
