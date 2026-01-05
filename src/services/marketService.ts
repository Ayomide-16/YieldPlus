// Market Service Module for YieldPlus Lifecycle System
// Handles market price data, trends, and forecasting

interface MarketPrice {
    cropName: string;
    variety?: string;
    state: string;
    lga?: string;
    marketName?: string;
    price: number;
    unit: string;
    date: Date;
    source: string;
    confidence: 'high' | 'medium' | 'low';
}

interface PriceTrend {
    direction: 'rising' | 'falling' | 'stable';
    percentChange: number;
    period: string;
    volatility: 'low' | 'medium' | 'high';
    seasonalPattern?: string;
}

interface PriceForecast {
    crop: string;
    location: { state: string; lga?: string };
    currentPrice: number;
    forecastDate: Date;
    expectedPrice: number;
    confidenceInterval: {
        low: number;
        high: number;
    };
    confidence: number; // 0-100
    reasoning: string;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface SeasonalPricePattern {
    month: number;
    monthName: string;
    averagePrice: number;
    priceIndex: number; // 100 = annual average
    typicalMovement: 'peak' | 'rising' | 'falling' | 'trough' | 'stable';
}

interface MarketAnalysis {
    crop: string;
    location: { state: string };
    currentPrice: MarketPrice | null;
    historicalPrices: MarketPrice[];
    trend: PriceTrend;
    seasonalPattern: SeasonalPricePattern[];
    forecast: PriceForecast;
    recommendation: string;
}

// Currency symbols by country
const CURRENCY: Record<string, { symbol: string; code: string }> = {
    'Nigeria': { symbol: '₦', code: 'NGN' },
    'Kenya': { symbol: 'KSh', code: 'KES' },
    'Ghana': { symbol: '₵', code: 'GHS' },
    'South Africa': { symbol: 'R', code: 'ZAR' },
    'Tanzania': { symbol: 'TSh', code: 'TZS' },
    'Uganda': { symbol: 'USh', code: 'UGX' },
    'Ethiopia': { symbol: 'Br', code: 'ETB' },
    'default': { symbol: '$', code: 'USD' }
};

/**
 * Get currency for a country
 */
export function getCurrency(country: string): { symbol: string; code: string } {
    return CURRENCY[country] || CURRENCY['default'];
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, country: string = 'Nigeria', unit: string = 'kg'): string {
    const currency = getCurrency(country);
    return `${currency.symbol}${price.toLocaleString()} per ${unit}`;
}

/**
 * Calculate price trend from historical data
 */
export function calculateTrend(prices: MarketPrice[]): PriceTrend {
    if (prices.length < 2) {
        return {
            direction: 'stable',
            percentChange: 0,
            period: 'insufficient data',
            volatility: 'low'
        };
    }

    // Sort by date descending (most recent first)
    const sorted = [...prices].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const recent = sorted[0];
    const previous = sorted[Math.min(sorted.length - 1, 7)]; // Compare to ~1 week ago or oldest

    const percentChange = ((recent.price - previous.price) / previous.price) * 100;

    // Calculate volatility (standard deviation of price changes)
    const priceValues = sorted.map(p => p.price);
    const mean = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
    const variance = priceValues.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / priceValues.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / mean) * 100;

    let volatility: 'low' | 'medium' | 'high';
    if (coefficientOfVariation < 10) volatility = 'low';
    else if (coefficientOfVariation < 25) volatility = 'medium';
    else volatility = 'high';

    let direction: 'rising' | 'falling' | 'stable';
    if (percentChange > 5) direction = 'rising';
    else if (percentChange < -5) direction = 'falling';
    else direction = 'stable';

