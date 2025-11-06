import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const inputSchema = z.object({
  location: z.object({
    country: z.string().min(1).max(100),
    state: z.string().max(100).optional(),
  }),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { location } = inputSchema.parse(requestBody);
    console.log('Fetching news for location:', location);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
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

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an agricultural news aggregator. Generate realistic, helpful news articles for farmers.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: insertedNews, error: insertError } = await supabase
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
    console.error('Error in fetch-agriculture-news:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});