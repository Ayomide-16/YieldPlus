import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CropAnalysisSchema = z.object({
  location: z.object({
    country: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    localGovernment: z.string().min(1).max(100)
  }),
  soilType: z.string().min(1).max(50),
  cropType: z.string().min(1).max(50).regex(/^[a-zA-Z\s-]+$/, 'Only letters, spaces and hyphens allowed'),
  farmSize: z.number().min(0.1).max(10000)
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
    const validatedData = CropAnalysisSchema.parse(body);
    const { location, soilType, cropType, farmSize } = validatedData;
    
    console.log('Analyzing crop conditions for:', { location, soilType, cropType, farmSize, userId: user.id });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert agricultural AI assistant with access to data from FAO, CGIAR, national agricultural departments, NASA POWER, and NOAA NCEI. Analyze crop suitability and provide comprehensive, data-rich recommendations with cited sources.
  
  Return your response as a valid JSON object with this EXACT structure:
  {
    "recommendedCrops": [
      {"name": "Crop Name", "suitability": 85, "season": "Season", "plantingWindow": "Month-Month", "harvestWindow": "Month-Month", "waterRequirement": "Low/Medium/High", "expectedYield": "X tons/hectare", "marketDemand": 75, "profitPotential": 80}
    ],
    "yieldPotential": {
      "expectedYield": "X tons",
      "averageYieldPerAcre": "X tons/acre",
      "confidenceLevel": "High/Medium/Low",
      "historicalYield": "X tons/year",
      "optimisticYield": "X tons",
      "conservativeYield": "X tons"
    },
    "climateAnalysis": "Detailed climate analysis with NASA POWER and NOAA NCEI data - rainfall patterns, temperature ranges, and seasonal considerations for the specific location",
    "monthlyData": [
      {"month": "Jan", "rainfall": 120, "temperature": 28, "idealForPlanting": true}
    ],
    "climateRecommendations": [
      {"recommendation": "Time-based climate recommendation with specific dates", "source": "NASA POWER", "confidence": "High"}
    ],
    "soilHealthScore": 85,
    "recommendations": [
      {"category": "Soil Preparation", "priority": "High", "action": "Detailed action", "timeframe": "Immediate/Short-term/Long-term", "costEstimate": "Low/Medium/High"}
    ],
    "pestRiskAnalysis": [
      {"pest": "Pest name", "risk": "High/Medium/Low", "preventiveMeasures": "Detailed measures"}
    ],
    "dataSources": [
      {"name": "FAO", "url": "http://www.fao.org/"},
      {"name": "CGIAR", "url": "https://www.cgiar.org/"},
      {"name": "NASA POWER", "url": "https://power.larc.nasa.gov/"},
      {"name": "NOAA NCEI", "url": "https://www.ncei.noaa.gov/"}
    ],
    "error": null
  }
  
  If the crop type provided is invalid or doesn't exist, include an "error" field with a helpful message and suggestions for valid crops.
  
  Provide extensive, actionable data with at least 3-5 recommended crops, detailed monthly climate data (all 12 months), climate-based recommendations, and comprehensive recommendations citing reputable agricultural sources.`;

    const userPrompt = `Analyze the following farm conditions and provide detailed crop planning recommendations with climate research for the specific location:
    
    Location: ${location.country}, ${location.state}, ${location.localGovernment}
    Soil Type: ${soilType}
    Desired Crop: ${cropType}
    Farm Size: ${farmSize} hectares
    
    First, research the climate conditions for this specific location (${location.localGovernment}, ${location.state}, ${location.country}).
    
    IMPORTANT: First check if "${cropType}" is a valid agricultural crop. If it's not valid or doesn't exist, return a JSON with an "error" field explaining this.
    
    Provide detailed recommendations in JSON format with these exact keys:
    {
      "error": "Include this ONLY if the crop is invalid/doesn't exist, explaining why and suggesting valid alternatives",
      "recommendedCrops": [
        {
          "name": "crop name",
          "suitability": 90,
          "season": "Early Spring to Late Fall",
          "plantingWindow": "Early Spring or Late Fall - 30 days after starting",
          "harvestWindow": "Early Spring or Late Fall - 25-35 days after starting"
        }
      ],
      "yieldPotential": {
        "expectedYield": "1800 bushels",
        "averageYieldPerAcre": "600 bushels",
        "confidenceLevel": "85%"
      },
      "climateAnalysis": "detailed climate analysis for the location",
      "soilSuitability": "analysis of soil compatibility",
      "plantingSchedule": "optimal planting timeline",
      "careInstructions": "maintenance and care guidelines",
      "riskFactors": "potential challenges and risks",
      "profitability": "expected profitability analysis"
    }
    
    Include at least 3 recommended crops with realistic suitability scores (70-95%).`;

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
    console.log('Analysis completed successfully');

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
    console.error('Error in analyze-crop function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});