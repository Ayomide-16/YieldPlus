import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { waterSource, farmSize, cropTypes, irrigationMethod } = await req.json();
    console.log('Analyzing water usage for:', { waterSource, farmSize, cropTypes, irrigationMethod });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert in agricultural water management. Provide comprehensive, data-rich analysis with extensive usage breakdowns, savings projections, and chart data in JSON format.`;

    const userPrompt = `Analyze water usage for the following farm conditions and provide optimization recommendations:
    
    Water Source: ${waterSource}
    Farm Size: ${farmSize} hectares
    Crop Types: ${cropTypes.join(', ')}
    Current Irrigation Method: ${irrigationMethod}
    
    Provide comprehensive analysis in JSON format with these exact keys:
    {
      "summary": "Brief overview",
      "currentUsage": {"estimatedDaily": "X liters", "estimatedMonthly": "X liters", "estimatedYearly": "X liters", "efficiency": "75%", "costPerMonth": "$500", "wastePercentage": "25%"},
      "usageBreakdown": [{"category": "Irrigation", "percentage": 65, "liters": "X liters"}],
      "optimizationStrategies": [{"name": "Strategy", "savings": "30%", "description": "Details", "implementation": "Steps", "cost": "$200", "roi": "6 months", "priority": "High"}],
      "irrigationSchedule": [{"crop": "Crop", "frequency": "3x/week", "timing": "6AM-8AM", "duration": "2hrs", "waterAmount": "500L", "season": "All year"}],
      "monthlyProjection": [{"month": "Jan", "currentUsage": 50000, "optimizedUsage": 35000, "savings": 15000}, {"month": "Feb", "currentUsage": 48000, "optimizedUsage": 34000, "savings": 14000}],
      "weatherIntegration": "Adjust based on rainfall",
      "systemUpgrades": [{"upgrade": "Drip irrigation", "benefit": "40% savings", "cost": "$1000", "paybackPeriod": "8 months"}],
      "waterQuality": {"assessment": "Good", "suitability": "High", "treatmentNeeded": "No", "recommendations": "None"},
      "recommendations": "Additional advice"
    }
    
    Provide data for all 12 months in monthlyProjection for charts.`;

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
