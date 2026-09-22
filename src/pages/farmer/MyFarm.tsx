import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { farmService } from '../../services/farmService';
import { alertService } from '../../services/alertService';
import { notificationService } from '../../services/notificationService';
import { weatherService, type WeatherData } from '../../services/weatherService';
import { locationService } from '../../services/locationService';
import type { PlotKey, PlotInfo, FarmParcel, AlertItem } from '../../types';

interface AiRecData {
  id: string;
  cropGu: string;
  cropEn: string;
  cropHi: string;
  varietyGu: string;
  varietyEn: string;
  varietyHi: string;
  score: number;
  profitGu: string;
  profitEn: string;
  profitHi: string;
  windowGu: string;
  windowEn: string;
  windowHi: string;
  reasonGu: string;
  reasonEn: string;
  reasonHi: string;
  badgeGu: string;
  badgeEn: string;
  badgeHi: string;
}

const AI_RECOMMENDATIONS: AiRecData[] = [
  {
    id: 'rec-groundnut',
    cropGu: 'મગફળી (GG-20)',
    cropEn: 'GG-20 Groundnut',
    cropHi: 'Mungfali (GG-20)',
    varietyGu: 'ગુજરાત મગફળી-૨૦ • ૧૦૫-૧૧૫ દિવસ',
    varietyEn: 'Gujarat Groundnut-20 • 105-115 Days',
    varietyHi: 'Gujarat Mungfali-20 • 105-115 Din',
    score: 96,
    profitGu: '₹૪૨,૫૦૦ / એકર',
    profitEn: '₹42,500 / Acre',
    profitHi: '₹42,500 / Acre',
    windowGu: 'વાવેતર: આગામી ૫-૭ દિવસ (શ્રેષ્ઠ ભેજ)',
    windowEn: 'Sowing: Next 5-7 Days (Optimal Moisture)',
    windowHi: 'Bovavani: Agle 5-7 Din (Best Moisture)',
    reasonGu: 'કાળી કાંપવાળી જમીન અને ડ્રિપ સિંચાઈ માટે ૯૬% સુસંગત. જમીનમાં કુદરતી નાઇટ્રોજન વધારે છે અને રાજકોટ/સુરત મંડીમાં પ્રીમિયમ ભાવ મળે છે.',
    reasonEn: '96% match with Black Cotton Soil pH 7.2 & drip irrigation. Naturally enriches nitrogen with premium export demand.',
    reasonHi: 'Kali mitti (pH 7.2) aur drip piyat ke sath 96% match. Mitti mein nitrogen badhata hai aur mandi mein ucha daam milta hai.',
    badgeGu: 'બ્લોક A માટે શ્રેષ્ઠ AI પસંદગી',
    badgeEn: 'Top AI Recommendation for Block A',
    badgeHi: 'Block A ke liye Top AI Choice',
  },
  {
    id: 'rec-cotton',
    cropGu: 'કપાસ (G.Cot-16)',
    cropEn: 'Bt Cotton (G.Cot-16)',
    cropHi: 'Kapas (G.Cot-16)',
    varietyGu: 'ગુજરાત કપાસ હાઇબ્રિડ-૧૬ • ૧૫૦-૧૬૫ દિવસ',
    varietyEn: 'Gujarat Cotton Hybrid-16 • 150-165 Days',
    varietyHi: 'Gujarat Kapas Hybrid-16 • 150-165 Din',
    score: 92,
    profitGu: '₹૩૮,૨૦૦ / એકર',
    profitEn: '₹38,200 / Acre',
    profitHi: '₹38,200 / Acre',
    windowGu: 'વાવેતર: પિયત પછી તરત તૈયાર કરો',
    windowEn: 'Sowing: Immediate Post Pre-Irrigation',
    windowHi: 'Bovavani: Piyat ke turant baad taiyar karein',
    reasonGu: 'કામરેજ નહેર પટ્ટામાં કાળી માટી માટે શ્રેષ્ઠ રોકડિયો પાક. લાંબો તાર અને રોગ પ્રતિકારક શક્તિ, સુરત ટેક્સટાઇલ મિલ દ્વારા સીધી ખરીદી.',
    reasonEn: 'Optimized for Kamrej canal basin. High staple fiber with in-built pest resilience; strong local textile mill demand.',
    reasonHi: 'Kamrej canal basin ki kali mitti ke liye best cash crop. Lamba resha aur pest tolerance, Surat mill dwara direct kharidi.',
    badgeGu: 'ઉચ્ચ રોકડિયો પાક અનુકૂળ',
    badgeEn: 'High-Yield Commercial Pick',
    badgeHi: 'High Cash Yield Choice',
  },
  {
    id: 'rec-sesame',
    cropGu: 'ઉનાળુ તલ (GT-2)',
    cropEn: 'Summer Sesame (GT-2)',
    cropHi: 'Garmi ke Til (GT-2)',
    varietyGu: 'ગુજરાત તલ-૨ • ૮૫-૯૦ દિવસ',
    varietyEn: 'Gujarat Til-2 • 85-90 Days',
    varietyHi: 'Gujarat Til-2 • 85-90 Din',
    score: 89,
    profitGu: '₹૩૫,૦૦૦ / એકર',
    profitEn: '₹35,000 / Acre',
    profitHi: '₹35,000 / Acre',
    windowGu: 'વાવેતર: પાક ફેરબદલી માટે આદર્શ',
    windowEn: 'Sowing: Ideal for Crop Rotation',
    windowHi: 'Bovavani: Fasal rotation ke liye best',
    reasonGu: 'ઓછા પાણીની જરૂરિયાત (૪૦% ડ્રિપ બચત) અને ટૂંકો પાક સમયગાળો. કપાસ પછી જમીનની ફળદ્રુપતા જાળવી રાખે છે.',
    reasonEn: 'Low water requirement (saves 40% water) with short 85-day maturity. Restores soil balance after heavy Kharif feeding.',
    reasonHi: 'Kam pani ki zaroorat (40% drip bachat) aur chhota 85 din ka cycle. Kapas ke baad mitti ki upaj banaye rakhta hai.',
    badgeGu: 'વોટર-સ્માર્ટ AI રોટેશન',
    badgeEn: 'Water-Smart AI Rotation',
    badgeHi: 'Kam Pani mein Bumper Munafa',
  },
];

const nowPlots = Date.now();
const INITIAL_PLOT_DATA: Record<string, PlotInfo> = {
  A: {
    id: 'plot_A',
    key: 'A',
    title: 'Plot Details: Block A (બ્લોક એ - કપાસ)',
    crop: 'Shankar-6 Cotton',
    subCrop: 'કપાસ',
    variety: 'Gujarat Cotton Hybrid-16',
    area: '2.5 Acres',
    stageBadge: 'Flowering (Day 54/150)',
    stageName: 'Flowering Stage',
    dayCount: 'Day 54',
    plantingDate: new Date(nowPlots - 54 * 86400000).toISOString().split('T')[0],
    progressBar: '36%',
    health: 'Good (તંદુરસ્ત)',
    moisture: '68% (Optimal / ઉત્તમ)',
    soilType: 'Black Cotton Soil (કાળી કાંપવાળી)',
    irrigation: 'Drip (Next: Tomorrow 7:00 AM)',
    syncTime: 'Today, 09:30 AM',
    provenance: 'Measured • IoT Probes',
  },
  B: {
    id: 'plot_B',
    key: 'B',
    title: 'Plot Details: Block B (બ્લોક બી - મગફળી)',
    crop: 'GG-20 Groundnut',
    subCrop: 'મગફળી',
    variety: 'Gujarat Groundnut-20',
    area: '2.0 Acres',
    stageBadge: 'Vegetative (Day 32/110)',
    stageName: 'Vegetative Stage',
    dayCount: 'Day 32',
    plantingDate: new Date(nowPlots - 32 * 86400000).toISOString().split('T')[0],
    progressBar: '29%',
    health: 'Excellent (ઉત્કૃષ્ટ)',
    moisture: '72% (Adequate / યોગ્ય)',
    soilType: 'Sandy Loamy Soil (ગોરાડુ જમીન)',
    irrigation: 'Sprinkler (Next: Thursday)',
    syncTime: 'Today, 08:15 AM',
    provenance: 'Estimated • Sentinel-2 + Weather',
  },
};

