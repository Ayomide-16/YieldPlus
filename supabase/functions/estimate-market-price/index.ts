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
    const { cropType, expectedYield, location, harvestDate } = await req.json();
    console.log('Estimating market prices for:', { cropType, expectedYield, location, harvestDate });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert agricultural economist. Provide comprehensive, data-rich market analysis with extensive historical data, forecasts, profitability analysis, and chart data in JSON format. If the crop type is invalid or doesn't exist, return an error message with suggestions.`;

    const userPrompt = `Estimate market prices and provide selling strategy for:
    
    Crop Type: ${cropType}
    Expected Yield: ${expectedYield} kg
    Location: ${location.country}, ${location.state}, ${location.localGovernment}
    Expected Harvest Date: ${harvestDate}
    
    IMPORTANT: First, verify if "${cropType}" is a valid, real crop. If it's not a real crop or you're unsure about it, return ONLY this structure:
    {
      "error": "The crop '${cropType}' is not recognized as a valid agricultural crop. Please enter a valid crop name such as: Maize, Rice, Wheat, Cassava, Yam, Soybeans, Tomatoes, etc."
    }
    
    If it IS a valid crop, provide comprehensive analysis in JSON format with these exact keys:
    {
      "summary": "Brief market overview",
      "priceEstimate": {"lowPrice": "₦X/kg", "averagePrice": "₦X/kg", "highPrice": "₦X/kg", "forecastAccuracy": "85%", "totalRevenue": "₦X", "pricePerTon": "₦X/ton"},
      "historicalPrices": [{"month": "Jan", "price": 450, "demand": 75}, {"month": "Feb", "price": 480, "demand": 80}],
      "marketTrends": [{"factor": "Factor", "impact": "Impact analysis", "trend": "Upward", "confidence": "High"}],
      "demandAnalysis": {"currentDemand": "High", "seasonalPattern": "Pattern", "competitionLevel": "Medium", "supplyGap": "Analysis"},
      "priceForecast": [{"period": "Next Month", "estimatedPrice": "₦X/kg", "confidence": "85%"}],
      "sellingStrategy": "Comprehensive strategy",
      "marketChannels": [{"channel": "Local Market", "priceRange": "₦X-Y/kg", "volume": "X tons", "paymentTerms": "Terms", "recommendation": "High"}],
      "riskFactors": [{"risk": "Risk", "probability": "Medium", "impact": "High", "mitigation": "Strategy"}],
      "profitabilityAnalysis": {"grossRevenue": "₦X", "estimatedCosts": "₦X", "netProfit": "₦X", "profitMargin": "X%", "breakEvenPoint": "X kg"}
    }
    
    Provide data for all 12 months in historicalPrices for charts.`;

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
    console.error('Error in estimate-market-price function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
