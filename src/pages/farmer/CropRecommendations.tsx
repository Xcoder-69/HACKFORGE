import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { farmService } from '../../services/farmService';
import { filterAndSortMultilingual } from '../../utils/multilingualSearch';
import { locationService } from '../../services/locationService';

interface CropRec {
  id: string;
  nameEn: string;
  nameGu: string;
  nameHi: string;
  variety: string;
  matchScore: number;
  expectedProfit: string;
  duration: string;
  waterNeed: 'Low' | 'Medium' | 'High';
  waterNeedGu: string;
  mandiPrice: string;
  priceTrend: 'up' | 'stable' | 'down';
  soilSuitability: string;
  description: string;
  recommendedReasonGu: string;
  riskFactor: 'Low' | 'Moderate' | 'High';
  stages: { name: string; days: string; detail: string }[];
}

const CROPS_DATA: Record<string, CropRec[]> = {
  kharif: [
    {
      id: 'groundnut',
      nameEn: 'Groundnut',
      nameGu: 'મગફળી (GG-20)',
      nameHi: 'Mungfali (GG-20)',
      variety: 'Gujarat Groundnut-20',
      matchScore: 94,
      expectedProfit: '₹42,500 / Acre',
      duration: '105 - 115 Days',
      waterNeed: 'Low',
      waterNeedGu: 'ઓછું પાણી (ડ્રિપ અનુકૂળ)',
      mandiPrice: '₹6,850 / Qtl',
      priceTrend: 'up',
      soilSuitability: '98% match with Black Cotton Soil pH 7.4',
      description: 'Drought-tolerant leguminous crop that enriches nitrogen in soil. Excellent export demand in Rajkot & Surat mandis.',
      recommendedReasonGu: 'કાળી જમીન અને ડ્રિપ માટે ઉત્તમ. નાઇટ્રોજન વધારે છે અને નફો વધુ આપે છે.',
      riskFactor: 'Low',
      stages: [
        { name: 'Soil Prep & FYM', days: 'Day 0-7', detail: 'Deep ploughing + 4 tons farmyard manure per acre' },
        { name: 'Seed Treatment & Sowing', days: 'Day 8-10', detail: 'Trichoderma viride treatment at 5g/kg seed' },
        { name: 'Basal Dose Fertilizer', days: 'Day 15', detail: 'NPK 20:40:20 + 10kg Gypsum' },
        { name: 'Weeding & Drip Irrigation', days: 'Day 25-30', detail: 'Light hoeing and 45mm drip cycle' },
        { name: 'Pegging & Pod Formation', days: 'Day 50-65', detail: 'Crucial moisture period, spray micronutrients' },
        { name: 'Harvesting & Drying', days: 'Day 105-115', detail: 'Dig when 75% shells show internal dark veins' },
      ],
    },
    {
      id: 'cotton',
      nameEn: 'Bt Cotton',
      nameGu: 'કપાસ (G.Cot-16)',
      nameHi: 'Kapas (G.Cot-16)',
      variety: 'Gujarat Cotton Hybrid-16',
      matchScore: 88,
      expectedProfit: '₹38,200 / Acre',
      duration: '150 - 165 Days',
      waterNeed: 'Medium',
      waterNeedGu: 'મધ્યમ પાણી (નિયમિત)',
      mandiPrice: '₹7,200 / Qtl',
      priceTrend: 'stable',
      soilSuitability: '92% match with Deep Black Clay',
      description: 'High staple length fibre variety with in-built bollworm tolerance. Highly suitable for South Gujarat canal/borewell belt.',
      recommendedReasonGu: 'સુરત જિલ્લાના કાળી માટીના પટ્ટા માટે શ્રેષ્ઠ રોકડિયો પાક.',
      riskFactor: 'Moderate',
      stages: [
        { name: 'Ridge & Furrow Prep', days: 'Day 0-5', detail: '90cm spacing ridges with basal compost' },
        { name: 'Dibbling & Sowing', days: 'Day 6-8', detail: 'Sow at 2-3cm depth under moist soil condition' },
        { name: 'Thinning & Gap Filling', days: 'Day 18-20', detail: 'Keep single healthy seedling per hill' },
        { name: 'Squaring & Split Nitrogen', days: 'Day 45-50', detail: 'Urea top dressing 35kg/acre' },
        { name: 'Boll Development', days: 'Day 80-110', detail: 'Pheromone trap monitoring for pink bollworm' },
        { name: 'First Picking', days: 'Day 140-160', detail: 'Pick clean dry bolls in morning hours' },
      ],
    },
    {
      id: 'sugarcane',
      nameEn: 'Sugarcane',
      nameGu: 'શેરડી (Co-86032)',
      nameHi: 'Ganna / Sherdi (Co-86032)',
      variety: 'Co-86032 (Nayana)',
      matchScore: 79,
      expectedProfit: '₹65,000 / Acre',
      duration: '330 - 360 Days',
      waterNeed: 'High',
      waterNeedGu: 'વધુ પાણી (નહેર/બોરવેલ)',
      mandiPrice: '₹3,400 / Ton',
      priceTrend: 'up',
      soilSuitability: '84% match with High Moisture Retention Soil',
      description: 'High-sugar recovery perennial crop with guaranteed buyback from Kamrej Sugar Mill cooperative.',
      recommendedReasonGu: 'કામરેજ સહકારી ખાંડ ફેક્ટરીમાં સીધું વેચાણ સુનિશ્ચિત.',
      riskFactor: 'Low',
      stages: [
        { name: 'Trench Opening', days: 'Day 0-10', detail: '4 feet trenching with organic press mud' },
        { name: 'Two-bud Sett Planting', days: 'Day 12-15', detail: 'Dip setts in carbendazim solution' },
        { name: 'Tillering Stage', days: 'Day 45-90', detail: 'Earthing up and irrigation scheduling' },
        { name: 'Grand Growth Period', days: 'Day 120-240', detail: 'Regular fertigation via drip emitters' },
        { name: 'Maturation & Brix Test', days: 'Day 300-330', detail: 'Withhold excess water to concentrate sucrose' },
        { name: 'Factory Harvesting', days: 'Day 340-360', detail: 'Harvest at ground level with sharp knife' },
      ],
    },
  ],
  rabi: [
    {
      id: 'wheat',
      nameEn: 'Durum Wheat',
      nameGu: 'ટુકડી / ભાલીયા ઘઉં',
      nameHi: 'Sharbati Gehun (GW-496)',
      variety: 'GW-496 Gold Line',
      matchScore: 92,
      expectedProfit: '₹28,500 / Acre',
      duration: '110 - 120 Days',
      waterNeed: 'Medium',
      waterNeedGu: 'મધ્યમ સિંચાઈ (૪-૫ પિયત)',
      mandiPrice: '₹2,820 / Qtl',
      priceTrend: 'up',
      soilSuitability: '95% match after Kharif Pulses',
      description: 'Ideal rotational crop following legumes. Low pest vulnerability during cold Gujarat winter months.',
      recommendedReasonGu: 'મગફળી પછી ઘઉં વાવવાથી જમીનમાં પોષક તત્વો સંતુલિત રહે છે.',
      riskFactor: 'Low',
      stages: [
        { name: 'Fine Tilth Prep', days: 'Day 0-5', detail: 'Rotavator ploughing to fine granular bed' },
        { name: 'Line Sowing', days: 'Day 6-8', detail: 'Seed drill sowing at 20cm row distance' },
        { name: 'Crown Root Irrigation', days: 'Day 21', detail: 'Most critical first irrigation stage' },
        { name: 'Tillering & Jointing', days: 'Day 40-45', detail: 'Top dressing with urea and zinc' },
        { name: 'Heading & Milking', days: 'Day 65-75', detail: 'Maintain soil moisture for grain plumping' },
        { name: 'Combine Harvesting', days: 'Day 115-120', detail: 'Harvest when grain moisture drops below 12%' },
      ],
    },
    {
      id: 'chickpea',
      nameEn: 'Gram / Chickpea',
      nameGu: 'ચણા (ગુજરાત ચણા-૫)',
      nameHi: 'Chana (GG-5)',
      variety: 'Gujarat Gram-5',
      matchScore: 89,
      expectedProfit: '₹31,000 / Acre',
      duration: '95 - 105 Days',
      waterNeed: 'Low',
      waterNeedGu: 'ઓછું પાણી (૨-૩ પિયત)',
      mandiPrice: '₹6,100 / Qtl',
      priceTrend: 'up',
      soilSuitability: '90% match with Residual Moisture Soil',
      description: 'Highly drought-resilient pulse variety requiring minimal input. Excellent minimum support price (MSP) backing.',
      recommendedReasonGu: 'ઓછા ખર્ચે અને ઓછા પાણીમાં સૌથી વધુ નફો આપતો રવિ પાક.',
      riskFactor: 'Low',
      stages: [
        { name: 'Seedbed Conditioning', days: 'Day 0-5', detail: 'Maintain deep residual subsoil moisture' },
        { name: 'Rhizobium Treatment', days: 'Day 6-7', detail: 'Bio-fertilizer seed coating for root nodules' },
        { name: 'Branching Phase', days: 'Day 30-35', detail: 'Nipping terminal buds to increase side branches' },
        { name: 'Pod Borer Watch', days: 'Day 55-65', detail: 'Install bird perches and NPV viral spray' },
        { name: 'Maturity & Threshing', days: 'Day 95-105', detail: 'Harvest when leaves turn yellow-brown' },
      ],
    },
  ],
  zaid: [
    {
      id: 'summer_sesame',
      nameEn: 'Summer Sesame (Til)',
      nameGu: 'ઉનાળુ તલ (ગુજરાત તલ-૨)',
      nameHi: 'Garmi ke Til (GT-2)',
      variety: 'Gujarat Til-2 (White)',
      matchScore: 85,
      expectedProfit: '₹34,000 / Acre',
      duration: '85 - 90 Days',
      waterNeed: 'Low',
      waterNeedGu: 'હળવું પિયત (ડ્રિપ)',
      mandiPrice: '₹14,500 / Qtl',
      priceTrend: 'up',
      soilSuitability: '88% match with Well Drained Loam/Black Soil',
      description: 'Short-duration premium cash crop with sky-high export prices in Unjha and Rajkot mandis.',
      recommendedReasonGu: '૮૫ દિવસનો ટૂંકો પાક. ઊંચા બજારભાવ અને ઓછી મજૂરી ખર્ચ.',
      riskFactor: 'Moderate',
      stages: [
        { name: 'Pre-sowing Watering', days: 'Day 0-3', detail: 'Vapasa condition preparation' },
        { name: 'Shallow Sowing', days: 'Day 4-6', detail: 'Mix small seeds with fine sand for even spread' },
        { name: 'Flowering Flush', days: 'Day 35-45', detail: 'Keep drip irrigation regular every 4 days' },
        { name: 'Capsule Browning', days: 'Day 80-85', detail: 'Harvest before capsules burst open' },
      ],
    },
  ],
};

