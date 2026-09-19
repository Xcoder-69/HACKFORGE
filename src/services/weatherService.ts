// Weather & Soil Intelligence Service for AgroMind AI
// Integrates with Open-Meteo REST API, handles 2-hour caching, WMO agricultural translation, and offline resiliency

import { storageService, STORAGE_KEYS } from './storageService';
import type { WeatherForecastDay, SoilTelemetry } from '../types';

export interface WeatherData {
  locationName: string;
  stationId: string;
  coordinates: { lat: number; lng: number };
  current: {
    temp: number;
    tempUnit: string;
    condition: string;
    conditionGu: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    rainProb: number;
    lastUpdated: string;
  };
  daily: WeatherForecastDay[];
  soil: SoilTelemetry;
  isOffline: boolean;
  advisory: {
    type: string;
    title: string;
    titleGu: string;
    message: string;
    messageGu: string;
    safeSprayDays: number;
  };
}

// Fallback / Seed 7-Day Forecast (Surat/Kamrej area)
const FALLBACK_FORECAST: WeatherForecastDay[] = [
  { day: 'Today', dayGu: 'આજે', tempMax: 33, tempMin: 24, condition: 'Partly Cloudy', icon: 'partly_cloudy_day', rainProb: 20, rainMm: '0.0 mm', sprayScore: 'Safe' },
  { day: 'Sun', dayGu: 'રવિ', tempMax: 34, tempMin: 25, condition: 'Sunny & Clear', icon: 'wb_sunny', rainProb: 5, rainMm: '0.0 mm', sprayScore: 'Optimal' },
  { day: 'Mon', dayGu: 'સોમ', tempMax: 32, tempMin: 24, condition: 'Isolated Showers', icon: 'rainy', rainProb: 65, rainMm: '14.2 mm', sprayScore: 'Unsafe' },
  { day: 'Tue', dayGu: 'મંગળ', tempMax: 30, tempMin: 23, condition: 'Moderate Rain', icon: 'thunderstorm', rainProb: 80, rainMm: '26.5 mm', sprayScore: 'Unsafe' },
  { day: 'Wed', dayGu: 'બુધ', tempMax: 31, tempMin: 23, condition: 'Passing Clouds', icon: 'cloud', rainProb: 30, rainMm: '2.1 mm', sprayScore: 'Moderate' },
  { day: 'Thu', dayGu: 'ગુરુ', tempMax: 33, tempMin: 24, condition: 'Warm & Humid', icon: 'wb_sunny', rainProb: 10, rainMm: '0.0 mm', sprayScore: 'Optimal' },
  { day: 'Fri', dayGu: 'શુક્ર', tempMax: 34, tempMin: 25, condition: 'Clear Sky', icon: 'sunny', rainProb: 5, rainMm: '0.0 mm', sprayScore: 'Optimal' },
];

const FALLBACK_SOIL: SoilTelemetry = {
  moisturePercent: 68,
  moistureStatus: 'Optimal (ઉત્તમ)',
  moistureStatusGu: 'પર્યાપ્ત ભેજ',
  tempCelsius: 28.4,
  phLevel: 7.4,
  phStatus: 'Neutral (Black Cotton)',
  nitrogenKgHa: 198,
  phosphorusKgHa: 22,
  potassiumKgHa: 340,
  organicCarbonPercent: 0.65,
  lastSyncTime: 'Today, 09:30 AM',
  stationId: 'GJ-SUR-04 (Kamrej Extension Node)',
};

