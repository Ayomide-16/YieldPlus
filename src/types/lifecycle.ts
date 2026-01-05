// TypeScript Types for YieldPlus Lifecycle System

// ============================================
// LOCATION TYPES
// ============================================
export interface Location {
    country: string;
    state: string;
    lga?: string;
    lat?: number;
    lon?: number;
}

// ============================================
// FARM TYPES
// ============================================
export interface SoilProfile {
    type: string;
    color?: string;
    texture?: string;
    pH?: number;
    healthScore?: number;
    nutrients?: {
        nitrogen?: number;
        phosphorus?: number;
        potassium?: number;
        organicMatter?: number;
    };
    issues?: string[];
    lastAnalyzed?: string;
}

export interface ActiveFarm {
    id: string;
    user_id: string;
    farm_name: string;
    location: Location;
    farm_size: number;
    size_unit: string;
    soil_profile?: SoilProfile;
    crop: string;
    crop_variety?: string;
    water_access: 'none' | 'well' | 'borehole' | 'river' | 'municipal' | 'rainwater';
    irrigation_method: 'none' | 'drip' | 'sprinkler' | 'flood' | 'manual';
    planting_date: string;
    expected_harvest_date?: string;
    current_growth_stage: string;
    days_in_stage: number;
    status: 'active' | 'harvested' | 'archived' | 'paused';
    plan_id?: string;
    budget?: number;
    budget_spent: number;
    expected_yield?: number;
    expected_revenue?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    last_activity: string;
}

export interface FarmActivity {
    id: string;
    farm_id: string;
    activity_type: ActivityType;
    activity_date: string;
    scheduled_date?: string;
    recommendation_id?: string;
    status: 'pending' | 'completed' | 'skipped' | 'delayed';
    completion_date?: string;
    notes?: string;
    cost?: number;
    resources_used?: ResourceUsed[];
    weather_at_time?: object;
    created_at: string;
}

export type ActivityType =
    | 'irrigation'
    | 'fertilization'
    | 'inspection'
    | 'planting'
    | 'weeding'
    | 'pest_treatment'
    | 'disease_treatment'
    | 'pruning'
    | 'thinning'
    | 'mulching'
    | 'staking'
    | 'harvesting'
    | 'post_harvest'
    | 'soil_preparation'
    | 'other';

export interface ResourceUsed {
    name: string;
    quantity: number;
    unit: string;
    cost?: number;
}

// ============================================
// RECOMMENDATION TYPES
// ============================================
export interface Recommendation {
    id: string;
    type: ActivityType;
    priority: 'critical' | 'high' | 'normal' | 'low';
    action: string;
    reasoning: string;
    resources?: string[];
    estimatedCost?: number;
    estimatedTime?: string;
    deadline?: string;
}

export interface DailyRecommendation {
    id: string;
    farm_id: string;
    recommendation_date: string;
    days_since_planting: number;
    current_stage: string;
    briefing: string;
    recommendations: Recommendation[];
    weather_data: WeatherData;
    farm_status: FarmStatus;
    user_viewed: boolean;
    viewed_at?: string;
    created_at: string;
}

export interface FarmStatus {
    isOnTrack: boolean;
    statusSummary: string;
    concerns: string[];
    positives: string[];
}

// ============================================
// FEEDBACK TYPES
// ============================================
export type FeedbackType =
    | 'weather_confirmation'
    | 'growth_milestone'
    | 'issue_report'
    | 'photo_analysis'
    | 'soil_check'
    | 'activity_completion'
    | 'observation';

export interface FarmFeedback {
    id: string;
    farm_id: string;
    feedback_type: FeedbackType;
    feedback_date: string;
    question?: string;
    user_response: object;
    ai_interpretation?: string;
    plan_adjusted: boolean;
    adjustments_made?: object;
    created_at: string;
}

export interface WeatherConfirmation {
    rain_occurred: boolean;
    rain_amount?: 'none' | 'light' | 'moderate' | 'heavy';
    was_forecasted: boolean;
}

export interface GrowthMilestone {
    expected_stage: string;
    actual_stage: 'on_track' | 'behind' | 'ahead';
    observations?: string;
    photo_url?: string;
}

export interface IssueReport {
    issue_type: 'pest' | 'disease' | 'nutrient' | 'water' | 'weather' | 'other';
    description: string;
    severity: 'minor' | 'moderate' | 'severe';
    affected_area?: string;
    photo_url?: string;
}

// ============================================
// WEATHER TYPES
// ============================================
export interface WeatherData {
    current: CurrentWeather;
    forecast: DailyForecast[];
    climate?: ClimateData;
    fetchedAt: string;
    source: string;
}

export interface CurrentWeather {
    temperature: number;
    feelsLike: number;
    humidity: number;
    conditions: string;
    description: string;
    icon: string;
    windSpeed: number;
    windDirection: number;
    cloudCover: number;
    visibility: number;
    pressure: number;
    rainfall?: number;
    timestamp: string;
}

export interface DailyForecast {
    date: string;
    temperatureHigh: number;
    temperatureLow: number;
    temperatureAvg: number;
    humidity: number;
    conditions: string;
    description: string;
    icon: string;
    rainfallProbability: number;
    rainfallAmount: number;
    windSpeed: number;
    sunrise?: string;
    sunset?: string;
}

export interface ClimateData {
    monthly: MonthlyClimate[];
    annualRainfall: number;
    drySeasonMonths: number[];
    wetSeasonMonths: number[];
    source: string;
    yearsOfData: number;
}

