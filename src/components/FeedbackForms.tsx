import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloudRain,
    CloudSun,
    Sprout,
    Bug,
    AlertTriangle,
    CheckCircle2,
    Camera,
    Loader2,
    X
} from 'lucide-react';

interface FeedbackFormProps {
    farmId: string;
    farmCrop: string;
    currentStage: string;
    onSubmit?: () => void;
    onClose?: () => void;
}

// Weather Confirmation Form
export const WeatherConfirmationForm: React.FC<FeedbackFormProps & {
    wasRainForecasted?: boolean;
}> = ({ farmId, wasRainForecasted = false, onSubmit, onClose }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rainOccurred, setRainOccurred] = useState<boolean | null>(null);
    const [rainAmount, setRainAmount] = useState<string>('');

    const handleSubmit = async () => {
        if (rainOccurred === null) return;

        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.functions.invoke('process-user-feedback', {
                body: {
                    farm_id: farmId,
                    feedback_type: 'weather_confirmation',
                    response: {
                        rain_occurred: rainOccurred,
                        rain_amount: rainOccurred ? rainAmount : 'none',
                        was_forecasted: wasRainForecasted,
                    },
                },
            });

            if (error) throw error;

            toast({
                title: 'Feedback Recorded',
                description: data.data?.interpretation || 'Thank you for the update!',
            });

            onSubmit?.();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit feedback',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CloudRain className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-base">Weather Confirmation</CardTitle>
                    </div>
                    {onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <CardDescription>
                    Did it rain yesterday as {wasRainForecasted ? 'forecasted' : 'expected'}?
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <RadioGroup
                    value={rainOccurred === null ? '' : rainOccurred ? 'yes' : 'no'}
                    onValueChange={(value) => setRainOccurred(value === 'yes')}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="rain-yes" />
                        <Label htmlFor="rain-yes" className="flex items-center gap-2 cursor-pointer">
                            <CloudRain className="h-4 w-4 text-blue-500" />
                            Yes, it rained
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="rain-no" />
                        <Label htmlFor="rain-no" className="flex items-center gap-2 cursor-pointer">
                            <CloudSun className="h-4 w-4 text-amber-500" />
                            No rain
                        </Label>
                    </div>
                </RadioGroup>

                <AnimatePresence>
                    {rainOccurred && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <Label>How much rain?</Label>
                            <Select value={rainAmount} onValueChange={setRainAmount}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select amount" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light (drizzle)</SelectItem>
                                    <SelectItem value="moderate">Moderate</SelectItem>
                                    <SelectItem value="heavy">Heavy (downpour)</SelectItem>
                                </SelectContent>
                            </Select>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button
                    onClick={handleSubmit}
                    disabled={rainOccurred === null || isSubmitting}
                    className="w-full"
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Submit
                </Button>
            </CardContent>
        </Card>
    );
};

// Growth Milestone Form
export const GrowthMilestoneForm: React.FC<FeedbackFormProps & {
    expectedStage: string;
}> = ({ farmId, expectedStage, farmCrop, onSubmit, onClose }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [observations, setObservations] = useState('');

    const handleSubmit = async () => {
        if (!status) return;

        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.functions.invoke('process-user-feedback', {
                body: {
                    farm_id: farmId,
                    feedback_type: 'growth_milestone',
                    response: {
                        expected_stage: expectedStage,
                        actual_status: status,
                        observations: observations || undefined,
                    },
                },
            });

            if (error) throw error;

            toast({
                title: 'Milestone Recorded',
                description: data.data?.interpretation || 'Growth status updated!',
            });

            onSubmit?.();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit feedback',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-green-500" />
                        <CardTitle className="text-base">Growth Check</CardTitle>
                    </div>
                    {onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <CardDescription>
                    Your {farmCrop} should be at the "{expectedStage}" stage. How does it look?
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <RadioGroup value={status} onValueChange={setStatus}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="on_track" id="status-ontrack" />
                        <Label htmlFor="status-ontrack" className="flex items-center gap-2 cursor-pointer">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            On track - looks as expected
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ahead" id="status-ahead" />
                        <Label htmlFor="status-ahead" className="flex items-center gap-2 cursor-pointer">
                            <Sprout className="h-4 w-4 text-blue-500" />
                            Ahead - growing faster than expected
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="behind" id="status-behind" />
                        <Label htmlFor="status-behind" className="flex items-center gap-2 cursor-pointer">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Behind - slower growth than expected
                        </Label>
                    </div>
                </RadioGroup>

                <div>
                    <Label htmlFor="observations">Additional Observations (optional)</Label>
                    <Textarea
                        id="observations"
                        placeholder="Describe what you see..."
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        className="mt-1"
                        rows={2}
                    />
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={!status || isSubmitting}
                    className="w-full"
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Submit
                </Button>
            </CardContent>
        </Card>
    );
};

// Issue Report Form
export const IssueReportForm: React.FC<FeedbackFormProps> = ({
    farmId,
    farmCrop,
    onSubmit,
    onClose
}) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [issueType, setIssueType] = useState('');
    const [severity, setSeverity] = useState('');
    const [description, setDescription] = useState('');
    const [affectedArea, setAffectedArea] = useState('');

    const handleSubmit = async () => {
        if (!issueType || !severity || !description) return;

        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.functions.invoke('process-user-feedback', {
                body: {
                    farm_id: farmId,
                    feedback_type: 'issue_report',
                    response: {
                        issue_type: issueType,
                        severity,
                        description,
                        affected_area: affectedArea || undefined,
                    },
                },
            });

            if (error) throw error;

            toast({
                title: 'Issue Reported',
                description: data.data?.interpretation || 'We\'ll analyze this and provide recommendations.',
            });

            // Show immediate recommendations if available
            if (data.data?.immediateRecommendations?.length > 0) {
                toast({
                    title: 'Immediate Action Needed',
                    description: data.data.immediateRecommendations[0].action,
                });
            }

            onSubmit?.();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit report',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bug className="h-5 w-5 text-red-500" />
                        <CardTitle className="text-base">Report Issue</CardTitle>
                    </div>
                    {onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <CardDescription>
                    Report a problem with your {farmCrop} farm
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label>Issue Type *</Label>
                    <Select value={issueType} onValueChange={setIssueType}>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pest">Pest Infestation</SelectItem>
                            <SelectItem value="disease">Plant Disease</SelectItem>
                            <SelectItem value="nutrient">Nutrient Deficiency</SelectItem>
                            <SelectItem value="water">Water Problem</SelectItem>
                            <SelectItem value="weather">Weather Damage</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>Severity *</Label>
                    <RadioGroup value={severity} onValueChange={setSeverity} className="mt-1">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="minor" id="sev-minor" />
                            <Label htmlFor="sev-minor" className="cursor-pointer">
                                Minor - Small area affected
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="moderate" id="sev-moderate" />
                            <Label htmlFor="sev-moderate" className="cursor-pointer">
                                Moderate - Noticeable impact
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="severe" id="sev-severe" />
                            <Label htmlFor="sev-severe" className="cursor-pointer">
                                Severe - Major threat to crop
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                        id="description"
                        placeholder="Describe what you're seeing..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1"
                        rows={3}
                    />
                </div>

                <div>
                    <Label htmlFor="affected-area">Affected Area (optional)</Label>
                    <Input
                        id="affected-area"
                        placeholder="e.g., 'North corner', '20% of plants'"
                        value={affectedArea}
                        onChange={(e) => setAffectedArea(e.target.value)}
                        className="mt-1"
                    />
                </div>

                <Button variant="outline" className="w-full" disabled>
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Photo (Coming Soon)
                </Button>

                <Button
                    onClick={handleSubmit}
                    disabled={!issueType || !severity || !description || isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700"
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <AlertTriangle className="h-4 w-4 mr-2" />
                    )}
                    Submit Report
                </Button>
            </CardContent>
        </Card>
    );
};

export default WeatherConfirmationForm;
