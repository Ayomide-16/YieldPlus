import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const inputSchema = z.object({
  waterSource: z.string().min(1).max(100),
  farmSize: z.number().positive().max(100000),
  cropTypes: z.array(z.string().max(100)).max(50),
  irrigationMethod: z.string().min(1).max(100),
  location: z.object({
    country: z.string().max(100),
    state: z.string().max(100).optional(),
  }),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { waterSource, farmSize, cropTypes, irrigationMethod, location } = inputSchema.parse(requestBody);
    console.log('Analyzing water usage for:', { waterSource, farmSize, cropTypes, irrigationMethod, location });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Determine local currency based on location
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

    const systemPrompt = `You are an expert in agricultural water management with access to NASA POWER and NOAA NCEI climate data. Provide comprehensive, data-rich analysis with extensive usage breakdowns, savings projections, rain predictions, and chart data in JSON format. Always cite reputable sources and include climate-based irrigation recommendations. Use ${currency} for all cost calculations.`;

    const userPrompt = `Analyze water usage for the following farm conditions and provide optimization recommendations:
    
    Water Source: ${waterSource}
    Farm Size: ${farmSize} hectares
    Crop Types: ${cropTypes.join(', ')}
    Current Irrigation Method: ${irrigationMethod}
    Location: ${location?.country}, ${location?.state || ''}
    Currency: ${currency}
    
    Provide comprehensive analysis in JSON format with these exact keys (use ${currency} for all costs):
    {
      "summary": "Brief overview including current weather and rain predictions",
      "currentUsage": {"estimatedDaily": "X liters", "estimatedMonthly": "X liters", "estimatedYearly": "X liters", "efficiency": "75%", "costPerMonth": "$500", "wastePercentage": "25%"},
      "usageBreakdown": [{"category": "Irrigation", "percentage": 65, "liters": "X liters"}],
      "rainPredictions": {
        "next24Hours": {"probability": "High/Medium/Low", "expectedAmount": "X mm", "recommendation": "Skip irrigation / Reduce by 50% / Proceed as planned"},
        "next7Days": [{"day": "Monday", "probability": "80%", "amount": "15mm", "irrigationAdvice": "Skip irrigation"}],
        "next30Days": {"totalExpected": "X mm", "averagePerWeek": "X mm", "irrigationAdjustment": "Reduce by X%"}
      },
      "climateBasedSchedule": [
        {"date": "2025-01-20", "action": "Skip irrigation - rain expected in 2 hours (15mm)", "source": "NASA POWER"},
        {"date": "2025-01-21", "action": "Reduce irrigation by 50% - heavy rain yesterday", "source": "NOAA NCEI"}
      ],
      "optimizationStrategies": [{"name": "Strategy", "savings": "30%", "description": "Details", "implementation": "Steps", "cost": "$200", "roi": "6 months", "priority": "High"}],
      "irrigationSchedule": [{"crop": "Crop", "frequency": "3x/week", "timing": "6AM-8AM", "duration": "2hrs", "waterAmount": "500L", "season": "All year"}],
      "monthlyProjection": [{"month": "Jan", "currentUsage": 50000, "optimizedUsage": 35000, "savings": 15000, "expectedRainfall": "120mm"}, {"month": "Feb", "currentUsage": 48000, "optimizedUsage": 34000, "savings": 14000, "expectedRainfall": "100mm"}],
      "weatherIntegration": "Real-time weather and rainfall integration recommendations based on NASA POWER and NOAA NCEI data",
      "systemUpgrades": [{"upgrade": "Drip irrigation", "benefit": "40% savings", "cost": "$1000", "paybackPeriod": "8 months"}],
      "waterQuality": {"assessment": "Good", "suitability": "High", "treatmentNeeded": "No", "recommendations": "None"},
      "recommendations": "Additional advice with climate considerations",
      "dataSources": [
        {"name": "NASA POWER", "url": "https://power.larc.nasa.gov/"},
        {"name": "NOAA NCEI", "url": "https://www.ncei.noaa.gov/"},
        {"name": "FAO", "url": "http://www.fao.org/"}
      ]
    }
    
    Provide data for all 12 months in monthlyProjection for charts. Include specific rain predictions and irrigation recommendations based on weather forecasts. Cite reputable sources.`;

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
    console.log('Water analysis completed successfully');

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-water function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