export interface MonthlyClimate {
    month: number;
    monthName: string;
    averageRainfall: number;
    rainyDays: number;
    averageTemperatureHigh: number;
    averageTemperatureLow: number;
    averageHumidity: number;
}

// ============================================
// MARKET TYPES
// ============================================
export interface MarketPrice {
    id: string;
    crop_name: string;
    variety?: string;
    state: string;
    lga?: string;
    market_name?: string;
    price: number;
    unit: string;
    price_date: string;
    source: string;
    confidence_level: 'high' | 'medium' | 'low';
    verified: boolean;
    verified_by?: string;
    recorded_at: string;
}

export interface PriceTrend {
    direction: 'rising' | 'falling' | 'stable';
    percentChange: number;
    period: string;
    volatility: 'low' | 'medium' | 'high';
}

export interface PriceForecast {
    crop: string;
    location: Location;
    currentPrice: number;
    forecastDate: string;
    expectedPrice: number;
    confidenceInterval: {
        low: number;
        high: number;
    };
    confidence: number;
    reasoning: string;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

// ============================================
// HARVEST TYPES
// ============================================
export interface HarvestRecord {
    id: string;
    farm_id: string;
    harvest_date: string;
    actual_yield: number;
    yield_unit: string;
    quality_rating?: number;
    selling_strategy?: 'immediate' | 'stored' | 'partial';
    storage_location?: string;
    sale_price?: number;
    sale_date?: string;
    sale_channel?: 'farm_gate' | 'local_market' | 'middleman' | 'retailer' | 'exchange';
    revenue?: number;
    total_investment?: number;
    profit?: number;
    roi?: number;
    lessons_learned?: string;
    notes?: string;
    created_at: string;
}

export interface HarvestAdvisory {
    harvestReadiness: {
        biologicalMaturity: 'not_ready' | 'approaching' | 'ready' | 'overdue';
        confidence: number;
        indicators: {
            observed: string[];
            expected: string[];
            assessment: string;
        };
    };
    harvestTiming: {
        recommendation: 'harvest_now' | 'wait' | 'monitor';
        optimalWindow: {
            startDate: string;
            endDate: string;
        };
        weatherConsiderations: string;
        urgency: 'low' | 'medium' | 'high';
        reasoning: string;
    };
    sellingStrategy: {
        recommendation: 'sell_immediately' | 'store_short' | 'store_medium';
        reasoning: string;
        priceAnalysis: {
            currentPrice: number;
            historicalAverage: number;
            percentageDifference: number;
            trend: 'rising' | 'falling' | 'stable';
        };
        profitComparison: {
            sellNow: FinancialProjection;
            storeAndSell?: FinancialProjection;
        };
    };
}

export interface FinancialProjection {
    revenue: number;
    costs: number;
    netProfit: number;
    roi: number;
    timeframe?: string;
    risks?: string[];
}

// ============================================
// CROP DATABASE TYPES
// ============================================
export interface CropInfo {
    id: string;
    crop_name: string;
    scientific_name?: string;
    category: 'cereal' | 'legume' | 'tuber' | 'vegetable' | 'fruit' | 'cash_crop';
    growth_stages: GrowthStage[];
    total_duration_days: number;
    soil_requirements: object;
    climate_requirements: object;
    water_requirements_per_day: number;
    nutrient_requirements: object;
    common_pests: PestInfo[];
    common_diseases: DiseaseInfo[];
    planting_methods: object;
    spacing_recommendations: object;
    expected_yield_per_hectare: {
        low: number;
        average: number;
        high: number;
        unit: string;
    };
    harvest_indicators: string[];
    storage_characteristics: object;
    market_demand_level: 'low' | 'medium' | 'high';
}

export interface GrowthStage {
    name: string;
    duration_days: number;
    description: string;
    key_activities: string[];
    indicators: string[];
}

export interface PestInfo {
    name: string;
    risk_period: string;
    symptoms: string[];
    treatment: string[];
}

export interface DiseaseInfo {
    name: string;
    risk_period: string;
    symptoms: string[];
    treatment: string[];
}

// ============================================
// CHAT TYPES
// ============================================
export interface ChatMessage {
    id: string;
    user_id: string;
    farm_id?: string;
    message: string;
    response: string;
    farm_context?: FarmContext;
    created_at: string;
}

export interface FarmContext {
    farm: ActiveFarm;
    weather: WeatherData;
    recentActivities: FarmActivity[];
    pendingRecommendations: Recommendation[];
    marketPrice?: MarketPrice;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface DailyBriefingResponse {
    briefing: string;
    recommendations: Recommendation[];
    farmStatus: FarmStatus;
    nextMilestone: {
        milestone: string;
        expectedDate: string;
        daysAway: number;
    };
}

export interface InitializeFarmResponse {
    farm: ActiveFarm;
    plan: object;
    firstRecommendations: Recommendation[];
}

// ============================================
// FORM INPUT TYPES
// ============================================
export interface CreateFarmInput {
    farm_name: string;
    location: Location;
    farm_size: number;
    size_unit: string;
    crop: string;
    crop_variety?: string;
    water_access: string;
    irrigation_method: string;
    planting_date: string;
    soil_profile?: SoilProfile;
    budget?: number;
    notes?: string;
}

export interface MidSeasonEntryInput extends CreateFarmInput {
    current_stage: string;
    stage_status: 'on_track' | 'behind' | 'ahead';
    fertilizer_applied?: boolean;
    fertilizer_details?: string;
    issues_noticed?: string[];
    photo_url?: string;
}

export interface FeedbackInput {
    farm_id: string;
    feedback_type: FeedbackType;
    response: object;
}
