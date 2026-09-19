// Typed Weather & Soil Telemetry Contract for AgroMind AI
import type { WeatherForecastDay, SoilTelemetry } from '../types';

export interface WeatherData {
  currentTemp: number;
  feelsLike: number;
  condition: string;
  conditionGu: string;
  highTemp: number;
  lowTemp: number;
  humidity: number;
  windSpeed: number;
  rainProb: number;
  rainMm: string;
  spraySuitability: 'Optimal' | 'Safe' | 'Moderate' | 'Unsafe';
  spraySuitabilityGu: string;
  sprayWindowNote: string;
  sprayWindowNoteGu: string;
  lastUpdated: string;
  isLive: boolean;
  forecast: WeatherForecastDay[];
  soil: SoilTelemetry;
}

export interface IWeatherService {
  fetchWeatherData(lat?: number, lng?: number, forceRefresh?: boolean): Promise<WeatherData>;
  getStoredWeather(): WeatherData | null;
  subscribeToWeather(callback: (data: WeatherData) => void): () => void;
}
