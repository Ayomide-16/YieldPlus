// Fetch Weather Data Edge Function
// Centralized weather API integration with caching

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const LocationSchema = z.object({
    country: z.string().optional().default('Nigeria'),
    state: z.string(),
    lga: z.string().optional(),
    lat: z.number().optional(),
    lon: z.number().optional(),
});

// State capital coordinates for Nigeria
const STATE_CAPITALS: Record<string, { lat: number; lon: number }> = {
    'Abia': { lat: 5.5333, lon: 7.4833 },
    'Adamawa': { lat: 9.2333, lon: 12.4667 },
    'Akwa Ibom': { lat: 5.0333, lon: 7.9333 },
    'Anambra': { lat: 6.2167, lon: 6.95 },
    'Bauchi': { lat: 10.3, lon: 9.8333 },
    'Bayelsa': { lat: 4.9333, lon: 6.2667 },
    'Benue': { lat: 7.7333, lon: 8.5333 },
    'Borno': { lat: 11.8333, lon: 13.15 },
    'Cross River': { lat: 4.95, lon: 8.3333 },
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

function getCoordinates(state: string, lat?: number, lon?: number): { lat: number; lon: number } | null {
    if (lat && lon) {
        return { lat, lon };
    }

    const normalized = state.trim();
    return STATE_CAPITALS[normalized] || null;
}

function getLocationKey(state: string, lga?: string): string {
    return `ng_${state.toLowerCase().replace(/\s+/g, '_')}_${(lga || 'default').toLowerCase().replace(/\s+/g, '_')}`;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const openWeatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');

        const supabase = createClient(supabaseUrl, supabaseKey);

        const body = await req.json();
        const location = LocationSchema.parse(body);

        const coords = getCoordinates(location.state, location.lat, location.lon);
        if (!coords) {
            throw new Error(`Could not find coordinates for state: ${location.state}`);
        }

        const locationKey = getLocationKey(location.state, location.lga);
        const now = new Date();

        // Check cache first
        const { data: cachedWeather } = await supabase
            .from('weather_cache')
            .select('*')
            .eq('location_key', locationKey)
            .eq('weather_type', 'current_and_forecast')
            .gt('expires_at', now.toISOString())
            .single();

        if (cachedWeather) {
            return new Response(
                JSON.stringify({
                    success: true,
                    data: cachedWeather.weather_data,
                    cached: true,
                    fetchedAt: cachedWeather.fetched_at,
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Fetch fresh weather data
        if (!openWeatherApiKey) {
            // Return mock data if no API key (for development)
            console.warn('No OpenWeather API key configured, returning mock data');
            const mockData = {
                current: {
                    temperature: 28 + Math.random() * 5,
                    feelsLike: 30 + Math.random() * 3,
                    humidity: 60 + Math.random() * 20,
                    conditions: 'Partly Cloudy',
                    description: 'scattered clouds',
                    icon: '03d',
                    windSpeed: 3 + Math.random() * 2,
                    windDirection: 180,
                    cloudCover: 40,
                    visibility: 10000,
                    pressure: 1013,
                    rainfall: 0,
                    timestamp: now.toISOString(),
                    source: 'mock',
                },
                forecast: Array.from({ length: 7 }, (_, i) => ({
                    date: new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    temperatureHigh: 30 + Math.random() * 5,
                    temperatureLow: 22 + Math.random() * 3,
                    temperatureAvg: 26 + Math.random() * 4,
                    humidity: 55 + Math.random() * 25,
                    conditions: i % 3 === 0 ? 'Rain' : 'Partly Cloudy',
                    description: i % 3 === 0 ? 'moderate rain' : 'scattered clouds',
                    icon: i % 3 === 0 ? '10d' : '03d',
                    rainfallProbability: i % 3 === 0 ? 70 + Math.random() * 20 : Math.random() * 30,
                    rainfallAmount: i % 3 === 0 ? 5 + Math.random() * 10 : 0,
                    windSpeed: 3 + Math.random() * 3,
                })),
                source: 'mock',
                fetchedAt: now.toISOString(),
            };

            return new Response(
                JSON.stringify({
                    success: true,
                    data: mockData,
                    cached: false,
                    warning: 'Using mock data - configure OPENWEATHER_API_KEY for live weather',
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Fetch current weather
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${openWeatherApiKey}&units=metric`;
        const currentResponse = await fetch(currentUrl);

        if (!currentResponse.ok) {
            throw new Error(`OpenWeatherMap API error: ${currentResponse.status}`);
        }

        const currentData = await currentResponse.json();

        // Fetch forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${openWeatherApiKey}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);

        if (!forecastResponse.ok) {
            throw new Error(`OpenWeatherMap forecast API error: ${forecastResponse.status}`);
        }

        const forecastData = await forecastResponse.json();

        // Process current weather
        const current = {
            temperature: currentData.main.temp,
            feelsLike: currentData.main.feels_like,
            humidity: currentData.main.humidity,
            conditions: currentData.weather[0].main,
            description: currentData.weather[0].description,
            icon: currentData.weather[0].icon,
            windSpeed: currentData.wind.speed,
            windDirection: currentData.wind.deg,
            cloudCover: currentData.clouds.all,
            visibility: currentData.visibility,
            pressure: currentData.main.pressure,
            rainfall: currentData.rain?.['1h'] || currentData.rain?.['3h'] || 0,
            timestamp: now.toISOString(),
            source: 'openweathermap',
        };

        // Process forecast - group by day
        const dailyMap = new Map<string, any[]>();
        for (const item of forecastData.list) {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyMap.has(date)) {
                dailyMap.set(date, []);
            }
            dailyMap.get(date)?.push(item);
        }

        const forecast = [];
        for (const [dateStr, items] of dailyMap) {
            const temps = items.map((i: any) => i.main.temp);
            const humidities = items.map((i: any) => i.main.humidity);
            const rainProbs = items.map((i: any) => (i.pop || 0) * 100);
            const rainAmounts = items.map((i: any) => (i.rain?.['3h'] || 0));

            forecast.push({
                date: dateStr,
                temperatureHigh: Math.max(...temps),
                temperatureLow: Math.min(...temps),
                temperatureAvg: temps.reduce((a: number, b: number) => a + b, 0) / temps.length,
                humidity: humidities.reduce((a: number, b: number) => a + b, 0) / humidities.length,
                conditions: items[Math.floor(items.length / 2)].weather[0].main,
                description: items[Math.floor(items.length / 2)].weather[0].description,
                icon: items[Math.floor(items.length / 2)].weather[0].icon,
                rainfallProbability: Math.max(...rainProbs),
                rainfallAmount: rainAmounts.reduce((a: number, b: number) => a + b, 0),
                windSpeed: items.reduce((sum: number, i: any) => sum + i.wind.speed, 0) / items.length,
            });
        }

        const weatherData = {
            current,
            forecast: forecast.slice(0, 7),
            source: 'openweathermap',
            fetchedAt: now.toISOString(),
        };

        // Cache the data for 3 hours
        const expiresAt = new Date(now.getTime() + 3 * 60 * 60 * 1000);

        await supabase
            .from('weather_cache')
            .upsert({
                location_key: locationKey,
                location: { ...location, ...coords },
                weather_type: 'current_and_forecast',
                weather_data: weatherData,
                source: 'openweathermap',
                fetched_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
            });

        return new Response(
            JSON.stringify({
                success: true,
                data: weatherData,
                cached: false,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Weather fetch error:', error);
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
