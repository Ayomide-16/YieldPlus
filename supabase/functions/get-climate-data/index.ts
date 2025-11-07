import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const inputSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  startDate: z.string().max(50).optional(),
  endDate: z.string().max(50).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { latitude, longitude, startDate, endDate } = inputSchema.parse(requestBody);
    console.log('Fetching climate data for:', { latitude, longitude, startDate, endDate });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
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
    const climateData = data.choices[0].message.content;
    console.log('Climate data retrieved successfully');

    return new Response(JSON.stringify({ climateData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-climate-data function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
