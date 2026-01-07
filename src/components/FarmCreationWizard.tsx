import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import LocationSelector from '@/components/LocationSelector';
import { UnitSelector } from '@/components/UnitSelector';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Loader2,
    MapPin,
    Sprout,
    Droplets,
    FlaskConical,
    CheckCircle,
    Calendar,
    Wallet
} from 'lucide-react';

interface FarmData {
    farm_name: string;
    location: {
        country: string;
        state: string;
        lga: string;
    };
    farm_size: number;
    size_unit: string;
    crop: string;
    crop_variety: string;
    water_access: string;
    irrigation_method: string;
    planting_date: string;
    budget: number | null;
    notes: string;
    soil_profile: {
        type: string;
        pH: number | null;
        color: string;
        texture: string;
    } | null;
}

const STEPS = [
    { id: 1, title: 'Farm Details', icon: MapPin, description: 'Name and location' },
    { id: 2, title: 'Crop Selection', icon: Sprout, description: 'What to grow' },
    { id: 3, title: 'Water & Irrigation', icon: Droplets, description: 'Water management' },
    { id: 4, title: 'Soil & Budget', icon: FlaskConical, description: 'Optional details' },
    { id: 5, title: 'Review', icon: CheckCircle, description: 'Confirm and start' },
];

const CROPS = [
    'Maize', 'Rice', 'Tomato', 'Pepper', 'Cassava', 'Yam', 'Groundnut',
    'Beans', 'Soybean', 'Sorghum', 'Millet', 'Wheat', 'Cowpea',
    'Okra', 'Cucumber', 'Watermelon', 'Onion', 'Carrot', 'Cabbage',
    'Cocoa', 'Coffee', 'Palm Oil', 'Sugarcane', 'Cotton'
];

const WATER_SOURCES = [
    { value: 'none', label: 'No water source (rain-fed only)' },
    { value: 'well', label: 'Well' },
    { value: 'borehole', label: 'Borehole' },
    { value: 'river', label: 'River/Stream' },
    { value: 'municipal', label: 'Municipal/Pipe Water' },
    { value: 'rainwater', label: 'Rainwater Harvesting' },
];

const IRRIGATION_METHODS = [
    { value: 'none', label: 'No irrigation (rain-fed)' },
    { value: 'manual', label: 'Manual (watering can/bucket)' },
    { value: 'flood', label: 'Flood irrigation' },
    { value: 'drip', label: 'Drip irrigation' },
    { value: 'sprinkler', label: 'Sprinkler system' },
];

const SOIL_TYPES = [
    'Sandy', 'Loamy', 'Clay', 'Sandy Loam', 'Clay Loam', 'Silty', 'Peaty'
];

