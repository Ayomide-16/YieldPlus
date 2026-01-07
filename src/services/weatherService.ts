// Weather Service Module for YieldPlus Lifecycle System
// Integrates OpenWeatherMap (current + forecast) and NASA POWER (historical climate)

interface Location {
    country: string;
    state: string;
    lga?: string;
    lat?: number;
    lon?: number;
}

interface CurrentWeather {
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
    timestamp: Date;
    source: string;
}

interface DailyForecast {
    date: Date;
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
    sunrise: Date;
    sunset: Date;
}

interface Forecast {
    daily: DailyForecast[];
    source: string;
    fetchedAt: Date;
}

interface MonthlyClimate {
    month: number;
    monthName: string;
    averageRainfall: number;
    rainyDays: number;
    averageTemperatureHigh: number;
    averageTemperatureLow: number;
    averageHumidity: number;
}

interface ClimateData {
    monthly: MonthlyClimate[];
    annualRainfall: number;
    drySeasonMonths: number[];
    wetSeasonMonths: number[];
    source: string;
    yearsOfData: number;
}

interface WeatherError {
    error: string;
    code: string;
    source: string;
}

// Nigeria LGA coordinates lookup (sample - expand as needed)
const LGA_COORDINATES: Record<string, Record<string, { lat: number; lon: number }>> = {
    'Kano': {
        'Kano Municipal': { lat: 12.0, lon: 8.5167 },
        'Nassarawa': { lat: 11.9667, lon: 8.5333 },
        'Fagge': { lat: 12.0167, lon: 8.5 },
    },
    'Lagos': {
        'Lagos Island': { lat: 6.455, lon: 3.3841 },
        'Ikeja': { lat: 6.6018, lon: 3.3515 },
        'Alimosho': { lat: 6.6122, lon: 3.2577 },
    },
    'Kaduna': {
        'Kaduna North': { lat: 10.5264, lon: 7.4388 },
        'Kaduna South': { lat: 10.4839, lon: 7.4352 },
        'Zaria': { lat: 11.0667, lon: 7.7 },
    },
    // Add more states and LGAs...
};

// State capital coordinates as fallback
const STATE_CAPITALS: Record<string, { lat: number; lon: number }> = {
    'Abia': { lat: 5.5333, lon: 7.4833 },
    'Adamawa': { lat: 9.2333, lon: 12.4667 },
    'AkwaIbom': { lat: 5.0333, lon: 7.9333 },
    'Anambra': { lat: 6.2167, lon: 6.95 },
    'Bauchi': { lat: 10.3, lon: 9.8333 },
    'Bayelsa': { lat: 4.9333, lon: 6.2667 },
    'Benue': { lat: 7.7333, lon: 8.5333 },
    'Borno': { lat: 11.8333, lon: 13.15 },
    'CrossRiver': { lat: 4.95, lon: 8.3333 },
    'Delta': { lat: 5.5167, lon: 5.75 },
    'Ebonyi': { lat: 6.2667, lon: 8.1 },
    'Edo': { lat: 6.3333, lon: 5.6333 },
    'Ekiti': { lat: 7.6333, lon: 5.2333 },
    'Enugu': { lat: 6.45, lon: 7.5 },
    'FCT': { lat: 9.0833, lon: 7.5333 },
    'Gombe': { lat: 10.2833, lon: 11.1667 },
    'Imo': { lat: 5.4833, lon: 7.0333 },
    'Jigawa': { lat: 12.15, lon: 9.35 },
    'Kaduna': { lat: 10.5167, lon: 7.4333 },
    'Kano': { lat: 12.0, lon: 8.5167 },
    'Katsina': { lat: 13.0, lon: 7.6 },
    'Kebbi': { lat: 12.45, lon: 4.2 },
    'Kogi': { lat: 7.8, lon: 6.7333 },
    'Kwara': { lat: 8.5, lon: 4.55 },
    'Lagos': { lat: 6.4531, lon: 3.3958 },
    'Nasarawa': { lat: 8.5333, lon: 8.5333 },
    'Niger': { lat: 9.6167, lon: 6.55 },
    'Ogun': { lat: 7.1667, lon: 3.35 },
    'Ondo': { lat: 7.25, lon: 5.2 },
    'Osun': { lat: 7.6333, lon: 4.5667 },
    'Oyo': { lat: 7.3833, lon: 3.85 },
    'Plateau': { lat: 9.9167, lon: 8.9 },
    'Rivers': { lat: 4.8167, lon: 7.05 },
    'Sokoto': { lat: 13.0667, lon: 5.2333 },
    'Taraba': { lat: 8.8833, lon: 11.3667 },
    'Yobe': { lat: 11.75, lon: 11.9667 },
    'Zamfara': { lat: 12.1667, lon: 6.25 },
};

/**
 * Get coordinates for a location
 */
