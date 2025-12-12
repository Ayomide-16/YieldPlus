import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PestIdentificationSchema = z.object({
  cropType: z.string().min(1).max(50).regex(/^[a-zA-Z\s-]+$/, 'Only letters, spaces and hyphens allowed'),
  symptoms: z.array(z.string().min(1).max(200)).min(1).max(20),
  location: z.object({
    country: z.string().min(1).max(100),
    state: z.string().max(100).optional(),
    localGovernment: z.string().max(100).optional()
  })
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
    const validatedData = PestIdentificationSchema.parse(body);
    const { cropType, symptoms, location } = validatedData;

    console.log('Identifying pest/disease for:', { cropType, symptoms, location, userId: user.id });

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const systemPrompt = `You are an expert agricultural pathologist and entomologist specializing in African crop diseases and pests.
    Provide accurate diagnoses based on symptoms and recommend treatments using locally available, affordable resources.
    Always cite reputable agricultural research sources.`;

    const userPrompt = `Diagnose pest or disease for ${cropType} with these symptoms: ${symptoms.join(', ')}
    Location: ${JSON.stringify(location)}
    
    You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanations outside the JSON structure.
    
    Provide analysis in this exact JSON format:
    {
      "diagnosis": {
        "primary": {
          "name": "Disease or Pest Name",
          "scientificName": "Scientific name",
          "confidence": "high",
          "description": "Clear description of the pest/disease"
        },
        "alternatives": [
          {
            "name": "Alternative diagnosis name",
            "confidence": "medium",
            "description": "Brief description"
          }
        ]
      },
      "symptoms": {
        "observed": ["symptom1", "symptom2"],
        "expected": ["additional symptoms to watch for"]
      },
      "causes": {
        "primary": "Main cause of the disease/pest",
        "contributing": ["Environmental factors", "Management practices"]
      },
      "treatment": {
        "immediate": [
          {
            "action": "Clear step-by-step action",
            "materials": ["locally available materials"],
            "cost": "estimated cost in local currency",
            "effectiveness": "high"
          }
        ],
        "preventive": [
          {
            "measure": "Prevention method",
            "timing": "When to apply",
            "frequency": "How often"
          }
        ],
        "organic": ["organic treatment options"],
        "chemical": [
          {
            "product": "Product name or generic type",
            "dosage": "Amount per area",
            "safety": "Safety precautions"
          }
        ]
      },
      "lifecycle": {
        "stages": ["stage1", "stage2"],
        "duration": "Duration of lifecycle",
        "spreadRate": "How fast it spreads"
      },
      "economicImpact": {
        "potentialLoss": "Percentage or description",
        "costOfTreatment": "Estimated cost",
        "yieldImpact": "Impact on harvest"
      },
      "resources": [
        {
          "title": "Resource title",
          "source": "Organization name",
          "url": "URL to resource",
          "type": "guide"
        }
      ],
      "expertAdvice": "When to seek professional help"
    }
    
    Focus on practical, affordable solutions suitable for African farmers. Use locally available materials and cost-effective methods.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';

    // Clean up the response to ensure valid JSON
    analysis = analysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Validate JSON
    try {
      JSON.parse(analysis);
      console.log('Pest identification completed successfully');
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
    console.error('Error in identify-pest function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});