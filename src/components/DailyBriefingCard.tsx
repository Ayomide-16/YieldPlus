import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Sun,
    CloudRain,
    Cloud,
    CloudSun,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Droplets,
    Sprout,
    Calendar,
    ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Recommendation, DailyRecommendation } from '@/types/lifecycle';

// Props interfaces
interface DailyBriefingCardProps {
    briefing: string;
    recommendations: Recommendation[];
    daysSincePlanting: number;
    currentStage: string;
    daysToHarvest: number | null;
    weather?: {
        current?: {
            temperature: number;
            conditions: string;
            humidity: number;
        };
        forecast?: Array<{
            date: string;
            rainfallProbability: number;
            conditions: string;
        }>;
    };
    onComplete?: (recommendationId: string) => void;
    onSkip?: (recommendationId: string) => void;
}

interface RecommendationItemProps {
    recommendation: Recommendation;
    onComplete?: (id: string) => void;
    onSkip?: (id: string) => void;
}

// Weather icon component
const WeatherIcon: React.FC<{ condition: string; className?: string }> = ({ condition, className }) => {
    const icons: Record<string, typeof Sun> = {
        'Clear': Sun,
        'Sunny': Sun,
        'Clouds': Cloud,
        'Partly Cloudy': CloudSun,
        'Rain': CloudRain,
        'Drizzle': CloudRain,
        'Thunderstorm': CloudRain,
    };

    const IconComponent = icons[condition] || Sun;
    return <IconComponent className={className} />;
};

// Priority badge component
const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
    const colors: Record<string, string> = {
        critical: 'bg-red-500 hover:bg-red-600',
        high: 'bg-orange-500 hover:bg-orange-600',
        normal: 'bg-blue-500 hover:bg-blue-600',
        low: 'bg-gray-500 hover:bg-gray-600',
    };

    return (
        <Badge className={`${colors[priority] || colors.normal} text-white`}>
            {priority}
        </Badge>
    );
};

// Recommendation Item Component
export const RecommendationItem: React.FC<RecommendationItemProps> = ({
    recommendation,
    onComplete,
    onSkip,
}) => {
    const typeIcons: Record<string, typeof Droplets> = {
        irrigation: Droplets,
        fertilization: Sprout,
        inspection: AlertTriangle,
        planting: Sprout,
        harvest: Sprout,
    };

    const TypeIcon = typeIcons[recommendation.type] || Clock;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
        >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TypeIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <PriorityBadge priority={recommendation.priority} />
                    <span className="text-xs text-muted-foreground capitalize">
                        {recommendation.type}
                    </span>
                </div>

                <p className="font-medium text-sm md:text-base">
                    {recommendation.action}
                </p>

                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {recommendation.reasoning}
                </p>

                {/* Resources and cost */}
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                    {recommendation.estimatedTime && (
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {recommendation.estimatedTime}
                        </span>
                    )}
                    {recommendation.estimatedCost && recommendation.estimatedCost > 0 && (
                        <span>Est: ₦{recommendation.estimatedCost.toLocaleString()}</span>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => onComplete?.(recommendation.id)}
                >
                    <CheckCircle2 className="h-5 w-5" />
                </Button>
            </div>
        </motion.div>
    );
};

// Daily Briefing Card Component
export const DailyBriefingCard: React.FC<DailyBriefingCardProps> = ({
    briefing,
    recommendations,
    daysSincePlanting,
    currentStage,
    daysToHarvest,
    weather,
    onComplete,
    onSkip,
}) => {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <Card className="overflow-hidden">
            {/* Header with date and weather */}
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {dayOfWeek}
                        </CardTitle>
                        <p className="text-green-100 text-sm">{dateStr}</p>
                        <p className="text-green-100 text-sm mt-1">
                            Day {daysSincePlanting} • {currentStage}
                        </p>
                    </div>

                    {weather?.current && (
                        <div className="text-right">
                            <div className="flex items-center gap-2">
                                <WeatherIcon
                                    condition={weather.current.conditions}
                                    className="h-8 w-8 text-yellow-200"
                                />
                                <span className="text-2xl font-bold">
                                    {weather.current.temperature?.toFixed(0)}°C
                                </span>
                            </div>
                            <p className="text-green-100 text-sm">
                                {weather.current.conditions}
                            </p>
                        </div>
                    )}
                </div>

                {/* Days to harvest badge */}
                {daysToHarvest !== null && daysToHarvest > 0 && (
                    <div className="mt-4">
                        <Badge className="bg-white/20 text-white hover:bg-white/30">
                            {daysToHarvest} days to harvest
                        </Badge>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-4">
                {/* Briefing text */}
                <p className="text-muted-foreground mb-4">
                    {briefing}
                </p>

                {/* Recommendations list */}
                {recommendations.length > 0 ? (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                            Today's Tasks ({recommendations.length})
                        </h3>
                        {recommendations.map((rec) => (
                            <RecommendationItem
                                key={rec.id}
                                recommendation={rec}
                                onComplete={onComplete}
                                onSkip={onSkip}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="font-medium">All Clear!</p>
                        <p className="text-sm text-muted-foreground">
                            No urgent tasks for today. Your farm is on track.
                        </p>
                    </div>
                )}

                {/* Rain forecast alert */}
                {weather?.forecast?.some(day => day.rainfallProbability > 60) && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <CloudRain className="h-4 w-4" />
                            <span className="text-sm font-medium">Rain Expected</span>
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            {weather.forecast
                                .filter(day => day.rainfallProbability > 60)
                                .map(day => new Date(day.date).toLocaleDateString('en', { weekday: 'short' }))
                                .join(', ')}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Farm Status Card Component
interface FarmStatusCardProps {
    isOnTrack: boolean;
    statusSummary: string;
    concerns: string[];
    positives: string[];
}

export const FarmStatusCard: React.FC<FarmStatusCardProps> = ({
    isOnTrack,
    statusSummary,
    concerns,
    positives,
}) => {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    {isOnTrack ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                    Farm Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm mb-4">{statusSummary}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {positives.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">
                                Going Well
                            </p>
                            <ul className="space-y-1">
                                {positives.map((item, idx) => (
                                    <li key={idx} className="text-sm flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {concerns.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wide">
                                Watch Out
                            </p>
                            <ul className="space-y-1">
                                {concerns.map((item, idx) => (
                                    <li key={idx} className="text-sm flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default DailyBriefingCard;
