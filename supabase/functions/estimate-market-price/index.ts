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

    const systemPrompt = `You are an expert agricultural economist with access to FAO, World Bank, national agricultural market data, and climate data from NASA POWER and NOAA NCEI. Provide comprehensive, data-rich market analysis with extensive historical data, forecasts, seasonal climate context, profitability analysis, and chart data in JSON format. Always cite reputable sources. If the crop type is invalid or doesn't exist, return an error message with suggestions. Use ${currency} for all price calculations.`;

    const userPrompt = `Estimate market prices and provide selling strategy for:
    
    Crop Type: ${cropType}
    ${expectedYield ? `Expected Yield: ${expectedYield} ${yieldUnit}` : `Farm Size: ${farmSize} hectares (auto-predict yield based on average productivity)`}
    Location: ${location.country}, ${location.state}, ${location.localGovernment}
    Expected Harvest Date: ${harvestDate}
    Currency: ${currency}
    
    IMPORTANT: First, verify if "${cropType}" is a valid, real crop. If it's not a real crop or you're unsure about it, return ONLY this structure:
    {
      "error": "The crop '${cropType}' is not recognized as a valid agricultural crop. Please enter a valid crop name such as: Maize, Rice, Wheat, Cassava, Yam, Soybeans, Tomatoes, etc."
    }
    
    If it IS a valid crop, provide comprehensive analysis in JSON format (use ${currency} for all prices) with these exact keys:
    {
      "summary": "Brief market overview with seasonal climate context",
      "priceEstimate": {"lowPrice": "₦X/kg", "averagePrice": "₦X/kg", "highPrice": "₦X/kg", "forecastAccuracy": "85%", "totalRevenue": "₦X", "pricePerTon": "₦X/ton"},
      "historicalPrices": [{"month": "Jan", "price": 450, "demand": 75}, {"month": "Feb", "price": 480, "demand": 80}],
      "marketTrends": [{"factor": "Factor", "impact": "Impact analysis", "trend": "Upward", "confidence": "High"}],
      "demandAnalysis": {"currentDemand": "High", "seasonalPattern": "Pattern", "competitionLevel": "Medium", "supplyGap": "Analysis"},
      "seasonalClimateImpact": {
        "harvestSeasonWeather": "Weather conditions during harvest period based on NASA POWER data",
        "storageConditions": "Climate-based storage recommendations",
        "transportRecommendations": "Climate considerations for transport timing"
      },
      "priceForecast": [{"period": "Next Month", "estimatedPrice": "₦X/kg", "confidence": "85%", "climateFactors": "Climate impacts on price"}],
      "sellingStrategy": "Comprehensive strategy with optimal selling timing based on climate and market data",
      "marketChannels": [{"channel": "Local Market", "priceRange": "₦X-Y/kg", "volume": "X tons", "paymentTerms": "Terms", "recommendation": "High"}],
      "riskFactors": [{"risk": "Risk", "probability": "Medium", "impact": "High", "mitigation": "Strategy"}],
      "profitabilityAnalysis": {"grossRevenue": "₦X", "estimatedCosts": "₦X", "netProfit": "₦X", "profitMargin": "X%", "breakEvenPoint": "X kg"},
      "dataSources": [
        {"name": "FAO", "url": "http://www.fao.org/"},
        {"name": "World Bank", "url": "https://www.worldbank.org/"},
        {"name": "NASA POWER", "url": "https://power.larc.nasa.gov/"},
        {"name": "NOAA NCEI", "url": "https://www.ncei.noaa.gov/"}
      ]
    }
    
    Provide data for all 12 months in historicalPrices for charts. Include seasonal climate context and cite reputable sources.`;

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