import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
    Scissors,
    TrendingUp,
    TrendingDown,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    DollarSign,
    CloudRain,
    Package,
    RefreshCw,
    Lightbulb
} from 'lucide-react';

interface HarvestAdvisoryProps {
    farmId: string;
    farmName: string;
    crop: string;
}

interface HarvestData {
    daysSincePlanting: number;
    expectedHarvestDay: number;
    daysToExpectedHarvest: number;
    harvestReadiness: {
        biologicalMaturity: string;
        confidence: number;
        indicators: {
            expected: string[];
            observed: string;
            assessment: string;
        };
    };
    harvestTiming: {
        recommendation: string;
        optimalWindow: {
            startDate: string;
            endDate: string;
        };
        urgency: string;
        weatherConsiderations: string;
        reasoning: string;
    };
    sellingStrategy: {
        recommendation: string;
        reasoning: string;
        currentPrice: number;
        historicalAverage: number;
        percentageDifference: string;
        trend: string;
    };
    profitProjection: {
        expectedYield: number;
        currentPriceRevenue: number;
        notes: string;
    };
    postHarvestTips: string[];
    warnings: string[];
}

const URGENCY_COLORS = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const MATURITY_COLORS = {
    not_ready: 'bg-gray-100 text-gray-800',
    approaching: 'bg-amber-100 text-amber-800',
    ready: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
};

