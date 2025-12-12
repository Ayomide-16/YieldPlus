import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ClimateDataSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  startDate: z.string().optional(),
  endDate: z.string().optional()
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
    const validatedData = ClimateDataSchema.parse(body);
    const { latitude, longitude, startDate, endDate } = validatedData;

    console.log('Fetching climate data for:', { latitude, longitude, startDate, endDate, userId: user.id });

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Get current date for context
    const now = new Date();
    const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days ahead

    const systemPrompt = `You are an agricultural climate analyst with access to NASA POWER and NOAA NCEI data. 
    Provide accurate climate predictions and recommendations based on historical patterns and current trends.
    Always cite data sources in your responses.`;

    const userPrompt = `Analyze climate data for agricultural planning at coordinates ${latitude}, ${longitude}.
    
    Provide comprehensive climate analysis in JSON format:
    {
      "currentConditions": {
        "temperature": {"avg": number, "min": number, "max": number, "unit": "°C"},
        "precipitation": {"amount": number, "probability": number, "unit": "mm"},
        "humidity": {"avg": number, "unit": "%"},
        "windSpeed": {"avg": number, "unit": "km/h"},
        "solarRadiation": {"avg": number, "unit": "MJ/m²/day"}
      },
      "forecast": {
        "next7Days": [
          {
            "date": "YYYY-MM-DD",
            "temperature": {"min": number, "max": number},
            "precipitation": {"probability": number, "amount": number},
            "conditions": "description"
          }
        ],
        "next30Days": {
          "temperatureTrend": "increasing/decreasing/stable",
          "rainfallExpectation": "above-average/average/below-average",
          "extremeWeatherRisk": "low/medium/high"
        }
      },
      "historicalContext": {
        "averageTemperature": number,
        "averageRainfall": number,
        "seasonalPattern": "description"
      },
      "agriculturalRecommendations": {
        "irrigationNeeded": boolean,
        "irrigationTiming": "description",
        "plantingWindow": {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"},
        "riskFactors": ["factor1", "factor2"],
        "opportunities": ["opportunity1", "opportunity2"]
      },
      "dataSources": [
        {"name": "NASA POWER", "url": "https://power.larc.nasa.gov/"},
        {"name": "NOAA NCEI", "url": "https://www.ncei.noaa.gov/"}
      ]
    }
    
    Base predictions on realistic weather patterns for the given location and season.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const climateData = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
    console.log('Climate data retrieved successfully');

    return new Response(JSON.stringify({ climateData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.error('Error in get-climate-data function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});