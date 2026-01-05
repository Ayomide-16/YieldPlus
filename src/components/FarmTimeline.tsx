import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
    Droplets,
    Sprout,
    Bug,
    FlaskConical,
    Sun,
    CloudRain,
    Eye,
    Scissors,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    Filter
} from 'lucide-react';

interface FarmActivity {
    id: string;
    farm_id: string;
    activity_type: string;
    activity_date: string;
    scheduled_date?: string;
    status: string;
    completion_date?: string;
    notes?: string;
    cost?: number;
    created_at: string;
}

interface FarmTimelineProps {
    farmId: string;
    plantingDate: string;
    expectedHarvestDate?: string;
    currentStage: string;
}

// Activity type icons and colors
const ACTIVITY_CONFIG: Record<string, { icon: typeof Sprout; color: string; bgColor: string }> = {
    irrigation: { icon: Droplets, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    fertilization: { icon: FlaskConical, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    planting: { icon: Sprout, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    weeding: { icon: Sprout, color: 'text-lime-500', bgColor: 'bg-lime-100 dark:bg-lime-900/30' },
    pest_treatment: { icon: Bug, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' },
    disease_treatment: { icon: Bug, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
    inspection: { icon: Eye, color: 'text-amber-500', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
    harvesting: { icon: Scissors, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
    other: { icon: Calendar, color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string }> = {
    completed: { icon: CheckCircle2, color: 'text-green-500' },
    skipped: { icon: XCircle, color: 'text-gray-400' },
    pending: { icon: Clock, color: 'text-amber-500' },
    delayed: { icon: Clock, color: 'text-red-500' },
};

export const FarmTimeline: React.FC<FarmTimelineProps> = ({
    farmId,
    plantingDate,
    expectedHarvestDate,
    currentStage,
}) => {
    const [activities, setActivities] = useState<FarmActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        loadActivities();
    }, [farmId]);

    const loadActivities = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('farm_activities')
            .select('*')
            .eq('farm_id', farmId)
            .order('activity_date', { ascending: false });

        if (!error && data) {
            setActivities(data as FarmActivity[]);
        }
        setIsLoading(false);
    };

    // Calculate key dates
    const planting = new Date(plantingDate);
    const today = new Date();
    const harvest = expectedHarvestDate ? new Date(expectedHarvestDate) : null;
    const daysSincePlanting = Math.floor((today.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24));

    // Group activities by date
    const groupedActivities = activities.reduce((groups, activity) => {
        const date = activity.activity_date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(activity);
        return groups;
    }, {} as Record<string, FarmActivity[]>);

    // Filter activities
    const filteredActivities = filter === 'all'
        ? activities
        : activities.filter(a => a.activity_type === filter);

    // Get unique activity types for filter
    const activityTypes = [...new Set(activities.map(a => a.activity_type))];

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-500" />
                        Farm Timeline
                    </CardTitle>
                    <Badge variant="outline">{activities.length} activities</Badge>
                </div>
            </CardHeader>

            <CardContent>
                {/* Key Milestones */}
                <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
                    <div className="text-center">
                        <Sprout className="h-5 w-5 text-green-500 mx-auto" />
                        <p className="text-xs text-muted-foreground">Planted</p>
                        <p className="text-sm font-medium">
                            {planting.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                        </p>
                    </div>
                    <div className="flex-1 h-1 mx-4 bg-gradient-to-r from-green-500 to-amber-500 rounded-full relative">
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
                            style={{ left: `${Math.min(100, (daysSincePlanting / (harvest ? Math.floor((harvest.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24)) : 90)) * 100)}%` }}
                        />
                    </div>
                    <div className="text-center">
                        <Scissors className="h-5 w-5 text-amber-500 mx-auto" />
                        <p className="text-xs text-muted-foreground">Harvest</p>
                        <p className="text-sm font-medium">
                            {harvest
                                ? harvest.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
                                : 'TBD'}
                        </p>
                    </div>
                </div>

                {/* Current Position */}
                <div className="text-center mb-4">
                    <Badge className="bg-blue-500 text-white">
                        Day {daysSincePlanting} • {currentStage}
                    </Badge>
                </div>

                {/* Filter Buttons */}
                {activityTypes.length > 1 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        <Button
                            size="sm"
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                            className="flex-shrink-0"
                        >
                            All
                        </Button>
                        {activityTypes.map(type => {
                            const config = ACTIVITY_CONFIG[type] || ACTIVITY_CONFIG.other;
                            const Icon = config.icon;
                            return (
                                <Button
                                    key={type}
                                    size="sm"
                                    variant={filter === type ? 'default' : 'outline'}
                                    onClick={() => setFilter(type)}
                                    className="flex-shrink-0"
                                >
                                    <Icon className={`h-4 w-4 mr-1 ${filter === type ? '' : config.color}`} />
                                    {type.replace('_', ' ')}
                                </Button>
                            );
                        })}
                    </div>
                )}

                {/* Activities List */}
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No activities recorded yet</p>
                        <p className="text-sm text-muted-foreground">
                            Activities will appear here as you complete tasks
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-[300px]">
                        <div className="relative pl-8">
                            {/* Timeline line */}
                            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-gray-300" />

                            {filteredActivities.map((activity, index) => {
                                const config = ACTIVITY_CONFIG[activity.activity_type] || ACTIVITY_CONFIG.other;
                                const statusConfig = STATUS_CONFIG[activity.status] || STATUS_CONFIG.pending;
                                const Icon = config.icon;
                                const StatusIcon = statusConfig.icon;

                                const activityDate = new Date(activity.activity_date);
                                const dayNumber = Math.floor((activityDate.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24));

                                return (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="relative mb-4"
                                    >
                                        {/* Timeline dot */}
                                        <div className={`absolute -left-5 w-4 h-4 rounded-full ${config.bgColor} border-2 border-white flex items-center justify-center`}>
                                            <Icon className={`h-2.5 w-2.5 ${config.color}`} />
                                        </div>

                                        {/* Activity Card */}
                                        <div className={`p-3 rounded-lg ${config.bgColor}`}>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-sm capitalize">
                                                            {activity.activity_type.replace('_', ' ')}
                                                        </span>
                                                        <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Day {dayNumber} • {activityDate.toLocaleDateString('en-NG', {
                                                            weekday: 'short',
                                                            day: 'numeric',
                                                            month: 'short',
                                                        })}
                                                    </p>
                                                    {activity.notes && (
                                                        <p className="text-xs mt-1 text-muted-foreground">
                                                            {activity.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                {activity.cost && activity.cost > 0 && (
                                                    <span className="text-xs font-medium">
                                                        ₦{activity.cost.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}

                {/* Summary Stats */}
                {activities.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                        <div className="text-center">
                            <p className="text-lg font-bold text-green-600">
                                {activities.filter(a => a.status === 'completed').length}
                            </p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-amber-600">
                                {activities.filter(a => a.status === 'pending').length}
                            </p>
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold">
                                ₦{activities.reduce((sum, a) => sum + (a.cost || 0), 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">Total Spent</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FarmTimeline;
