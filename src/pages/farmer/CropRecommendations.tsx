import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { farmService } from '../../services/farmService';
import { filterAndSortMultilingual } from '../../utils/multilingualSearch';
import { locationService, type GeoCoordinates } from '../../services/locationService';
import { weatherService, type WeatherData } from '../../services/weatherService';
import {
  recommendationService,
} from '../../services/recommendationService';
import type {
  CropRecommendationItem,
  GrowingCropAdvisory,
  SeasonKey,
} from '../../contracts/recommendation.contract';
import type { PlotInfo, FarmParcel } from '../../types';

export const CropRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const { language, bi } = useLanguage();

  // Primary Navigation Tab (Tab 1: What Should I Grow?, Tab 2: My Growing Crop)
  const [activeTab, setActiveTab] = useState<'what_to_grow' | 'my_crop'>('what_to_grow');

  // Location & Weather Context State
  const [location, setLocation] = useState<GeoCoordinates>(() => locationService.getSavedLocation());
  const [weather, setWeather] = useState<WeatherData | null>(() => weatherService.getStoredWeather());
  const [farmParcel, setFarmParcel] = useState<FarmParcel | null>(() => farmService.getFarmParcel());
  const [plots, setPlots] = useState<Record<string, PlotInfo>>(() => farmService.getPlots());

  // Tab 1 (What Should I Grow) State
  const [season, setSeason] = useState<SeasonKey>('kharif');
  const [recommendations, setRecommendations] = useState<CropRecommendationItem[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendationItem | null>(null);
  const [compareWith, setCompareWith] = useState<CropRecommendationItem | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [cropSearch, setCropSearch] = useState('');
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [recError, setRecError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Tab 2 (My Growing Crop) State
  const [selectedPlotKey, setSelectedPlotKey] = useState<string>('A');
  const [selectedCropName, setSelectedCropName] = useState<string>('cotton');
  const [selectedGrowthStage, setSelectedGrowthStage] = useState<string>('Flowering Stage');
  const [advisory, setAdvisory] = useState<GrowingCropAdvisory | null>(null);
  const [isLoadingAdvisory, setIsLoadingAdvisory] = useState(false);
  const [advisoryError, setAdvisoryError] = useState<string | null>(null);

  // 1. Initial Load & Location Subscription
  useEffect(() => {
    let isMounted = true;

    const syncContext = async () => {
      const loc = locationService.getSavedLocation();
      if (isMounted) setLocation(loc);

      const parcel = farmService.getFarmParcel();
      if (isMounted) setFarmParcel(parcel);

      const currentPlots = farmService.getPlots();
      if (isMounted) setPlots(currentPlots);

      if (locationService.hasValidLocation(loc)) {
        try {
          const wData = await weatherService.getWeather(loc.latitude, loc.longitude);
          if (isMounted) setWeather(wData);
        } catch (e) {
          console.warn('[CropRecommendations] Weather load warning:', e);
        }
      }
    };

    syncContext();
    const unsubLoc = locationService.subscribeToLocation(() => {
      syncContext();
    });

    return () => {
      isMounted = false;
      unsubLoc();
    };
  }, []);

  // 2. Fetch "What Should I Grow?" Recommendations
  const loadRecommendations = async () => {
    try {
      setIsLoadingRecs(true);
      setRecError(null);
      const items = await recommendationService.getWhatToGrowRecommendations(season, location);
      setRecommendations(items);
      if (items.length > 0) {
        setSelectedCrop(items[0]);
        setCompareWith(items[1] || items[0]);
      }
    } catch (err: any) {
      console.error('[CropRecommendations] Error loading recommendations:', err);
      setRecError(err?.message || 'Failed to load crop recommendations.');
    } finally {
      setIsLoadingRecs(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [season, location?.latitude, location?.longitude]);

  // 3. Fetch "My Growing Crop" Advisory
  const loadAdvisory = async () => {
    try {
      setIsLoadingAdvisory(true);
      setAdvisoryError(null);
      const activePlot = plots[selectedPlotKey] || null;
      const adv = await recommendationService.getGrowingCropAdvisory(
        selectedCropName,
        selectedGrowthStage,
        activePlot
      );
      setAdvisory(adv);
    } catch (err: any) {
      console.error('[CropRecommendations] Error loading advisory:', err);
      setAdvisoryError(err?.message || 'Failed to load growing crop advisory.');
    } finally {
      setIsLoadingAdvisory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my_crop') {
      loadAdvisory();
    }
  }, [activeTab, selectedCropName, selectedGrowthStage, selectedPlotKey]);

  // Handle Plot Selection in Tab 2
  const handleSelectPlot = (key: string) => {
    setSelectedPlotKey(key);
    const plot = plots[key];
    if (plot) {
      if (plot.crop.toLowerCase().includes('cotton')) {
        setSelectedCropName('cotton');
      } else if (plot.crop.toLowerCase().includes('groundnut')) {
        setSelectedCropName('groundnut');
      } else if (plot.crop.toLowerCase().includes('wheat')) {
        setSelectedCropName('wheat');
      } else if (plot.crop.toLowerCase().includes('sugar')) {
        setSelectedCropName('sugarcane');
      }
      if (plot.stageName) {
        setSelectedGrowthStage(plot.stageName);
      }
    }
  };

  // Multilingual Filter for Recommendations
  const filteredCrops = filterAndSortMultilingual(
    recommendations,
    cropSearch,
    (c) => ({
      primaryGu: c.nameGu,
      primaryEn: c.nameEn,
      primaryHi: c.nameHi,
      secondaryGu: [c.variety, c.waterNeedGu, c.suitabilityReasonGu],
      secondaryEn: [c.variety, c.waterNeed, c.suitabilityReasonEn],
      secondaryHi: [c.variety],
    }),
    language
  );

  // Apply Crop to Farm Plot Action
  const handleApplyToFarm = (crop: CropRecommendationItem) => {
    // Transform to basic format expected by farmService
    const basicRec: any = {
      id: crop.id,
      nameEn: crop.nameEn,
      nameGu: crop.nameGu,
      variety: crop.variety,
      expectedProfit: `₹${crop.estimatedProfitMin.toLocaleString('en-IN')} - ₹${crop.estimatedProfitMax.toLocaleString('en-IN')} / Acre`,
      duration: crop.growingDurationDays,
      waterNeed: crop.waterNeed,
      waterNeedGu: crop.waterNeedGu,
      mandiPrice: crop.liveMarketPriceFormatted,
      priceTrend: crop.liveMarketTrend,
      soilSuitability: crop.soilSuitabilityEn,
      description: crop.suitabilityReasonEn,
      recommendedReasonGu: crop.suitabilityReasonGu,
      riskFactor: crop.suitabilityCategory === 'Highly Suitable' ? 'Low' : 'Moderate',
      stages: crop.stages.map((s) => ({ name: s.name, days: s.days, detail: s.detail })),
    };

    farmService.applyCropToFarm(basicRec, 'A');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      navigate('/my-farm');
    }, 1400);
  };

  // Helper for Suitability Badge Color
  const getSuitabilityColor = (cat: string) => {
    switch (cat) {
      case 'Highly Suitable':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Suitable':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'Moderate':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FCF9F0] text-[#1C1C17] pb-24 md:pb-12">
      {/* ===================================================================== */}
      {/* TOP AGROMIND HEADER BAR                                               */}
      {/* ===================================================================== */}
      <div className="bg-[#163A2D] text-white py-4 sm:py-6 px-3 sm:px-6 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1">
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">psychology</span>
              <span>
                {bi(
                  'AI પાક ભલામણ • Agronomy',
                  'AgroMind AI • Crop Advisory',
                  'एग्रोनॉमी AI • फसल सलाह'
                ).primary}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              {bi('પાક ભલામણ અને ખેતી આયોજન', 'Crop Recommendations & Planning', 'फसल सिफारिशें और योजना').primary}
            </h1>
            <p className="text-emerald-300/90 text-[11px] sm:text-xs font-semibold mt-0.5">
              {bi(
                'લાઇવ હવામાન અને APMC મંડી ભાવ આધારિત વાસ્તવિક સલાહ',
                'Real-time guidance powered by Open-Meteo & APMC Mandi',
                'लाइव मौसम और मंडी भाव आधारित सलाह'
              ).primary}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {activeTab === 'what_to_grow' && (
              <button
                type="button"
                onClick={() => setShowComparison(true)}
                disabled={!selectedCrop || !compareWith}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">compare_arrows</span>
                <span>{bi('સરખામણી', 'Compare Crops', 'फसल तुलना').primary}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/market')}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">storefront</span>
              <span>{bi('મંડી ભાવ', 'Live Mandi Rates', 'मंडी भाव').primary}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MAIN CONTAINER                                                        */}
      {/* ===================================================================== */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 md:px-8 pt-3 sm:pt-5 space-y-4 sm:space-y-6">
        {/* Saved feedback toast */}
        {savedSuccess && selectedCrop && (
          <div className="p-3 sm:p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl sm:rounded-2xl flex items-center gap-2.5 sm:gap-3 shadow-md animate-bounce">
            <span className="material-symbols-outlined text-emerald-700 text-[20px] sm:text-[24px]">check_circle</span>
            <span className="font-bold text-xs sm:text-sm">
              {selectedCrop.nameEn} ({selectedCrop.nameGu}) has been scheduled for Block A! Redirecting to My Farm...
            </span>
          </div>
        )}

        {/* =================================================================== */}
        {/* TWO PRIMARY NAVIGATION TABS                                         */}
        {/* =================================================================== */}
        <div className="bg-[#F1EEE5] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('what_to_grow')}
            className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              activeTab === 'what_to_grow'
                ? 'bg-[#163A2D] text-white shadow-md'
                : 'text-[#414844] hover:text-[#163A2D] hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">eco</span>
            <div className="text-left">
              <span className="block leading-tight">
                {bi('૧. શું વાવવું?', '1. What Should I Grow?', '1. क्या उगाएं?').primary}
              </span>
              <span className="text-[10px] font-normal opacity-80 hidden sm:block">
                {bi('વાવણી આયોજન & નફો અંદાજ', 'Pre-sowing suitability & profit estimates', 'बुवाई योजना और अनुमानित लाभ').primary}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my_crop')}
            className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              activeTab === 'my_crop'
                ? 'bg-[#163A2D] text-white shadow-md'
                : 'text-[#414844] hover:text-[#163A2D] hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">potted_plant</span>
            <div className="text-left">
              <span className="block leading-tight">
                {bi('૨. હાલનો પાક', '2. Growing Crop', '2. मेरी मौजूदा फसल').primary}
              </span>
              <span className="text-[10px] font-normal opacity-80 hidden sm:block">
                {bi('પાક વૃદ્ધિ, પિયત & ખાતર સલાહ', 'Crop-specific irrigation & fertilizer care', 'फसल सिंचाई व खाद सलाह').primary}
              </span>
            </div>
          </button>
        </div>

        {/* =================================================================== */}
        {/* PARCEL & METEOROLOGICAL TELEMETRY CONTEXT BAR                       */}
        {/* =================================================================== */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-[#E5E2DA] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">location_on</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wide block">
                {bi('ખેતર અને હવામાન ટેલિમેટ્રી', 'Active Field Telemetry', 'खेत और मौसम टेलीमेट्री').primary}
              </span>
              <h3 className="text-xs sm:text-base font-black text-[#163A2D]">
                {location.locationName || location.district || 'Surat Farm'} • {farmParcel?.totalArea || 4.5} {farmParcel?.unit?.includes('Vigha') ? 'Vigha' : 'Acres'}
              </h3>
            </div>
          </div>

          {/* Micro Telemetry Chips */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 max-w-full no-scrollbar flex-wrap">
            {/* Live Weather Chip */}
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#F6F3EA] rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-[#1C1C17] flex items-center gap-1 sm:gap-1.5 border border-[#E5E2DA]">
              <span className="material-symbols-outlined text-amber-600 text-[14px] sm:text-[16px]">
                {weather?.current?.icon || 'wb_sunny'}
              </span>
              <span>
                {weather?.current ? `${Math.round(weather.current.temp)}°C` : '28°C'}
              </span>
            </div>

            {/* Soil Type Chip */}
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#F6F3EA] rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-[#1C1C17] flex items-center gap-1 sm:gap-1.5 border border-[#E5E2DA]">
              <span className="material-symbols-outlined text-amber-800 text-[14px] sm:text-[16px]">terrain</span>
              <span>{farmParcel?.soilType ? farmParcel.soilType.split('(')[0].trim() : 'Black Cotton Soil'}</span>
            </div>

            {/* Open-Meteo Verified Live Badge */}
            <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-50 text-emerald-800 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Live Weather</span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: WHAT SHOULD I GROW? (PRE-SOWING SUITABILITY & PROFIT)        */}
        {/* =================================================================== */}
        {activeTab === 'what_to_grow' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Season Selector Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div className="bg-[#F1EEE5] p-1 rounded-xl flex items-center gap-1 sm:gap-1.5 max-w-md w-full shadow-xs">
                <button
                  type="button"
                  onClick={() => setSeason('kharif')}
                  className={`flex-1 py-1.5 sm:py-2 rounded-lg font-extrabold text-xs transition-all flex flex-col items-center cursor-pointer ${
                    season === 'kharif'
                      ? 'bg-[#163A2D] text-white shadow-sm'
                      : 'text-[#414844] hover:bg-white/60'
                  }`}
                >
                  <span>{bi('ચોમાસુ', 'Kharif', 'खरीफ').primary}</span>
                  <span className="text-[9px] sm:text-[10px] font-normal opacity-80">Jun - Oct</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSeason('rabi')}
                  className={`flex-1 py-1.5 sm:py-2 rounded-lg font-extrabold text-xs transition-all flex flex-col items-center cursor-pointer ${
                    season === 'rabi'
                      ? 'bg-[#163A2D] text-white shadow-sm'
                      : 'text-[#414844] hover:bg-white/60'
                  }`}
                >
                  <span>{bi('શિયાળુ', 'Rabi', 'रबी').primary}</span>
                  <span className="text-[9px] sm:text-[10px] font-normal opacity-80">Oct - Mar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSeason('zaid')}
                  className={`flex-1 py-1.5 sm:py-2 rounded-lg font-extrabold text-xs transition-all flex flex-col items-center cursor-pointer ${
                    season === 'zaid'
                      ? 'bg-[#163A2D] text-white shadow-sm'
                      : 'text-[#414844] hover:bg-white/60'
                  }`}
                >
                  <span>{bi('ઉનાળુ', 'Zaid', 'जायद').primary}</span>
                  <span className="text-[9px] sm:text-[10px] font-normal opacity-80">Mar - Jun</span>
                </button>
              </div>

              {/* Multilingual Search Bar */}
              <div className="relative flex-1 max-w-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700 text-[18px] sm:text-lg">
                  search
                </span>
                <input
                  type="text"
                  value={cropSearch}
                  onChange={(e) => setCropSearch(e.target.value)}
                  placeholder={bi(
                    'પાક અથવા જાત શોધો... (કપાસ, મગફળી)',
                    'Search crop or variety... (Cotton, Groundnut)',
                    'फसल या किस्म खोजें... (कपास, मूंगफली)'
                  ).primary}
                  className="w-full pl-9 pr-8 py-1.5 sm:py-2 bg-white border border-[#E5E2DA] rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-xs"
                />
                {cropSearch && (
                  <button
                    type="button"
                    onClick={() => setCropSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Loading / Error States */}
            {isLoadingRecs ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 animate-pulse">
                <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                  <div className="h-36 sm:h-44 bg-white rounded-xl sm:rounded-2xl border border-[#E5E2DA]" />
                  <div className="h-36 sm:h-44 bg-white rounded-xl sm:rounded-2xl border border-[#E5E2DA]" />
                </div>
                <div className="lg:col-span-7 h-80 sm:h-96 bg-white rounded-xl sm:rounded-2xl border border-[#E5E2DA]" />
              </div>
            ) : recError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center space-y-2 sm:space-y-3">
                <span className="material-symbols-outlined text-red-600 text-[28px] sm:text-[32px]">warning</span>
                <h3 className="text-sm sm:text-base font-bold text-red-950">{recError}</h3>
                <button
                  type="button"
                  onClick={loadRecommendations}
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Retry Loading
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                {/* ------------------------------------------------------------- */}
                {/* LEFT COLUMN: Ranked Recommended Crops List (5 cols)           */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-extrabold text-[#163A2D] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-700 text-[18px] sm:text-[20px]">stars</span>
                      <span>{bi('અનુકૂળતા મુજબ પાક', 'Ranked by Weather & Market', 'मौसम व मंडी अनुसार फसलें').primary}</span>
                    </h2>
                    <span className="text-[11px] sm:text-xs font-bold text-[#717974]">
                      {filteredCrops.length} {bi('પાક ઉપલબ્ધ', 'Crops', 'फसलें').primary}
                    </span>
                  </div>

                  {filteredCrops.length === 0 ? (
                    <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center border border-[#E5E2DA] space-y-2">
                      <p className="font-bold text-xs sm:text-sm text-[#163A2D]">No crops matching "{cropSearch}"</p>
                      <button
                        type="button"
                        onClick={() => setCropSearch('')}
                        className="text-xs font-bold text-emerald-700 underline cursor-pointer"
                      >
                        Clear Search Filter
                      </button>
                    </div>
                  ) : (
                    filteredCrops.map((crop, idx) => {
                      const isSelected = selectedCrop?.id === crop.id;
                      return (
                        <div
                          key={crop.id}
                          onClick={() => setSelectedCrop(crop)}
                          className={`cursor-pointer rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 transition-all shadow-sm ${
                            isSelected
                              ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-md scale-[1.005]'
                              : 'border-[#E5E2DA] bg-white hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                            <div className="flex items-start gap-2.5 sm:gap-3">
                              <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 ${
                                  idx === 0
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-emerald-100 text-emerald-900'
                                }`}
                              >
                                #{idx + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                  <h3 className="font-black text-sm sm:text-base text-[#163A2D]">
                                    {bi(crop.nameGu, crop.nameEn, crop.nameHi).primary}
                                  </h3>
                                  <span
                                    className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold border ${getSuitabilityColor(
                                      crop.suitabilityCategory
                                    )}`}
                                  >
                                    {bi(crop.suitabilityCategoryGu, crop.suitabilityCategory, crop.suitabilityCategory).primary}
                                  </span>
                                </div>
                                <p className="text-[11px] sm:text-xs font-semibold text-emerald-700">{crop.variety}</p>
                              </div>
                            </div>

                            <span
                              className={`material-symbols-outlined text-[18px] sm:text-[22px] shrink-0 ${
                                isSelected ? 'text-emerald-600' : 'text-[#C1C8C3]'
                              }`}
                            >
                              {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                            </span>
                          </div>

                          {/* 3 Metric Chips */}
                          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#F1EEE5] grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs">
                            <div className="bg-[#F6F3EA] p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#717974] block truncate">Est. Profit</span>
                              <span className="text-[11px] sm:text-xs font-black text-emerald-800 truncate block">
                                ₹{(crop.estimatedProfitMax / 1000).toFixed(1)}k/Ac
                              </span>
                            </div>
                            <div className="bg-[#F6F3EA] p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#717974] block truncate">Mandi Price</span>
                              <span className="text-[11px] sm:text-xs font-black text-[#163A2D] truncate block">
                                {crop.liveMarketPriceFormatted}
                              </span>
                            </div>
                            <div className="bg-[#F6F3EA] p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#717974] block truncate">Duration</span>
                              <span className="text-[11px] sm:text-xs font-bold text-[#1C1C17] truncate block">
                                {crop.growingDurationDays.split(' ')[0]} d
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] sm:text-xs text-[#414844] mt-2 sm:mt-2.5 leading-snug bg-[#FCF9F0] p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-[#E5E2DA] line-clamp-2 sm:line-clamp-none">
                            💡 <strong>{bi('અનુકૂળતા:', 'Fit:', 'अनुकूलता:').primary}</strong>{' '}
                            {bi(crop.suitabilityReasonGu, crop.suitabilityReasonEn, crop.suitabilityReasonEn).primary}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* RIGHT COLUMN: Selected Crop Comprehensive Analysis (7 cols)  */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                  {selectedCrop ? (
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E5E2DA] space-y-4 sm:space-y-6">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 sm:pb-5 border-b border-[#E5E2DA] gap-3 sm:gap-4">
                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span
                              className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border ${getSuitabilityColor(
                                selectedCrop.suitabilityCategory
                              )}`}
                            >
                              {bi(selectedCrop.suitabilityCategoryGu, selectedCrop.suitabilityCategory, selectedCrop.suitabilityCategory).primary}
                            </span>
                            <span className="text-[11px] sm:text-xs font-semibold text-[#717974]">
                              Score: {selectedCrop.suitabilityScore}/100
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-[#163A2D] mt-1">
                            {bi(selectedCrop.nameGu, selectedCrop.nameEn, selectedCrop.nameHi).primary}
                          </h2>
                          <p className="text-[11px] sm:text-xs text-[#717974] mt-0.5">
                            {selectedCrop.variety} • {selectedCrop.soilSuitabilityEn}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyToFarm(selectedCrop)}
                          className="w-full sm:w-auto px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#163A2D] hover:bg-emerald-900 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                          <span className="material-symbols-outlined text-[16px] sm:text-[18px]">add_task</span>
                          <span>{bi('પાક સ્વીકારો', 'Apply Plan to Farm', 'योजना स्वीकारें').primary}</span>
                        </button>
                      </div>

                      {/* 4 Agronomic Metric Chips */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-[#F6F3EA] p-3 rounded-xl border border-[#E5E2DA]">
                          <span className="text-[10px] uppercase font-bold text-[#717974] block">Water Need</span>
                          <span className="text-xs font-extrabold text-[#163A2D] flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-blue-600 text-[16px]">water_drop</span>
                            <span>{selectedCrop.waterNeed}</span>
                          </span>
                        </div>
                        <div className="bg-[#F6F3EA] p-3 rounded-xl border border-[#E5E2DA]">
                          <span className="text-[10px] uppercase font-bold text-[#717974] block">Duration</span>
                          <span className="text-xs font-extrabold text-[#163A2D] flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-amber-600 text-[16px]">timelapse</span>
                            <span>{selectedCrop.growingDurationDays}</span>
                          </span>
                        </div>
                        <div className="bg-[#F6F3EA] p-3 rounded-xl border border-[#E5E2DA]">
                          <span className="text-[10px] uppercase font-bold text-[#717974] block">Expected Yield</span>
                          <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-emerald-600 text-[16px]">agriculture</span>
                            <span>{selectedCrop.yieldRange.minYieldPerAcre} - {selectedCrop.yieldRange.maxYieldPerAcre} {selectedCrop.yieldRange.unit}/Ac</span>
                          </span>
                        </div>
                        <div className="bg-[#F6F3EA] p-3 rounded-xl border border-[#E5E2DA]">
                          <span className="text-[10px] uppercase font-bold text-[#717974] block">Mandi Price</span>
                          <span className="text-xs font-extrabold text-[#163A2D] flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-emerald-600 text-[16px]">trending_up</span>
                            <span>{selectedCrop.liveMarketPriceFormatted}</span>
                          </span>
                        </div>
                      </div>

                      {/* ======================================================= */}
                      {/* TRANSPARENT PROFIT & ARITHMETIC BREAKDOWN CARD          */}
                      {/* ======================================================= */}
                      <div className="bg-[#F6F3EA] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-[#E5E2DA] space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E5E2DA] pb-2 sm:pb-2.5">
                          <h3 className="font-extrabold text-xs sm:text-sm text-[#163A2D] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-emerald-700 text-[16px] sm:text-[18px]">calculate</span>
                            <span>{bi('પારદર્શક નફો ગણતરી', 'Revenue & Profit Math', 'आय व लाभ गणना').primary}</span>
                          </h3>
                          <span className="text-[9px] sm:text-[10px] font-bold text-[#717974]">
                            1 Acre • {selectedCrop.liveMarketName}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
                          {/* 1. Estimated Input Costs */}
                          <div className="bg-white p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-[#E5E2DA] space-y-0.5 sm:space-y-1">
                            <span className="text-[9px] sm:text-[10px] font-bold text-[#717974] uppercase block">
                              1. Total Input Cost
                            </span>
                            <span className="text-sm sm:text-base font-black text-red-700 block">
                              ₹{selectedCrop.costs.totalCostPerAcre.toLocaleString('en-IN')}
                            </span>
                            <p className="text-[9px] sm:text-[10px] text-gray-500">
                              Seeds: ₹{selectedCrop.costs.seedCostPerAcre} • Fert: ₹{selectedCrop.costs.fertilizerCostPerAcre}
                            </p>
                          </div>

                          {/* 2. Expected Revenue */}
                          <div className="bg-white p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-[#E5E2DA] space-y-0.5 sm:space-y-1">
                            <span className="text-[9px] sm:text-[10px] font-bold text-[#717974] uppercase block">
                              2. Gross Revenue
                            </span>
                            <span className="text-sm sm:text-base font-black text-[#163A2D] block">
                              ₹{selectedCrop.estimatedRevenueMin.toLocaleString('en-IN')} - ₹{selectedCrop.estimatedRevenueMax.toLocaleString('en-IN')}
                            </span>
                            <p className="text-[9px] sm:text-[10px] text-gray-500">
                              Yield × ₹{selectedCrop.liveMarketPrice}
                            </p>
                          </div>

                          {/* 3. Estimated Net Profit */}
                          <div className="bg-emerald-50 p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-emerald-300 space-y-0.5 sm:space-y-1">
                            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-800 uppercase block">
                              3. Estimated Net Profit
                            </span>
                            <span className="text-sm sm:text-base font-black text-emerald-800 block">
                              ₹{selectedCrop.estimatedProfitMin.toLocaleString('en-IN')} - ₹{selectedCrop.estimatedProfitMax.toLocaleString('en-IN')}
                            </span>
                            <p className="text-[9px] sm:text-[10px] text-emerald-700 font-semibold">
                              Revenue − Input Cost
                            </p>
                          </div>
                        </div>

                        {/* Explicit Disclaimer */}
                        <p className="text-[10px] sm:text-[11px] text-[#414844] italic bg-white/70 p-2 rounded-lg sm:rounded-xl border border-[#E5E2DA]/60">
                          ℹ️ {bi(selectedCrop.disclaimerGu, selectedCrop.disclaimer, selectedCrop.disclaimer).primary}
                        </p>
                      </div>

                      {/* ======================================================= */}
                      {/* DATA AUDIT & UNAVAILABLE FIELDS BADGES                  */}
                      {/* ======================================================= */}
                      <div className="p-3 sm:p-4 rounded-xl bg-white border border-[#E5E2DA] space-y-2 text-xs">
                        <span className="font-extrabold text-[#163A2D] flex items-center gap-1.5 text-xs">
                          <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-emerald-700">fact_check</span>
                          <span>Data Audit:</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
                          <span className="px-2 py-0.5 sm:py-1 bg-emerald-50 text-emerald-800 rounded font-semibold border border-emerald-200">
                            Weather: {selectedCrop.dataAudit.weatherSource}
                          </span>
                          <span className="px-2 py-0.5 sm:py-1 bg-sky-50 text-sky-800 rounded font-semibold border border-sky-200">
                            Mandi: {selectedCrop.dataAudit.marketSource}
                          </span>
                        </div>
                      </div>

                      {/* Cultivation Stages Roadmap */}
                      <div className="space-y-2.5 sm:space-y-3">
                        <h3 className="font-extrabold text-xs sm:text-sm text-[#163A2D] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-emerald-700 text-[16px] sm:text-[18px]">timeline</span>
                          <span>{bi('તબક્કાવાર ખેતી આયોજન', 'Cultivation Stages', 'क्रमवार कृषि योजना').primary}</span>
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          {selectedCrop.stages.map((stg, sIdx) => (
                            <div key={sIdx} className="p-2.5 sm:p-3.5 bg-[#F6F3EA] rounded-lg sm:rounded-xl border border-[#E5E2DA] space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-[#163A2D]">
                                  {sIdx + 1}. {bi(stg.nameGu, stg.name, stg.name).primary}
                                </span>
                                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-white text-emerald-800 font-bold rounded border border-[#E5E2DA]">
                                  {stg.days}
                                </span>
                              </div>
                              <p className="text-[11px] sm:text-xs text-[#414844]">
                                {bi(stg.detailGu, stg.detail, stg.detail).primary}
                              </p>
                              {stg.fertilizerAction && (
                                <p className="text-[10px] sm:text-[11px] text-emerald-800 font-semibold">
                                  🌱 {bi(stg.fertilizerActionGu || stg.fertilizerAction, stg.fertilizerAction, stg.fertilizerAction).primary}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: MY GROWING CROP (ALREADY GROWING A CROP ADVISORY)            */}
        {/* =================================================================== */}
        {activeTab === 'my_crop' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Plot and Crop Selector Banner */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-[#E5E2DA] space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-[#E5E2DA] pb-2.5 sm:pb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-[#163A2D] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-700 text-[18px] sm:text-[20px]">agriculture</span>
                    <span>{bi('વાવેલા પાકની પસંદગી કરો', 'Select Active Plot & Stage', 'बोई गई फसल और अवस्था').primary}</span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#717974] mt-0.5">
                    {bi(
                      'તમારા ખેતરના બ્લોક મુજબ પાક અને અવસ્થા પસંદ કરો.',
                      'Choose plot and growth stage to receive crop-specific advice.',
                      'सटीक सलाह के लिए खेत का ब्लॉक और अवस्था चुनें।'
                    ).primary}
                  </p>
                </div>

                {/* Plot Selector Chips */}
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
                  {Object.keys(plots).length === 0 ? (
                    <button
                      type="button"
                      onClick={() => navigate('/my-farm')}
                      className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">add_location_alt</span>
                      <span>{bi('+ પ્લોટ ઉમેરો', '+ Add Plot in My Farm', '+ Plot Jodein').primary}</span>
                    </button>
                  ) : (
                    Object.entries(plots).map(([key, p]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectPlot(key)}
                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-bold text-xs border transition-all cursor-pointer shrink-0 ${
                          selectedPlotKey === key
                            ? 'bg-[#163A2D] text-white border-[#163A2D] shadow-sm'
                            : 'bg-[#F6F3EA] text-[#163A2D] border-[#E5E2DA] hover:border-emerald-500'
                        }`}
                      >
                        Plot {key}: {p.crop.split(' ')[0]}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Crop & Stage Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-[#717974] uppercase block mb-1">
                    {bi('વાવેલો પાક', 'Active Crop', 'बोई गई फसल').primary}
                  </label>
                  <select
                    value={selectedCropName}
                    onChange={(e) => setSelectedCropName(e.target.value)}
                    className="w-full p-2 sm:p-2.5 bg-[#F6F3EA] border border-[#E5E2DA] rounded-lg sm:rounded-xl text-xs font-extrabold text-[#163A2D] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    <option value="cotton">Bt Cotton (કપાસ)</option>
                    <option value="groundnut">Groundnut (મગફળી)</option>
                    <option value="sugarcane">Sugarcane (શેરડી)</option>
                    <option value="wheat">Durum Wheat (ઘઉં)</option>
                    <option value="chickpea">Chickpea / Gram (ચણા)</option>
                    <option value="sesame">Summer Sesame (તલ)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-[#717974] uppercase block mb-1">
                    {bi('વિકાસ તબક્કો', 'Growth Stage', 'विकास अवस्था').primary}
                  </label>
                  <select
                    value={selectedGrowthStage}
                    onChange={(e) => setSelectedGrowthStage(e.target.value)}
                    className="w-full p-2 sm:p-2.5 bg-[#F6F3EA] border border-[#E5E2DA] rounded-lg sm:rounded-xl text-xs font-extrabold text-[#163A2D] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    <option value="Vegetative">Vegetative Growth (વાનસ્પતિક વૃદ્ધિ)</option>
                    <option value="Flowering">Flowering & Square Initiation (ફૂલ-ચાપવા)</option>
                    <option value="Pod Formation">Pod / Boll Formation (જીંડવા / પોપટા)</option>
                    <option value="Maturation">Maturation & Dough (દાણા ભરાવા)</option>
                    <option value="Harvesting">Harvesting & Picking (કાપણી / વીણી)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Advisory Content Cards */}
            {isLoadingAdvisory ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
                <div className="h-56 bg-white rounded-2xl border border-[#E5E2DA]" />
                <div className="h-56 bg-white rounded-2xl border border-[#E5E2DA]" />
                <div className="h-56 bg-white rounded-2xl border border-[#E5E2DA]" />
                <div className="h-56 bg-white rounded-2xl border border-[#E5E2DA]" />
              </div>
            ) : advisoryError || !advisory ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-2">
                <p className="font-bold text-red-900">{advisoryError || 'Unable to compute advisory.'}</p>
                <button
                  type="button"
                  onClick={loadAdvisory}
                  className="px-3.5 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Weather Alert Banner if present */}
                {advisory.weatherSuitability.forecastAlert && (
                  <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 shadow-xs">
                    <span className="material-symbols-outlined text-amber-700 text-[24px] shrink-0">
                      warning
                    </span>
                    <div>
                      <h4 className="font-black text-amber-950 text-sm">
                        {bi('હવામાન જોખમ ચેતવણી (Open-Meteo Alert)', 'Weather Risk Alert (Open-Meteo)', 'मौसम जोखिम चेतावनी').primary}
                      </h4>
                      <p className="text-xs text-amber-900 mt-0.5">
                        {bi(
                          advisory.weatherSuitability.forecastAlertGu || advisory.weatherSuitability.forecastAlert,
                          advisory.weatherSuitability.forecastAlert,
                          advisory.weatherSuitability.forecastAlert
                        ).primary}
                      </p>
                    </div>
                  </div>
                )}

                {/* 4 Crop-Specific Advisory Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
                  {/* Card 1: Weather & Crop Status */}
                  <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-[#E5E2DA] shadow-sm space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E5E2DA] pb-2">
                      <span className="font-black text-xs sm:text-sm text-[#163A2D] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-emerald-700 text-[16px] sm:text-[18px]">thermostat</span>
                        <span>{bi('હવામાન અનુકૂળતા', 'Weather Suitability', 'मौसम अनुकूलता').primary}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold">
                        {bi(advisory.weatherSuitability.statusGu, advisory.weatherSuitability.status, advisory.weatherSuitability.status).primary}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-[#163A2D]">
                        🌡️ {bi(advisory.weatherSuitability.temperatureStatusGu, advisory.weatherSuitability.temperatureStatus, advisory.weatherSuitability.temperatureStatus).primary}
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#414844] leading-snug">
                        {bi(
                          `${advisory.cropNameGu} માટે વર્તમાન ${advisory.currentStageGu} તબક્કે આ તાપમાન અનુકૂળ વૃદ્ધિ દર્શાવે છે.`,
                          `Current temperature is well within standard threshold for ${advisory.cropName} during ${advisory.currentStage}.`,
                          `यह तापमान ${advisory.cropName} की वर्तमान अवस्था के लिए अनुकूल है।`
                        ).primary}
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Dynamic Irrigation Guidance */}
                  <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-[#E5E2DA] shadow-sm space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E5E2DA] pb-2">
                      <span className="font-black text-xs sm:text-sm text-[#163A2D] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-600 text-[16px] sm:text-[18px]">water_drop</span>
                        <span>{bi('પિયત આયોજન', 'Irrigation Guidance', 'सिंचाई योजना').primary}</span>
                      </span>
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {advisory.irrigationGuidance.nextSchedule}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-blue-900">
                        💧 {bi(advisory.irrigationGuidance.actionGu, advisory.irrigationGuidance.action, advisory.irrigationGuidance.action).primary}
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#414844]">
                        {bi(advisory.irrigationGuidance.reasonGu, advisory.irrigationGuidance.reason, advisory.irrigationGuidance.reason).primary}
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Crop-Specific Fertilizer Schedule */}
                  <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-[#E5E2DA] shadow-sm space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E5E2DA] pb-2">
                      <span className="font-black text-xs sm:text-sm text-[#163A2D] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-amber-700 text-[16px] sm:text-[18px]">compost</span>
                        <span>{bi('ખાતર વ્યવસ્થાપન', 'Fertilizer Guidance', 'उर्वरक प्रबंधन').primary}</span>
                      </span>
                      <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                        {advisory.currentStage.split(' ')[0]} Dose
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-[#163A2D]">
                        🌱 {bi(advisory.fertilizerGuidance.dosageGu, advisory.fertilizerGuidance.dosage, advisory.fertilizerGuidance.dosage).primary}
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#414844]">
                        <strong>{bi('પદ્ધતિ:', 'Method:', 'विधि:').primary}</strong> {bi(advisory.fertilizerGuidance.methodGu, advisory.fertilizerGuidance.method, advisory.fertilizerGuidance.method).primary}
                      </p>
                      <p className="text-[10px] text-amber-900 font-medium italic bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                        {bi(advisory.fertilizerGuidance.soilTestNoticeGu, advisory.fertilizerGuidance.soilTestNotice, advisory.fertilizerGuidance.soilTestNotice).primary}
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Crop-Specific Pest & Disease Prevention */}
                  <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-[#E5E2DA] shadow-sm space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E5E2DA] pb-2">
                      <span className="font-black text-xs sm:text-sm text-[#163A2D] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-red-600 text-[16px] sm:text-[18px]">pest_control</span>
                        <span>{bi('જીવાત & રોગ નિયંત્રણ', 'Pest & Disease Prevention', 'कीट व रोग नियंत्रण').primary}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
                        {advisory.pestPrevention.threatName}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-red-950">
                        ⚠️ {bi(advisory.pestPrevention.threatNameGu, advisory.pestPrevention.threatName, advisory.pestPrevention.threatName).primary}
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#414844]">
                        {bi(advisory.pestPrevention.symptomsGu, advisory.pestPrevention.symptoms, advisory.pestPrevention.symptoms).primary}
                      </p>
                      <p className="text-[11px] sm:text-xs text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        🛡️ {bi(advisory.pestPrevention.preventiveActionGu, advisory.pestPrevention.preventiveAction, advisory.pestPrevention.preventiveAction).primary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Harvest Projection & Market Valuation Card */}
                <div className="bg-[#F6F3EA] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-[#E5E2DA] shadow-sm space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E2DA] pb-2.5 sm:pb-3">
                    <h3 className="font-extrabold text-xs sm:text-sm text-[#163A2D] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-700 text-[16px] sm:text-[18px]">payments</span>
                      <span>{bi('કાપણી સમય અને બજાર વ્યૂહરચના', 'Harvest Projection & Strategy', 'कटाई समय व रणनीति').primary}</span>
                    </h3>
                    <span className="text-[11px] sm:text-xs font-bold text-emerald-800">
                      {advisory.harvestProjection.currentMarketPrice}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
                    <div className="bg-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-[#E5E2DA]">
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#717974] block">Harvest Window</span>
                      <span className="text-xs sm:text-sm font-black text-[#163A2D] block mt-0.5">
                        {advisory.harvestProjection.expectedWindow}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-gray-500">{advisory.harvestProjection.daysRemaining}</span>
                    </div>

                    <div className="bg-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-[#E5E2DA]">
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#717974] block">Expected Yield</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-800 block mt-0.5">
                        {advisory.harvestProjection.expectedYieldPerAcre}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-gray-500">Standard farm parcel</span>
                    </div>

                    <div className="bg-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-[#E5E2DA]">
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#717974] block">Estimated Revenue</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-800 block mt-0.5">
                        {advisory.harvestProjection.estimatedRevenuePerAcre}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-gray-500">Yield × Price</span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-[#E5E2DA] text-xs space-y-1">
                    <span className="font-bold text-[#163A2D] block text-xs">
                      📈 {bi('બજાર વેચાણ ભલામણ:', 'Selling Strategy:', 'बिक्री रणनीति:').primary}
                    </span>
                    <p className="text-[11px] sm:text-xs text-[#414844]">
                      {bi(advisory.harvestProjection.sellingStrategyGu, advisory.harvestProjection.sellingStrategy, advisory.harvestProjection.sellingStrategy).primary}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* SIDE-BY-SIDE COMPARISON MODAL (FEATURE A)                             */}
      {/* ===================================================================== */}
      {showComparison && selectedCrop && compareWith && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[#E5E2DA]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E2DA]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-700 text-[26px]">compare_arrows</span>
                <h3 className="text-lg md:text-xl font-extrabold text-[#163A2D]">
                  {bi('પાક સરખામણી મેટ્રિક્સ (Side-by-Side Comparison)', 'Side-by-Side Crop Comparison', 'फसल तुलना मैट्रिक्स').primary}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowComparison(false)}
                className="w-9 h-9 rounded-full bg-[#F1EEE5] hover:bg-[#E5E2DA] flex items-center justify-center text-[#1C1C17] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Left: Selected Pick */}
              <div className="bg-[#F6F3EA] rounded-2xl p-5 border-2 border-emerald-600 space-y-3 text-xs">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                  Primary Selection
                </span>
                <h4 className="text-lg font-black text-[#163A2D]">{selectedCrop.nameEn}</h4>
                <p className="text-xs font-semibold text-emerald-700">{selectedCrop.nameGu}</p>

                <div className="space-y-2 pt-2 border-t border-[#E5E2DA]">
                  <div className="flex justify-between py-1 border-b border-[#E5E2DA]/60">
                    <span className="text-[#717974]">Category</span>
                    <span className="font-extrabold text-emerald-800">{selectedCrop.suitabilityCategory}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E5E2DA]/60">
                    <span className="text-[#717974]">Input Cost</span>
                    <span className="font-extrabold text-red-700">₹{selectedCrop.costs.totalCostPerAcre.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E5E2DA]/60">
                    <span className="text-[#717974]">Est. Profit</span>
                    <span className="font-extrabold text-emerald-800">
                      ₹{(selectedCrop.estimatedProfitMax / 1000).toFixed(1)}k / Ac
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E5E2DA]/60">
                    <span className="text-[#717974]">Live Mandi Price</span>
                    <span className="font-extrabold text-[#163A2D]">{selectedCrop.liveMarketPriceFormatted}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E5E2DA]/60">
                    <span className="text-[#717974]">Duration</span>
                    <span className="font-bold text-[#1C1C17]">{selectedCrop.growingDurationDays}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleApplyToFarm(selectedCrop);
                    setShowComparison(false);
                  }}
                  className="w-full mt-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                >
                  Choose {selectedCrop.nameEn}
                </button>
              </div>

              {/* Right: Alternative */}
              <div className="bg-[#F6F3EA] rounded-2xl p-5 border border-[#E5E2DA] space-y-3 text-xs">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-700 font-bold">
                  Alternative Pick
                </span>
                <h4 className="text-lg font-black text-[#163A2D]">{compareWith.nameEn}</h4>
                <p className="text-xs font-semibold text-emerald-700">{compareWith.nameGu}</p>

                <div className="space-y-2 pt-2 border-t border-[#E5E2DA]">
                  <div className="flex justify-between py-1 border-b border-[#E5E2DA]/60">
                    <span className="text-[#717974]">Category</span>
                    <span className="font-extrabold text-emerald-800">{compareWith.suitabilityCategory}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E5E2DA]/60">
                    <span className="text-[#717974]">Input Cost</span>
                    <span className="font-extrabold text-red-700">₹{compareWith.costs.totalCostPerAcre.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E5E2DA]/60">
                    <span className="text-[#717974]">Est. Profit</span>
                    <span className="font-extrabold text-emerald-800">
                      ₹{(compareWith.estimatedProfitMax / 1000).toFixed(1)}k / Ac
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E5E2DA]/60">
                    <span className="text-[#717974]">Live Mandi Price</span>
                    <span className="font-extrabold text-[#163A2D]">{compareWith.liveMarketPriceFormatted}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E5E2DA]/60">
                    <span className="text-[#717974]">Duration</span>
                    <span className="font-bold text-[#1C1C17]">{compareWith.growingDurationDays}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCrop(compareWith);
                    setShowComparison(false);
                  }}
                  className="w-full mt-3 py-2 bg-[#163A2D] hover:bg-emerald-950 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                >
                  Switch to {compareWith.nameEn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
