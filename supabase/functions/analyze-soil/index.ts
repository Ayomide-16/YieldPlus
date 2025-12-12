import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SoilAnalysisSchema = z.object({
  color: z.string().min(1).max(50),
  texture: z.string().min(1).max(50),
  notes: z.string().max(500).optional(),
  imageBase64: z.string().optional(),
  soilPH: z.string().max(50).optional(),
  soilCompactness: z.string().max(50).optional()
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
    const validatedData = SoilAnalysisSchema.parse(body);
    const { color, texture, notes, imageBase64, soilPH, soilCompactness } = validatedData;

    console.log('Analyzing soil conditions with pH and compactness data for user:', user.id);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const systemPrompt = `You are an expert soil scientist and agricultural consultant with access to data from FAO, CGIAR, USDA, and agricultural research institutions. Analyze soil conditions and provide comprehensive, data-rich recommendations in JSON format with extensive nutrient analysis, charts data, and climate-based recommendations. Always cite reputable sources.`;

    let userPrompt: string;
    let contents: any[];

    if (imageBase64) {
      // If image is provided, use vision model with inline image
      userPrompt = `Analyze this soil image along with the following characteristics:
            
Soil Color: ${color}
Soil Texture: ${texture}
${soilPH ? `Soil pH Indicator (Taste): ${soilPH}` : ''}
${soilCompactness ? `Soil Compactness: ${soilCompactness}` : ''}
Additional Notes: ${notes || 'None'}

Provide comprehensive analysis in JSON format with these exact keys:
{
  "summary": "Brief overview",
  "healthAssessment": {"overallHealth": "Good/Fair/Poor", "pHLevel": "6.5-7.0", "organicMatter": "High", "drainageQuality": "Excellent", "soilStructure": "Well-structured", "healthScore": 85},
  "nutrientStatus": {"nitrogen": "Adequate", "phosphorus": "High", "potassium": "Adequate", "calcium": "Adequate", "magnesium": "Low", "sulfur": "Adequate"},
  "nutrientChart": [{"nutrient": "Nitrogen", "current": 85, "optimal": 90, "status": "Good"}, {"nutrient": "Phosphorus", "current": 95, "optimal": 85, "status": "High"}],
  "amendments": [{"name": "Amendment", "purpose": "Purpose", "application": "Method", "quantity": "Amount", "cost": "Estimate", "priority": "High"}],
  "cropRotation": "Detailed rotation strategy",
  "timeline": [{"period": "Month 1-2", "action": "Action", "expectedImprovement": "Improvement"}],
  "micronutrients": {"iron": "Adequate", "zinc": "Low", "manganese": "Adequate", "boron": "Adequate"},
  "irrigationRecommendations": "Water management advice",
  "climateRecommendations": ["Climate-based recommendation with timing and specific actions"],
  "expectedImprovementTimeline": [{"month": 1, "healthScore": 65}, {"month": 3, "healthScore": 75}, {"month": 6, "healthScore": 85}, {"month": 12, "healthScore": 90}],
  "dataSources": [
    {"name": "FAO", "url": "http://www.fao.org/"},
    {"name": "CGIAR", "url": "https://www.cgiar.org/"},
    {"name": "USDA", "url": "https://www.usda.gov/"}
  ]
}

Provide detailed data for charts including all major and micronutrients, and include reputable source citations.`;

      // Extract base64 data if it includes data URL prefix
      const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

      contents = [{
        role: 'user',
        parts: [
          { text: userPrompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
        ]
      }];
    } else {
      // Text-only analysis
      userPrompt = `Analyze the following soil characteristics and provide detailed recommendations:
        
Soil Color: ${color}
Soil Texture: ${texture}
${soilPH ? `Soil pH Indicator (Taste): ${soilPH}` : ''}
${soilCompactness ? `Soil Compactness: ${soilCompactness}` : ''}
Additional Notes: ${notes || 'None'}

Provide analysis in JSON format with these exact keys:
{
  "healthScore": 35,
  "soilColor": "${color}",
  "soilTexture": "${texture}",
  "moistureLevel": "Estimated level",
  "naturalAmendments": [
    {
      "title": "Amendment Title",
      "description": "Detailed description",
      "priority": "high"
    }
  ],
  "cropRotation": [
    {
      "suggestion": "Rotation recommendation",
      "benefits": "Benefits explanation"
    }
  ],
  "irrigationRecommendations": [
    {
      "title": "Irrigation Title",
      "description": "Detailed recommendation"
    }
  ],
  "climateRecommendations": ["Climate-based recommendation with timing"],
  "additionalNotes": "Important notes and concerns",
  "dataSources": [
    {"name": "FAO", "url": "http://www.fao.org/"},
    {"name": "CGIAR", "url": "https://www.cgiar.org/"}
  ]
}

Provide at least 3 items for each array field and cite reputable agricultural sources.`;

      contents = [{ role: 'user', parts: [{ text: userPrompt }] }];
    }

    const model = imageBase64 ? 'gemini-2.0-flash' : 'gemini-2.0-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
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
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
    console.log('Soil analysis completed successfully');

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
    console.error('Error in analyze-soil function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});