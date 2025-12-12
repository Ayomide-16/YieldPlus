import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NewsSchema = z.object({
  location: z.object({
    country: z.string().min(1).max(100),
    state: z.string().max(100).optional()
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Input validation
    const body = await req.json();
    const validatedData = NewsSchema.parse(body);
    const { location } = validatedData;
    console.log('Fetching news for location:', location, 'userId:', user.id);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Generate AI-powered news summaries based on location
    const prompt = `Generate 5 recent and relevant agricultural news articles for farmers in ${location.country}, ${location.state || ''}.

Include a mix of:
1. Local agricultural events, workshops, or training opportunities
2. Government programs, subsidies, or policies
3. Weather forecasts and climate advisories
4. Pest/disease alerts or warnings
5. Market trends and price updates

For each article, provide:
{
  "title": "Engaging headline",
  "summary": "2-3 sentence summary of the news",
  "source_name": "Credible source name",
  "source_url": "https://example.com/article",
  "category": "one of: Training, Government Program, Weather, Disease Alert, Market Update",
  "location": "${location.country}",
  "published_date": "recent date in ISO format"
}

Return ONLY a JSON array of 5 articles. Be realistic and specific to the location.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: 'You are an agricultural news aggregator. Generate realistic, helpful news articles for farmers.' }] },
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
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

    // Parse the AI response
    let newsArticles;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      newsArticles = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      throw new Error('Failed to parse news articles');
    }

    // Store in database
    const { data: insertedNews, error: insertError } = await supabaseClient
      .from('agricultural_news_feed')
      .insert(newsArticles)
      .select();

    if (insertError) {
      console.error('Database insert error:', insertError);
    }

    return new Response(JSON.stringify({
      success: true,
      articles: newsArticles
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.error('Error in fetch-agriculture-news:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});