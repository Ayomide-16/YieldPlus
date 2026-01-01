import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ComprehensivePlanSchema = z.object({
  farmData: z.object({
    farm_name: z.string().min(1).max(100),
    location: z.object({
      country: z.string().min(1).max(100),
      state: z.string().max(100).optional(),
      localGovernment: z.string().max(100).optional()
    }),
    total_size: z.number().min(0.1).max(10000),
    soil_type: z.string().min(1).max(50),
    water_source: z.string().min(1).max(100),
    irrigation_method: z.string().min(1).max(100),
    crops: z.array(z.string().min(1).max(50)).optional()
  }),
  preferredPlantingDate: z.string(),
  climateData: z.any().optional(),
  includeSections: z.record(z.boolean()).optional()
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
    const validatedData = ComprehensivePlanSchema.parse(body);
    const { farmData, preferredPlantingDate, climateData, includeSections } = validatedData;

    console.log('Generating comprehensive farm plan for:', farmData.farm_name, 'userId:', user.id);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const systemPrompt = `You are an expert agricultural consultant providing comprehensive farm planning with a focus on profitability and sustainability.
    
    CRITICAL PRIORITIES:
    1. PROFITABILITY: Analyze current market prices and trends to recommend crops that maximize farmer income
    2. SUSTAINABILITY: Ensure recommendations follow environmental best practices including crop rotation
    3. MARKET ANALYSIS: Base crop recommendations primarily on market demand, pricing trends, and expected ROI
    4. CROP ROTATION: Always include proper crop rotation strategies to maintain soil health and prevent nutrient depletion
    5. ENVIRONMENTAL FRIENDLINESS: Prioritize methods that reduce environmental impact while maintaining profitability
    
    Use real agricultural research data and cite reputable sources like FAO, CGIAR, national agricultural departments, and local market data.
    Consider climate data, soil conditions, market trends, local farming practices, and sustainable agriculture principles.`;

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
        "profitabilityAnalysis": {
          "summary": "Overview of most profitable crops based on current market",
          "marketTrends": "Current market demand and price trends",
          "reasoning": "Why these crops maximize profitability"
        },
        "recommendedCrops": [
          {
            "crop": "Crop name",
            "variety": "Best variety",
            "plantingDate": "YYYY-MM-DD",
            "harvestDate": "YYYY-MM-DD",
            "expectedYield": "Yield per hectare",
            "marketValue": "Current market price per kg",
            "projectedRevenue": "Revenue per hectare",
            "profitMargin": "Expected profit margin %",
            "marketDemand": "high/medium/low",
            "priceStability": "stable/volatile",
            "spacing": "Plant spacing",
            "seedRate": "Seeds per hectare",
            "sustainabilityScore": "Environmental impact rating",
            "rotationBenefit": "How it benefits crop rotation"
          }
        ],
        "cropRotation": {
          "plan": "Multi-season rotation strategy to maintain soil health",
          "season1": "Crops for first season",
          "season2": "Crops for second season", 
          "season3": "Crops for third season",
          "benefits": ["Prevents soil nutrient depletion", "Reduces pest/disease buildup", "benefit3"],
          "profitabilityImpact": "How rotation affects long-term profitability"
        },
        "sustainability": {
          "practices": ["Sustainable practice 1", "practice 2"],
          "environmentalBenefits": ["benefit1", "benefit2"],
          "longTermViability": "Why this approach is sustainable"
        },
        "intercropping": {
          "combinations": ["combination1"],
          "benefits": ["benefit1"],
          "profitability": "How intercropping affects income"
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
          "currentPrices": [{"crop": "Crop", "price": "Price per kg", "demand": "high/medium/low"}],
          "historicalTrends": "6-month price trend for recommended crops",
          "forecastTrends": "Expected price movements",
          "bestSellingTime": "Optimal selling period for maximum profit",
          "competitiveAdvantage": "Why these crops are profitable in this location"
        },
        "profitMaximization": {
          "highestRevenueCrops": ["Top 3 crops by revenue"],
          "quickestReturnCrops": ["Fastest crops to profit"],
          "balancedApproach": "Recommended mix for risk management and sustained income"
        },
        "valueAddition": [
          {
            "method": "Processing method",
            "priceIncrease": "Percentage increase",
            "requirements": ["requirement1"],
            "profitability": "Additional profit potential"
          }
        ],
        "marketAccess": ["market option1", "market option2"],
        "riskDiversification": "How to balance high-profit and stable-income crops"
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
    
    IMPORTANT INSTRUCTIONS:
    - Prioritize crops with the HIGHEST market value and demand
    - Include detailed market price analysis showing why recommended crops maximize profit
    - Provide a comprehensive crop rotation plan that maintains profitability across seasons
    - Balance short-term profit (fast-growing crops) with long-term sustainability (crop rotation, soil health)
    - Cite specific market data and agricultural sources
    - Include environmental sustainability metrics for each crop recommendation
    - Make all financial projections realistic based on current market prices`;

    // Retry logic with exponential backoff
    let retryCount = 0;
    const maxRetries = 3;
    let response: Response | null = null;
    let lastError: Error | null = null;

    while (retryCount < maxRetries) {
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
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

        if (response.ok) {
          break; // Success, exit retry loop
        }

        // Handle specific error codes
        if (response.status === 429) {
          console.warn(`Rate limit hit (attempt ${retryCount + 1}/${maxRetries})`);
          lastError = new Error('Rate limit exceeded. Please try again later.');
        } else {
          const errorText = await response.text();
          console.error(`Gemini API error (attempt ${retryCount + 1}/${maxRetries}):`, response.status, errorText);
          lastError = new Error(`AI service error: ${response.status}`);
        }
      } catch (fetchError) {
        console.error(`Network error (attempt ${retryCount + 1}/${maxRetries}):`, fetchError);
        lastError = new Error('Network error. Please check your connection.');
      }

      retryCount++;
      if (retryCount < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, retryCount - 1) * 1000;
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    // If all retries failed, check for cached/previous plan
    if (!response || !response.ok) {
      console.error('All retries exhausted, checking for previous plan...');

      // Try to fetch the most recent successful plan for this farm
      const { data: previousPlan, error: dbError } = await supabase
        .from('comprehensive_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!dbError && previousPlan) {
        console.log('Returning previous plan as fallback');
        return new Response(JSON.stringify({
          plan: JSON.stringify(previousPlan),
          fallback: true,
          message: 'Using previous plan due to temporary service issues'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // No fallback available, return error
      throw lastError || new Error('Failed to generate plan and no previous plan available');
    }

    const data = await response.json();
    const plan = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
    console.log('Comprehensive plan generated successfully');

    // Parse and save the plan to database
    try {
      let parsedPlan = plan;
      if (typeof plan === 'string') {
        // Clean markdown code blocks if present
        parsedPlan = plan.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsedPlan = JSON.parse(parsedPlan);
      }

      // Save to database
      const { error: saveError } = await supabase
        .from('comprehensive_plans')
        .insert({
          user_id: user.id,
          farm_id: null, // Farm ID would need to be passed separately
          plan_name: `${farmData.farm_name} - ${new Date().toLocaleDateString()}`,
          included_sections: includeSections || {},
          preferred_planting_date: preferredPlantingDate,
          climate_data: climateData || {},
          comprehensive_summary: parsedPlan.executiveSummary || {},
          optimal_planting_window: parsedPlan.climaticAnalysis?.optimalPlantingWindow || {},
          crop_analysis: parsedPlan.cropManagement || {},
          soil_analysis: parsedPlan.soilManagement || {},
          water_analysis: parsedPlan.waterManagement || {},
          market_analysis: parsedPlan.marketStrategy || {}
        });

      if (saveError) {
        console.error('Failed to save plan to database:', saveError);
        // Continue anyway - don't fail the request
      } else {
        console.log('Plan saved to database successfully');
      }
    } catch (parseError) {
      console.error('Failed to parse or save plan:', parseError);
      // Continue anyway - return the plan even if save failed
    }

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.error('Error in generate-comprehensive-plan function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});