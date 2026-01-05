// Process User Feedback Edge Function
// Handles weather confirmations, growth milestones, issue reports, and triggers plan adjustments

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const WeatherConfirmationSchema = z.object({
    rain_occurred: z.boolean(),
    rain_amount: z.enum(['none', 'light', 'moderate', 'heavy']).optional(),
    was_forecasted: z.boolean(),
});

const GrowthMilestoneSchema = z.object({
    expected_stage: z.string(),
    actual_status: z.enum(['on_track', 'behind', 'ahead']),
    observations: z.string().optional(),
    photo_url: z.string().optional(),
});

const IssueReportSchema = z.object({
    issue_type: z.enum(['pest', 'disease', 'nutrient', 'water', 'weather', 'other']),
    description: z.string(),
    severity: z.enum(['minor', 'moderate', 'severe']),
    affected_area: z.string().optional(),
    photo_url: z.string().optional(),
});

const ActivityCompletionSchema = z.object({
    recommendation_id: z.string(),
    completed: z.boolean(),
    notes: z.string().optional(),
    cost: z.number().optional(),
});

const FeedbackInputSchema = z.object({
    farm_id: z.string().uuid(),
    feedback_type: z.enum([
        'weather_confirmation',
        'growth_milestone',
        'issue_report',
        'activity_completion',
        'observation',
    ]),
    response: z.any(),
});

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Verify user
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            throw new Error('Unauthorized');
        }

        // Parse input
        const body = await req.json();
        const input = FeedbackInputSchema.parse(body);

        // Verify farm ownership
        const { data: farm, error: farmError } = await supabase
            .from('active_farms')
            .select('*')
            .eq('id', input.farm_id)
            .eq('user_id', user.id)
            .single();

        if (farmError || !farm) {
            throw new Error('Farm not found or access denied');
        }

        const today = new Date().toISOString().split('T')[0];
        let aiInterpretation = '';
        let planAdjusted = false;
        let adjustments: any = null;
        let immediateRecommendations: any[] = [];

        // Process based on feedback type
        switch (input.feedback_type) {
            case 'weather_confirmation': {
                const data = WeatherConfirmationSchema.parse(input.response);

                // Update weather history accuracy
                if (data.was_forecasted !== data.rain_occurred) {
                    aiInterpretation = `Weather forecast was inaccurate. Forecasted ${data.was_forecasted ? 'rain' : 'no rain'}, but user reported ${data.rain_occurred ? 'rain' : 'no rain'}.`;

                    // If rain was expected but didn't come, suggest irrigation
                    if (!data.rain_occurred && data.was_forecasted) {
                        immediateRecommendations.push({
                            id: crypto.randomUUID(),
                            type: 'irrigation',
                            priority: 'high',
                            action: 'Consider irrigating today as expected rain did not occur',
                            reasoning: 'Forecast predicted rain but it did not fall. Your crops may need water.',
                            estimatedTime: '1-2 hours',
                        });
                        planAdjusted = true;
                        adjustments = { irrigation_needed: true, reason: 'forecast_miss' };
                    }
                } else {
                    aiInterpretation = `Weather confirmation received. Forecast was accurate.`;
                }
                break;
            }

            case 'growth_milestone': {
                const data = GrowthMilestoneSchema.parse(input.response);

                if (data.actual_status === 'behind') {
                    aiInterpretation = `Crop growth is behind schedule. Expected stage: ${data.expected_stage}.`;
                    planAdjusted = true;

                    // Extend expected harvest date
                    adjustments = {
                        growth_delay: true,
                        original_stage: data.expected_stage,
                        needs_investigation: true,
                    };

                    immediateRecommendations.push({
                        id: crypto.randomUUID(),
                        type: 'inspection',
                        priority: 'high',
                        action: 'Inspect plants for potential issues causing growth delay',
                        reasoning: 'Growth is behind schedule. Check for water stress, nutrient deficiency, or pest damage.',
                        estimatedTime: '30 minutes',
                    });

                    // Update farm stage
                    await supabase
                        .from('active_farms')
                        .update({ current_growth_stage: data.expected_stage + ' (delayed)' })
                        .eq('id', input.farm_id);

                } else if (data.actual_status === 'ahead') {
                    aiInterpretation = `Crop growth is ahead of schedule. Consider advancing harvest timeline.`;
                    planAdjusted = true;
                    adjustments = {
                        growth_ahead: true,
                        harvest_timeline_adjusted: true,
                    };
                } else {
                    aiInterpretation = `Crop growth confirmed on track at ${data.expected_stage} stage.`;

                    // Update farm stage
                    await supabase
                        .from('active_farms')
                        .update({ current_growth_stage: data.expected_stage })
                        .eq('id', input.farm_id);
                }
                break;
            }

            case 'issue_report': {
                const data = IssueReportSchema.parse(input.response);

                // Use AI to diagnose and recommend treatment
                if (geminiApiKey) {
                    const diagnosisPrompt = `
A farmer reports an issue with their ${farm.crop} farm:
- Issue Type: ${data.issue_type}
- Description: ${data.description}
- Severity: ${data.severity}
- Location: ${farm.location.state}, Nigeria
- Current Stage: ${farm.current_growth_stage}

Provide a brief diagnosis and treatment recommendation in JSON format:
{
  "diagnosis": "Brief diagnosis",
  "likely_cause": "Most likely cause",
  "immediate_action": "What to do immediately",
  "treatment": "Recommended treatment",
  "prevention": "How to prevent in future",
  "urgency": "low" | "medium" | "high"
}`;

                    try {
                        const geminiResponse = await fetch(
                            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
                            {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    contents: [{ role: 'user', parts: [{ text: diagnosisPrompt }] }],
                                    generationConfig: { temperature: 0.5, maxOutputTokens: 1024 },
                                }),
                            }
                        );

                        if (geminiResponse.ok) {
                            const geminiData = await geminiResponse.json();
                            let diagnosisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
                            diagnosisText = diagnosisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

                            try {
                                const diagnosis = JSON.parse(diagnosisText);
                                aiInterpretation = diagnosis.diagnosis;
                                adjustments = {
                                    issue_diagnosed: true,
                                    diagnosis,
                                };

                                immediateRecommendations.push({
                                    id: crypto.randomUUID(),
                                    type: data.issue_type === 'pest' ? 'pest_treatment' :
                                        data.issue_type === 'disease' ? 'disease_treatment' : 'inspection',
                                    priority: diagnosis.urgency === 'high' ? 'critical' :
                                        diagnosis.urgency === 'medium' ? 'high' : 'normal',
                                    action: diagnosis.immediate_action,
                                    reasoning: diagnosis.treatment,
                                });
                                planAdjusted = true;
                            } catch {
                                aiInterpretation = `Issue reported: ${data.issue_type} - ${data.description}. Severity: ${data.severity}. Requires attention.`;
                            }
                        }
                    } catch (e) {
                        console.error('AI diagnosis failed:', e);
                        aiInterpretation = `Issue reported: ${data.issue_type} - ${data.description}. Severity: ${data.severity}. Investigate further.`;
                    }
                } else {
                    aiInterpretation = `Issue reported: ${data.issue_type} - ${data.description}. Severity: ${data.severity}. Use Pest Identifier tool for diagnosis.`;
                }
                break;
            }

            case 'activity_completion': {
                const data = ActivityCompletionSchema.parse(input.response);

                // Log the activity
                await supabase.from('farm_activities').insert({
                    farm_id: input.farm_id,
                    activity_type: 'other',
                    activity_date: today,
                    recommendation_id: data.recommendation_id,
                    status: data.completed ? 'completed' : 'skipped',
                    completion_date: data.completed ? new Date().toISOString() : null,
                    notes: data.notes,
                    cost: data.cost,
                });

                // Update budget spent if cost provided
                if (data.cost && data.cost > 0) {
                    await supabase
                        .from('active_farms')
                        .update({ budget_spent: (farm.budget_spent || 0) + data.cost })
                        .eq('id', input.farm_id);
                }

                aiInterpretation = data.completed
                    ? `Activity marked as completed${data.notes ? `: ${data.notes}` : ''}`
                    : `Activity skipped${data.notes ? `: ${data.notes}` : ''}`;
                break;
            }

            case 'observation': {
                aiInterpretation = `Observation recorded: ${JSON.stringify(input.response)}`;
                break;
            }
        }

        // Save feedback to database
        const { data: feedback, error: feedbackError } = await supabase
            .from('farm_feedback')
            .insert({
                farm_id: input.farm_id,
                feedback_type: input.feedback_type,
                feedback_date: today,
                user_response: input.response,
                ai_interpretation: aiInterpretation,
                plan_adjusted: planAdjusted,
                adjustments_made: adjustments,
            })
            .select()
            .single();

        if (feedbackError) {
            console.error('Failed to save feedback:', feedbackError);
        }

        // Update farm's last activity
        await supabase
            .from('active_farms')
            .update({ last_activity: new Date().toISOString() })
            .eq('id', input.farm_id);

        return new Response(
            JSON.stringify({
                success: true,
                data: {
                    feedbackId: feedback?.id,
                    interpretation: aiInterpretation,
                    planAdjusted,
                    adjustments,
                    immediateRecommendations,
                },
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