export const HarvestAdvisory: React.FC<HarvestAdvisoryProps> = ({
    farmId,
    farmName,
    crop,
}) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<HarvestData | null>(null);
    const [observations, setObservations] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadAdvisory();
    }, [farmId]);

    const loadAdvisory = async (userObs?: string) => {
        setIsRefreshing(true);
        try {
            const { data: result, error } = await supabase.functions.invoke('get-harvest-advisory', {
                body: {
                    farm_id: farmId,
                    user_observations: userObs || observations,
                },
            });

            if (error) throw error;
            setData(result.data);
        } catch (error) {
            console.error('Error loading advisory:', error);
            toast({
                title: 'Error',
                description: 'Failed to load harvest advisory',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadAdvisory(observations);
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p>Unable to load harvest advisory</p>
                    <Button onClick={() => loadAdvisory()} className="mt-4">
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const progress = Math.min(100, (data.daysSincePlanting / data.expectedHarvestDay) * 100);

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="overflow-hidden">
                <div className={`p-4 ${data.harvestReadiness.biologicalMaturity === 'ready'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : data.harvestReadiness.biologicalMaturity === 'overdue'
                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                    } text-white`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Scissors className="h-8 w-8" />
                            <div>
                                <h2 className="text-xl font-bold">Harvest Advisory</h2>
                                <p className="text-sm opacity-90">{farmName} • {crop}</p>
                            </div>
                        </div>
                        <Badge className={MATURITY_COLORS[data.harvestReadiness.biologicalMaturity as keyof typeof MATURITY_COLORS]}>
                            {data.harvestReadiness.biologicalMaturity.replace('_', ' ')}
                        </Badge>
                    </div>
                </div>

                <CardContent className="pt-4">
                    {/* Progress to Harvest */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Day {data.daysSincePlanting}</span>
                            <span>{progress.toFixed(0)}% to Harvest</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.daysToExpectedHarvest > 0
                                ? `${data.daysToExpectedHarvest} days to expected harvest`
                                : data.daysToExpectedHarvest === 0
                                    ? 'Harvest day!'
                                    : `${Math.abs(data.daysToExpectedHarvest)} days past expected harvest`}
                        </p>
                    </div>

                    {/* Main Recommendation */}
                    <div className={`p-4 rounded-lg ${data.harvestTiming.recommendation === 'harvest_now'
                            ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                            : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
                        }`}>
                        <div className="flex items-start gap-3">
                            {data.harvestTiming.recommendation === 'harvest_now' ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                            ) : (
                                <Clock className="h-6 w-6 text-amber-600 flex-shrink-0" />
                            )}
                            <div>
                                <p className="font-semibold">
                                    {data.harvestTiming.recommendation === 'harvest_now'
                                        ? '🌾 Ready to Harvest!'
                                        : data.harvestTiming.recommendation === 'wait'
                                            ? '⏳ Wait - Not Yet Ready'
                                            : '👀 Continue Monitoring'}
                                </p>
                                <p className="text-sm mt-1">{data.harvestTiming.reasoning}</p>
                                <Badge className={`mt-2 ${URGENCY_COLORS[data.harvestTiming.urgency as keyof typeof URGENCY_COLORS]}`}>
                                    {data.harvestTiming.urgency} urgency
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Optimal Window */}
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-muted-foreground">Optimal Window Start</p>
                            <p className="font-semibold">
                                {new Date(data.harvestTiming.optimalWindow.startDate).toLocaleDateString('en-NG', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-muted-foreground">Optimal Window End</p>
                            <p className="font-semibold">
                                {new Date(data.harvestTiming.optimalWindow.endDate).toLocaleDateString('en-NG', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Weather Alert */}
            {data.harvestTiming.weatherConsiderations && (
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                            <CloudRain className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Weather Consideration</p>
                                <p className="text-sm text-muted-foreground">
                                    {data.harvestTiming.weatherConsiderations}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Selling Strategy */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        Selling Strategy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="p-3 bg-muted rounded-lg text-center">
                            <p className="text-xs text-muted-foreground">Current Price</p>
                            <p className="text-lg font-bold text-green-600">
                                ₦{data.sellingStrategy.currentPrice?.toLocaleString()}
                            </p>
                            <p className="text-xs">per kg</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-center">
                            <p className="text-xs text-muted-foreground">30-Day Average</p>
                            <p className="text-lg font-bold">
                                ₦{data.sellingStrategy.historicalAverage?.toLocaleString()}
                            </p>
                            <p className="text-xs">per kg</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-center">
                            <p className="text-xs text-muted-foreground">Trend</p>
                            <div className="flex items-center justify-center gap-1">
                                {data.sellingStrategy.trend === 'rising' ? (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : data.sellingStrategy.trend === 'falling' ? (
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                ) : (
                                    <span>→</span>
                                )}
                                <span className={`font-bold ${data.sellingStrategy.trend === 'rising' ? 'text-green-600' :
                                        data.sellingStrategy.trend === 'falling' ? 'text-red-600' : ''
                                    }`}>
                                    {data.sellingStrategy.percentageDifference}%
                                </span>
                            </div>
                            <p className="text-xs capitalize">{data.sellingStrategy.trend}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-center">
                            <p className="text-xs text-muted-foreground">Est. Revenue</p>
                            <p className="text-lg font-bold text-green-600">
                                ₦{data.profitProjection.currentPriceRevenue?.toLocaleString()}
                            </p>
                            <p className="text-xs">{data.profitProjection.expectedYield?.toLocaleString()} kg</p>
                        </div>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm">
                                {data.sellingStrategy.recommendation === 'sell_immediately'
                                    ? '💰 Sell Immediately'
                                    : data.sellingStrategy.recommendation === 'store_short'
                                        ? '📦 Store Short-Term (1-2 weeks)'
                                        : '🏪 Store Medium-Term (1+ month)'}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{data.sellingStrategy.reasoning}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Maturity Indicators */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Check These Indicators</CardTitle>
                    <CardDescription>Physical signs that your {crop} is ready for harvest</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {data.harvestReadiness.indicators.expected.map((indicator, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{indicator}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-4">
                        <Label htmlFor="observations">Your Observations</Label>
                        <Textarea
                            id="observations"
                            placeholder="Describe what you see on your crops..."
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            className="mt-1"
                            rows={2}
                        />
                        <Button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="mt-2"
                            variant="outline"
                        >
                            {isRefreshing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Update Advisory
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Post-Harvest Tips */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        Post-Harvest Tips
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {data.postHarvestTips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-amber-500">💡</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Warnings */}
            {data.warnings && data.warnings.length > 0 && (
                <Card className="border-red-200 dark:border-red-800">
                    <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-red-600">Warnings</p>
                                <ul className="mt-1 space-y-1">
                                    {data.warnings.map((warning, idx) => (
                                        <li key={idx} className="text-sm text-red-600">{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default HarvestAdvisory;
