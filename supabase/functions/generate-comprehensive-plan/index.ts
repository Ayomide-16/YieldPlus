import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const inputSchema = z.object({
  farmData: z.object({
    farm_name: z.string().max(200).optional(),
    location: z.any(),
    total_size: z.number().positive().max(100000).optional(),
    farmSize: z.number().positive().max(100000).optional(),
    soil_type: z.string().max(100).optional(),
    soilType: z.string().max(100).optional(),
    cropType: z.string().max(100).optional(),
    water_source: z.string().max(100).optional(),
    irrigation_method: z.string().max(100).optional(),
    crops: z.array(z.string().max(100)).optional(),
  }),
  preferredPlantingDate: z.string().max(50).optional(),
  climateData: z.any().optional(),
  includeSections: z.array(z.string()).max(20).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { 
      farmData, 
      preferredPlantingDate, 
      climateData,
      includeSections 
    } = inputSchema.parse(requestBody);
    
    console.log('Generating comprehensive farm plan for:', farmData.farm_name);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert agricultural consultant providing comprehensive farm planning.
    Use real agricultural research data and cite reputable sources like FAO, CGIAR, national agricultural departments.
    Consider climate data, soil conditions, market trends, and local farming practices.`;

    const userPrompt = `Create a comprehensive farm plan with these details:
    
    Farm: ${farmData.farm_name}
    Location: ${JSON.stringify(farmData.location)}
    Size: ${farmData.total_size} hectares
    Soil: ${farmData.soil_type}
    Water Source: ${farmData.water_source}
    Irrigation: ${farmData.irrigation_method}
    Crops: ${farmData.crops?.join(', ')}
    Preferred Planting Date: ${preferredPlantingDate}
    
    Climate Data: ${JSON.stringify(climateData)}
    
    Include sections: ${JSON.stringify(includeSections)}
    
    Provide comprehensive plan in JSON format:
    {
      "executiveSummary": {
        "overview": "Brief overview",
        "keyRecommendations": ["recommendation1", "recommendation2"],
        "expectedOutcomes": {
          "yield": "Expected yield",
          "revenue": "Revenue projection",
          "roi": "Return on investment"
        }
      },
      "climaticAnalysis": {
        "currentConditions": "Summary of climate",
        "seasonalPattern": "Pattern description",
        "optimalPlantingWindow": {
          "start": "YYYY-MM-DD",
          "end": "YYYY-MM-DD",
          "reasoning": "Why this window"
        },
        "weatherRisks": ["risk1", "risk2"],
        "recommendations": ["recommendation1", "recommendation2"],
        "dataSources": [{"name": "Source", "url": "URL"}]
      },
      "cropManagement": {
        "recommendedCrops": [
          {
            "crop": "Crop name",
            "variety": "Best variety",
            "plantingDate": "YYYY-MM-DD",
            "harvestDate": "YYYY-MM-DD",
            "expectedYield": "Yield per hectare",
            "marketValue": "Current market price",
            "spacing": "Plant spacing",
            "seedRate": "Seeds per hectare"
          }
        ],
        "cropRotation": {
          "plan": "Rotation strategy",
          "benefits": ["benefit1", "benefit2"]
        },
        "intercropping": {
          "combinations": ["combination1"],
          "benefits": ["benefit1"]
        }
      },
      "soilManagement": {
        "analysis": "Soil condition assessment",
        "nutrients": {
          "nitrogen": {"status": "sufficient/deficient", "recommendation": "Action"},
          "phosphorus": {"status": "sufficient/deficient", "recommendation": "Action"},
          "potassium": {"status": "sufficient/deficient", "recommendation": "Action"}
        },
        "amendments": [
          {
            "material": "Amendment type",
            "quantity": "Amount per hectare",
            "application": "When and how",
            "cost": "Estimated cost",
            "source": "Where to get it"
          }
        ],
        "soilConservation": ["practice1", "practice2"]
      },
      "waterManagement": {
        "irrigationSchedule": [
          {
            "crop": "Crop name",
            "frequency": "Times per week",
            "amount": "Liters per session",
            "timing": "Best time of day",
            "adjustments": "Based on weather"
          }
        ],
        "waterBudget": {
          "totalNeed": "Total water requirement",
          "source": "Water source adequacy",
          "efficiency": "Current efficiency",
          "improvements": ["improvement1"]
        },
        "conservation": [
          {
            "method": "Conservation method",
            "savings": "Water saved",
            "cost": "Implementation cost"
          }
        ],
        "rainfallIntegration": "How to use rainfall predictions"
      },
      "pestDiseaseManagement": {
        "commonThreats": [
          {
            "threat": "Pest/disease name",
            "risk": "high/medium/low",
            "timing": "When it occurs",
            "prevention": ["preventive measure1"],
            "treatment": ["treatment option1"]
          }
        ],
        "ipm": {
          "strategy": "Integrated pest management approach",
          "biological": ["biological control1"],
          "cultural": ["cultural practice1"],
          "chemical": "When to use chemicals"
        },
        "monitoring": "How to monitor crops"
      },
      "marketStrategy": {
        "priceAnalysis": {
          "currentPrices": [{"crop": "Crop", "price": "Price per kg"}],
          "trends": "Market trend description",
          "bestSellingTime": "Optimal selling period"
        },
        "valueAddition": [
          {
            "method": "Processing method",
            "priceIncrease": "Percentage increase",
            "requirements": ["requirement1"]
          }
        ],
        "marketAccess": ["market option1", "market option2"]
      },
      "financialProjection": {
        "startup": {
          "seeds": {"cost": number, "source": "Where to buy"},
          "fertilizers": {"cost": number},
          "labor": {"cost": number},
          "irrigation": {"cost": number},
          "other": {"cost": number},
          "total": number
        },
        "operational": {
          "monthly": {"cost": number, "breakdown": {}},
          "seasonal": {"cost": number}
        },
        "revenue": {
          "optimistic": {"amount": number, "assumptions": ["assumption1"]},
          "realistic": {"amount": number, "assumptions": ["assumption1"]},
          "pessimistic": {"amount": number, "assumptions": ["assumption1"]}
        },
        "profitability": {
          "roi": "Percentage",
          "breakeven": "Time to breakeven",
          "netProfit": "Expected profit"
        }
      },
      "timeline": [
        {
          "phase": "Phase name",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD",
          "activities": ["activity1", "activity2"],
          "milestones": ["milestone1"]
        }
      ],
      "riskManagement": {
        "identified": [
          {
            "risk": "Risk description",
            "probability": "high/medium/low",
            "impact": "high/medium/low",
            "mitigation": "Mitigation strategy"
          }
        ],
        "contingency": "Backup plan"
      },
      "resources": [
        {
          "title": "Resource title",
          "type": "guide/article/video",
          "source": "Organization",
          "url": "URL",
          "relevance": "Why it's useful"
        }
      ],
      "charts": {
        "monthlyWaterUsage": [
          {"month": "Jan", "usage": 5000, "rainfall": 100}
        ],
        "cropCalendar": [
          {"month": "Jan", "activities": ["activity1"]}
        ],
        "financialProjection": [
          {"month": "Jan", "revenue": 0, "expenses": 1000, "profit": -1000}
        ]
      }
    }
    
    Make projections realistic and cite specific agricultural sources.`;

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
    const plan = data.choices[0].message.content;
    console.log('Comprehensive plan generated successfully');

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-comprehensive-plan function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
