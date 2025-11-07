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
      console.log('Pest identification completed successfully');
    } catch (parseError) {
      console.error('Invalid JSON in response:', analysis);
      throw new Error('AI returned invalid JSON format');
    }

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
