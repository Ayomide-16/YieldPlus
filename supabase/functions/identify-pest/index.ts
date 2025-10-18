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
    const { cropType, symptoms, location } = await req.json();
    console.log('Identifying pest/disease for:', { cropType, symptoms, location });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert agricultural pathologist and entomologist specializing in African crop diseases and pests.
    Provide accurate diagnoses based on symptoms and recommend treatments using locally available, affordable resources.
    Always cite reputable agricultural research sources.`;

    const userPrompt = `Diagnose pest or disease for ${cropType} with these symptoms: ${symptoms.join(', ')}
    Location: ${JSON.stringify(location)}
    
    Provide analysis in JSON format:
    {
      "diagnosis": {
        "primary": {
          "name": "Disease/Pest Name",
          "scientificName": "Scientific name",
          "confidence": "high/medium/low",
          "description": "Brief description"
        },
        "alternatives": [
          {
            "name": "Alternative diagnosis",
            "confidence": "percentage",
            "description": "Brief description"
          }
        ]
      },
      "symptoms": {
        "observed": ["symptom1", "symptom2"],
        "expected": ["additional symptoms to watch for"]
      },
      "treatment": {
        "immediate": [
          {
            "action": "Step-by-step action",
            "materials": ["locally available materials"],
            "cost": "estimated cost",
            "effectiveness": "high/medium/low"
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
            "product": "Product name or type",
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
          "type": "guide/video/article"
        }
      ],
      "expertAdvice": "When to seek professional help"
    }
    
    Focus on practical, affordable solutions suitable for African farmers.`;

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
    console.log('Pest identification completed successfully');

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in identify-pest function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