export const CropRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const { language, bi } = useLanguage();
  const [season, setSeason] = useState<'kharif' | 'rabi' | 'zaid'>('kharif');
  const [selectedCrop, setSelectedCrop] = useState<CropRec>(CROPS_DATA.kharif[0]);
  const [showComparison, setShowComparison] = useState(false);
  const [compareWith, setCompareWith] = useState<CropRec>(CROPS_DATA.kharif[1]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [cropSearch, setCropSearch] = useState('');

  const activeCrops = CROPS_DATA[season] || [];
  const filteredCrops = filterAndSortMultilingual(
    activeCrops,
    cropSearch,
    (c) => ({
      primaryGu: c.nameGu,
      primaryEn: c.nameEn,
      primaryHi: c.nameHi,
      secondaryGu: [c.variety, c.waterNeedGu, c.recommendedReasonGu],
      secondaryEn: [c.variety, c.waterNeed, c.description],
      secondaryHi: [c.variety],
    }),
    language
  );

  useEffect(() => {
    if (cropSearch.trim() && filteredCrops.length > 0) {
      if (!filteredCrops.some((c) => c.id === selectedCrop.id)) {
        setSelectedCrop(filteredCrops[0]);
      }
    }
  }, [cropSearch, filteredCrops, selectedCrop.id]);

  const handleSelectSeason = (s: 'kharif' | 'rabi' | 'zaid') => {
    setSeason(s);
    const first = CROPS_DATA[s]?.[0];
    if (first) {
      setSelectedCrop(first);
      setCompareWith(CROPS_DATA[s]?.[1] || first);
    }
  };

  const handleApplyToFarm = (crop: CropRec) => {
    farmService.applyCropToFarm(crop, 'A');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      navigate('/my-farm');
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen bg-[#FCF9F0] text-[#1C1C17] pb-24 md:pb-12">
      {/* Top Header / Breadcrumb */}
      <div className="bg-[#163A2D] text-white py-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              <span>{bi('AI પાક ભલામણ કેન્દ્ર • Autonomous Agronomy', 'Autonomous Agronomy AI • Crop Advisory', 'स्वायत्त एग्रोनॉमी AI • फसल सलाह').primary}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {bi('પાક ભલામણ અને ખેતી આયોજન', 'Crop Recommendations & Cultivation Planning', 'फसल सिफारिशें और कृषि योजना').primary}
            </h1>
            <p className="text-emerald-300/90 text-xs font-semibold mt-0.5">
              {bi('Crop Recommendations & Cultivation Planning', 'પાક ભલામણ અને ખેતી આયોજન', 'Crop Recommendations & Planning').primary}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowComparison(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">compare_arrows</span>
              <span>{bi('સરખામણી કરો / Compare Crops', 'Compare Crops / સરખામણી કરો', 'फसल तुलना / Compare Crops').primary}</span>
            </button>
            <button
              onClick={() => navigate('/market')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-colors border border-white/20"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              <span>{bi('લાઇવ મંડી ભાવ / Live Mandi Rates', 'Live Mandi Rates / લાઇવ મંડી ભાવ', 'लाइव मंडी भाव / Live Mandi').primary}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Saved feedback toast */}
        {savedSuccess && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-3 shadow-md animate-bounce">
            <span className="material-symbols-outlined text-emerald-700 text-[24px]">check_circle</span>
            <span className="font-bold">
              {selectedCrop.nameEn} ({selectedCrop.nameGu}) has been scheduled for Block A! Redirecting to My Farm...
            </span>
          </div>
        )}

        {/* Parcel & Micro-climate Context Bar */}
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-[#E5E2DA] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">location_on</span>
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Target Field Parcel</span>
              <h3 className="text-base md:text-lg font-bold text-[#163A2D]">Kamrej Block A • 6.5 Vigha (3.6 Acres)</h3>
            </div>
          </div>

          {/* Environmental Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <div className="px-3 py-1.5 bg-[#F6F3EA] rounded-full text-xs font-semibold text-[#1C1C17] flex items-center gap-1.5 shrink-0 border border-[#E5E2DA]">
              <span className="material-symbols-outlined text-emerald-700 text-[16px]">water_drop</span>
              <span>Moisture: 34% (Optimal)</span>
            </div>
            <div className="px-3 py-1.5 bg-[#F6F3EA] rounded-full text-xs font-semibold text-[#1C1C17] flex items-center gap-1.5 shrink-0 border border-[#E5E2DA]">
              <span className="material-symbols-outlined text-emerald-700 text-[16px]">science</span>
              <span>pH 7.4 (Black Soil)</span>
            </div>
            <div className="px-3 py-1.5 bg-[#F6F3EA] rounded-full text-xs font-semibold text-[#1C1C17] flex items-center gap-1.5 shrink-0 border border-[#E5E2DA]">
              <span className="material-symbols-outlined text-emerald-700 text-[16px]">history</span>
              <span>Prev: Wheat (ઘઉં)</span>
            </div>
            <div className="px-3 py-1.5 bg-[#F6F3EA] rounded-full text-xs font-semibold text-[#1C1C17] flex items-center gap-1.5 shrink-0 border border-[#E5E2DA]">
              <span className="material-symbols-outlined text-emerald-700 text-[16px]">wb_sunny</span>
              <span>Monsoon: On Track</span>
            </div>
          </div>
        </div>

        {/* Season Selector Tabs */}
        <div className="bg-[#F1EEE5] p-1.5 rounded-2xl flex items-center gap-2 max-w-lg shadow-inner">
          <button
            onClick={() => handleSelectSeason('kharif')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex flex-col items-center justify-center ${
              season === 'kharif'
                ? 'bg-[#163A2D] text-white shadow-md'
                : 'text-[#414844] hover:text-[#163A2D] hover:bg-white/60'
            }`}
          >
            <span>{bi('ચોમાસુ (Kharif)', 'Kharif (ચોમાસુ)', 'खरीफ (Kharif)').primary}</span>
            <span className="text-[11px] font-normal opacity-80">Jun - Oct • Current</span>
          </button>
          <button
            onClick={() => handleSelectSeason('rabi')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex flex-col items-center justify-center ${
              season === 'rabi'
                ? 'bg-[#163A2D] text-white shadow-md'
                : 'text-[#414844] hover:text-[#163A2D] hover:bg-white/60'
            }`}
          >
            <span>{bi('શિયાળુ (Rabi)', 'Rabi (શિયાળુ)', 'रबी (Rabi)').primary}</span>
            <span className="text-[11px] font-normal opacity-80">Oct - Mar</span>
          </button>
          <button
            onClick={() => handleSelectSeason('zaid')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex flex-col items-center justify-center ${
              season === 'zaid'
                ? 'bg-[#163A2D] text-white shadow-md'
                : 'text-[#414844] hover:text-[#163A2D] hover:bg-white/60'
            }`}
          >
            <span>{bi('ઉનાળુ (Zaid)', 'Zaid (ઉનાળુ)', 'जायद (Zaid)').primary}</span>
            <span className="text-[11px] font-normal opacity-80">Mar - Jun</span>
          </button>
        </div>

        {/* Grid Layout: Recommended Crops Cards & Cultivation Roadmap */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Top Recommended Crops Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#163A2D] flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-700">stars</span>
                <span>
                  {bi(
                    'AI ભલામણ અને જમીન અનુરૂપતા',
                    'Ranked by AI Profit & Soil Fit',
                    'एआई लाभ व मृदा अनुकूलता'
                  ).primary}
                </span>
              </h2>
              <span className="text-xs font-semibold text-[#717974]">
                {filteredCrops.length} / {activeCrops.length} {bi('પાક', 'Crops', 'फसलें').primary}
              </span>
            </div>

            {/* Multilingual Search Bar */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700 text-lg">
                search
              </span>
              <input
                type="text"
                value={cropSearch}
                onChange={(e) => setCropSearch(e.target.value)}
                placeholder={bi(
                  'પાક અથવા જાત શોધો... (કપાસ, ઘઉં, kapas, wheat)',
                  'Search crop or variety... (Cotton, Wheat, Kapas)',
                  'फसल या किस्म खोजें... (कपास, गेहूं, cotton)'
                ).primary}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E5E2DA] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all shadow-sm"
              />
              {cropSearch && (
                <button
                  type="button"
                  onClick={() => setCropSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 flex items-center justify-center"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>

            {/* Empty state if search has no results */}
            {filteredCrops.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#E5E2DA] space-y-3 shadow-sm">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                  <span className="material-symbols-outlined text-2xl">search_off</span>
                </div>
                <p className="font-bold text-[#163A2D] text-base">
                  {bi(
                    `"${cropSearch}" માટે કોઈ પાક મળ્યો નથી`,
                    `No crops found matching "${cropSearch}"`,
                    `"${cropSearch}" के लिए कोई फसल नहीं मिली`
                  ).primary}
                </p>
                <p className="text-xs text-[#717974] leading-relaxed">
                  {bi(
                    'અન્ય પાક અથવા અંગ્રેજી/ગુજરાતી નામ (દા.ત. કપાસ, ઘઉં, મગફળી, kapas, wheat) લખીને શોધો.',
                    'Try searching with English or regional terms (e.g. Cotton, Kapas, Wheat, Groundnut).',
                    'अन्य फसल या नाम (उदा. कपास, गेहूं, cotton, wheat) लिखकर खोजें।'
                  ).primary}
                </p>
                <button
                  onClick={() => setCropSearch('')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {bi('શોધ સાફ કરો (Clear Search)', 'Clear Search (શોધ સાફ કરો)', 'खोज साफ़ करें (Clear Search)').primary}
                </button>
              </div>
            ) : (
              filteredCrops.map((crop, idx) => {
                const isSelected = selectedCrop.id === crop.id;
                return (
                  <div
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop)}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all shadow-sm ${
                      isSelected
                        ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-md scale-[1.01]'
                        : 'border-[#E5E2DA] bg-white hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-base shrink-0 ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-lg text-[#163A2D]">
                              {bi(crop.nameGu, crop.nameEn, crop.nameHi).primary}
                            </h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                              {crop.matchScore}% Match
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-emerald-700">
                            {bi(crop.nameGu, crop.nameEn, crop.nameHi).secondary}
                          </p>
                          <p className="text-xs text-[#717974]">{crop.variety}</p>
                        </div>
                      </div>

                      <span
                        className={`material-symbols-outlined text-[24px] ${
                          isSelected ? 'text-emerald-600' : 'text-[#C1C8C3]'
                        }`}
                      >
                        {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>

                    {/* Profit & Metric Badges */}
                    <div className="mt-4 pt-3 border-t border-[#F1EEE5] grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[#F6F3EA] p-2 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-[#717974] block">Exp. Profit</span>
                        <span className="text-xs md:text-sm font-extrabold text-emerald-800">{crop.expectedProfit}</span>
                      </div>
                      <div className="bg-[#F6F3EA] p-2 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-[#717974] block">Mandi Rate</span>
                        <span className="text-xs md:text-sm font-extrabold text-[#163A2D] flex items-center justify-center gap-0.5">
                          {crop.mandiPrice}
                          <span className="material-symbols-outlined text-xs text-emerald-600">arrow_upward</span>
                        </span>
                      </div>
                      <div className="bg-[#F6F3EA] p-2 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-[#717974] block">Duration</span>
                        <span className="text-xs md:text-sm font-bold text-[#1C1C17]">{crop.duration.split(' ')[0]} d</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#414844] mt-3 leading-relaxed bg-[#FCF9F0] p-2.5 rounded-xl border border-[#E5E2DA]">
                      💡 <strong>AI ભલામણ:</strong> {crop.recommendedReasonGu}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Crop Cultivation Roadmap & Planning (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E2DA]">
              {/* Header of Selected Crop */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-[#E5E2DA] gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                      Selected Plan
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">6-Stage Cultivation Guide</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#163A2D] mt-1">
                    {bi(selectedCrop.nameGu, selectedCrop.nameEn, selectedCrop.nameHi).primary} ({bi(selectedCrop.nameGu, selectedCrop.nameEn, selectedCrop.nameHi).secondary})
                  </h2>
                  <p className="text-sm text-[#717974] mt-0.5">{selectedCrop.soilSuitability}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApplyToFarm(selectedCrop)}
                    className="px-5 py-2.5 bg-[#163A2D] hover:bg-emerald-900 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_task</span>
                    <span>{bi('પાક સ્વીકારો (Apply to Farm)', 'Apply to Farm (પાક સ્વીકારો)', 'फसल स्वीकारें (Apply to Farm)').primary}</span>
                  </button>
                </div>
              </div>

              {/* Quick Details Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-[#F1EEE5]">
                <div>
                  <span className="text-xs text-[#717974] block">Water Requirement</span>
                  <span className="text-sm font-bold text-[#163A2D] flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">water_drop</span>
                    {selectedCrop.waterNeed} ({selectedCrop.waterNeedGu.split(' ')[0]})
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#717974] block">Risk Profile</span>
                  <span className="text-sm font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">shield</span>
                    {selectedCrop.riskFactor} Risk
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#717974] block">Crop Duration</span>
                  <span className="text-sm font-bold text-[#163A2D] flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-amber-600 text-[18px]">timelapse</span>
                    {selectedCrop.duration}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#717974] block">Expected Yield</span>
                  <span className="text-sm font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">agriculture</span>
                    18-22 Qtl / Acre
                  </span>
                </div>
              </div>

              {/* Cultivation Stages Timeline */}
              <div className="mt-5">
                <h3 className="font-extrabold text-base text-[#163A2D] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700">timeline</span>
                  <span>Chronological Cultivation Roadmap (તબક્કાવાર આયોજન)</span>
                </h3>

                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-300">
                  {selectedCrop.stages.map((stage, sIdx) => (
                    <div key={sIdx} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-sm ring-2 ring-emerald-200" />
                      <div className="bg-[#F6F3EA] rounded-xl p-4 border border-[#E5E2DA] hover:border-emerald-400 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-sm md:text-base text-[#163A2D]">
                            {sIdx + 1}. {stage.name}
                          </h4>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white font-bold text-emerald-800 border border-[#E5E2DA]">
                            {stage.days}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-[#414844] mt-1.5 leading-relaxed">{stage.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-5 border-t border-[#E5E2DA] flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => navigate('/ai-camera')}
                  className="px-4 py-2.5 rounded-xl bg-[#F1EEE5] hover:bg-[#E5E2DA] text-[#163A2D] font-bold text-xs md:text-sm flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-emerald-700">photo_camera</span>
                  <span>Scan Foliage for Seed Quality</span>
                </button>

                <button
                  onClick={() => navigate('/expenses')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs md:text-sm flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-emerald-700">calculate</span>
                  <span>Estimate Seed & Fertilizer Cost</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Drawer / Modal */}
      {showComparison && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[#E5E2DA]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E2DA]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-700 text-[26px]">compare_arrows</span>
                <h3 className="text-xl font-extrabold text-[#163A2D]">Side-by-Side Crop Comparison</h3>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="w-9 h-9 rounded-full bg-[#F1EEE5] hover:bg-[#E5E2DA] flex items-center justify-center text-[#1C1C17] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Comparison Matrix */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Left Crop */}
              <div className="bg-[#F6F3EA] rounded-2xl p-5 border-2 border-emerald-600">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                  Recommended Pick
                </span>
                <h4 className="text-xl font-extrabold text-[#163A2D] mt-2">{selectedCrop.nameEn}</h4>
                <p className="text-sm font-semibold text-emerald-700">{selectedCrop.nameGu}</p>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DA]">
                    <span className="text-[#717974]">AI Match Score</span>
                    <span className="font-extrabold text-emerald-800">{selectedCrop.matchScore}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DA]">
                    <span className="text-[#717974]">Expected Net Profit</span>
                    <span className="font-extrabold text-emerald-800">{selectedCrop.expectedProfit}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DA]">
                    <span className="text-[#717974]">Duration</span>
                    <span className="font-bold text-[#1C1C17]">{selectedCrop.duration}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DA]">
                    <span className="text-[#717974]">Water Need</span>
                    <span className="font-bold text-[#1C1C17]">{selectedCrop.waterNeed}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DA]">
                    <span className="text-[#717974]">Mandi Price Trend</span>
                    <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                      {selectedCrop.mandiPrice} ↑
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleApplyToFarm(selectedCrop);
                    setShowComparison(false);
                  }}
                  className="w-full mt-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm shadow hover:bg-emerald-800 transition-colors"
                >
                  Choose {selectedCrop.nameEn}
                </button>
              </div>

              {/* Right Crop */}
              <div className="bg-[#F6F3EA] rounded-2xl p-5 border border-[#E5E2DA]">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-700 font-bold">
                  Alternative
                </span>
                <h4 className="text-xl font-extrabold text-[#163A2D] mt-2">{compareWith.nameEn}</h4>
                <p className="text-sm font-semibold text-emerald-700">{compareWith.nameGu}</p>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DA]">
                    <span className="text-[#717974]">AI Match Score</span>
                    <span className="font-extrabold text-emerald-800">{compareWith.matchScore}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DA]">
                    <span className="text-[#717974]">Expected Net Profit</span>
                    <span className="font-extrabold text-emerald-800">{compareWith.expectedProfit}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DA]">
                    <span className="text-[#717974]">Duration</span>
                    <span className="font-bold text-[#1C1C17]">{compareWith.duration}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DA]">
                    <span className="text-[#717974]">Water Need</span>
                    <span className="font-bold text-[#1C1C17]">{compareWith.waterNeed}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E5E2DA]">
                    <span className="text-[#717974]">Mandi Price Trend</span>
                    <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                      {compareWith.mandiPrice} ↔
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCrop(compareWith);
                    setShowComparison(false);
                  }}
                  className="w-full mt-5 py-2.5 bg-[#163A2D] text-white rounded-xl font-bold text-sm shadow hover:bg-emerald-950 transition-colors"
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