export function FarmCreationWizard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [farmData, setFarmData] = useState<FarmData>({
        farm_name: '',
        location: { country: 'Nigeria', state: '', lga: '' },
        farm_size: 1,
        size_unit: 'hectares',
        crop: '',
        crop_variety: '',
        water_access: 'none',
        irrigation_method: 'none',
        planting_date: new Date().toISOString().split('T')[0],
        budget: null,
        notes: '',
        soil_profile: null,
    });

    const updateFarmData = (updates: Partial<FarmData>) => {
        setFarmData(prev => ({ ...prev, ...updates }));
    };

    const canProceed = (): boolean => {
        switch (currentStep) {
            case 1:
                return !!farmData.farm_name && !!farmData.location.state && farmData.farm_size > 0;
            case 2:
                return !!farmData.crop && !!farmData.planting_date;
            case 3:
                return !!farmData.water_access;
            case 4:
                return true; // Optional step
            case 5:
                return true; // Review step
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);

        try {
            // Fetch weather data first
            const { data: weatherResult, error: weatherError } = await supabase.functions.invoke(
                'fetch-weather-data',
                {
                    body: {
                        state: farmData.location.state,
                        lga: farmData.location.lga,
                    },
                }
            );

            if (weatherError) {
                console.warn('Weather fetch failed:', weatherError);
            }

            // Initialize farm session
            const { data: result, error } = await supabase.functions.invoke(
                'initialize-farm-session',
                {
                    body: {
                        ...farmData,
                        weather_data: weatherResult?.data || {
                            current: { temperature: 28, conditions: 'Clear', humidity: 65 },
                            forecast: [],
                        },
                    },
                }
            );

            if (error) throw error;

            toast({
                title: 'Farm Created! 🌱',
                description: `${farmData.farm_name} is now being tracked. Your first recommendations are ready!`,
            });

            // Navigate to the new farm dashboard
            navigate(`/farm/${result.data.farm.id}`);

        } catch (error) {
            console.error('Error creating farm:', error);
            toast({
                title: 'Failed to create farm',
                description: error instanceof Error ? error.message : 'Please try again',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="farm_name">Farm Name *</Label>
                            <Input
                                id="farm_name"
                                placeholder="e.g., My Maize Farm, Home Garden"
                                value={farmData.farm_name}
                                onChange={(e) => updateFarmData({ farm_name: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <LocationSelector
                            country={farmData.location.country}
                            state={farmData.location.state}
                            lga={farmData.location.lga}
                            onCountryChange={(country) => updateFarmData({
                                location: { ...farmData.location, country }
                            })}
                            onStateChange={(state) => updateFarmData({
                                location: { ...farmData.location, state, lga: '' }
                            })}
                            onLgaChange={(lga) => updateFarmData({
                                location: { ...farmData.location, lga }
                            })}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="farm_size">Farm Size *</Label>
                                <Input
                                    id="farm_size"
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={farmData.farm_size}
                                    onChange={(e) => updateFarmData({ farm_size: parseFloat(e.target.value) || 0 })}
                                    className="mt-1"
                                />
                            </div>
                            <UnitSelector
                                value={farmData.size_unit}
                                onChange={(size_unit) => updateFarmData({ size_unit })}
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="crop">What do you want to grow? *</Label>
                            <Select
                                value={farmData.crop}
                                onValueChange={(crop) => updateFarmData({ crop })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select a crop" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CROPS.map((crop) => (
                                        <SelectItem key={crop} value={crop.toLowerCase()}>
                                            {crop}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="crop_variety">Variety (optional)</Label>
                            <Input
                                id="crop_variety"
                                placeholder="e.g., SAMMAZ 15, FARO 44"
                                value={farmData.crop_variety}
                                onChange={(e) => updateFarmData({ crop_variety: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="planting_date" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Planting Date *
                            </Label>
                            <Input
                                id="planting_date"
                                type="date"
                                value={farmData.planting_date}
                                onChange={(e) => updateFarmData({ planting_date: e.target.value })}
                                className="mt-1"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                Set your planned or actual planting date
                            </p>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label>Water Source *</Label>
                            <Select
                                value={farmData.water_access}
                                onValueChange={(water_access) => updateFarmData({ water_access })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {WATER_SOURCES.map((source) => (
                                        <SelectItem key={source.value} value={source.value}>
                                            {source.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Irrigation Method</Label>
                            <Select
                                value={farmData.irrigation_method}
                                onValueChange={(irrigation_method) => updateFarmData({ irrigation_method })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {IRRIGATION_METHODS.map((method) => (
                                        <SelectItem key={method.value} value={method.value}>
                                            {method.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {farmData.water_access === 'none' && farmData.irrigation_method === 'none' && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    ⚠️ Your farm will be rain-fed only. We'll optimize recommendations based on rainfall forecasts.
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                This step is optional but helps us provide better recommendations.
                            </p>
                        </div>

                        <div>
                            <Label>Soil Type</Label>
                            <Select
                                value={farmData.soil_profile?.type || ''}
                                onValueChange={(type) => updateFarmData({
                                    soil_profile: { ...(farmData.soil_profile || { type: '', pH: null, color: '', texture: '' }), type }
                                })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select soil type (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SOIL_TYPES.map((type) => (
                                        <SelectItem key={type} value={type.toLowerCase()}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="budget" className="flex items-center gap-2">
                                <Wallet className="h-4 w-4" />
                                Budget (₦)
                            </Label>
                            <Input
                                id="budget"
                                type="number"
                                placeholder="Enter your budget (optional)"
                                value={farmData.budget || ''}
                                onChange={(e) => updateFarmData({
                                    budget: e.target.value ? parseFloat(e.target.value) : null
                                })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes">Additional Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Any other information about your farm..."
                                value={farmData.notes}
                                onChange={(e) => updateFarmData({ notes: e.target.value })}
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                            <h3 className="text-lg font-semibold">Ready to Start!</h3>
                            <p className="text-muted-foreground">Review your farm details below</p>
                        </div>

                        <div className="space-y-4 bg-muted/50 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Farm Name:</span>
                                    <p className="font-medium">{farmData.farm_name}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Location:</span>
                                    <p className="font-medium">
                                        {farmData.location.lga || farmData.location.state}, {farmData.location.state}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Size:</span>
                                    <p className="font-medium">{farmData.farm_size} {farmData.size_unit}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Crop:</span>
                                    <p className="font-medium capitalize">
                                        {farmData.crop}{farmData.crop_variety && ` (${farmData.crop_variety})`}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Planting Date:</span>
                                    <p className="font-medium">{new Date(farmData.planting_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Water:</span>
                                    <p className="font-medium capitalize">{farmData.water_access.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-800 dark:text-green-200">
                                🌱 We'll generate a comprehensive farm plan and start providing daily recommendations based on your location's weather and your crop's needs.
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex flex-col items-center ${index > 0 ? 'ml-4' : ''}`}>
                                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${currentStep >= step.id
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                    }
                `}>
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <span className="text-xs mt-1 hidden md:block">{step.title}</span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className={`h-1 w-8 md:w-16 mx-2 ${currentStep > step.id
                                    ? 'bg-green-500'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Main Card */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {React.createElement(STEPS[currentStep - 1].icon, { className: 'h-5 w-5 text-green-500' })}
                            {STEPS[currentStep - 1].title}
                        </CardTitle>
                        <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderStep()}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>

                            {currentStep < STEPS.length ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                >
                                    Next
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating Farm...
                                        </>
                                    ) : (
                                        <>
                                            <Sprout className="h-4 w-4 mr-2" />
                                            Start Farm Tracking
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Help Text */}
                <p className="text-center text-sm text-muted-foreground mt-4">
                    Need help? Our Farm Assistant can answer any questions.
                </p>
            </div>
        </div>
    );
}

export default FarmCreationWizard;