    const daysDiff = Math.round(
        (new Date(recent.date).getTime() - new Date(previous.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
        direction,
        percentChange: Math.round(percentChange * 100) / 100,
        period: `Last ${daysDiff} days`,
        volatility
    };
}

/**
 * Calculate seasonal price patterns
 */
export function calculateSeasonalPattern(prices: MarketPrice[]): SeasonalPricePattern[] {
    const monthlyPrices: Record<number, number[]> = {};

    // Group prices by month
    for (const price of prices) {
        const month = new Date(price.date).getMonth() + 1;
        if (!monthlyPrices[month]) {
            monthlyPrices[month] = [];
        }
        monthlyPrices[month].push(price.price);
    }

    // Calculate monthly averages
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const patterns: SeasonalPricePattern[] = [];
    let annualTotal = 0;
    let monthCount = 0;

    for (let i = 1; i <= 12; i++) {
        const monthPrices = monthlyPrices[i] || [];
        const avgPrice = monthPrices.length > 0
            ? monthPrices.reduce((a, b) => a + b, 0) / monthPrices.length
            : 0;

        if (avgPrice > 0) {
            annualTotal += avgPrice;
            monthCount++;
        }

        patterns.push({
            month: i,
            monthName: monthNames[i - 1],
            averagePrice: Math.round(avgPrice * 100) / 100,
            priceIndex: 0, // Will calculate after
            typicalMovement: 'stable'
        });
    }

    // Calculate price index (100 = annual average)
    const annualAverage = monthCount > 0 ? annualTotal / monthCount : 0;

    for (const pattern of patterns) {
        if (annualAverage > 0 && pattern.averagePrice > 0) {
            pattern.priceIndex = Math.round((pattern.averagePrice / annualAverage) * 100);

            // Determine typical movement
            if (pattern.priceIndex >= 115) pattern.typicalMovement = 'peak';
            else if (pattern.priceIndex >= 105) pattern.typicalMovement = 'rising';
            else if (pattern.priceIndex <= 85) pattern.typicalMovement = 'trough';
            else if (pattern.priceIndex <= 95) pattern.typicalMovement = 'falling';
            else pattern.typicalMovement = 'stable';
        }
    }

    return patterns;
}

/**
 * Generate simple price forecast based on historical patterns
 */
export function generateForecast(
    crop: string,
    location: { state: string; lga?: string },
    historicalPrices: MarketPrice[],
    targetDate: Date
): PriceForecast {
    const trend = calculateTrend(historicalPrices);
    const seasonalPattern = calculateSeasonalPattern(historicalPrices);

    // Get current price
    const sortedPrices = [...historicalPrices].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const currentPrice = sortedPrices[0]?.price || 0;

    // Get target month's seasonal index
    const targetMonth = targetDate.getMonth() + 1;
    const targetPattern = seasonalPattern.find(p => p.month === targetMonth);
    const currentMonth = new Date().getMonth() + 1;
    const currentPattern = seasonalPattern.find(p => p.month === currentMonth);

    // Calculate forecast
    let expectedPrice = currentPrice;
    let confidence = 50;
    let reasoning = 'Based on limited data';
    let dataQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';

    if (historicalPrices.length >= 50) {
        dataQuality = 'excellent';
        confidence = 80;
    } else if (historicalPrices.length >= 20) {
        dataQuality = 'good';
        confidence = 65;
    } else if (historicalPrices.length >= 5) {
        dataQuality = 'fair';
        confidence = 50;
    }

    if (targetPattern && currentPattern && currentPattern.priceIndex > 0) {
        // Adjust for seasonal pattern
        const seasonalAdjustment = targetPattern.priceIndex / currentPattern.priceIndex;
        expectedPrice = currentPrice * seasonalAdjustment;

        // Apply trend momentum (but dampen it)
        const monthsToTarget = Math.abs(targetMonth - currentMonth);
        const trendMultiplier = 1 + ((trend.percentChange / 100) * (monthsToTarget / 4) * 0.5);
        expectedPrice = expectedPrice * trendMultiplier;

        reasoning = `Based on seasonal pattern (${targetPattern.typicalMovement} period) ` +
            `and recent ${trend.direction} trend (${trend.percentChange.toFixed(1)}%).`;
    }

    // Calculate confidence interval
    const uncertaintyFactor = (100 - confidence) / 100;
    const interval = expectedPrice * uncertaintyFactor * 0.3;

    return {
        crop,
        location,
        currentPrice,
        forecastDate: targetDate,
        expectedPrice: Math.round(expectedPrice * 100) / 100,
        confidenceInterval: {
            low: Math.round((expectedPrice - interval) * 100) / 100,
            high: Math.round((expectedPrice + interval) * 100) / 100
        },
        confidence,
        reasoning,
        dataQuality
    };
}

/**
 * Get selling recommendation based on price analysis
 */
export function getSellingRecommendation(
    forecast: PriceForecast,
    trend: PriceTrend,
    canStore: boolean = false,
    storageCostPerMonth: number = 0
): { recommendation: 'sell_now' | 'store_short' | 'store_medium'; reasoning: string } {
    const priceIncreasePotential =
        ((forecast.expectedPrice - forecast.currentPrice) / forecast.currentPrice) * 100;

    // If prices are falling or current price is above forecast
    if (trend.direction === 'falling' || forecast.currentPrice >= forecast.expectedPrice) {
        return {
            recommendation: 'sell_now',
            reasoning: `Current price is ${trend.direction === 'falling' ? 'declining' : 'favorable'}. ` +
                `Forecast suggests prices may ${forecast.expectedPrice < forecast.currentPrice ? 'drop' : 'stabilize'}.`
        };
    }

    // If user can't store
    if (!canStore) {
        return {
            recommendation: 'sell_now',
            reasoning: 'No storage available. Sell immediately to avoid quality deterioration.'
        };
    }

    // Calculate if storage is worth it
    const monthsToHold = Math.ceil(
        (forecast.forecastDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
    );
    const totalStorageCost = storageCostPerMonth * monthsToHold;
    const expectedGain = forecast.expectedPrice - forecast.currentPrice;

    if (expectedGain <= totalStorageCost) {
        return {
            recommendation: 'sell_now',
            reasoning: `Expected price increase (${priceIncreasePotential.toFixed(1)}%) ` +
                `won't cover storage costs of ${formatPrice(totalStorageCost, 'Nigeria')}.`
        };
    }

    if (monthsToHold <= 1) {
        return {
            recommendation: 'store_short',
            reasoning: `Prices expected to rise ${priceIncreasePotential.toFixed(1)}% in next month. ` +
                `Net gain after storage: ${formatPrice(expectedGain - totalStorageCost, 'Nigeria')}.`
        };
    }

    return {
        recommendation: 'store_medium',
        reasoning: `Prices expected to peak in ${monthsToHold} months. ` +
            `Potential net gain: ${formatPrice(expectedGain - totalStorageCost, 'Nigeria')}.`
    };
}

/**
 * Analyze market for a crop
 */
export function analyzeMarket(
    crop: string,
    location: { state: string; lga?: string },
    historicalPrices: MarketPrice[],
    targetHarvestDate: Date,
    canStore: boolean = false,
    storageCost: number = 0
): MarketAnalysis {
    const sortedPrices = [...historicalPrices].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const trend = calculateTrend(historicalPrices);
    const seasonalPattern = calculateSeasonalPattern(historicalPrices);
    const forecast = generateForecast(crop, location, historicalPrices, targetHarvestDate);
    const { recommendation, reasoning } = getSellingRecommendation(
        forecast, trend, canStore, storageCost
    );

    return {
        crop,
        location,
        currentPrice: sortedPrices[0] || null,
        historicalPrices: sortedPrices.slice(0, 20), // Last 20 records
        trend,
        seasonalPattern,
        forecast,
        recommendation: reasoning
    };
}

export type {
    MarketPrice,
    PriceTrend,
    PriceForecast,
    SeasonalPricePattern,
    MarketAnalysis
};