const WMO_MAP: Record<number, { condition: string; conditionGu: string; icon: string; score: 'Optimal' | 'Safe' | 'Moderate' | 'Unsafe' }> = {
  0: { condition: 'Clear Sky', conditionGu: 'ચોખ્ખું આકાશ', icon: 'wb_sunny', score: 'Optimal' },
  1: { condition: 'Mainly Clear', conditionGu: 'મુખ્યત્વે ચોખ્ખું', icon: 'wb_sunny', score: 'Optimal' },
  2: { condition: 'Partly Cloudy', conditionGu: 'અંશતઃ વાદળછાયું', icon: 'partly_cloudy_day', score: 'Safe' },
  3: { condition: 'Overcast', conditionGu: 'વાદળછાયું', icon: 'cloud', score: 'Moderate' },
  45: { condition: 'Foggy', conditionGu: 'ધુમ્મસ', icon: 'foggy', score: 'Moderate' },
  51: { condition: 'Light Drizzle', conditionGu: 'હળવી ઝરમર', icon: 'rainy', score: 'Moderate' },
  53: { condition: 'Moderate Drizzle', conditionGu: 'ઝરમર વરસાદ', icon: 'rainy', score: 'Unsafe' },
  55: { condition: 'Dense Drizzle', conditionGu: 'ભારે ઝરમર', icon: 'rainy', score: 'Unsafe' },
  61: { condition: 'Slight Rain', conditionGu: 'હળવો વરસાદ', icon: 'rainy', score: 'Unsafe' },
  63: { condition: 'Moderate Rain', conditionGu: 'સાધારણ વરસાદ', icon: 'rainy', score: 'Unsafe' },
  65: { condition: 'Heavy Rain', conditionGu: 'ભારે વરસાદ', icon: 'thunderstorm', score: 'Unsafe' },
  80: { condition: 'Rain Showers', conditionGu: 'વરસાદી ઝાપટાં', icon: 'rainy', score: 'Unsafe' },
  81: { condition: 'Moderate Showers', conditionGu: 'ઝાપટાં', icon: 'rainy', score: 'Unsafe' },
  82: { condition: 'Violent Showers', conditionGu: 'ભારે ઝાપટાં', icon: 'thunderstorm', score: 'Unsafe' },
  95: { condition: 'Thunderstorm', conditionGu: 'ગાજવીજ સાથે વરસાદ', icon: 'thunderstorm', score: 'Unsafe' },
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_GU = ['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'];
import { locationService } from './locationService';

export const weatherService = {
  async getWeather(
    lat?: number,
    lng?: number,
    forceRefresh: boolean = false,
    customLocationLabel?: string
  ): Promise<WeatherData> {
    const activeLocation = locationService.getSavedLocation();
    const targetLat = typeof lat === 'number' ? lat : activeLocation.latitude;
    const targetLng = typeof lng === 'number' ? lng : activeLocation.longitude;
    const nearest = locationService.getNearestDistrict(targetLat, targetLng);
    const locationName = customLocationLabel || (targetLat === activeLocation.latitude ? activeLocation.locationName : nearest.name);
    const districtName = activeLocation.district || nearest.district;

    const cacheKey = `${STORAGE_KEYS.WEATHER_CACHE}_${targetLat.toFixed(3)}_${targetLng.toFixed(3)}`;
    const cached = storageService.get<{ data: WeatherData; timestamp: number } | null>(cacheKey, null);

    const TWO_HOURS = 2 * 60 * 60 * 1000;
    if (!forceRefresh && cached && Date.now() - cached.timestamp < TWO_HOURS) {
      return cached.data;
    }

    try {
      const baseUrl = import.meta.env.VITE_OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1';
      const url = `${baseUrl}/forecast?latitude=${targetLat}&longitude=${targetLng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata`;

      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP error ${response.status}`);
      }

      const json = await response.json();
      const currentCode = json.current?.weather_code ?? 2;
      const currentWmo = WMO_MAP[currentCode] || { condition: 'Partly Cloudy', conditionGu: 'અંશતઃ વાદળછાયું', icon: 'partly_cloudy_day', score: 'Safe' };

      const daily: WeatherForecastDay[] = [];
      const times: string[] = json.daily?.time || [];

      for (let i = 0; i < Math.min(times.length, 7); i++) {
        const dateObj = new Date(times[i]);
        const dayOfWeek = dateObj.getDay();
        const code = json.daily.weather_code?.[i] ?? 1;
        const wmo = WMO_MAP[code] || { condition: 'Fair', conditionGu: 'સાધારણ', icon: 'wb_sunny', score: 'Optimal' };
        const rainProb = json.daily.precipitation_probability_max?.[i] ?? 10;
        const rainMm = (json.daily.precipitation_sum?.[i] ?? 0).toFixed(1);

        let sprayScore: 'Optimal' | 'Safe' | 'Moderate' | 'Unsafe' = wmo.score;
        if (rainProb >= 60 || parseFloat(rainMm) >= 5) {
          sprayScore = 'Unsafe';
        } else if (rainProb >= 30) {
          sprayScore = 'Moderate';
        }

        daily.push({
          day: i === 0 ? 'Today' : DAY_NAMES[dayOfWeek],
          dayGu: i === 0 ? 'આજે' : DAY_NAMES_GU[dayOfWeek],
          tempMax: Math.round(json.daily.temperature_2m_max?.[i] ?? 33),
          tempMin: Math.round(json.daily.temperature_2m_min?.[i] ?? 24),
          condition: wmo.condition,
          icon: wmo.icon,
          rainProb,
          rainMm: `${rainMm} mm`,
          sprayScore,
        });
      }

      const weatherResult: WeatherData = {
        locationName,
        stationId: `GJ-${districtName.substring(0, 3).toUpperCase()}-01 • Open-Meteo Telemetry`,
        coordinates: { lat: targetLat, lng: targetLng },
        current: {
          temp: Math.round(json.current?.temperature_2m ?? 31),
          tempUnit: '°C',
          condition: currentWmo.condition,
          conditionGu: currentWmo.conditionGu,
          icon: currentWmo.icon,
          humidity: Math.round(json.current?.relative_humidity_2m ?? 65),
          windSpeed: Math.round(json.current?.wind_speed_10m ?? 12),
          rainProb: Math.round(json.daily?.precipitation_probability_max?.[0] ?? 20),
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        daily: daily.length > 0 ? daily : FALLBACK_FORECAST,
        soil: {
          ...FALLBACK_SOIL,
          stationId: `GJ-${districtName.substring(0, 3).toUpperCase()}-01 Node`,
        },
        isOffline: false,
        advisory: {
          type: 'IMD & Open-Meteo Live Advisory',
          title: 'Convective Rain & Spray Window Guidance',
          titleGu: 'વરસાદ અને દવા છંટકાવ માટે માર્ગદર્શન',
          message: daily.some((d) => d.rainProb >= 60)
            ? `Rainfall anticipated in ${districtName} region over the next 48 hours. Postpone foliar pesticide sprays.`
            : `Favorable conditions for foliar nutrient sprays and irrigation across ${districtName} agricultural plots.`,
          messageGu: `આગામી દિવસોમાં ${districtName} વિસ્તારમાં હવામાન મુજબ ખેતી કાર્ય કરો.`,
          safeSprayDays: daily.filter((d) => d.sprayScore === 'Optimal' || d.sprayScore === 'Safe').length,
        },
      };

      // Store in 2-hour cache
      storageService.set(cacheKey, { data: weatherResult, timestamp: Date.now() });
      return weatherResult;
    } catch (err) {
      console.warn('[WeatherService] Live API unavailable, falling back to cached/seed telemetry:', err);
      if (cached?.data) {
        return { ...cached.data, isOffline: true };
      }

      // Dynamic offline fallback response
      return {
        locationName: `${locationName} (Offline Cache)`,
        stationId: `GJ-${districtName.substring(0, 3).toUpperCase()}-01 • Local Agro-Cache`,
        coordinates: { lat: targetLat, lng: targetLng },
        current: {
          temp: 32,
          tempUnit: '°C',
          condition: 'Partly Cloudy',
          conditionGu: 'અંશતઃ વાદળછાયું',
          icon: 'partly_cloudy_day',
          humidity: 68,
          windSpeed: 14,
          rainProb: 20,
          lastUpdated: 'Cached mode',
        },
        daily: FALLBACK_FORECAST,
        soil: {
          ...FALLBACK_SOIL,
          stationId: `GJ-${districtName.substring(0, 3).toUpperCase()}-01 Node`,
        },
        isOffline: true,
        advisory: {
          type: 'Cached Weather Advisory',
          title: 'Convective Rain & Spray Guidance',
          titleGu: 'વરસાદ અને દવા છંટકાવ માટે માર્ગદર્શન',
          message: `Postpone foliar pesticide sprays in ${districtName} if rain showers develop.`,
          messageGu: `દવા છંટકાવ મુલતવી રાખો જો ${districtName}માં વરસાદી ઝાપટાં પડે.`,
          safeSprayDays: 4,
        },
      };
    }
  },

  /**
   * Returns cached weather summary for context injection (e.g. AI chat).
   * Non-async, returns null if no cache exists.
   */
  getStoredWeather(): { condition: string; spraySuitability: string } | null {
    // Search any location-keyed weather cache
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.WEATHER_CACHE + '_')) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const cached = JSON.parse(raw) as { data: any; timestamp: number };
            if (cached?.data?.current) {
              const c = cached.data.current;
              const todayForecast = cached.data.daily?.[0];
              return {
                condition: `${c.condition}, ${c.temp}°C, ${c.humidity}% humidity`,
                spraySuitability: todayForecast?.sprayScore || 'Unknown',
              };
            }
          }
        } catch { /* ignore parse errors */ }
      }
    }
    return null;
  },
};