export function getCoordinates(location: Location): { lat: number; lon: number } | null {
    // If coordinates provided, use them
    if (location.lat && location.lon) {
        return { lat: location.lat, lon: location.lon };
    }

    // Try LGA-specific coordinates
    if (location.lga && location.state && LGA_COORDINATES[location.state]?.[location.lga]) {
        return LGA_COORDINATES[location.state][location.lga];
    }

    // Fall back to state capital
    const stateKey = location.state?.replace(/\s+/g, '');
    if (stateKey && STATE_CAPITALS[stateKey]) {
        return STATE_CAPITALS[stateKey];
    }

    return null;
}

/**
 * Generate cache key from location
 */
export function getLocationKey(location: Location): string {
    if (location.lat && location.lon) {
        return `${location.lat.toFixed(2)}_${location.lon.toFixed(2)}`;
    }
    return `${location.country}_${location.state}_${location.lga || 'default'}`.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Fetch current weather from OpenWeatherMap
 */
export async function fetchCurrentWeather(
    lat: number,
    lon: number,
    apiKey: string
): Promise<CurrentWeather | WeatherError> {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            return {
                error: errorData.message || 'Failed to fetch weather',
                code: response.status.toString(),
                source: 'openweathermap'
            };
        }

        const data = await response.json();

        return {
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            humidity: data.main.humidity,
            conditions: data.weather[0].main,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            windSpeed: data.wind.speed,
            windDirection: data.wind.deg,
            cloudCover: data.clouds.all,
            visibility: data.visibility,
            pressure: data.main.pressure,
            rainfall: data.rain?.['1h'] || data.rain?.['3h'] || 0,
            timestamp: new Date(),
            source: 'openweathermap'
        };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Network error',
            code: 'NETWORK_ERROR',
            source: 'openweathermap'
        };
    }
}

/**
 * Fetch 7-day forecast from OpenWeatherMap
 */
export async function fetchForecast(
    lat: number,
    lon: number,
    apiKey: string,
    days: number = 7
): Promise<Forecast | WeatherError> {
    try {
        // OpenWeatherMap free tier uses 5-day/3-hour forecast
        // We'll use the One Call API if available, otherwise fall back
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=${days * 8}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            return {
                error: errorData.message || 'Failed to fetch forecast',
                code: response.status.toString(),
                source: 'openweathermap'
            };
        }

        const data = await response.json();

        // Group by date and aggregate
        const dailyMap = new Map<string, Array<{ dt_txt: string; main: { temp: number; humidity: number }; weather: Array<{ main: string; description: string; icon: string }>; pop?: number; rain?: { '3h'?: number }; wind: { speed: number } }>>();

        for (const item of data.list) {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyMap.has(date)) {
                dailyMap.set(date, []);
            }
            dailyMap.get(date)?.push(item);
        }

        const daily: DailyForecast[] = [];

        for (const [dateStr, items] of dailyMap) {
            const temps = items.map(i => i.main.temp);
            const humidities = items.map(i => i.main.humidity);
            const rainProbs = items.map(i => (i.pop || 0) * 100);
            const rainAmounts = items.map(i => (i.rain?.['3h'] || 0));

            daily.push({
                date: new Date(dateStr),
                temperatureHigh: Math.max(...temps),
                temperatureLow: Math.min(...temps),
                temperatureAvg: temps.reduce((a, b) => a + b, 0) / temps.length,
                humidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
                conditions: items[Math.floor(items.length / 2)].weather[0].main,
                description: items[Math.floor(items.length / 2)].weather[0].description,
                icon: items[Math.floor(items.length / 2)].weather[0].icon,
                rainfallProbability: Math.max(...rainProbs),
                rainfallAmount: rainAmounts.reduce((a, b) => a + b, 0),
                windSpeed: items.reduce((sum, i) => sum + i.wind.speed, 0) / items.length,
                sunrise: new Date(), // Would come from One Call API
                sunset: new Date(),
            });
        }

        return {
            daily: daily.slice(0, days),
            source: 'openweathermap',
            fetchedAt: new Date()
        };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Network error',
            code: 'NETWORK_ERROR',
            source: 'openweathermap'
        };
    }
}

/**
 * Fetch historical climate data from NASA POWER
 */