export const MyFarm: React.FC = () => {
  const { language, bi } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active Plot & Farm State from farmService
  const [plots, setPlots] = useState<Record<string, PlotInfo>>(() => {
    const loaded = farmService.getPlots();
    return Object.keys(loaded).length > 0 ? loaded : INITIAL_PLOT_DATA;
  });
  const [activePlot, setActivePlot] = useState<PlotKey>('A');
  const [farmParcel, setFarmParcel] = useState<FarmParcel | null>(() => farmService.getFarmParcel());

  useEffect(() => {
    const parcel = farmService.getFarmParcel();
    if (parcel) setFarmParcel(parcel);
  }, []);

  useEffect(() => {
    const unsubscribe = farmService.subscribePlots((updatedPlots) => {
      if (updatedPlots && Object.keys(updatedPlots).length > 0) {
        setPlots(updatedPlots);
      }
    });
    return unsubscribe;
  }, []);

  // AI Real-time Decision Hub State
  const [recIndex, setRecIndex] = useState(0);
  const [isAiUpdating, setIsAiUpdating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(4);
  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>(() => alertService.getActiveAlerts());
  const [alertSummary, setAlertSummary] = useState(() => alertService.getAlertSummary());

  // Real Open-Meteo Weather State for Home Dashboard (Section 10)
  const [homeWeather, setHomeWeather] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const loadHomeWeather = async () => {
    try {
      setIsWeatherLoading(true);
      setWeatherError(null);
      let loc = locationService.getSavedLocation();
      if (!locationService.hasValidLocation(loc)) {
        const res = await locationService.resolveLocation();
        loc = res.coords;
      }
      if (!locationService.hasValidLocation(loc)) {
        setWeatherError('Location needed for weather');
        setIsWeatherLoading(false);
        return;
      }
      const data = await weatherService.getWeather(loc.latitude, loc.longitude);
      setHomeWeather(data);
      setIsWeatherLoading(false);

      // Re-evaluate alerts with live weather data
      alertService.evaluateAllAlerts().then(() => {
        setActiveAlerts(alertService.getActiveAlerts());
        setAlertSummary(alertService.getAlertSummary());
      });

      if (data.locationName) {
        notificationService.notifyWeatherUpdated(data.locationName);
      }
    } catch (err: any) {
      console.warn('[MyFarm] Weather load error:', err);
      setWeatherError(err?.message || 'Weather data temporarily unavailable.');
      setIsWeatherLoading(false);
    }
  };

  const handleEnableGps = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsWeatherLoading(true);
      const res = await locationService.getCurrentLocation();
      if (res.success && locationService.hasValidLocation(res.coords)) {
        const data = await weatherService.getWeather(res.coords.latitude, res.coords.longitude);
        setHomeWeather(data);
        setWeatherError(null);
        alertService.evaluateAllAlerts().then(() => {
          setActiveAlerts(alertService.getActiveAlerts());
          setAlertSummary(alertService.getAlertSummary());
        });
      } else {
        setWeatherError(res.error || 'Location needed for weather');
      }
    } catch (err: any) {
      setWeatherError(err?.message || 'Failed to detect location');
    } finally {
      setIsWeatherLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadHomeWeather();
    const unsubLoc = locationService.subscribeToLocation(() => {
      if (isMounted) {
        loadHomeWeather();
      }
    });
    return () => {
      isMounted = false;
      unsubLoc();
    };
  }, []);

  // Evaluate and subscribe to real alerts
  useEffect(() => {
    alertService.evaluateAllAlerts().then(() => {
      setActiveAlerts(alertService.getActiveAlerts());
      setAlertSummary(alertService.getAlertSummary());
    });

    const unsubAlerts = alertService.subscribeToAlerts(() => {
      setActiveAlerts(alertService.getActiveAlerts());
      setAlertSummary(alertService.getAlertSummary());
    });
    return unsubAlerts;
  }, []);

  // AI Recommendation Auto-update interval: rotates recommendation every 9s
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIsAiUpdating(true);
      setTimeout(() => {
        setRecIndex((prev) => (prev + 1) % AI_RECOMMENDATIONS.length);
        setIsAiUpdating(false);
        setSecondsSinceUpdate(0);
      }, 500);
    }, 9000);
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceUpdate((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualAiRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAiUpdating(true);
    alertService.evaluateAllAlerts().then(() => {
      setActiveAlerts(alertService.getActiveAlerts());
      setAlertSummary(alertService.getAlertSummary());
    });
    setTimeout(() => {
      setRecIndex((prev) => (prev + 1) % AI_RECOMMENDATIONS.length);
      setIsAiUpdating(false);
      setSecondsSinceUpdate(0);
      showToast(
        bi(
          'AgroMind AI: ખેતર ડેટા અને નવીનતમ ભલામણો અપડેટ થઈ!',
          'AgroMind AI: Farm telemetry & real-time insights updated!',
          'AgroMind AI: Khet telemetry aur nayi salah update ho gayi!'
        ).primary
      );
    }, 600);
  };

  // History Accordion State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('edit');
  const [formPlotName, setFormPlotName] = useState('Block A (કપાસ)');
  const [formArea, setFormArea] = useState('2.5');
  const [formCrop, setFormCrop] = useState('Cotton (કપાસ)');
  const [formSoil, setFormSoil] = useState('Black Cotton Soil');
  const [formIrrigation, setFormIrrigation] = useState('Drip Irrigation');
  const [formStage, setFormStage] = useState('Flowering');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openEditModal = () => {
    setModalMode('edit');
    const p = plots[activePlot] || Object.values(plots)[0];
    if (p) {
      setFormPlotName(p.title.replace(/^Plot Details:\s*/, ''));
      setFormArea(p.area.replace(/[^0-9.]/g, '') || '2.0');
      setFormCrop(p.crop);
      setFormSoil(p.soilType || 'Black Cotton Soil (કાળી કાંપવાળી)');
      setFormIrrigation(p.irrigation || 'Drip Irrigation (ટપક પદ્ધતિ)');
    }
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setModalMode('add');
    const existingKeys = Object.keys(plots);
    const candidateKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    let nextLetter = 'C';
    for (const k of candidateKeys) {
      if (!existingKeys.includes(k)) {
        nextLetter = k;
        break;
      }
    }
    setFormPlotName(`Block ${nextLetter} (નવો પ્લોટ)`);
    setFormArea('1.5');
    setFormCrop('Cotton (કપાસ - Shankar 6)');
    setFormSoil('Black Cotton Soil (કાળી કાંપવાળી)');
    setFormIrrigation('Drip Irrigation (ટપક પદ્ધતિ)');
    setIsModalOpen(true);
  };

  const handleDeletePlot = (key: string) => {
    if (Object.keys(plots).length <= 1) {
      showToast('Cannot delete the only remaining plot.');
      return;
    }
    farmService.deletePlot(key);
    const remaining = { ...plots };
    delete remaining[key];
    setPlots(remaining);
    setActivePlot(Object.keys(remaining)[0] as PlotKey);
    setIsModalOpen(false);
    showToast(`Plot ${key} deleted successfully.`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'edit') {
      const existing = plots[activePlot];
      if (existing) {
        const updated: PlotInfo = {
          ...existing,
          title: `Plot Details: ${formPlotName}`,
          area: formArea.includes('Acre') ? formArea : `${formArea} Acres`,
          crop: formCrop,
          soilType: formSoil,
          irrigation: formIrrigation,
        };
        farmService.savePlot(updated);
        setPlots((prev) => ({ ...prev, [activePlot]: updated }));
      }
      showToast(`Plot ${activePlot} details saved successfully!`);
    } else {
      const created = farmService.addPlot({
        title: `Plot Details: ${formPlotName}`,
        area: formArea,
        crop: formCrop,
        soilType: formSoil,
        irrigation: formIrrigation,
      });
      setPlots((prev) => ({ ...prev, [created.key]: created }));
      setActivePlot(created.key);
      showToast(`New plot "${formPlotName}" registered with Sentinel-2 link!`);
    }
    setIsModalOpen(false);
  };

  const currentPlot: PlotInfo =
    plots[activePlot] ||
    Object.values(plots)[0] ||
    INITIAL_PLOT_DATA.A;

  const currentRec = AI_RECOMMENDATIONS[recIndex] || AI_RECOMMENDATIONS[0];

  const totalCalculatedAcres = Object.values(plots).reduce((acc, p) => {
    const match = p.area.match(/([0-9.]+)/);
    return acc + (match ? parseFloat(match[1]) : 0);
  }, 0);
  const totalLandStr = totalCalculatedAcres > 0
    ? `${totalCalculatedAcres.toFixed(1)} Acres`
    : farmParcel?.totalArea
    ? `${farmParcel.totalArea} ${farmParcel.unit?.includes('Vigha') ? 'Vigha' : 'Acres'}`
    : 'Land not added';
  const hasPlots = Object.keys(plots).length > 0;
  const uniqueCrops = hasPlots
    ? Array.from(new Set(Object.values(plots).map((p) => p.crop.split('(')[0].trim()))).join(' + ')
    : 'No crops added';
  const uniqueCropsGu = hasPlots
    ? Array.from(new Set(Object.values(plots).map((p) => p.subCrop.split('(')[0].trim()))).join(' + ')
    : 'કોઈ પાક ઉમેરેલ નથી';

  return (
    <div className="w-full min-h-screen bg-surface font-sans text-on-surface antialiased pt-2 sm:pt-4 pb-10 sm:pb-12 px-2.5 sm:px-6 lg:px-10">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-4 py-2 rounded-full shadow-2xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Responsive Container */}
      <div className="max-w-6xl mx-auto space-y-3.5 sm:space-y-5">

        {/* Real User Action Banner when farm registration is pending */}
        {!farmParcel && !user?.isDemo && (
          <div className="bg-gradient-to-r from-emerald-900 to-[#163A2D] text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-secondary text-white flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px]">add_home_work</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  {bi('તમારા ખેતરની નોંધણી કરો', 'Complete Your Farm Setup', 'Apne Khet Ka Registration Karein').primary}
                </h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  {bi(
                    'વાસ્તવિક હવામાન, ઉપગ્રહ દેખરેખ અને પાક ભલામણો સક્રિય કરવા તમારી જમીનનું ક્ષેત્રફળ અને સ્થાન ઉમેરો.',
                    'Add your land acreage and location to activate personalized weather, satellite NDVI, and crop recommendations.',
                    'Mausam, satellite dekhrekh aur fasal salah ke liye khet ki jankari jodein.'
                  ).primary}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-xl text-xs font-bold shadow-md shrink-0 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              <span>{bi('ખેતર ઉમેરો', 'Add Farm Parcel', 'Khet Jodein').primary}</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* COMPREHENSIVE FARM IDENTITY & VITAL TELEMETRY BANNER CARD                 */}
        {/* ========================================================================= */}
        <div className="w-full bg-surface-container-lowest p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-outline-variant/30 space-y-3 sm:space-y-5">
          {/* Top Row: Farmer Profile, Status Badges & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Farmer Avatar / Photo */}
              <div className="relative shrink-0">
                <img
                  src="/farmer-hero.jpg"
                  alt="Farmer avatar"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover shadow-sm border-2 border-secondary/40"
                />
                <span
                  className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-secondary text-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold border-2 border-white shadow-xs"
                  title="Verified Kisan"
                >
                  ✓
                </span>
              </div>

              {/* Profile Name, Status Badges & Detailed Geolocation */}
              <div className="flex flex-col min-w-0 space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-base sm:text-xl font-black text-primary truncate">
                    {user?.name || (user?.isDemo ? 'Rameshbhai Patel' : 'Kisan')}
                  </h2>
                  <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-secondary text-[10px] sm:text-[11px] font-extrabold shadow-xs">
                    <span className="material-symbols-outlined text-[12px] sm:text-[13px]">verified</span>
                    KYC ✓
                  </span>
                  <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-primary text-[10px] sm:text-[11px] font-bold border border-outline-variant/30">
                    <span className="material-symbols-outlined text-[12px] sm:text-[13px] text-tertiary">badge</span>
                    {user?.pmKisanId || (user?.isDemo ? 'GJ-SUR-88412' : 'KYC Registered')}
                  </span>
                </div>

                {/* Location Breadcrumb & Survey Identification */}
                <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-on-surface-variant font-medium flex-wrap">
                  <span className="flex items-center gap-0.5 text-secondary font-semibold">
                    <span className="material-symbols-outlined text-[14px] sm:text-[15px]">location_on</span>
                    <span>
                      {farmParcel?.landmark || `${user?.village || 'Kamrej'}, ${user?.district || 'Surat'}`}
                    </span>
                  </span>
                  <span>•</span>
                  <span>{farmParcel?.surveyNo || (user?.isDemo ? 'Block 142/A' : 'Survey No. Pending')}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => navigate('/onboarding')}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold transition-all active:scale-95 border border-outline-variant/30 flex items-center gap-1 sm:gap-1.5 shadow-xs"
                title="Update farm parcels, coordinates and acreage"
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[17px] text-secondary">tune</span>
                <span>{bi('સુધારો', 'Edit Farm', 'Sudharein').primary}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all active:scale-95 shadow-xs flex items-center gap-1 sm:gap-1.5"
                title="View full account and KYC profile"
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[17px]">account_circle</span>
                <span>{bi('પ્રોફાઇલ', 'Profile', 'Profile').primary}</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-outline-variant/20" />

          {/* Bottom Row: 4 Critical Agricultural Telemetry Chips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {/* Metric 1: Total & Cultivable Land */}
            <div className="bg-surface-container-low/70 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-outline-variant/20 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[17px] sm:text-[20px]">landscape</span>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block truncate">
                  {bi('કુલ જમીન', 'Total Land', 'Kul Zameen').primary}
                </span>
                <span className="text-xs sm:text-base font-black text-primary block truncate">
                  {farmParcel ? `${farmParcel.totalArea} ${farmParcel.unit?.includes('Vigha') ? 'Vigha' : 'Acres'}` : 'Land not added'}
                </span>
                <span className="text-[9px] sm:text-[10px] text-secondary font-bold truncate block">
                  {farmParcel ? `${farmParcel.cultivableArea} Ac Cultivable` : 'Registration pending'}
                </span>
              </div>
            </div>

            {/* Metric 2: Soil Classification */}
            <div className="bg-surface-container-low/70 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-outline-variant/20 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[17px] sm:text-[20px]">terrain</span>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block truncate">
                  {bi('માટી પ્રકાર', 'Soil Type', 'Mitti Prakar').primary}
                </span>
                <span className="text-xs sm:text-base font-black text-primary block truncate">
                  {farmParcel?.soilType ? farmParcel.soilType.split('(')[0].trim() : 'Soil unverified'}
                </span>
                <span className="text-[9px] sm:text-[10px] text-amber-800 font-bold truncate block">
                  {farmParcel?.soilType ? (user?.isDemo ? 'pH 7.4 • Black Cotton' : 'Tested Profile') : 'Upload soil report'}
                </span>
              </div>
            </div>

            {/* Metric 3: Water & Irrigation Source */}
            <div className="bg-surface-container-low/70 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-outline-variant/20 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[17px] sm:text-[20px]">water_drop</span>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block truncate">
                  {bi('પિયત પદ્ધતિ', 'Irrigation', 'Piyat').primary}
                </span>
                <span className="text-xs sm:text-base font-black text-primary block truncate">
                  {farmParcel?.irrigationTechnique ? farmParcel.irrigationTechnique.split('(')[0].trim() : 'Not recorded'}
                </span>
                <span className="text-[9px] sm:text-[10px] text-sky-700 font-bold truncate block">
                  {farmParcel?.waterSources?.length ? farmParcel.waterSources.join(' & ') : 'Source pending'}
                </span>
              </div>
            </div>

            {/* Metric 4: Satellite Vigour & NDVI */}
            <div className="bg-surface-container-low/70 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-outline-variant/20 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[17px] sm:text-[20px]">satellite_alt</span>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block truncate">
                  {bi('ઉપગ્રહ NDVI', 'Satellite NDVI', 'Satellite NDVI').primary}
                </span>
                <span className="text-xs sm:text-base font-black text-emerald-800 block truncate">
                  NDVI 0.76 (Good)
                </span>
                <span className="text-[9px] sm:text-[10px] text-on-surface-variant font-bold truncate block">
                  Sentinel-2 Live
                </span>
              </div>
            </div>
          </div>

          {/* Active Field Status Ticker Bar */}
          <div className="bg-surface-container p-3 rounded-2xl border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-extrabold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">potted_plant</span>
                Active Crops:
              </span>
              {Object.entries(plots).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActivePlot(key as PlotKey)}
                  className={`px-2.5 py-1 rounded-xl font-bold text-xs shadow-xs border transition-all cursor-pointer flex items-center gap-1 ${
                    activePlot === key
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-surface-container-lowest text-primary border-outline-variant/20 hover:border-secondary'
                  }`}
                >
                  <span>Plot {key}:</span>
                  <span className={activePlot === key ? 'text-white underline' : 'text-secondary'}>
                    {p.crop ? p.crop.split('(')[0].trim() : 'Crop'}
                  </span>
                  <span className="text-[10px] opacity-80">
                    ({p.stageBadge ? p.stageBadge.split('(')[0].trim() : 'Active'})
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-on-surface-variant text-[11px] font-medium">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-sky-600">schedule</span>
                Next Irrigation: <strong className="text-primary">Tomorrow 07:00 AM</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">sensors</span>
                IoT Moisture: <strong className="text-secondary">68% Optimal</strong>
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 10: REAL-TIME OPEN-METEO WEATHER CARD                             */}
        {/* ========================================================================= */}
        {isWeatherLoading ? (
          <div className="w-full bg-surface-container-lowest rounded-3xl p-5 sm:p-6 shadow-sm border border-outline-variant/30 animate-pulse space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high" />
                <div className="space-y-2">
                  <div className="h-4 w-44 bg-surface-container-high rounded" />
                  <div className="h-3 w-28 bg-surface-container-high rounded" />
                </div>
              </div>
              <div className="h-7 w-28 bg-surface-container-high rounded-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="h-16 bg-surface-container-high rounded-2xl" />
              <div className="h-16 bg-surface-container-high rounded-2xl" />
              <div className="h-16 bg-surface-container-high rounded-2xl" />
              <div className="h-16 bg-surface-container-high rounded-2xl" />
            </div>
          </div>
        ) : weatherError || !homeWeather ? (
          <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px]">location_off</span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-amber-950">
                  {bi('હવામાન માટે સ્થાન જરૂરી છે', 'Location needed for weather', 'Mausam ke liye sthan zaroori hai').primary}
                </h3>
                <p className="text-xs text-amber-900/80 mt-0.5">
                  {bi(
                    'ઓપન-મેટિઓ રીઅલ-ટાઇમ હવામાન જોવા માટે જીપીએસ ચાલુ કરો અથવા પ્રોફાઇલમાં જિલ્લો પસંદ કરો.',
                    'Enable live GPS or select your district in profile to view live Open-Meteo weather forecasts.',
                    'Live Open-Meteo mausam dekhne ke liye GPS chalu karein ya profile me jila chunein.'
                  ).primary}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleEnableGps}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">my_location</span>
                <span>{bi('જીપીએસ સક્રિય કરો', 'Enable GPS', 'GPS Chalu Karein').primary}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-3.5 py-2 rounded-xl bg-white text-amber-950 hover:bg-amber-100 text-xs font-bold transition-all border border-amber-500/30 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>{bi('પ્રોફાઇલ સુધારો', 'Set District', 'Jila Chunein').primary}</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => navigate('/weather-soil')}
            className="w-full bg-surface-container-lowest rounded-3xl p-5 sm:p-6 shadow-sm border border-outline-variant/30 hover:border-secondary transition-all cursor-pointer group space-y-4"
          >
            {/* Top Weather Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-[28px]">
                    {homeWeather.current?.icon || 'wb_sunny'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                      {Math.round(homeWeather.current?.temp ?? 28)}°C
                    </span>
                    <span className="text-sm sm:text-base font-bold text-secondary">
                      {bi(
                        homeWeather.current?.conditionGu || 'ચોખ્ખું આકાશ',
                        homeWeather.current?.condition || 'Clear Sky',
                        homeWeather.current?.condition || 'Clear Sky'
                      ).primary}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      ({bi('અનુભવાય છે', 'Feels like', 'Lagta hai').primary}{' '}
                      {Math.round(homeWeather.current?.apparentTemp ?? homeWeather.current?.temp ?? 28)}°C)
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                    <span className="font-bold text-primary">
                      {homeWeather.normalized?.location?.district || homeWeather.locationName || 'Gujarat Farm'}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{homeWeather.stationId || 'Live Open-Meteo'}</span>
                  </p>
                </div>
              </div>

              {/* Verified Source & Link Badge */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>Open-Meteo Live</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-surface-container group-hover:bg-secondary group-hover:text-white text-primary text-xs font-bold transition-colors flex items-center gap-1">
                  <span>{bi('વિગતવાર આગાહી', 'Full Forecast', 'Poora Forecast').primary}</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </span>
              </div>
            </div>

            {/* 4 Micro Weather Agricultural Telemetry Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Metric 1: Humidity */}
              <div className="bg-surface-container-low/70 rounded-2xl p-3 border border-outline-variant/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">humidity_percentage</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block truncate">
                    {bi('ભેજ / Humidity', 'Humidity', 'Nami').primary}
                  </span>
                  <span className="text-sm font-black text-primary block truncate">
                    {homeWeather.current?.humidity ?? 65}%
                  </span>
                  <span className="text-[10px] text-sky-700 font-bold block truncate">
                    {(homeWeather.current?.humidity ?? 65) > 70
                      ? 'High / ઊંચો'
                      : (homeWeather.current?.humidity ?? 65) < 40
                      ? 'Low / ઓછો'
                      : 'Optimal / અનુકૂળ'}
                  </span>
                </div>
              </div>

              {/* Metric 2: Rain & Chance */}
              <div className="bg-surface-container-low/70 rounded-2xl p-3 border border-outline-variant/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">rainy</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block truncate">
                    {bi('વરસાદ / Rain', 'Precipitation', 'Barish').primary}
                  </span>
                  <span className="text-sm font-black text-primary block truncate">
                    {homeWeather.current?.rain ?? 0} mm
                  </span>
                  <span className="text-[10px] text-blue-700 font-bold block truncate">
                    {bi('સંભાવના', 'Chance', 'Sambhavna').primary}: {homeWeather.current?.rainProb ?? 0}%
                  </span>
                </div>
              </div>

              {/* Metric 3: Wind Speed & Direction */}
              <div className="bg-surface-container-low/70 rounded-2xl p-3 border border-outline-variant/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">air</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block truncate">
                    {bi('પવન / Wind', 'Wind Speed', 'Hawa').primary}
                  </span>
                  <span className="text-sm font-black text-primary block truncate">
                    {Math.round(homeWeather.current?.windSpeed ?? 10)} km/h
                  </span>
                  <span className="text-[10px] text-teal-700 font-bold block truncate">
                    {homeWeather.current?.windDirection ? `${homeWeather.current.windDirection}°` : 'NW'}
                  </span>
                </div>
              </div>

              {/* Metric 4: Daily Range / Spray Safety */}
              <div className="bg-surface-container-low/70 rounded-2xl p-3 border border-outline-variant/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">thermostat</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block truncate">
                    {bi('દિવસ રેન્જ / Range', 'Daily Temp', 'Tapman Range').primary}
                  </span>
                  <span className="text-sm font-black text-primary block truncate">
                    {homeWeather.daily?.[0]
                      ? `${Math.round(homeWeather.daily[0].tempMax)}° / ${Math.round(homeWeather.daily[0].tempMin)}°`
                      : `${Math.round(homeWeather.current?.temp ?? 28)}°C`}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block truncate">
                    {(homeWeather.current?.windSpeed ?? 0) <= 15 && (homeWeather.current?.rain ?? 0) === 0
                      ? 'Spray Safe / છંટકાવ યોગ્ય'
                      : 'Spray Caution / સાવચેત'}
                  </span>
                </div>
              </div>
            </div>

            {/* Micro Footer Bar */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-secondary">update</span>
                <span>
                  {bi('અપડેટ:', 'Updated:', 'Update:').primary}{' '}
                  {homeWeather.current?.lastUpdated || 'Live'}
                </span>
              </span>
              <span className="font-bold text-secondary flex items-center gap-0.5 group-hover:underline">
                <span>{bi('જમીન અને હવામાન બુદ્ધિમત્તા જુઓ', 'View Weather & Soil Intelligence', 'Mausam aur Mitti Jankari Dekhein').primary}</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION HEADER: MY FARM / મારું ખેતર                                      */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-primary tracking-tight">
              My Farm <span className="text-secondary text-base sm:text-2xl">/ મારું ખેતર</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-on-surface-variant mt-0.5">
              Real-time field monitoring & crop stage telemetry
            </p>
          </div>

          {/* Quick Telemetry Sync Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-primary-container text-primary-fixed text-[11px] sm:text-xs font-semibold w-fit">
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-fixed opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-secondary-fixed" />
            </span>
            <span>Sentinel-2 Live</span>
            <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded bg-white/10 text-white font-bold ml-0.5">
              NDVI 0.76 (Good)
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* AGROMIND AI REAL-TIME DECISION HUB (RECOMMENDATION & ALERT BLOCKS)        */}
        {/* ========================================================================= */}
        <div 
          className="w-full bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-sm border border-outline-variant/30 space-y-3 sm:space-y-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* AI Decision Hub Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                <span className="material-symbols-outlined text-[18px] sm:text-[22px] animate-pulse">psychology</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-xs sm:text-base font-black text-primary flex items-center gap-1.5">
                    {bi('AI નિર્ણય કેન્દ્ર', 'AgroMind AI Decision Hub', 'AgroMind AI Decision Hub').primary}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[9px] sm:text-[10px] font-extrabold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                    <span>Live AI</span>
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">
                  {bi(
                    `સેટેલાઇટ અને સેન્સર્સ આધારે સતત અપડેટ (${secondsSinceUpdate}s પહેલાં)`,
                    `Continuous telemetry analysis (updated ${secondsSinceUpdate}s ago)`,
                    `Satellite aur sensors se live update (${secondsSinceUpdate}s pehle)`
                  ).primary}
                </p>
              </div>
            </div>

            {/* Quick AI Action: Re-run Inference */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleManualAiRefresh}
                disabled={isAiUpdating}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-[11px] sm:text-xs font-bold transition-all active:scale-95 border border-outline-variant/30 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                title="Force AI model recalculation"
              >
                <span className={`material-symbols-outlined text-[14px] sm:text-[16px] text-secondary ${isAiUpdating ? 'animate-spin' : ''}`}>
                  refresh
                </span>
                <span>{bi('AI રીફ્રેશ', 'AI Re-analyze', 'AI Re-analyze').primary}</span>
              </button>
            </div>
          </div>

          {/* AI Model Recalculating Shimmer Banner */}
          {isAiUpdating && (
            <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-emerald-800 font-bold animate-in fade-in duration-200">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] animate-spin text-emerald-700">sync</span>
                <span>
                  {bi('AI મોડલ વિશ્લેષણ કરી રહ્યું છે...', 'AgroMind AI is recalculating...', 'AI Model analysis kar raha hai...').primary}
                </span>
              </span>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-mono">Neural 3.4</span>
            </div>
          )}

          {/* Responsive 2-Block Interactive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch">

            {/* ------------------------------------------------------------------- */}
            {/* BLOCK 1: AI CROP RECOMMENDATION BLOCK (REDIRECTS TO /recommendations) */}
            {/* ------------------------------------------------------------------- */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate('/recommendations')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/recommendations')}
              className="group relative flex flex-col justify-between p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/5 via-surface-container-lowest to-surface-container-lowest border-2 border-emerald-500/25 hover:border-emerald-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title="Click to view full AI crop recommendations and cultivation calendar"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[15px] sm:text-[17px]">eco</span>
                  </span>
                  <div>
                    <span className="text-xs font-black text-emerald-900 tracking-tight block">
                      {bi('AI પાક ભલામણ', 'AI Crop Advisory', 'AI Fasal Sifarish').primary}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold block truncate max-w-[150px] sm:max-w-none">
                      {language === 'gu' ? currentRec.badgeGu : language === 'hi' ? currentRec.badgeHi : currentRec.badgeEn}
                    </span>
                  </div>
                </div>

                {/* Score Pill & Carousel Dots */}
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] sm:text-[11px] font-extrabold shadow-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] sm:text-[13px]">auto_awesome</span>
                    {currentRec.score}% {bi('અનુકૂળ', 'Match', 'Fit').primary}
                  </span>
                  <div className="flex items-center gap-1 pt-0.5">
                    {AI_RECOMMENDATIONS.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                          recIndex === idx ? 'w-3 sm:w-4 bg-emerald-600' : 'w-1 sm:w-1.5 bg-emerald-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Crop Identity & Telemetry Metrics */}
              <div className="space-y-1.5 sm:space-y-2 mb-2.5">
                <div>
                  <h3 className="text-sm sm:text-lg font-black text-primary group-hover:text-emerald-800 transition-colors flex items-center justify-between">
                    <span>{language === 'gu' ? currentRec.cropGu : language === 'hi' ? currentRec.cropHi : currentRec.cropEn}</span>
                    <span className="text-[11px] sm:text-xs font-black text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-200/60">
                      {language === 'gu' ? currentRec.profitGu : language === 'hi' ? currentRec.profitHi : currentRec.profitEn}
                    </span>
                  </h3>
                  <p className="text-[10px] sm:text-xs text-on-surface-variant font-medium truncate">
                    {language === 'gu' ? currentRec.varietyGu : language === 'hi' ? currentRec.varietyHi : currentRec.varietyEn}
                  </p>
                </div>

                {/* AI Rationale Snippet Box */}
                <div className="bg-emerald-50/80 rounded-lg sm:rounded-xl p-2 sm:p-2.5 border border-emerald-200/50 text-[10px] sm:text-[11px] text-emerald-950 flex items-start gap-1.5 sm:gap-2">
                  <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-emerald-700 shrink-0 mt-0.5">
                    insights
                  </span>
                  <p className="leading-snug line-clamp-2 sm:line-clamp-none">
                    {language === 'gu' ? currentRec.reasonGu : language === 'hi' ? currentRec.reasonHi : currentRec.reasonEn}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-on-surface-variant font-semibold">
                  <span className="flex items-center gap-1 text-emerald-800 truncate">
                    <span className="material-symbols-outlined text-[12px] sm:text-[13px]">calendar_today</span>
                    {language === 'gu' ? currentRec.windowGu : language === 'hi' ? currentRec.windowHi : currentRec.windowEn}
                  </span>
                </div>
              </div>

              {/* Redirect Action Footer */}
              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 group-hover:text-emerald-900 flex items-center gap-1">
                  <span>{bi('ખેતી યોજના જુઓ', 'View Cultivation Plan', 'Kheti Plan Dekhein').primary}</span>
                  <span className="material-symbols-outlined text-[15px] sm:text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </span>
                <span className="hidden sm:inline text-[10px] text-on-surface-variant font-medium">
                  {bi('ટેપ કરો → /recommendations', 'Tap to open /recommendations', 'Tap karein → /recommendations').primary}
                </span>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* BLOCK 2: ACTIVE ALERTS WIDGET (REDIRECTS TO /alerts)                */}
            {/* ------------------------------------------------------------------- */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate('/alerts')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/alerts')}
              className="group relative flex flex-col justify-between p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500/5 via-surface-container-lowest to-surface-container-lowest border-2 border-amber-500/30 hover:border-amber-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-amber-500"
              title="Click to view all actionable farm alerts and emergency spray advisories"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    alertSummary.criticalCount > 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className="material-symbols-outlined text-[15px] sm:text-[17px]">
                      {alertSummary.criticalCount > 0 ? 'crisis_alert' : 'notifications_active'}
                    </span>
                  </span>
                  <div>
                    <span className="text-xs font-black text-amber-950 tracking-tight block">
                      {bi('સક્રિય ચેતવણીઓ', 'Active Field Alerts', 'Active Alerts').primary}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-amber-800 font-bold block truncate max-w-[150px] sm:max-w-none">
                      {alertSummary.activeCount > 0
                        ? `${alertSummary.activeCount} ${bi('સક્રિય', 'Active', 'Active').primary}${alertSummary.criticalCount > 0 ? ` • ${alertSummary.criticalCount} ${bi('તાત્કાલિક', 'Critical', 'Critical').primary}` : ''}`
                        : bi('બધું સામાન્ય છે', 'All Normal', 'Sab Normal').primary}
                    </span>
                  </div>
                </div>

                {/* Counter Pill */}
                <div className="flex items-center gap-1.5">
                  {alertSummary.activeCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-white text-[10px] sm:text-[11px] font-extrabold shadow-xs flex items-center gap-1 bg-amber-600">
                      <span>{alertSummary.activeCount} Active</span>
                      {alertSummary.criticalCount > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-300 animate-ping" />
                      )}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] sm:text-[14px]">check</span>
                      <span>{bi('ક્લિયર', 'Clear', 'Clear').primary}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Active Alerts List (Top 2-3 items) or Clean Empty State */}
              <div className="space-y-1.5 sm:space-y-2 mb-2.5">
                {activeAlerts.length > 0 ? (
                  activeAlerts.slice(0, 3).map((alert) => {
                    const alertTitle =
                      language === 'gu' && alert.titleGu
                        ? alert.titleGu
                        : language === 'hi' && alert.titleHi
                        ? alert.titleHi
                        : alert.titleEn || alert.title;
                    const alertMsg =
                      language === 'gu' && alert.descriptionGu
                        ? alert.descriptionGu
                        : language === 'hi' && alert.descriptionHi
                        ? alert.descriptionHi
                        : alert.descriptionEn || alert.message;

                    const isCrit = alert.priority === 'Critical';
                    const isHigh = alert.priority === 'High';

                    return (
                      <div
                        key={alert.id}
                        className="bg-white/80 rounded-lg sm:rounded-xl p-2 sm:p-2.5 border border-outline-variant/30 hover:border-amber-500/50 transition-all flex items-start gap-2 shadow-xs"
                      >
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            isCrit ? 'bg-red-600 animate-pulse' : isHigh ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-[11px] sm:text-xs font-black text-primary truncate">{alertTitle}</h4>
                            <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-bold shrink-0">
                              {alert.source}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-on-surface-variant line-clamp-1 sm:line-clamp-2 mt-0.5 leading-snug">
                            {alertMsg}
                          </p>
                          <div className="mt-1 flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (alert.actionRoute) navigate(alert.actionRoute);
                                else navigate('/alerts');
                              }}
                              className="text-[9px] sm:text-[10px] font-bold text-secondary hover:underline flex items-center gap-0.5"
                            >
                              <span>{bi('ચેતવણી જુઓ', 'View Alert', 'Alert Dekhein').primary}</span>
                              <span className="material-symbols-outlined text-[11px] sm:text-[12px]">chevron_right</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-3 sm:py-4 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center flex flex-col items-center justify-center gap-0.5">
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px] text-emerald-600">verified</span>
                    <p className="text-[11px] sm:text-xs font-extrabold text-emerald-900">
                      {bi('કોઈ સક્રિય ચેતવણી નથી', 'No active alerts', 'Koi active alert nahi').primary}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-emerald-700/80">
                      {bi('હવામાન, પાક અને જમીન સુરક્ષિત છે', 'Field conditions optimal', 'Sab anukool hai').primary}
                    </p>
                  </div>
                )}
              </div>

              {/* Redirect Action Footer */}
              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 group-hover:text-amber-900 flex items-center gap-1">
                  <span>{bi('બધી ચેતવણીઓ જુઓ →', 'View All Alerts →', 'Sabhi Alerts Dekhein →').primary}</span>
                </span>
                <span className="text-[10px] text-on-surface-variant font-medium">
                  /alerts
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* RESPONSIVE 2-COLUMN GRID (Mobile: Single Stack | Desktop: 2 Columns)      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 items-start">

          {/* ----------------------------------------------------------------------- */}
          {/* LEFT COLUMN (lg:col-span-7): Metrics & Interactive Parcel Map           */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-5">

            {/* 4 Key Agricultural Metrics Grid */}
            <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
                <h3 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-secondary flex items-center gap-1 sm:gap-1.5">
                  <span className="material-symbols-outlined text-[15px] sm:text-[16px]">analytics</span>
                  <span>{bi('ખેતર વિગત', 'Farm Summary', 'Khet Vivran').primary}</span>
                </h3>
                <span className="text-[10px] sm:text-[11px] text-outline font-medium">Kharif 2026</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {/* Metric 1: Total Land */}
                <div className="bg-surface-container-low p-2 sm:p-3 rounded-lg sm:rounded-xl flex flex-col justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-1 text-on-surface-variant mb-0.5">
                    <span className="material-symbols-outlined text-[15px] sm:text-[17px] text-secondary">crop_free</span>
                    <span className="text-[10px] sm:text-[11px] font-semibold">{bi('જમીન', 'Total Land', 'Zameen').primary}</span>
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-extrabold text-primary block leading-tight">{totalLandStr}</span>
                    <span className="text-[9px] sm:text-[10px] text-on-surface-variant">
                      {farmParcel ? `${farmParcel.cultivableArea} Ac Cultivable` : 'Registration pending'}
                    </span>
                  </div>
                </div>

                {/* Metric 2: Active Plots */}
                <div className="bg-surface-container-low p-2 sm:p-3 rounded-lg sm:rounded-xl flex flex-col justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-1 text-on-surface-variant mb-0.5">
                    <span className="material-symbols-outlined text-[15px] sm:text-[17px] text-secondary">grid_view</span>
                    <span className="text-[10px] sm:text-[11px] font-semibold">{bi('પ્લોટ', 'Plots', 'Plots').primary}</span>
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-extrabold text-primary block leading-tight">
                      {Object.keys(plots).length} {Object.keys(plots).length === 1 ? 'Plot' : 'Plots'}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-on-surface-variant truncate block">
                      {Object.keys(plots).map((k) => `Block ${k}`).join(', ')}
                    </span>
                  </div>
                </div>

                {/* Metric 3: Crops Planted */}
                <div className="bg-surface-container-low p-2 sm:p-3 rounded-lg sm:rounded-xl flex flex-col justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-1 text-on-surface-variant mb-0.5">
                    <span className="material-symbols-outlined text-[15px] sm:text-[17px] text-secondary">psychiatry</span>
                    <span className="text-[10px] sm:text-[11px] font-semibold">{bi('પાક', 'Crops', 'Fasal').primary}</span>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-extrabold text-primary block truncate leading-tight" title={uniqueCrops}>
                      {uniqueCrops}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-on-surface-variant truncate block" title={uniqueCropsGu}>
                      {uniqueCropsGu}
                    </span>
                  </div>
                </div>

                {/* Metric 4: Irrigation */}
                <div className="bg-surface-container-low p-2 sm:p-3 rounded-lg sm:rounded-xl flex flex-col justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-1 text-on-surface-variant mb-0.5">
                    <span className="material-symbols-outlined text-[15px] sm:text-[17px] text-secondary">water_drop</span>
                    <span className="text-[10px] sm:text-[11px] font-semibold">{bi('પિયત', 'Irrigation', 'Piyat').primary}</span>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-extrabold text-primary block leading-tight truncate">
                      {currentPlot.irrigation ? currentPlot.irrigation.split('(')[0].trim() : 'Drip'}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-on-surface-variant truncate block">
                      Drip System
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Visual Parcel Map Card */}
            <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-outline-variant/30 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px] sm:text-[22px]">map</span>
                  <h2 className="text-xs sm:text-base font-bold text-primary">
                    {bi('ખેતર નકશો', 'Parcel Map', 'Khet Naksha').primary}
                  </h2>
                </div>
                <span className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">
                  {bi('ટેપ કરી પ્લોટ બદલો', 'Tap to switch plot', 'Tap to switch').primary}
                </span>
              </div>

              {/* Stylized Visual Field Graphic */}
              <div className="relative w-full rounded-xl sm:rounded-2xl bg-surface-container p-2.5 sm:p-3 overflow-hidden border border-outline-variant/30">
                {!hasPlots ? (
                  <div className="py-8 px-4 text-center bg-surface-container-lowest/80 rounded-xl border border-dashed border-outline-variant/50 space-y-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center mx-auto shadow-xs">
                      <span className="material-symbols-outlined text-[26px]">add_location_alt</span>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-primary">
                        {bi('કોઈ પ્લોટ ઉમેરેલ નથી', 'No Plots Added Yet', 'Koi Plot Nahi Joda Gaya').primary}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-on-surface-variant max-w-xs mx-auto mt-0.5">
                        {bi(
                          'તમારા ખેતરના પ્લોટ (Block A, Block B) ઉમેરીને પાક વૃદ્ધિ અને સેટેલાઇટ વિશ્લેષણ શરૂ કરો.',
                          'Add micro-plots (Block A, Block B) to track crops, growth stages, and satellite vigour.',
                          'Fasal aur satellite dekhrekh ke liye micro-plots jodein.'
                        ).primary}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="px-3.5 py-1.5 bg-secondary text-white rounded-xl text-xs font-bold shadow-xs hover:bg-primary transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>{bi('પ્લોટ ઉમેરો', 'Add Plot', 'Plot Jodein').primary}</span>
                    </button>
                  </div>
                ) : (
                  <div className={`grid ${
                    Object.keys(plots).length === 1 
                      ? 'grid-cols-1' 
                      : Object.keys(plots).length === 2 
                      ? 'grid-cols-2' 
                      : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3'
                  } gap-2 sm:gap-3 relative z-10`}>
                    {Object.entries(plots).map(([key, p]) => {
                      const isSelected = activePlot === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setActivePlot(key as PlotKey)}
                          className={`flex flex-col text-left p-2.5 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-200 border-2 cursor-pointer ${
                            isSelected
                              ? 'bg-secondary-container/50 border-secondary shadow-md'
                              : 'bg-surface-container-lowest/90 hover:bg-surface-container-lowest border-transparent shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1 sm:mb-2">
                            <span
                              className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-extrabold ${
                                isSelected
                                  ? 'bg-secondary text-white'
                                  : 'bg-surface-container-high text-on-surface-variant'
                              }`}
                            >
                              BLOCK {key}
                            </span>
                            {isSelected && (
                              <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-secondary" />
                              </span>
                            )}
                          </div>
                          <p className="text-sm sm:text-base font-extrabold text-primary leading-tight">{p.area}</p>
                          <p className="text-[11px] sm:text-xs text-secondary font-bold mt-0.5 truncate">{p.crop}</p>
                          <p className="text-[10px] sm:text-[11px] text-on-surface-variant truncate">{p.subCrop}</p>
                          <div className="mt-2 sm:mt-3 flex items-center gap-1 text-secondary text-[11px] sm:text-xs font-semibold">
                            <span className="material-symbols-outlined text-[14px] sm:text-[16px]">eco</span>
                            <span className="truncate">{p.stageName}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {hasPlots && (
                  <div className="mt-2 pt-1.5 flex items-center justify-between text-on-surface-variant text-[10px] sm:text-[11px] px-1 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      <span>{bi('દક્ષિણ ઢાળ', 'South slope', 'South slope').primary}</span>
                    </span>
                    <span>{bi('બોરવેલ: ઉત્તર લાઇન', 'Borewell North', 'Borewell North').primary}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Action: + Add New Farm / Plot Button */}
            <button
              type="button"
              onClick={openAddModal}
              className="w-full h-11 sm:h-14 bg-secondary hover:bg-primary text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">add_circle</span>
              <span>{bi('+ નવો પ્લોટ ઉમેરો', '+ Add New Plot', '+ Naya Plot Jodein').primary}</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT COLUMN (lg:col-span-5): Dynamic Plot Details, IoT, & History      */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-5">

            {/* Dynamic Plot Details Card */}
            {!hasPlots ? (
              <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm border border-outline-variant/30 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary-container/40 text-secondary flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[32px]">crop_free</span>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-primary">
                    {bi('કોઈ પ્લોટ સેટ કરેલ નથી', 'No Plots Configured', 'Koi Plot Nahi Hai').primary}
                  </h2>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 leading-relaxed">
                    {bi(
                      'પાક મોનિટરિંગ, સેન્સર સિંક અને AI હેલ્થ સ્કેન જોવા માટે નવો પ્લોટ ઉમેરો.',
                      'Add your first plot to track crop stages, soil moisture, and AI disease scans.',
                      'Fasal stage aur mitti nami dekhne ke liye naya plot jodein.'
                    ).primary}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-primary text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span>{bi('+ પ્રથમ પ્લોટ ઉમેરો', '+ Add First Plot', '+ Pehla Plot Jodein').primary}</span>
                </button>
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-outline-variant/30 space-y-3 sm:space-y-4">
                {/* Header with Stage Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] sm:text-[11px] text-secondary font-bold uppercase tracking-wider">
                        Active View
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      <span className="text-[10px] sm:text-[11px] text-on-surface-variant">
                        {currentPlot.provenance}
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-lg font-bold text-primary mt-0.5">
                      {currentPlot.title}
                    </h2>
                  </div>
                  <span className="shrink-0 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-secondary-container text-secondary text-[11px] sm:text-xs font-bold">
                    {currentPlot.stageBadge}
                  </span>
                </div>

                {/* Stage Progress Bar */}
                <div className="w-full bg-surface-container-low rounded-full h-2 sm:h-2.5 overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full transition-all duration-500"
                    style={{ width: currentPlot.progressBar }}
                  />
                </div>

                {/* Quick Status Rows */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-surface-container-low border border-outline-variant/15">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="material-symbols-outlined text-[17px] sm:text-[20px] text-secondary">vital_signs</span>
                      <span className="text-[11px] sm:text-xs text-on-surface-variant font-medium">{bi('પાક સ્થિતિ', 'Crop Health', 'Fasal Sthiti').primary}</span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-secondary flex items-center gap-1 sm:gap-1.5">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-secondary" />
                      {currentPlot.health}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-surface-container-low border border-outline-variant/15">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="material-symbols-outlined text-[17px] sm:text-[20px] text-secondary">opacity</span>
                      <span className="text-[11px] sm:text-xs text-on-surface-variant font-medium">{bi('જમીન ભેજ', 'Soil Moisture', 'Mitti Nami').primary}</span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-primary">
                      {currentPlot.moisture}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-surface-container-low border border-outline-variant/15">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="material-symbols-outlined text-[17px] sm:text-[20px] text-secondary">terrain</span>
                      <span className="text-[11px] sm:text-xs text-on-surface-variant font-medium">{bi('જમીન પ્રકાર', 'Soil Type', 'Mitti Prakar').primary}</span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-primary truncate max-w-[150px] sm:max-w-[180px]">
                      {currentPlot.soilType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-surface-container-low border border-outline-variant/15">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="material-symbols-outlined text-[17px] sm:text-[20px] text-secondary">water</span>
                      <span className="text-[11px] sm:text-xs text-on-surface-variant font-medium">{bi('પિયત પદ્ધતિ', 'Irrigation', 'Piyat').primary}</span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-primary">
                      {currentPlot.irrigation}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-surface-container-low border border-outline-variant/15">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="material-symbols-outlined text-[17px] sm:text-[20px] text-secondary">sensors</span>
                      <span className="text-[11px] sm:text-xs text-on-surface-variant font-medium">{bi('છેલ્લો સિંક', 'Last Sync', 'Last Sync').primary}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-on-surface-variant">
                      {currentPlot.syncTime}
                    </span>
                  </div>
                </div>

                {/* Action Buttons for Selected Plot */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/ai-camera')}
                    className="flex items-center justify-center gap-1.5 h-10 sm:h-12 px-2.5 sm:px-3 rounded-xl bg-secondary hover:bg-primary text-white text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[17px] sm:text-[19px]">photo_camera</span>
                    <span>{bi('કેમેરા સ્કેન', 'Scan Leaf', 'Leaf Scan').primary}</span>
                  </button>

                  <button
                    type="button"
                    onClick={openEditModal}
                    className="flex items-center justify-center gap-1.5 h-10 sm:h-12 px-2.5 sm:px-3 rounded-xl bg-surface-container-high hover:bg-surface-variant text-primary text-xs font-bold transition-all active:scale-[0.98] border border-outline-variant/30"
                  >
                    <span className="material-symbols-outlined text-[17px] sm:text-[19px]">edit</span>
                    <span>{bi('પ્લોટ વિગત', 'Edit Plot', 'Plot Edit').primary}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Farm History Collapsible Accordion */}
            <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-secondary text-[22px]">history_edu</span>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-primary leading-tight">
                      Crop Rotation & Soil History
                    </h2>
                    <span className="text-[11px] text-on-surface-variant">
                      પાછલી ખેતી ઇતિહાસ અને ફળદ્રુપતા
                    </span>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-primary text-[22px] transition-transform duration-300 ${isHistoryOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {isHistoryOpen && (
                <div className="p-4 pt-0 space-y-2.5 border-t border-outline-variant/20 animate-in fade-in duration-200">
                  {user?.isDemo || hasPlots ? (
                    <>
                      <div className="p-3 bg-surface-container-low rounded-xl space-y-1 border border-outline-variant/15">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary">
                            Rabi 2023-24: Wheat (ઘઉં GW-496)
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-secondary-container text-secondary font-bold">
                            22 Qtl/Ac
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant">
                          Area: 2.5 Acres • Above regional benchmark yield (+14%) • Residue mulched into topsoil.
                        </p>
                      </div>

                      <div className="p-3 bg-surface-container-low rounded-xl space-y-1 border border-outline-variant/15">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary">
                            Kharif 2023: Groundnut (મગફળી GG-20)
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-secondary-container text-secondary font-bold">
                            +18% N2 Fixed
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant">
                          Area: 4.5 Acres • High root nodulation, enhanced organic nitrogen content.
                        </p>
                      </div>

                      <div className="p-3 bg-surface-container-high rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-primary block">
                            Soil Health Card Benchmark (જમીન ચકાસણી)
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            pH 7.2 (Neutral) • Organic Carbon 0.65% (Medium)
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-secondary text-[22px] fill">
                          verified
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-surface-container-low rounded-xl text-center">
                      <p className="text-xs text-on-surface-variant">
                        {bi('કોઈ પાછલો ઇતિહાસ નોંધાયેલ નથી.', 'No past seasonal history recorded yet.', 'Koi pichla itihas darj nahi hai.').primary}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT PLOT MODAL                                                    */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/30">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[24px]">
                  {modalMode === 'edit' ? 'edit_location_alt' : 'add_location_alt'}
                </span>
                <div>
                  <h2 className="text-base font-bold text-primary">
                    {modalMode === 'edit' ? `Edit ${activePlot === 'A' ? 'Block A' : 'Block B'}` : 'Add New Farm / Plot'}
                  </h2>
                  <span className="text-[11px] text-on-surface-variant">
                    પ્લોટ વિગત ઉમેરો અથવા બદલો
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-primary block">
                  Farm / Plot Name (પ્લોટનું નામ)
                </label>
                <input
                  type="text"
                  required
                  value={formPlotName}
                  onChange={(e) => setFormPlotName(e.target.value)}
                  className="w-full h-12 px-3.5 rounded-xl bg-surface-container-low text-on-surface text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary border border-outline-variant/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-primary block">
                  Area in Acres (જમીન ક્ષેત્રફળ - એકર)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formArea}
                  onChange={(e) => setFormArea(e.target.value)}
                  className="w-full h-12 px-3.5 rounded-xl bg-surface-container-low text-on-surface text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary border border-outline-variant/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-primary block">
                  Primary Crop (વાવેતર પાક)
                </label>
                <select
                  value={formCrop}
                  onChange={(e) => setFormCrop(e.target.value)}
                  className="w-full h-12 px-3.5 rounded-xl bg-surface-container-low text-on-surface text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary border border-outline-variant/30"
                >
                  <option value="Cotton (કપાસ - Shankar 6)">Cotton (કપાસ - Shankar 6)</option>
                  <option value="Groundnut (મગફળી - GG 20)">Groundnut (મગફળી - GG 20)</option>
                  <option value="Wheat (ઘઉં - GW 496)">Wheat (ઘઉં - GW 496)</option>
                  <option value="Sugarcane (શેરડી)">Sugarcane (શેરડી)</option>
                  <option value="Vegetables (શાકભાજી)">Vegetables (શાકભાજી / મરચી)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-primary block">
                  Soil Type (જમીનનો પ્રકાર)
                </label>
                <select
                  value={formSoil}
                  onChange={(e) => setFormSoil(e.target.value)}
                  className="w-full h-12 px-3.5 rounded-xl bg-surface-container-low text-on-surface text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary border border-outline-variant/30"
                >
                  <option value="Black Cotton Soil (કાળી કાંપવાળી)">Black Cotton Soil (કાળી કાંપવાળી)</option>
                  <option value="Loamy Soil (ગોરાડુ જમીન)">Loamy Soil (ગોરાડુ જમીન)</option>
                  <option value="Sandy Loam (રેતાળ ગોરાડુ)">Sandy Loam (રેતાળ ગોરાડુ)</option>
                  <option value="Alluvial Soil (કાંપની જમીન)">Alluvial Soil (કાંપની જમીન)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-primary block">
                  Irrigation System (સિંચાઈ પદ્ધતિ)
                </label>
                <select
                  value={formIrrigation}
                  onChange={(e) => setFormIrrigation(e.target.value)}
                  className="w-full h-12 px-3.5 rounded-xl bg-surface-container-low text-on-surface text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary border border-outline-variant/30"
                >
                  <option value="Drip Irrigation (ટપક પદ્ધતિ)">Drip Irrigation (ટપક પદ્ધતિ)</option>
                  <option value="Canal Water (નહેર દ્વારા)">Canal Water (નહેર દ્વારા)</option>
                  <option value="Borewell Flood (બોરવેલ)">Borewell (બોરવેલ / કૂવો)</option>
                  <option value="Rainfed (વરસાદ આધારિત)">Rainfed (વરસાદ આધારિત)</option>
                </select>
              </div>

              {/* Submit / Cancel / Delete Buttons */}
              <div className="pt-3 space-y-2">
                <button
                  type="submit"
                  className="w-full h-12 bg-secondary hover:bg-primary text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>{bi('પ્લોટ સાચવો / Save Farm Details', 'Save Farm Details / પ્લોટ સાચવો', 'Khet Details Save Karein / Save Farm Details').primary}</span>
                </button>
                {modalMode === 'edit' && Object.keys(plots).length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeletePlot(activePlot)}
                    className="w-full h-11 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-red-200"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    <span>{bi(`પ્લોટ (${activePlot}) કાઢી નાખો / Delete Plot`, `Delete Plot (${activePlot}) / પ્લોટ કાઢી નાખો`, `Plot (${activePlot}) Hatayein / Delete Plot`).primary}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full h-11 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold rounded-xl border border-outline-variant/40 shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                  <span>{bi('રદ કરો / Cancel', 'Cancel / રદ કરો', 'Cancel Karein / Cancel').primary}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
