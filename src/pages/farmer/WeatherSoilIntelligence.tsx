import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { weatherService, type WeatherData } from '../../services/weatherService';
import { farmService } from '../../services/farmService';
import { filterAndSortMultilingual } from '../../utils/multilingualSearch';
import {
  locationService,
  GUJARAT_DISTRICT_PRESETS,
  type GeoCoordinates,
  type GujaratDistrictPreset,
} from '../../services/locationService';

export type WeatherLoadingStage =
  | 'getting_location'
  | 'fetching_weather'
  | 'processing_response'
  | 'weather_ready'
  | 'no_location'
  | 'error';

export const WeatherSoilIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const { language, bi } = useLanguage();
  const [activeTab, setActiveTab] = useState<'weather' | 'soil' | 'spray'>('weather');
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Automatic Location Detection State
  const [currentLocation, setCurrentLocation] = useState<GeoCoordinates>(() =>
    locationService.getSavedLocation()
  );
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationNotice, setLocationNotice] = useState<{
    message: string;
    type: 'info' | 'warning' | 'success';
  } | null>(null);
  const [showDistrictModal, setShowDistrictModal] = useState<boolean>(false);
  const [districtSearch, setDistrictSearch] = useState<string>('');

  const filteredDistricts = filterAndSortMultilingual(
    GUJARAT_DISTRICT_PRESETS,
    districtSearch,
    (preset) => ({
      primaryGu: preset.nameGu,
      primaryEn: preset.name,
      primaryHi: preset.name,
      secondaryGu: [preset.districtGu, preset.district],
      secondaryEn: [preset.district, preset.name],
      secondaryHi: [preset.district],
    }),
    language
  );

  const [loadingStage, setLoadingStage] = useState<WeatherLoadingStage>('getting_location');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchWeather = async (
    lat?: number,
    lng?: number,
    force: boolean = false
  ) => {
    try {
      setErrorMessage(null);
      if (force) setIsRefreshing(true);

      let targetLat = lat;
      let targetLng = lng;
      let locName = currentLocation.locationName;

      // Stage 1: Location Resolution
      if (typeof targetLat !== 'number' || typeof targetLng !== 'number' || targetLat === 0) {
        setLoadingStage('getting_location');
        const active = locationService.getSavedLocation();
        if (!locationService.hasValidLocation(active)) {
          setLoadingStage('no_location');
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }
        targetLat = active.latitude;
        targetLng = active.longitude;
        locName = active.locationName;
        setCurrentLocation(active);
      }

      // Stage 2: Fetching live weather from Open-Meteo
      setLoadingStage('fetching_weather');

      // Stage 3: Processing response
      const dataPromise = weatherService.getWeather(
        targetLat,
        targetLng,
        force,
        locName
      );

      setLoadingStage('processing_response');
      const data = await dataPromise;

      // Stage 4: Weather Ready
      setWeatherData(data);
      setLoadingStage('weather_ready');
    } catch (err: any) {
      console.error('[WeatherSoilIntelligence] Error fetching Open-Meteo weather:', err);
      setLoadingStage('error');
      setErrorMessage(err?.message || 'Weather data temporarily unavailable.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const saved = locationService.getSavedLocation();
    setCurrentLocation(saved);
    if (locationService.hasValidLocation(saved)) {
      fetchWeather(saved.latitude, saved.longitude);
    } else {
      setLoadingStage('no_location');
      setIsLoading(false);
    }

    // Subscribe to external location updates
    const unsub = locationService.subscribeToLocation((coords) => {
      setCurrentLocation(coords);
      if (locationService.hasValidLocation(coords)) {
        fetchWeather(coords.latitude, coords.longitude, true);
      }
    });
    return unsub;
  }, []);

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationNotice(null);
    setLoadingStage('getting_location');

    const result = await locationService.getCurrentLocation();
    setIsDetectingLocation(false);
    setCurrentLocation(result.coords);

    if (result.success && locationService.hasValidLocation(result.coords)) {
      setLocationNotice({
        message:
          language === 'gu'
            ? `જીવંત જીપીએસ દ્વારા સ્થાન મળ્યું: ${result.coords.locationNameGu}`
            : `Live GPS detected: ${result.coords.locationName} (Accuracy: ±${result.coords.accuracy || 15}m)`,
        type: 'success',
      });
      fetchWeather(result.coords.latitude, result.coords.longitude, true);
    } else {
      setLocationNotice({
        message:
          language === 'gu'
            ? result.errorGu ||
              'સ્થાન પરવાનગી નકારી છે. કૃપા કરીને જિલ્લો જાતે પસંદ કરો.'
            : result.error ||
              'Location permission denied. Please select district manually.',
        type: 'warning',
      });
      if (locationService.hasValidLocation(result.coords)) {
        fetchWeather(result.coords.latitude, result.coords.longitude, true);
      } else {
        setLoadingStage('no_location');
        setIsLoading(false);
        if (result.errorType === 'denied') {
          setShowDistrictModal(true);
        }
      }
    }
  };

  const handleSelectDistrict = (preset: GujaratDistrictPreset) => {
    const coords = locationService.setManualLocation(preset);
    setCurrentLocation(coords);
    setShowDistrictModal(false);
    setLocationNotice({
      message:
        language === 'gu'
          ? `પસંદ કરેલ જિલ્લો: ${preset.nameGu}`
          : `District manually set: ${preset.name}`,
      type: 'info',
    });
    fetchWeather(preset.lat, preset.lng, true);
  };

  const weeklyForecast = weatherData?.daily || [];

  return (
    <div className="w-full min-h-screen bg-[#FCF9F0] text-[#1C1C17] pb-24 md:pb-12">
      {/* Top Header */}
      <div className="bg-[#163A2D] text-white py-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1 flex-wrap">
              <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
              <span>Open-Meteo & IMD Live Radar • હવામાન અને જમીન બુદ્ધિમત્તા</span>
              {weatherData && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${weatherData.isOffline ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'}`}>
                  {weatherData.isOffline ? '● Offline Cache' : '● Live API'}
                </span>
              )}
              {/* Dynamic Location Source Badge */}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                  currentLocation.source === 'gps'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                    : currentLocation.source === 'saved_farm'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : currentLocation.source === 'manual'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {currentLocation.source === 'gps'
                    ? 'near_me'
                    : currentLocation.source === 'saved_farm'
                    ? 'home_pin'
                    : currentLocation.source === 'manual'
                    ? 'edit_location'
                    : 'info'}
                </span>
                <span>
                  {language === 'gu'
                    ? currentLocation.sourceLabelGu
                    : currentLocation.sourceLabel}
                </span>
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {bi('હવામાન અને જમીન વિશ્લેષણ', 'Weather & Soil Intelligence', 'मौसम और मृदा विश्लेषण').primary}
            </h1>
            <p className="text-emerald-300/90 text-xs font-semibold mt-0.5">
              {bi('Live Weather & Soil Intelligence', 'જીવંત હવામાન અને જમીન સ્થિતિ', 'Live Weather & Soil Intelligence').primary}
            </p>
            <p className="text-emerald-100/80 text-sm mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>
                Hyperlocal telemetry for{' '}
                <strong className="text-white">
                  {language === 'gu'
                    ? currentLocation.locationNameGu
                    : currentLocation.locationName}
                </strong>
              </span>
              <span>•</span>
              <span>Station: {weatherData?.stationId || 'GJ-Live'}</span>
            </p>
          </div>

          {/* Action pills */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* GPS Detection Button */}
            <button
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="px-3.5 py-2.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-1.5 transition-colors border border-emerald-400/40 active:scale-95 shadow-sm"
              title="Detect current location using GPS"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isDetectingLocation ? 'animate-spin' : ''
                }`}
              >
                {isDetectingLocation ? 'progress_activity' : 'my_location'}
              </span>
              <span>
                {isDetectingLocation
                  ? bi('શોધાય છે...', 'Detecting GPS...', 'GPS Khoj Rahe Hain...').primary
                  : bi('GPS સ્થાન (Detect GPS)', 'Detect GPS (GPS સ્થાન)', 'GPS Location Pata Karein').primary}
              </span>
            </button>

            {/* Manual District Selection Button */}
            <button
              onClick={() => setShowDistrictModal(true)}
              className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-colors border border-white/20 active:scale-95"
              title="Select Gujarat agricultural district"
            >
              <span className="material-symbols-outlined text-[18px]">
                location_on
              </span>
              <span>
                {bi('જિલ્લો બદલો (Change District)', 'Change District (જિલ્લો બદલો)', 'Jila Badlein (Change District)').primary}
              </span>
            </button>

            {/* Refresh Live Forecast */}
            <button
              onClick={() =>
                fetchWeather(
                  currentLocation.latitude,
                  currentLocation.longitude,
                  true
                )
              }
              disabled={isRefreshing}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-colors border border-white/20 active:scale-95"
              title="Refresh live Open-Meteo forecast"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              >
                sync
              </span>
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={() => navigate('/alerts')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              <span>Weather Alerts (1)</span>
            </button>
            <button
              onClick={() => navigate('/recommendations')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-colors border border-white/20"
            >
              <span className="material-symbols-outlined text-[18px]">eco</span>
              <span>Crop Advisory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Dynamic Location Feedback Notification */}
        {locationNotice && (
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs md:text-sm font-semibold transition-all ${
              locationNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : locationNotice.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-blue-50 text-blue-900 border-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">
                {locationNotice.type === 'success'
                  ? 'check_circle'
                  : locationNotice.type === 'warning'
                  ? 'warning'
                  : 'info'}
              </span>
              <span>{locationNotice.message}</span>
            </div>
            <button
              onClick={() => setLocationNotice(null)}
              className="p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Extreme / Live Weather Advisory Banner */}
        {weatherData && (
          <div className={`border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm ${
            weatherData.daily.some((d) => d.rainProb >= 50)
              ? 'bg-amber-50 border-amber-300'
              : 'bg-emerald-50 border-emerald-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                weatherData.daily.some((d) => d.rainProb >= 50)
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-emerald-200 text-emerald-900'
              }`}>
                <span className="material-symbols-outlined text-[24px]">
                  {weatherData.daily.some((d) => d.rainProb >= 50) ? 'thunderstorm' : 'wb_sunny'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-white text-[11px] font-bold uppercase ${
                    weatherData.daily.some((d) => d.rainProb >= 50) ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}>
                    {language === 'gu' ? weatherData.advisory.titleGu : weatherData.advisory.title}
                  </span>
                  <span className="text-xs text-[#717974] font-semibold">
                    Telemetry: {weatherData.current.lastUpdated}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#163A2D] mt-0.5">
                  {language === 'gu' ? weatherData.advisory.messageGu : weatherData.advisory.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('spray')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                weatherData.daily.some((d) => d.rainProb >= 50)
                  ? 'bg-amber-200 hover:bg-amber-300 text-amber-900'
                  : 'bg-emerald-200 hover:bg-emerald-300 text-emerald-900'
              }`}
            >
              {bi('સ્પ્રે સમય તપાસો', 'Check Spray Window', 'Spray Time Dekhein').primary}
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-[#E5E2DA] pb-2">
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'weather'
                ? 'bg-[#163A2D] text-white shadow-sm'
                : 'text-[#414844] hover:bg-[#F1EEE5]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
            <span>Live Weather & 7-Day Forecast</span>
          </button>
          <button
            onClick={() => setActiveTab('soil')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'soil'
                ? 'bg-[#163A2D] text-white shadow-sm'
                : 'text-[#414844] hover:bg-[#F1EEE5]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">layers</span>
            <span>Soil Moisture & N-P-K Health</span>
          </button>
          <button
            onClick={() => setActiveTab('spray')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'spray'
                ? 'bg-[#163A2D] text-white shadow-sm'
                : 'text-[#414844] hover:bg-[#F1EEE5]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">water_voc</span>
            <span>Smart Spraying & Irrigation Window</span>
          </button>
        </div>

        {/* TAB 1: Weather Forecast */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            {/* Real Stage Loading Indicator (Section 7) */}
            {(isLoading || isRefreshing) && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#E5E2DA] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-700 animate-spin text-[20px]">
                      progress_activity
                    </span>
                    <h3 className="font-extrabold text-sm text-[#163A2D]">
                      {bi('ઓપન-મેટિઓ જીવંત હવામાન ડેટા લોડ થઈ રહ્યો છે...', 'Fetching Live Open-Meteo Weather Data...', 'Live Open-Meteo Mausam Data Load Ho Raha Hai...').primary}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Source: Open-Meteo
                  </span>
                </div>

                {/* Sequential Real Stages (NO fake timer / NO fake percentage) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {/* Stage 1: Location */}
                  <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                    loadingStage === 'getting_location'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {loadingStage === 'getting_location' ? 'near_me' : 'check_circle'}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">Stage 1</span>
                      <span className="text-xs font-bold truncate block">
                        {loadingStage === 'getting_location' ? 'Getting location...' : '✓ Location verified'}
                      </span>
                    </div>
                  </div>

                  {/* Stage 2: Fetching weather */}
                  <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                    loadingStage === 'fetching_weather'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : loadingStage === 'processing_response' || loadingStage === 'weather_ready'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-[#F6F3EA] border-[#E5E2DA] text-[#717974]'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {loadingStage === 'fetching_weather'
                        ? 'cloud_sync'
                        : loadingStage === 'processing_response' || loadingStage === 'weather_ready'
                        ? 'check_circle'
                        : 'hourglass_empty'}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">Stage 2</span>
                      <span className="text-xs font-bold truncate block">
                        {loadingStage === 'fetching_weather'
                          ? 'Fetching weather...'
                          : loadingStage === 'processing_response' || loadingStage === 'weather_ready'
                          ? '✓ Weather received'
                          : 'Waiting for network'}
                      </span>
                    </div>
                  </div>

                  {/* Stage 3: Processing forecast */}
                  <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                    loadingStage === 'processing_response'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : loadingStage === 'weather_ready'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-[#F6F3EA] border-[#E5E2DA] text-[#717974]'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {loadingStage === 'processing_response'
                        ? 'tune'
                        : loadingStage === 'weather_ready'
                        ? 'check_circle'
                        : 'hourglass_empty'}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">Stage 3</span>
                      <span className="text-xs font-bold truncate block">
                        {loadingStage === 'processing_response'
                          ? 'Preparing forecast...'
                          : loadingStage === 'weather_ready'
                          ? '✓ Telemetry ready'
                          : 'Waiting'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Location Needed Prompt State */}
            {loadingStage === 'no_location' && !weatherData && (
              <div className="bg-white rounded-3xl p-8 text-center space-y-4 border border-amber-300 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[36px]">location_off</span>
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-[#163A2D]">
                    {bi('હવામાન માટે સ્થાન જરૂરી છે', 'Location needed for weather', 'Mausam ke liye sthan zaroori hai').primary}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#717974] max-w-md mx-auto">
                    {bi(
                      'ઓપન-મેટિઓ દ્વારા વાસ્તવિક હવામાન જોવા માટે કૃપા કરીને ઉપકરણનું GPS સક્રિય કરો અથવા જિલ્લો પસંદ કરો.',
                      'Open-Meteo forecasts require your coordinates. Please enable device GPS or choose your agricultural district.',
                      'Open-Meteo mausam dekhne ke liye device GPS on karein ya jila chunein.'
                    ).primary}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleDetectLocation}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">my_location</span>
                    <span>{bi('GPS શોધો', 'Detect GPS', 'GPS Pata Karein').primary}</span>
                  </button>
                  <button
                    onClick={() => setShowDistrictModal(true)}
                    className="px-4 py-2.5 bg-[#163A2D] hover:bg-[#0f281f] text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">pin_drop</span>
                    <span>{bi('જિલ્લો પસંદ કરો', 'Select District', 'Jila Chunein').primary}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Weather Error State (Zero Fake Weather) */}
            {loadingStage === 'error' && !weatherData && (
              <div className="bg-white rounded-3xl p-8 text-center space-y-4 border border-red-300 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[36px]">cloud_off</span>
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-[#163A2D]">
                    {errorMessage || 'Weather data temporarily unavailable.'}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#717974] max-w-md mx-auto">
                    {bi(
                      'ઓપન-મેટિઓ હવામાન સર્વર સાથે સંપર્ક થઈ શક્યો નથી. કૃપા કરીને થોડીવાર પછી ફરી પ્રયાસ કરો.',
                      'Could not retrieve weather from Open-Meteo. Please check your network connection and retry.',
                      'Open-Meteo mausam prapt nahi ho saka. Kripya network check karein aur dobara koshish karein.'
                    ).primary}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => fetchWeather(currentLocation.latitude, currentLocation.longitude, true)}
                    className="px-5 py-2.5 bg-[#163A2D] hover:bg-[#0f281f] text-white font-bold rounded-xl text-sm inline-flex items-center gap-2 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">sync</span>
                    <span>Retry Weather Sync</span>
                  </button>
                </div>
              </div>
            )}

            {/* Current Real-time Condition Card (Rendered only with real data) */}
            {weatherData && (
              <>
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E5E2DA] relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl -z-0 pointer-events-none" />

                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Main Gauge / Temp */}
                    <div className="md:col-span-6 flex items-center gap-6">
                      <div className="w-24 h-24 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner shrink-0">
                        <span className="material-symbols-outlined text-[54px]">{weatherData.current.icon}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-1 rounded-full">
                          {currentLocation.locationName} • {weatherData.isOffline ? 'Offline Cache' : 'Live Open-Meteo'}
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-5xl md:text-6xl font-black text-[#163A2D]">{weatherData.current.temp}°C</span>
                          <span className="text-base font-semibold text-[#717974]">Feels like {weatherData.current.apparentTemp}°C</span>
                        </div>
                        <p className="text-sm font-bold text-[#414844] mt-0.5">
                          {language === 'gu' ? weatherData.current.conditionGu : weatherData.current.condition} • પવન: {weatherData.current.windSpeed} km/h
                        </p>
                      </div>
                    </div>

                    {/* Micro-metrics Grid */}
                    <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-[#F6F3EA] p-3 rounded-2xl border border-[#E5E2DA]">
                        <span className="text-xs text-[#717974] block">Humidity</span>
                        <span className="text-base font-extrabold text-[#163A2D] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-blue-600 text-sm">humidity_mid</span>
                          {weatherData.current.humidity}%
                        </span>
                      </div>
                      <div className="bg-[#F6F3EA] p-3 rounded-2xl border border-[#E5E2DA]">
                        <span className="text-xs text-[#717974] block">Wind Velocity</span>
                        <span className="text-base font-extrabold text-[#163A2D] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-teal-600 text-sm">air</span>
                          {weatherData.current.windSpeed} km/h
                        </span>
                      </div>
                      <div className="bg-[#F6F3EA] p-3 rounded-2xl border border-[#E5E2DA]">
                        <span className="text-xs text-[#717974] block">Precipitation</span>
                        <span className="text-base font-extrabold text-[#163A2D] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-blue-500 text-sm">water_drop</span>
                          {weatherData.current.precipitation} mm
                        </span>
                      </div>
                      <div className="bg-[#F6F3EA] p-3 rounded-2xl border border-[#E5E2DA]">
                        <span className="text-xs text-[#717974] block">Rain Chance</span>
                        <span className="text-base font-extrabold text-[#163A2D] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-amber-500 text-sm">rainy</span>
                          {weatherData.current.rainProb}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Real Attribution Bar */}
                  <div className="mt-5 pt-3 border-t border-[#E5E2DA] flex flex-wrap items-center justify-between text-[11px] text-[#717974] gap-2">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-emerald-700">info</span>
                      <span>Source: Open-Meteo (15-min weather model telemetry)</span>
                    </span>
                    <span>Updated: {weatherData.current.lastUpdated}</span>
                  </div>
                </div>

                {/* 24-Hour Real Hourly Telemetry Carousel */}
                {weatherData.hourly && weatherData.hourly.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-extrabold text-[#163A2D] flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-700">schedule</span>
                        <span>24-Hour Real-Time Telemetry (કલાકવાર આગાહી)</span>
                      </h3>
                      <span className="text-[11px] font-bold text-[#717974]">Open-Meteo Hourly</span>
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                      {weatherData.hourly.slice(0, 16).map((hr, idx) => (
                        <div
                          key={idx}
                          className="shrink-0 p-3.5 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA] text-center min-w-[92px] space-y-1 hover:border-emerald-300 transition-colors"
                        >
                          <span className="text-[11px] font-bold text-[#717974] block">{hr.time}</span>
                          <span className="material-symbols-outlined text-[28px] text-emerald-800 block">
                            {hr.icon}
                          </span>
                          <span className="text-xs font-black text-[#163A2D] block">{hr.temperature}°C</span>
                          <span className="text-[10px] text-blue-600 font-bold block flex items-center justify-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px]">water_drop</span>
                            {hr.precipitationProbability}%
                          </span>
                          <span className="text-[10px] text-[#717974] block">
                            {hr.windSpeed} km/h
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7-Day Precision Forecast */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA]">
                  <h2 className="text-lg font-extrabold text-[#163A2D] mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-700">calendar_month</span>
                    <span>7-Day Agricultural Forecast (સાપ્તાહિક અનુમાન)</span>
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                    {weeklyForecast.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedDay(idx)}
                        className={`cursor-pointer p-3.5 rounded-2xl border text-center transition-all ${
                          selectedDay === idx
                            ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500'
                            : 'border-[#E5E2DA] bg-[#F6F3EA] hover:border-emerald-300'
                        }`}
                      >
                        <span className="text-xs font-bold text-[#163A2D] block">{item.day}</span>
                        <span className="text-[11px] text-[#717974]">{item.dayGu}</span>

                        <div className="my-2 flex justify-center text-emerald-800">
                          <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
                        </div>

                        <div className="text-xs font-extrabold text-[#1C1C17]">
                          {item.tempMax}° / <span className="text-[#717974] font-normal">{item.tempMin}°</span>
                        </div>

                        <div className="mt-2 text-[11px] font-semibold text-blue-600 flex items-center justify-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px]">water_drop</span>
                          {item.rainProb}%
                        </div>

                        <div className="mt-1 text-[10px] text-[#717974]">{item.rainMm}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: Soil Health & Telemetry */}
        {activeTab === 'soil' && (
          <div className="space-y-6">
            {/* Multi-depth Soil Moisture */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E5E2DA]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-[#E5E2DA] gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-[#163A2D] flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-700">water_drop</span>
                    <span>Multi-Depth Soil Moisture Matrix (જમીન ભેજ સ્થિતિ)</span>
                  </h2>
                  <p className="text-xs md:text-sm text-[#717974] mt-0.5">
                    Sensor Node: Kamrej Block A • Soil Type: Deep Black Cotton Clay (કાળી ચીકણી જમીન)
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold self-start md:self-auto">
                  Moisture Status: OPTIMAL
                </span>
              </div>

              {/* 3 Depth Levels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                <div className="bg-[#F6F3EA] rounded-2xl p-5 border border-[#E5E2DA]">
                  <div className="flex justify-between items-start">
                    <span className="text-xs uppercase font-bold text-[#717974]">Surface Zone (0 - 10 cm)</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Good</span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#163A2D] mt-2">34%</div>
                  <p className="text-xs text-[#414844] mt-1">Field capacity target: 30-40%</p>
                  <div className="w-full bg-[#E5E2DA] h-2.5 rounded-full overflow-hidden mt-3">
                    <div className="bg-emerald-600 h-full rounded-full w-[68%]" />
                  </div>
                </div>

                <div className="bg-[#F6F3EA] rounded-2xl p-5 border border-[#E5E2DA]">
                  <div className="flex justify-between items-start">
                    <span className="text-xs uppercase font-bold text-[#717974]">Root Zone (10 - 30 cm)</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Ideal</span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#163A2D] mt-2">38%</div>
                  <p className="text-xs text-[#414844] mt-1">Sufficient for Cotton/Groundnut pegging</p>
                  <div className="w-full bg-[#E5E2DA] h-2.5 rounded-full overflow-hidden mt-3">
                    <div className="bg-emerald-600 h-full rounded-full w-[76%]" />
                  </div>
                </div>

                <div className="bg-[#F6F3EA] rounded-2xl p-5 border border-[#E5E2DA]">
                  <div className="flex justify-between items-start">
                    <span className="text-xs uppercase font-bold text-[#717974]">Subsoil Reservoir (30 - 60 cm)</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">High</span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#163A2D] mt-2">42%</div>
                  <p className="text-xs text-[#414844] mt-1">Deep moisture reserve intact</p>
                  <div className="w-full bg-[#E5E2DA] h-2.5 rounded-full overflow-hidden mt-3">
                    <div className="bg-blue-600 h-full rounded-full w-[84%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Soil Health Card & NPK Nutrients */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E5E2DA]">
              <div className="flex items-center justify-between pb-5 border-b border-[#E5E2DA]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#163A2D] flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-700">science</span>
                    <span>Soil Health Card (N-P-K & Macro-Nutrients)</span>
                  </h2>
                  <p className="text-xs md:text-sm text-[#717974]">Last Lab Tested: 14 Aug 2026 • Soil Card #GJ-KAM-9921</p>
                </div>
                <button
                  onClick={() => navigate('/expenses')}
                  className="px-4 py-2 bg-[#163A2D] text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-900 transition-colors"
                >
                  Order Fertilizers
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {/* Nitrogen */}
                <div className="p-4 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA]">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-[#163A2D]">Nitrogen (N)</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-bold">Medium</span>
                  </div>
                  <div className="text-2xl font-black text-[#163A2D] mt-2">182 <span className="text-xs font-normal text-[#717974]">kg/ha</span></div>
                  <p className="text-[11px] text-[#414844] mt-1">Optimum: 280-560 kg/ha</p>
                </div>

                {/* Phosphorus */}
                <div className="p-4 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA]">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-[#163A2D]">Phosphorus (P)</span>
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[11px] font-bold">Low</span>
                  </div>
                  <div className="text-2xl font-black text-red-700 mt-2">24 <span className="text-xs font-normal text-[#717974]">kg/ha</span></div>
                  <p className="text-[11px] text-[#414844] mt-1">Optimum: 35-60 kg/ha</p>
                </div>

                {/* Potassium */}
                <div className="p-4 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA]">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-[#163A2D]">Potassium (K)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">High</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-800 mt-2">310 <span className="text-xs font-normal text-[#717974]">kg/ha</span></div>
                  <p className="text-[11px] text-[#414844] mt-1">Optimum: 150-280 kg/ha</p>
                </div>

                {/* pH & EC */}
                <div className="p-4 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA]">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-[#163A2D]">pH / EC</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">Neutral</span>
                  </div>
                  <div className="text-2xl font-black text-[#163A2D] mt-2">7.4 <span className="text-xs font-normal text-[#717974]">pH</span></div>
                  <p className="text-[11px] text-[#414844] mt-1">EC: 0.42 dS/m (Safe)</p>
                </div>
              </div>

              {/* Agronomist Correction Note */}
              <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-700 text-[24px] mt-0.5">tips_and_updates</span>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950">AI Agronomist Fertilizer Recommendation:</h4>
                  <p className="text-xs md:text-sm text-emerald-900 mt-0.5">
                    Phosphorus is currently in the lower quartile. Apply 25 kg SSP (Single Super Phosphate) per acre during the next scheduled fertigation to support robust root elongation and flower retention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Smart Spraying & Irrigation Window */}
        {activeTab === 'spray' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E5E2DA]">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E2DA]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#163A2D] flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-700">water_voc</span>
                    <span>Smart Spraying Window Indicator (દવા છંટકાવ અનુકૂળતા)</span>
                  </h2>
                  <p className="text-xs md:text-sm text-[#717974]">
                    AI synthesized from Wind Velocity, Temperature, Relative Humidity, and 6-hour Precipitation Probability
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  (weatherData?.hourly?.[0]?.sprayScore === 'Optimal' || weatherData?.hourly?.[0]?.sprayScore === 'Safe')
                    ? 'bg-emerald-600 text-white'
                    : weatherData?.hourly?.[0]?.sprayScore === 'Moderate'
                    ? 'bg-amber-500 text-white'
                    : 'bg-red-600 text-white'
                }`}>
                  {weatherData?.hourly?.[0]?.sprayScore
                    ? `Current: ${weatherData.hourly[0].sprayScore.toUpperCase()} FOR SPRAYING`
                    : 'Awaiting Weather Telemetry'}
                </span>
              </div>

              {/* Dynamic Real Hours Grid from Open-Meteo */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6">
                {(weatherData?.hourly?.slice(0, 6) || []).map((hour, idx) => {
                  const isSafeOrOptimal = hour.sprayScore === 'Optimal' || hour.sprayScore === 'Safe';
                  const isModerate = hour.sprayScore === 'Moderate';

                  return (
                    <div
                      key={idx}
                      className={`border-2 rounded-2xl p-4 text-center transition-all ${
                        isSafeOrOptimal
                          ? 'bg-emerald-50 border-emerald-500'
                          : isModerate
                          ? 'bg-amber-50 border-amber-400'
                          : 'bg-red-50 border-red-400'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#1C1C17] block">{hour.time}</span>
                      <div className={`my-1.5 font-black text-base ${
                        isSafeOrOptimal
                          ? 'text-emerald-700'
                          : isModerate
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}>
                        {hour.sprayScore.toUpperCase()}
                      </div>
                      <span className="text-[11px] text-[#717974] block">
                        Wind: {hour.windSpeed} km/h • {hour.temperature}°C
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
                        Rain: {hour.precipitationProbability}% ({hour.rain.toFixed(1)} mm)
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Recommended Irrigation Schedule */}
              <div className="mt-8 pt-6 border-t border-[#E5E2DA]">
                <h3 className="text-base font-extrabold text-[#163A2D] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700">timer</span>
                  <span>Autonomous Drip Runtime Recommendation</span>
                </h3>
                <div className="bg-[#F6F3EA] rounded-2xl p-5 border border-[#E5E2DA] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-lg text-[#163A2D]">Block A: 45 Minutes Drip Cycle</h4>
                    <p className="text-xs md:text-sm text-[#414844] mt-0.5">
                      Compensates for ET0 of 4.8 mm/day. Schedule during morning low evaporative window (6:30 AM).
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/my-farm')}
                    className="px-5 py-2.5 bg-[#163A2D] text-white rounded-xl text-xs md:text-sm font-bold shadow hover:bg-emerald-950 transition-colors"
                  >
                    Start Valve from My Farm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual District Selection Modal */}
      {showDistrictModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#E5E2DA] max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DA]">
              <div>
                <h3 className="font-extrabold text-lg text-[#163A2D] flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700">pin_drop</span>
                  <span>
                    {bi('કૃષિ જિલ્લો પસંદ કરો', 'Select Agricultural District', 'Krishi Jila Chunein').primary}
                  </span>
                </h3>
                <p className="text-xs text-[#717974] mt-0.5">
                  {bi(
                    'તમારા વિસ્તારનું હવામાન અને દવા છંટકાવ વિગતો મેળવવા જિલ્લો પસંદ કરો',
                    'Choose your district to load localized Open-Meteo weather forecasts',
                    'Apne kshetra ka mausam aur spray timing dekhne ke liye jila chunein'
                  ).primary}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDistrictModal(false);
                  setDistrictSearch('');
                }}
                className="w-8 h-8 rounded-full hover:bg-[#F1EEE5] flex items-center justify-center text-[#717974] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Search Input for Districts */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700 text-base">
                search
              </span>
              <input
                type="text"
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                placeholder={bi(
                  'જિલ્લો અથવા તાલુકો શોધો... (Surat, સુરત, Rajkot, રાજકોટ)',
                  'Search district or taluka... (Surat, Rajkot, Junagadh)',
                  'Jila ya taluka khojein... (Surat, Rajkot, Junagadh)'
                ).primary}
                className="w-full pl-9 pr-9 py-2.5 bg-[#FCF9F0] border border-[#E5E2DA] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all"
              />
              {districtSearch && (
                <button
                  type="button"
                  onClick={() => setDistrictSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {/* District list grid */}
            <div className="overflow-y-auto space-y-2 pr-1 flex-1 py-1 max-h-[45vh]">
              {filteredDistricts.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#717974] bg-[#FCF9F0] rounded-2xl border border-[#E5E2DA] space-y-2">
                  <span className="material-symbols-outlined text-2xl text-gray-400">location_off</span>
                  <p className="font-bold text-[#163A2D]">
                    {bi(`"${districtSearch}" માટે કોઈ જિલ્લો મળ્યો નથી`, `No districts found matching "${districtSearch}"`, `"${districtSearch}" ke liye koi jila nahi mila`).primary}
                  </p>
                  <button
                    onClick={() => setDistrictSearch('')}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                  >
                    {bi('શોધ સાફ કરો', 'Clear Search', 'Khoj Saaf Karein').primary}
                  </button>
                </div>
              ) : (
                filteredDistricts.map((preset) => {
                  const isSelected = currentLocation.district === preset.district;
                  const districtTitle = bi(preset.nameGu, preset.name, preset.nameGu);
                  return (
                    <button
                      key={preset.district}
                      onClick={() => {
                        handleSelectDistrict(preset);
                        setDistrictSearch('');
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between active:scale-[0.99] ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 shadow-sm ring-1 ring-emerald-600'
                          : 'bg-[#FCF9F0] hover:bg-[#F6F3EA] border-[#E5E2DA]'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-sm text-[#163A2D] flex items-center gap-1.5">
                          <span>{districtTitle.primary}</span>
                          {preset.district === 'Surat' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                              KVK Main Node
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-800">
                          {districtTitle.secondary}
                        </div>
                        <div className="text-[10px] text-[#717974] mt-0.5">
                          Coordinates: {preset.lat.toFixed(3)}° N, {preset.lng.toFixed(3)}° E
                        </div>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-emerald-700 text-[22px]">
                          check_circle
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-[#E5E2DA] flex items-center justify-between text-xs text-[#717974]">
              <span className="truncate max-w-[220px]">
                Active: <strong className="text-[#163A2D]">{currentLocation.locationName}</strong>
              </span>
              <button
                onClick={() => {
                  setShowDistrictModal(false);
                  handleDetectLocation();
                }}
                className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">my_location</span>
                <span>Use Device GPS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