export async function fetchClimateData(
    lat: number,
    lon: number
): Promise<ClimateData | WeatherError> {
    try {
        // NASA POWER API - Climatology endpoint
        // Uses 30-year averages
        const parameters = 'PRECTOTCORR,T2M_MAX,T2M_MIN,RH2M';
        const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=${parameters}&community=AG&longitude=${lon}&latitude=${lat}&format=JSON`;

        const response = await fetch(url);

        if (!response.ok) {
            return {
                error: 'Failed to fetch climate data from NASA POWER',
                code: response.status.toString(),
                source: 'nasa_power'
            };
        }

        const data = await response.json();

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        const monthly: MonthlyClimate[] = [];
        let annualRainfall = 0;

        for (let i = 1; i <= 12; i++) {
            const key = i.toString().padStart(2, '0');
            const rainfall = data.properties.parameter.PRECTOTCORR?.[key] || 0;
            const rainyDays = rainfall > 5 ? Math.ceil(rainfall / 10) : (rainfall > 0 ? 1 : 0);

            monthly.push({
                month: i,
                monthName: monthNames[i - 1],
                averageRainfall: rainfall * 30, // Convert daily to monthly (approx)
                rainyDays,
                averageTemperatureHigh: data.properties.parameter.T2M_MAX?.[key] || 30,
                averageTemperatureLow: data.properties.parameter.T2M_MIN?.[key] || 20,
                averageHumidity: data.properties.parameter.RH2M?.[key] || 60,
            });

            annualRainfall += rainfall * 30;
        }

        // Determine wet/dry seasons (Nigerian pattern)
        const drySeasonMonths = monthly
            .filter(m => m.averageRainfall < 50)
            .map(m => m.month);

        const wetSeasonMonths = monthly
            .filter(m => m.averageRainfall >= 50)
            .map(m => m.month);

        return {
            monthly,
            annualRainfall,
            drySeasonMonths,
            wetSeasonMonths,
            source: 'nasa_power',
            yearsOfData: 30
        };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Network error',
            code: 'NETWORK_ERROR',
            source: 'nasa_power'
        };
    }
}

/**
 * Check if result is an error
 */
export function isWeatherError(result: CurrentWeather | Forecast | ClimateData | WeatherError): result is WeatherError {
    return 'error' in result && 'code' in result;
}

/**
 * Format weather for display
 */
export function formatCurrentWeather(weather: CurrentWeather): string {
    return `${weather.temperature.toFixed(1)}°C, ${weather.conditions} (${weather.description}). ` +
        `Humidity: ${weather.humidity}%. Wind: ${weather.windSpeed.toFixed(1)} m/s.`;
}

/**
 * Format forecast summary
 */
export function formatForecastSummary(forecast: Forecast): string {
    const next3Days = forecast.daily.slice(0, 3);
    const hasRain = next3Days.some(d => d.rainfallProbability > 50);

    if (hasRain) {
        const rainyDays = next3Days.filter(d => d.rainfallProbability > 50);
        return `Rain expected in next 3 days (${rainyDays.length} day(s) with ${rainyDays[0]?.rainfallProbability.toFixed(0)}% probability).`;
    }

    return `Clear weather expected for the next 3 days.`;
}

/**
 * Determine if conditions are good for specific activity
 */
export function isGoodConditionFor(
    activity: 'planting' | 'irrigation' | 'fertilization' | 'harvest' | 'spraying',
    weather: CurrentWeather,
    forecast: Forecast
): { suitable: boolean; reason: string } {
    const next24h = forecast.daily[0];

    switch (activity) {
        case 'planting':
            if (weather.rainfall && weather.rainfall > 10) {
                return { suitable: false, reason: 'Too wet for planting' };
            }
            if (next24h?.rainfallProbability > 80) {
                return { suitable: true, reason: 'Good - rain expected will help seedlings' };
            }
            return { suitable: true, reason: 'Conditions are suitable for planting' };

        case 'irrigation':
            if (next24h?.rainfallProbability > 60) {
                return { suitable: false, reason: `Skip - ${next24h.rainfallProbability.toFixed(0)}% chance of rain` };
            }
            return { suitable: true, reason: 'No significant rain expected' };

        case 'fertilization':
            if (next24h?.rainfallProbability > 50) {
                return { suitable: false, reason: 'Rain may wash away fertilizer' };
            }
            if (weather.windSpeed > 5) {
                return { suitable: false, reason: 'Too windy for fertilizer application' };
            }
            return { suitable: true, reason: 'Good conditions for fertilizer application' };

        case 'harvest':
            if (weather.rainfall && weather.rainfall > 5) {
                return { suitable: false, reason: 'Too wet for harvest' };
            }
            if (next24h?.rainfallProbability > 40) {
                return { suitable: false, reason: 'Rain expected - delay harvest' };
            }
            return { suitable: true, reason: 'Clear weather suitable for harvest' };

        case 'spraying':
            if (weather.windSpeed > 4) {
                return { suitable: false, reason: 'Too windy for spraying' };
            }
            if (next24h?.rainfallProbability > 30) {
                return { suitable: false, reason: 'Rain may wash off spray' };
            }
            return { suitable: true, reason: 'Good conditions for spraying' };

        default:
            return { suitable: true, reason: 'Conditions are normal' };
    }
}

export type { Location, CurrentWeather, DailyForecast, Forecast, MonthlyClimate, ClimateData, WeatherError };
