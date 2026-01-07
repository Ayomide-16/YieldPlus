import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    Sun,
    CloudRain,
    Droplets,
    ThermometerSun,
    Wind,
    Calendar,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Sprout,
    TrendingUp,
    MessageSquare,
    ListTodo,
    BarChart3,
    FileText,
    Loader2,
    RefreshCw,
    ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { ActiveFarm, DailyRecommendation, Recommendation } from '@/types/lifecycle';

// Weather icon mapping
const WEATHER_ICONS: Record<string, typeof Sun> = {
    'Clear': Sun,
    'Clouds': CloudRain,
    'Rain': CloudRain,
    'Drizzle': CloudRain,
    'Thunderstorm': CloudRain,
    'default': Sun,
};

// Priority colors
const PRIORITY_COLORS = {
    critical: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    normal: 'bg-blue-500 text-white',
    low: 'bg-gray-500 text-white',
};

export function ActiveFarmDashboard() {
    const { farmId } = useParams<{ farmId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [farm, setFarm] = useState<ActiveFarm | null>(null);
    const [dailyRec, setDailyRec] = useState<DailyRecommendation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (farmId) {
            loadFarmData();
        }
    }, [farmId]);

    const loadFarmData = async () => {
        try {
            // Load farm
            const { data: farmData, error: farmError } = await supabase
                .from('active_farms')
                .select('*')
                .eq('id', farmId)
                .single();

            if (farmError) throw farmError;
            setFarm(farmData as unknown as ActiveFarm);

            // Load today's recommendations
            const today = new Date().toISOString().split('T')[0];
            const { data: recData } = await supabase
                .from('daily_recommendations')
                .select('*')
                .eq('farm_id', farmId)
                .eq('recommendation_date', today)
                .single();

            if (recData) {
                setDailyRec(recData as unknown as DailyRecommendation);

                // Mark as viewed
                if (!recData.user_viewed) {
                    await supabase
                        .from('daily_recommendations')
                        .update({ user_viewed: true, viewed_at: new Date().toISOString() })
                        .eq('id', recData.id);
                }
            }

        } catch (error) {
            console.error('Error loading farm:', error);
            toast({
                title: 'Error loading farm',
                description: 'Please try again',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const refreshRecommendations = async () => {
        setIsRefreshing(true);
        try {
            const { data, error } = await supabase.functions.invoke(
                'generate-daily-recommendations',
                { body: { farm_id: farmId } }
            );

            if (error) throw error;

            toast({
                title: 'Recommendations Updated',
                description: 'Fresh recommendations generated!',
            });

            loadFarmData();
        } catch (error) {
            toast({
                title: 'Failed to refresh',
                description: 'Please try again',
                variant: 'destructive',
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    const markRecommendationComplete = async (recId: string) => {
        try {
            await supabase.from('farm_activities').insert({
                farm_id: farmId,
                activity_type: 'other',
                activity_date: new Date().toISOString().split('T')[0],
                recommendation_id: recId,
                status: 'completed',
                completion_date: new Date().toISOString(),
            });

            toast({ title: 'Activity marked complete! ✓' });
            loadFarmData();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
        );
    }

    if (!farm) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Farm Not Found</h2>
                <p className="text-muted-foreground mb-4">This farm may have been deleted or archived.</p>
                <Button onClick={() => navigate('/my-farms')}>View My Farms</Button>
            </div>
        );
    }

    // Calculate progress
    const plantingDate = new Date(farm.planting_date);
    const harvestDate = farm.expected_harvest_date ? new Date(farm.expected_harvest_date) : null;
    const today = new Date();
    const daysSincePlanting = Math.floor((today.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysToHarvest = harvestDate ? Math.floor((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const totalDays = harvestDate ? Math.floor((harvestDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)) : 90;
    const progressPercent = Math.min(100, Math.max(0, (daysSincePlanting / totalDays) * 100));

    const weather = dailyRec?.weather_data as Record<string, unknown> | undefined;
    const recommendations = (dailyRec?.recommendations || []) as Recommendation[];
    const farmStatus = dailyRec?.farm_status as Record<string, unknown> | undefined;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-emerald-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Sprout className="h-6 w-6" />
                                {farm.farm_name}
                            </h1>
                            <p className="text-green-100 mt-1">
                                {farm.location.state}{farm.location.lga ? `, ${farm.location.lga}` : ''} • {farm.farm_size} {farm.size_unit}
                            </p>
                        </div>
                        <div className="text-right">
                            <Badge className="bg-white/20 text-white hover:bg-white/30 capitalize">
                                {farm.crop}
                            </Badge>
                            <p className="text-sm text-green-100 mt-2">
                                Day {daysSincePlanting} • {farm.current_growth_stage}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Planted</span>
                            <span>{progressPercent.toFixed(0)}% Complete</span>
                            <span>Harvest</span>
                        </div>
                        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1 }}
                                className="h-full bg-white rounded-full"
                            />
                        </div>
                        <div className="flex justify-between text-xs mt-1 text-green-100">
                            <span>{plantingDate.toLocaleDateString()}</span>
                            <span>{daysToHarvest !== null ? `${daysToHarvest} days to harvest` : ''}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4 md:p-6">
                <Tabs defaultValue="today" className="space-y-6">
                    <TabsList className="w-full md:w-auto">
                        <TabsTrigger value="today" className="flex items-center gap-2">
                            <ListTodo className="h-4 w-4" />
                            Today
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Timeline
                        </TabsTrigger>
                        <TabsTrigger value="plan" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Plan
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    {/* TODAY TAB */}
                    <TabsContent value="today" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Weather Card */}
                            <Card className="lg:col-span-1">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Today's Weather
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {weather?.current ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-3xl font-bold">
                                                        {weather.current.temperature?.toFixed(0)}°C
                                                    </p>
                                                    <p className="text-muted-foreground capitalize">
                                                        {weather.current.conditions}
                                                    </p>
                                                </div>
                                                {React.createElement(
                                                    WEATHER_ICONS[weather.current.conditions] || WEATHER_ICONS.default,
                                                    { className: 'h-12 w-12 text-amber-500' }
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Droplets className="h-4 w-4 text-blue-500" />
                                                    <span>{weather.current.humidity?.toFixed(0)}% humidity</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Wind className="h-4 w-4 text-gray-500" />
                                                    <span>{weather.current.windSpeed?.toFixed(1)} m/s</span>
                                                </div>
                                            </div>
                                            {/* 3-day forecast */}
                                            {weather.forecast && weather.forecast.length > 0 && (
                                                <div className="border-t pt-3 mt-3">
                                                    <p className="text-xs text-muted-foreground mb-2">3-Day Forecast</p>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {weather.forecast.slice(0, 3).map((day: { date: string; temperatureHigh: number; rainfallProbability: number }, idx: number) => (
                                                            <div key={idx} className="text-center text-xs">
                                                                <p className="font-medium">
                                                                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                                                                </p>
                                                                <p>{day.temperatureHigh?.toFixed(0)}°</p>
                                                                {day.rainfallProbability > 40 && (
                                                                    <p className="text-blue-500">{day.rainfallProbability?.toFixed(0)}% rain</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">Weather data unavailable</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recommendations Card */}
                            <Card className="lg:col-span-2">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div>
                                        <CardTitle className="text-lg">Today's Recommendations</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {dailyRec?.briefing || `Day ${daysSincePlanting} of your ${farm.crop} journey`}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={refreshRecommendations}
                                        disabled={isRefreshing}
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {recommendations.length > 0 ? (
                                        <div className="space-y-3">
                                            {recommendations.map((rec) => (
                                                <motion.div
                                                    key={rec.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg"
                                                >
                                                    <Badge className={PRIORITY_COLORS[rec.priority]}>
                                                        {rec.priority}
                                                    </Badge>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{rec.action}</p>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {rec.reasoning}
                                                        </p>
                                                        {rec.estimatedCost && rec.estimatedCost > 0 && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Est. cost: ₦{rec.estimatedCost.toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => markRecommendationComplete(rec.id)}
                                                    >
                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                    </Button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                            <p className="font-medium">No urgent tasks today</p>
                                            <p className="text-sm text-muted-foreground">
                                                Your farm is on track. Keep monitoring!
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Farm Status */}
                        {farmStatus && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        {farmStatus.isOnTrack ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                                        )}
                                        Farm Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-3">{farmStatus.statusSummary}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {farmStatus.positives?.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-green-600 mb-2">Going Well</p>
                                                <ul className="space-y-1">
                                                    {farmStatus.positives.map((item: string, idx: number) => (
                                                        <li key={idx} className="text-sm flex items-center gap-2">
                                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {farmStatus.concerns?.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-amber-600 mb-2">Watch Out</p>
                                                <ul className="space-y-1">
                                                    {farmStatus.concerns.map((item: string, idx: number) => (
                                                        <li key={idx} className="text-sm flex items-center gap-2">
                                                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Button variant="outline" className="h-auto py-4 flex-col">
                                <MessageSquare className="h-5 w-5 mb-2" />
                                <span className="text-sm">Ask Assistant</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 flex-col">
                                <TrendingUp className="h-5 w-5 mb-2" />
                                <span className="text-sm">Market Prices</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 flex-col">
                                <Sprout className="h-5 w-5 mb-2" />
                                <span className="text-sm">Soil Analysis</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 flex-col">
                                <AlertTriangle className="h-5 w-5 mb-2" />
                                <span className="text-sm">Report Issue</span>
                            </Button>
                        </div>
                    </TabsContent>

                    {/* TIMELINE TAB */}
                    <TabsContent value="timeline">
                        <Card>
                            <CardHeader>
                                <CardTitle>Farm Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative pl-8 space-y-6">
                                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-green-200 dark:bg-green-800" />

                                    {/* Planting */}
                                    <div className="relative">
                                        <div className="absolute -left-5 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                                        <div>
                                            <p className="font-medium">Planted</p>
                                            <p className="text-sm text-muted-foreground">
                                                {plantingDate.toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Current */}
                                    <div className="relative">
                                        <div className="absolute -left-5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white animate-pulse" />
                                        <div>
                                            <p className="font-medium capitalize">{farm.current_growth_stage}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Day {daysSincePlanting} - Current Stage
                                            </p>
                                        </div>
                                    </div>

                                    {/* Harvest */}
                                    {harvestDate && (
                                        <div className="relative">
                                            <div className="absolute -left-5 w-4 h-4 rounded-full bg-gray-300 border-2 border-white" />
                                            <div>
                                                <p className="font-medium text-muted-foreground">Expected Harvest</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {harvestDate.toLocaleDateString()} ({daysToHarvest} days)
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PLAN TAB */}
                    <TabsContent value="plan">
                        <Card>
                            <CardHeader>
                                <CardTitle>Farm Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Your comprehensive farm plan will be displayed here.
                                </p>
                                <Button className="mt-4" onClick={() => navigate(`/comprehensive-plan?farm=${farmId}`)}>
                                    View Full Plan
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ANALYTICS TAB */}
                    <TabsContent value="analytics">
                        <Card>
                            <CardHeader>
                                <CardTitle>Farm Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Days Active</p>
                                        <p className="text-2xl font-bold">{daysSincePlanting}</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Budget Spent</p>
                                        <p className="text-2xl font-bold">
                                            ₦{(farm.budget_spent || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Expected Revenue</p>
                                        <p className="text-2xl font-bold">
                                            ₦{(farm.expected_revenue || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default ActiveFarmDashboard;
