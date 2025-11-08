import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FertilizerAnalysisSchema = z.object({
  cropType: z.string().min(1).max(50).regex(/^[a-zA-Z\s-]+$/, 'Only letters, spaces and hyphens allowed'),
  farmSize: z.number().min(0.1).max(10000),
  plantingMonth: z.string().min(1).max(20),
  location: z.object({
    country: z.string().min(1).max(100),
    state: z.string().max(100).optional(),
    localGovernment: z.string().max(100).optional()
  }),
  soilData: z.object({
    pH: z.number().min(0).max(14).optional(),
    nitrogen: z.number().min(0).optional(),
    phosphorus: z.number().min(0).optional(),
    potassium: z.number().min(0).optional(),
    organicMatter: z.number().min(0).max(100).optional()
  }).optional()
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
    const validatedData = FertilizerAnalysisSchema.parse(body);
    const { cropType, farmSize, plantingMonth, location, soilData } = validatedData;
    
    console.log('Analyzing fertilizer needs for:', { cropType, farmSize, plantingMonth, location, soilData, userId: user.id });

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

    const systemPrompt = `You are an expert agricultural scientist specializing in soil fertility and fertilizer management in Africa.
    Provide region-specific, cost-effective fertilizer recommendations based on crop requirements, soil test data, and local availability.
    Always cite reputable sources like FAO, IFDC, AGRA, and national agricultural research institutes. Use ${currency} for all cost calculations.`;

    const userPrompt = `Create a comprehensive fertilizer plan for ${cropType} cultivation.
    Farm details:
    - Size: ${farmSize} hectares
    - Planting month: ${plantingMonth}
    - Location: ${JSON.stringify(location)}
    ${soilData && (soilData.pH || soilData.nitrogen || soilData.phosphorus || soilData.potassium || soilData.organicMatter) ? 
      `- Soil Test Results:
        ${soilData.pH ? `  pH: ${soilData.pH}` : ''}
        ${soilData.nitrogen ? `  Nitrogen: ${soilData.nitrogen} ppm` : ''}
        ${soilData.phosphorus ? `  Phosphorus: ${soilData.phosphorus} ppm` : ''}
        ${soilData.potassium ? `  Potassium: ${soilData.potassium} ppm` : ''}
        ${soilData.organicMatter ? `  Organic Matter: ${soilData.organicMatter}%` : ''}` : ''}
    - Currency: ${currency}
    
    ${soilData && (soilData.pH || soilData.nitrogen) ? 
      'IMPORTANT: Use the provided soil test data to adjust fertilizer recommendations. If nutrients are already high, reduce recommended amounts accordingly.' : 
      'Note: No soil test data provided. Base recommendations on typical requirements for this crop and region.'}
    
    You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanations outside the JSON structure.
    
    Provide fertilizer recommendations in this exact JSON format (use ${currency} for all costs):
    {
      "cropNutrientRequirements": {
        "nitrogen": "Amount in kg/ha",
        "phosphorus": "Amount in kg/ha",
        "potassium": "Amount in kg/ha",
        "secondary": ["Calcium", "Magnesium", "Sulfur"],
        "micronutrients": ["Zinc", "Boron", "Iron"]
      },
      "fertilizerPlan": {
        "basalApplication": {
          "timing": "Before planting or at planting",
          "fertilizers": [
            {
              "type": "NPK 15-15-15 or local equivalent",
              "quantity": "kg per hectare",
              "totalQuantity": "kg for entire farm",
              "applicationMethod": "Broadcasting or band placement",
              "cost": "Estimated cost in local currency"
            }
          ]
        },
        "topDressing": [
          {
            "timing": "Number of weeks after planting",
            "cropStage": "Vegetative/Flowering/Fruiting stage",
            "fertilizers": [
              {
                "type": "Urea or CAN",
                "quantity": "kg per hectare",
                "totalQuantity": "kg for entire farm",
                "applicationMethod": "Side dressing or foliar spray",
                "cost": "Estimated cost in local currency"
              }
            ]
          }
        ]
      },
      "organicAlternatives": {
        "compost": {
          "quantity": "tons per hectare",
          "applicationTiming": "Before planting",
          "benefits": "Improves soil structure and provides nutrients"
        },
        "animalManure": {
          "type": "Poultry/Cattle/Goat manure",
          "quantity": "tons per hectare",
          "preparationMethod": "Composting process",
          "applicationTiming": "2-4 weeks before planting"
        },
        "greenManure": {
          "crops": ["Legumes like cowpea, mucuna"],
          "benefits": "Nitrogen fixation and soil improvement"
        },
        "bioFertilizers": ["Rhizobium inoculants", "Mycorrhizae"]
      },
      "costAnalysis": {
        "inorganicFertilizers": {
          "totalCost": "Total cost in local currency",
          "costPerHectare": "Cost per hectare"
        },
        "organicFertilizers": {
          "totalCost": "Total cost in local currency",
          "costPerHectare": "Cost per hectare"
        },
        "hybrid": {
          "description": "Combination of organic and inorganic",
          "totalCost": "Total cost in local currency",
          "costPerHectare": "Cost per hectare"
        }
      },
      "applicationGuidelines": {
        "soilTesting": "Importance of soil testing before application",
        "weatherConditions": "Apply during cool hours or before rain",
        "safetyPrecautions": ["Wear protective gear", "Store safely away from food"],
        "storage": "Keep in cool, dry place away from moisture"
      },
      "yieldProjection": {
        "withOptimalFertilization": "Expected yield in tons/ha",
        "withoutFertilization": "Expected yield in tons/ha",
        "yieldIncrease": "Percentage increase"
      },
      "regionalConsiderations": {
        "localAvailability": "Commonly available fertilizers in the region",
        "suppliers": "Where to purchase (agricultural stores, cooperatives)",
        "seasonalFactors": "Rainy season vs dry season considerations",
        "governmentSubsidies": "Available government support programs"
      },
      "resources": [
        {
          "title": "Resource title",
          "source": "FAO/IFDC/AGRA/National extension service",
          "url": "URL to resource",
          "type": "guide/manual/video"
        }
      ]
    }
    
    Focus on:
    - Cost-effective solutions for smallholder farmers
    - Locally available fertilizers and materials
    - Organic and inorganic options
    - Region-specific recommendations
    - Maximum yield with minimum cost`;

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
    let analysis = data.choices[0].message.content;
    
    // Clean up the response to ensure valid JSON
    analysis = analysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Validate JSON
    try {
      JSON.parse(analysis);
      console.log('Fertilizer analysis completed successfully');
    } catch (parseError) {
      console.error('Invalid JSON in response:', analysis);
      throw new Error('AI returned invalid JSON format');
    }

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
    console.error('Error in analyze-fertilizer function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});