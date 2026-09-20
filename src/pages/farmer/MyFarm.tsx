import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { farmService } from '../../services/farmService';
import { alertService } from '../../services/alertService';
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

interface AiAlertDisplay {
  id: string;
  category: string;
  severity: 'Critical' | 'High' | 'Medium';
  severityColor: string;
  badgeGu: string;
  badgeEn: string;
  badgeHi: string;
  titleGu: string;
  titleEn: string;
  titleHi: string;
  timeGu: string;
  timeEn: string;
  timeHi: string;
  actionSnippetGu: string;
  actionSnippetEn: string;
  actionSnippetHi: string;
  ctaGu: string;
  ctaEn: string;
  ctaHi: string;
  route: string;
}

const AI_ALERTS: AiAlertDisplay[] = [
  {
    id: 'ai-alert-1',
    category: 'urgent',
    severity: 'Critical',
    severityColor: 'bg-red-500 text-white',
    badgeGu: 'તાત્કાલિક જીવાત જોખમ',
    badgeEn: 'Critical Pest Outbreak',
    badgeHi: 'Zaroori Pest Alert',
    titleGu: 'કામરેજ વિસ્તારમાં ગુલાબી ઈયળ (Pink Bollworm) નો ઉપદ્રવ',
    titleEn: 'Pink Bollworm Infestation in Kamrej Cluster',
    titleHi: 'Kamrej Area mein Gulabi Eeyal / Pink Bollworm Outbreak',
    timeGu: '૧૮ મિનિટ પહેલાં • સેન્સર ટ્રેપ રિપોર્ટ',
    timeEn: '18m ago • IoT Trap Cluster Report',
    timeHi: '18 min pehle • IoT Trap Report',
    actionSnippetGu: 'ટ્રેપ દીઠ ૮ થી વધુ પુખ્ત ફૂદાં નોંધાયા છે. તાત્કાલિક ફેરોમોન ટ્રેપ લગાવો અને AI કેમેરાથી પાન તપાસો.',
    actionSnippetEn: 'Cluster telemetry detected >8 adult moths/trap. Deploy pheromone traps & scan leaves with AI Camera.',
    actionSnippetHi: 'Trap mein 8 se zyada kide detect hue hain. Turant pheromone trap lagayein aur AI camera se scan karein.',
    ctaGu: 'AI કેમેરાથી તપાસ કરો',
    ctaEn: 'Scan Field with AI Camera',
    ctaHi: 'AI Camera se Jaanch Karein',
    route: '/ai-camera',
  },
  {
    id: 'ai-alert-2',
    category: 'weather',
    severity: 'High',
    severityColor: 'bg-amber-500 text-white',
    badgeGu: 'હવામાન ચેતવણી (ડોપ્લર રડાર)',
    badgeEn: 'Weather Warning (Doppler Radar)',
    badgeHi: 'Mausam Warning (Doppler Radar)',
    titleGu: 'સોમવારે બપોરે ભારે વરસાદ (૨૮ મીમી) ની શક્યતા',
    titleEn: 'Heavy Convective Rain Forecast (28mm)',
    titleHi: 'Somwar Dopahar Bhaari Baarish (28mm) ka Anuman',
    timeGu: '૪૫ મિનિટ પહેલાં • IMD સુરત રડાર',
    timeEn: '45m ago • IMD Surat Radar',
    timeHi: '45 min pehle • IMD Surat Radar',
    actionSnippetGu: 'કીટનાશક છંટકાવ મોકૂફ રાખો અને ખેતરના પાળા સાફ કરો જેથી પાણી ભરાઈ ન રહે.',
    actionSnippetEn: 'Postpone pesticide spraying and clear field furrows to prevent waterlogging.',
    actionSnippetHi: 'Dawa chhidkaw rokein aur khet ke dhalan saaf karein taaki pani jama na ho.',
    ctaGu: 'હવામાન અને સ્પ્રે વિગત જુઓ',
    ctaEn: 'Check Weather & Spray Window',
    ctaHi: 'Mausam aur Spray Timing Dekhein',
    route: '/weather-soil',
  },
  {
    id: 'ai-alert-3',
    category: 'soil',
    severity: 'Medium',
    severityColor: 'bg-blue-600 text-white',
    badgeGu: 'જમીન પોષક તત્વ ચેતવણી',
    badgeEn: 'Soil Nutrient Telemetry',
    badgeHi: 'Mitti Poshan Alert',
    titleGu: 'બ્લોક A ના મૂળ વિસ્તારમાં ફોસ્ફરસની અછત નોંધાઈ',
    titleEn: 'Phosphorus Deficit in Block A Root Zone',
    titleHi: 'Block A mein Phosphorus ki kami detect hui',
    timeGu: '૨ કલાક પહેલાં • IoT જમીન સેન્સર',
    timeEn: '2h ago • IoT Soil Probe Feed',
    timeHi: '2 ghante pehle • IoT Soil Sensor',
    actionSnippetGu: 'ફોસ્ફરસ ૨૪ કિગ્રા/હેક્ટરથી ઓછું છે. આગામી પિયત વખતે ૨૫ કિગ્રા SSP ખાતર આપો.',
    actionSnippetEn: 'Available P is below 24 kg/ha. Apply 25kg SSP fertilizer with next irrigation.',
    actionSnippetHi: 'Phosphorus 24 kg/ha se kam hai. Agle piyat ke sath 25kg SSP khad dein.',
    ctaGu: 'ખાતર ખર્ચ ટ્રેક કરો',
    ctaEn: 'Track Fertilizer in Expenses',
    ctaHi: 'Khad Kharach Track Karein',
    route: '/expenses',
  },
];

const INITIAL_PLOT_DATA: Record<string, PlotInfo> = {
  A: {
    title: 'Plot Details: Block A (બ્લોક એ - કપાસ)',
    crop: 'Shankar-6 Cotton',
    subCrop: 'કપાસ (Day 54)',
    area: '2.5 Acres',
    stageBadge: 'Flowering (Day 54/150)',
    stageName: 'Flowering Stage',
    dayCount: 'Day 54',
    progressBar: '36%',
    health: 'Good (તંદુરસ્ત)',
    moisture: '68% (Optimal / ઉત્તમ)',
    soilType: 'Black Cotton Soil (કાળી કાંપવાળી)',
    irrigation: 'Drip (Next: Tomorrow 7:00 AM)',
    syncTime: 'Today, 09:30 AM',
    provenance: 'Measured • IoT Probes',
  },
  B: {
    title: 'Plot Details: Block B (બ્લોક બી - મગફળી)',
    crop: 'GG-20 Groundnut',
    subCrop: 'મગફળી (Day 32)',
    area: '2.0 Acres',
    stageBadge: 'Vegetative (Day 32/110)',
    stageName: 'Vegetative Stage',
    dayCount: 'Day 32',
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
  const [alertIndex, setAlertIndex] = useState(0);
  const [isAiUpdating, setIsAiUpdating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(4);
  const [alerts, setAlerts] = useState<AlertItem[]>(() => alertService.getAlerts());

  useEffect(() => {
    setAlerts(alertService.getAlerts());
    const unsub = alertService.subscribeToAlerts((updated) => {
      if (updated && updated.length > 0) setAlerts(updated);
    });
    return unsub;
  }, []);

  // AI Model Auto-update interval: updates information apparently every 9s
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIsAiUpdating(true);
      setTimeout(() => {
        setRecIndex((prev) => (prev + 1) % AI_RECOMMENDATIONS.length);
        setAlertIndex((prev) => (prev + 1) % AI_ALERTS.length);
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
    setTimeout(() => {
      setRecIndex((prev) => (prev + 1) % AI_RECOMMENDATIONS.length);
      setAlertIndex((prev) => (prev + 1) % AI_ALERTS.length);
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
  const currentAlert = AI_ALERTS[alertIndex % AI_ALERTS.length] || AI_ALERTS[0];

  const totalCalculatedAcres = Object.values(plots).reduce((acc, p) => {
    const match = p.area.match(/([0-9.]+)/);
    return acc + (match ? parseFloat(match[1]) : 0);
  }, 0);
  const totalLandStr = totalCalculatedAcres > 0 ? `${totalCalculatedAcres.toFixed(1)} Acres` : `${farmParcel?.totalArea || 4.5} Acres`;
  const uniqueCrops = Array.from(new Set(Object.values(plots).map((p) => p.crop.split('(')[0].trim()))).join(' + ') || 'Cotton';
  const uniqueCropsGu = Array.from(new Set(Object.values(plots).map((p) => p.subCrop.split('(')[0].trim()))).join(' + ') || 'કપાસ';

  return (
    <div className="w-full min-h-screen bg-surface font-sans text-on-surface antialiased pt-4 pb-12 px-4 sm:px-6 lg:px-10">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Responsive Container */}
      <div className="max-w-6xl mx-auto space-y-5">

        {/* ========================================================================= */}
        {/* COMPREHENSIVE FARM IDENTITY & VITAL TELEMETRY BANNER CARD                 */}
        {/* ========================================================================= */}
        <div className="w-full bg-surface-container-lowest p-5 sm:p-6 rounded-3xl shadow-sm border border-outline-variant/30 space-y-5">
          {/* Top Row: Farmer Profile, Status Badges & Quick Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4 min-w-0">
              {/* Farmer Avatar / Photo (Properly constrained & styled) */}
              <div className="relative shrink-0">
                <img
                  src="/farmer-hero.jpg"
                  alt="Farmer avatar"
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover shadow-sm border-2 border-secondary/40"
                />
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-xs"
                  title="Verified Kisan"
                >
                  ✓
                </span>
              </div>

              {/* Profile Name, Status Badges & Detailed Geolocation */}
              <div className="flex flex-col min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-primary truncate">
                    {user?.name || 'Rameshbhai Patel'}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-secondary text-[11px] font-extrabold shadow-xs">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    100% KYC Verified
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary text-[11px] font-bold border border-outline-variant/30">
                    <span className="material-symbols-outlined text-[13px] text-tertiary">badge</span>
                    PM-KISAN: {user?.pmKisanId || 'GJ-SUR-88412'}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Kharif 2026
                  </span>
                </div>

                {/* Location Breadcrumb & Survey Identification */}
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium flex-wrap">
                  <span className="flex items-center gap-0.5 text-secondary font-semibold">
                    <span className="material-symbols-outlined text-[15px]">location_on</span>
                    {user?.village || 'Kamrej Gam'}, {user?.city || user?.taluka || 'Kamrej'}, {user?.district || 'Surat'}, Gujarat
                  </span>
                  <span className="opacity-40">•</span>
                  <span className="bg-surface-container px-2 py-0.5 rounded-md text-[11px] font-semibold text-primary">
                    Khata / Survey: {farmParcel?.surveyNo || 'Block 142/A'}
                  </span>
                  {farmParcel?.landmark && (
                    <span className="text-[11px] text-on-surface-variant/80 hidden md:inline">
                      ({farmParcel.landmark})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={openEditModal}
                className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold transition-all active:scale-95 shadow-xs flex items-center gap-1.5 border border-outline-variant/30"
                title="Configure plots and crop details"
              >
                <span className="material-symbols-outlined text-[17px] text-secondary">tune</span>
                <span>{bi('સુધારો / Edit Farm', 'Edit Farm / સુધારો', 'Khet Sudharein / Edit Farm').primary}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all active:scale-95 shadow-xs flex items-center gap-1.5"
                title="View full account and KYC profile"
              >
                <span className="material-symbols-outlined text-[17px]">account_circle</span>
                <span>KYC Profile</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-outline-variant/20" />

          {/* Bottom Row: 4 Critical Agricultural Telemetry Chips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Metric 1: Total & Cultivable Land */}
            <div className="bg-surface-container-low/70 rounded-2xl p-3.5 border border-outline-variant/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[20px]">landscape</span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block truncate">
                  Total Land / જમીન
                </span>
                <span className="text-sm sm:text-base font-black text-primary block truncate">
                  {farmParcel?.totalArea || 4.5} {farmParcel?.unit?.includes('Vigha') ? 'Vigha' : 'Acres'}
                </span>
                <span className="text-[10px] text-secondary font-bold truncate block">
                  {farmParcel?.cultivableArea || 4.0} Ac Cultivable
                </span>
              </div>
            </div>

            {/* Metric 2: Soil Classification */}
            <div className="bg-surface-container-low/70 rounded-2xl p-3.5 border border-outline-variant/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[20px]">terrain</span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block truncate">
                  Soil Type / માટી
                </span>
                <span className="text-sm sm:text-base font-black text-primary block truncate">
                  {farmParcel?.soilType ? farmParcel.soilType.split('(')[0].trim() : 'Black Cotton Soil'}
                </span>
                <span className="text-[10px] text-amber-800 font-bold truncate block">
                  કાળી કાંપવાળી • pH 7.2
                </span>
              </div>
            </div>

            {/* Metric 3: Water & Irrigation Source */}
            <div className="bg-surface-container-low/70 rounded-2xl p-3.5 border border-outline-variant/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[20px]">water_drop</span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block truncate">
                  Irrigation / પિયત
                </span>
                <span className="text-sm sm:text-base font-black text-primary block truncate">
                  {farmParcel?.irrigationTechnique ? farmParcel.irrigationTechnique.split('(')[0].trim() : 'Micro-Drip (90%)'}
                </span>
                <span className="text-[10px] text-sky-700 font-bold truncate block">
                  {farmParcel?.waterSources?.length ? farmParcel.waterSources.join(' & ') : 'Canal & Tube Well'}
                </span>
              </div>
            </div>

            {/* Metric 4: Satellite Vigour & NDVI */}
            <div className="bg-surface-container-low/70 rounded-2xl p-3.5 border border-outline-variant/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[20px]">satellite_alt</span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block truncate">
                  Satellite NDVI / ઉપગ્રહ
                </span>
                <span className="text-sm sm:text-base font-black text-emerald-800 block truncate">
                  NDVI 0.76 (Healthy)
                </span>
                <span className="text-[10px] text-on-surface-variant font-bold truncate block">
                  Sentinel-2 Live Optical
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
        {/* SECTION HEADER: MY FARM / મારું ખેતર                                      */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              My Farm <span className="text-secondary">/ મારું ખેતર</span>
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Real-time field monitoring, plot telemetry & crop stages
            </p>
          </div>

          {/* Quick Telemetry Sync Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-container text-primary-fixed text-xs font-semibold w-fit">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-fixed opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-fixed" />
            </span>
            <span>Sentinel-2 Live Link</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-bold ml-1">
              NDVI 0.76 (Healthy)
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* AGROMIND AI REAL-TIME DECISION HUB (RECOMMENDATION & ALERT BLOCKS)        */}
        {/* ========================================================================= */}
        <div 
          className="w-full bg-surface-container-lowest rounded-3xl p-5 sm:p-6 shadow-sm border border-outline-variant/30 space-y-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* AI Decision Hub Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <span className="material-symbols-outlined text-[22px] animate-pulse">psychology</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-black text-primary flex items-center gap-1.5">
                    {bi('AI રિયલ-ટાઇમ સ્માર્ટ નિર્ણય કેન્દ્ર', 'AgroMind AI Real-Time Decision Hub', 'AgroMind AI Real-Time Decision Hub').primary}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    {bi('AI મોડલ સક્રિય (Live Model)', 'AI Model Active (Live)', 'AI Model Active (Live)').primary}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant font-medium">
                  {bi(
                    `સેટેલાઇટ NDVI અને જમીન સેન્સર્સ આધારે સતત અપડેટ (${secondsSinceUpdate}s પહેલાં અપડેટ)`,
                    `Continuous telemetry analysis via Sentinel-2 & IoT Probes (updated ${secondsSinceUpdate}s ago)`,
                    `Satellite NDVI aur IoT probes se live update (${secondsSinceUpdate}s pehle update)`
                  ).primary}
                </p>
              </div>
            </div>

            {/* Quick AI Action: Re-run Inference */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-[11px] text-on-surface-variant/80 hidden md:inline font-medium">
                {isPaused ? '⏸️ Rotation paused' : '🔄 Auto-updating'}
              </span>
              <button
                type="button"
                onClick={handleManualAiRefresh}
                disabled={isAiUpdating}
                className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold transition-all active:scale-95 border border-outline-variant/30 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                title="Force AI model recalculation"
              >
                <span className={`material-symbols-outlined text-[16px] text-secondary ${isAiUpdating ? 'animate-spin' : ''}`}>
                  refresh
                </span>
                <span>{bi('AI પુનઃ ગણતરી (Re-analyze)', 'AI Re-analyze', 'AI Re-analyze Karein').primary}</span>
              </button>
            </div>
          </div>

          {/* AI Model Recalculating Shimmer Banner */}
          {isAiUpdating && (
            <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3.5 py-1.5 flex items-center justify-between text-xs text-emerald-800 font-bold animate-in fade-in duration-200">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] animate-spin text-emerald-700">sync</span>
                <span>
                  {bi('AI મોડલ ખેતરના ડેટાનું ફરીથી વિશ્લેષણ કરી રહ્યું છે...', 'AgroMind AI is recalculating soil, weather & crop telemetry...', 'AI Model khet data ka re-analysis kar raha hai...').primary}
                </span>
              </span>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-mono">Neural 3.4</span>
            </div>
          )}

          {/* Responsive 2-Block Interactive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">

            {/* ------------------------------------------------------------------- */}
            {/* BLOCK 1: AI CROP RECOMMENDATION BLOCK (REDIRECTS TO /recommendations) */}
            {/* ------------------------------------------------------------------- */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate('/recommendations')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/recommendations')}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-surface-container-lowest to-surface-container-lowest border-2 border-emerald-500/25 hover:border-emerald-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title="Click to view full AI crop recommendations and cultivation calendar"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[17px]">eco</span>
                  </span>
                  <div>
                    <span className="text-xs font-black text-emerald-900 tracking-tight block">
                      {bi('AI પાક ભલામણ (AI Crop Recommendation)', 'AI Crop Recommendation', 'AI Fasal Sifarish (AI Crop Recommendation)').primary}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold block">
                      {language === 'gu' ? currentRec.badgeGu : language === 'hi' ? currentRec.badgeHi : currentRec.badgeEn}
                    </span>
                  </div>
                </div>

                {/* Score Pill & Carousel Dots */}
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold shadow-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                    {currentRec.score}% {bi('અનુકૂળ', 'Match', 'Fit').primary}
                  </span>
                  <div className="flex items-center gap-1 pt-0.5">
                    {AI_RECOMMENDATIONS.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          recIndex === idx ? 'w-4 bg-emerald-600' : 'w-1.5 bg-emerald-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Crop Identity & Telemetry Metrics */}
              <div className="space-y-2 mb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-primary group-hover:text-emerald-800 transition-colors flex items-center justify-between">
                    <span>{language === 'gu' ? currentRec.cropGu : language === 'hi' ? currentRec.cropHi : currentRec.cropEn}</span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      {language === 'gu' ? currentRec.profitGu : language === 'hi' ? currentRec.profitHi : currentRec.profitEn}
                    </span>
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {language === 'gu' ? currentRec.varietyGu : language === 'hi' ? currentRec.varietyHi : currentRec.varietyEn}
                  </p>
                </div>

                {/* AI Rationale Snippet Box */}
                <div className="bg-emerald-50/80 rounded-xl p-2.5 border border-emerald-200/50 text-[11px] text-emerald-950 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700 shrink-0 mt-0.5">
                    insights
                  </span>
                  <p className="leading-snug">
                    {language === 'gu' ? currentRec.reasonGu : language === 'hi' ? currentRec.reasonHi : currentRec.reasonEn}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-semibold">
                  <span className="flex items-center gap-1 text-emerald-800">
                    <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                    {language === 'gu' ? currentRec.windowGu : language === 'hi' ? currentRec.windowHi : currentRec.windowEn}
                  </span>
                </div>
              </div>

              {/* Redirect Action Footer */}
              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 group-hover:text-emerald-900 flex items-center gap-1">
                  <span>{bi('સંપૂર્ણ AI ખેતી યોજના જુઓ', 'View Full Cultivation Plan', 'Poori Kheti Plan Dekhein').primary}</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </span>
                <span className="text-[10px] text-on-surface-variant font-medium">
                  {bi('ટેપ કરો → /recommendations', 'Tap to open /recommendations', 'Tap karein → /recommendations').primary}
                </span>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* BLOCK 2: AI ACTIONABLE ALERT BLOCK (REDIRECTS TO /alerts)           */}
            {/* ------------------------------------------------------------------- */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate('/alerts')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/alerts')}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 via-surface-container-lowest to-surface-container-lowest border-2 border-amber-500/30 hover:border-amber-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-amber-500"
              title="Click to view all actionable farm alerts and emergency spray advisories"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[17px] text-amber-700">warning</span>
                  </span>
                  <div>
                    <span className="text-xs font-black text-amber-950 tracking-tight block">
                      {bi('AI તાત્કાલિક ચેતવણી (AI Priority Alert)', 'AI Priority Field Alert', 'AI Turant Alert (AI Priority Alert)').primary}
                    </span>
                    <span className="text-[10px] text-amber-800 font-bold block">
                      {language === 'gu' ? currentAlert.badgeGu : language === 'hi' ? currentAlert.badgeHi : currentAlert.badgeEn}
                    </span>
                  </div>
                </div>

                {/* Severity Pill & Carousel Dots */}
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-white text-[11px] font-extrabold shadow-xs flex items-center gap-1 ${
                    currentAlert.severity === 'Critical' ? 'bg-red-600 animate-pulse' : 'bg-amber-600'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    {currentAlert.severity}
                  </span>
                  <div className="flex items-center gap-1 pt-0.5">
                    {AI_ALERTS.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          alertIndex === idx ? 'w-4 bg-amber-600' : 'w-1.5 bg-amber-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Alert Title & Source */}
              <div className="space-y-2 mb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-primary group-hover:text-amber-900 transition-colors">
                    {language === 'gu' ? currentAlert.titleGu : language === 'hi' ? currentAlert.titleHi : currentAlert.titleEn}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[13px] text-amber-700">schedule</span>
                    <span>{language === 'gu' ? currentAlert.timeGu : language === 'hi' ? currentAlert.timeHi : currentAlert.timeEn}</span>
                  </p>
                </div>

                {/* AI Hazard Advice Box */}
                <div className="bg-amber-50/90 rounded-xl p-2.5 border border-amber-200/60 text-[11px] text-amber-950 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0 mt-0.5">
                    crisis_alert
                  </span>
                  <p className="leading-snug">
                    {language === 'gu' ? currentAlert.actionSnippetGu : language === 'hi' ? currentAlert.actionSnippetHi : currentAlert.actionSnippetEn}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-semibold">
                  <span className="flex items-center gap-1 text-red-700 font-bold">
                    <span className="material-symbols-outlined text-[13px]">notification_important</span>
                    {bi('તાત્કાલિક પગલું જરૂરી', 'Immediate Action Required', 'Turant Action Zaroori').primary}
                  </span>
                </div>
              </div>

              {/* Redirect Action Footer */}
              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 group-hover:text-amber-900 flex items-center gap-1">
                  <span>{bi('ચેતવણી કેન્દ્રમાં પગલાં લો', 'Take Action in Alert Center', 'Alerts Center mein Action Lein').primary}</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </span>
                <span className="text-[10px] text-on-surface-variant font-medium">
                  {bi('ટેપ કરો → /alerts', 'Tap to open /alerts', 'Tap karein → /alerts').primary}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* RESPONSIVE 2-COLUMN GRID (Mobile: Single Stack | Desktop: 2 Columns)      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* ----------------------------------------------------------------------- */}
          {/* LEFT COLUMN (lg:col-span-7): Metrics & Interactive Parcel Map           */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-5">

            {/* 4 Key Agricultural Metrics Grid */}
            <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">analytics</span>
                  Farm Summary • સર્વગ્રાહી સ્થિતિ
                </h3>
                <span className="text-[11px] text-outline font-medium">Kharif 2026 Cycle</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Metric 1: Total Land */}
                <div className="bg-surface-container-low p-3 rounded-xl flex flex-col justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-1 text-on-surface-variant mb-1">
                    <span className="material-symbols-outlined text-[17px] text-secondary">crop_free</span>
                    <span className="text-[11px] font-semibold">Total Land</span>
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-primary block leading-tight">{totalLandStr}</span>
                    <span className="text-[10px] text-on-surface-variant">કુલ જમીન</span>
                  </div>
                </div>

                {/* Metric 2: Active Plots */}
                <div className="bg-surface-container-low p-3 rounded-xl flex flex-col justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-1 text-on-surface-variant mb-1">
                    <span className="material-symbols-outlined text-[17px] text-secondary">grid_view</span>
                    <span className="text-[11px] font-semibold">Active Plots</span>
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-primary block leading-tight">
                      {Object.keys(plots).length} {Object.keys(plots).length === 1 ? 'Plot' : 'Plots'}
                    </span>
                    <span className="text-[10px] text-on-surface-variant truncate block">
                      {Object.keys(plots).map((k) => `Block ${k}`).join(', ')}
                    </span>
                  </div>
                </div>

                {/* Metric 3: Crops Planted */}
                <div className="bg-surface-container-low p-3 rounded-xl flex flex-col justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-1 text-on-surface-variant mb-1">
                    <span className="material-symbols-outlined text-[17px] text-secondary">psychiatry</span>
                    <span className="text-[11px] font-semibold">Crops Planted</span>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-primary block truncate leading-tight" title={uniqueCrops}>
                      {uniqueCrops}
                    </span>
                    <span className="text-[10px] text-on-surface-variant truncate block" title={uniqueCropsGu}>
                      {uniqueCropsGu}
                    </span>
                  </div>
                </div>

                {/* Metric 4: Irrigation */}
                <div className="bg-surface-container-low p-3 rounded-xl flex flex-col justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-1 text-on-surface-variant mb-1">
                    <span className="material-symbols-outlined text-[17px] text-secondary">water_drop</span>
                    <span className="text-[11px] font-semibold">Irrigation</span>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-extrabold text-primary block leading-tight truncate">
                      {currentPlot.irrigation ? currentPlot.irrigation.split('(')[0].trim() : 'Drip'}
                    </span>
                    <span className="text-[10px] text-on-surface-variant truncate block">
                      {currentPlot.irrigation ? (currentPlot.irrigation.includes('(') ? currentPlot.irrigation.split('(')[1].replace(')', '') : 'ટપક પદ્ધતિ') : 'ટપક પદ્ધતિ'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Visual Parcel Map Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">map</span>
                  <h2 className="text-sm sm:text-base font-bold text-primary">
                    {bi('ખેતર નકશો / Parcel Map', 'Parcel Map / ખેતર નકશો', 'Khet Naksha / Parcel Map').primary}
                  </h2>
                </div>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  {bi('પ્લોટ બદલવા ટેપ કરો', 'Tap to switch plot', 'Plot badalne ke liye tap karein').primary}
                </span>
              </div>

              {/* Stylized Visual Field Graphic */}
              <div className="relative w-full rounded-2xl bg-surface-container p-3 overflow-hidden border border-outline-variant/30">
                <div className={`grid ${
                  Object.keys(plots).length === 1 
                    ? 'grid-cols-1' 
                    : Object.keys(plots).length === 2 
                      ? 'grid-cols-2' 
                      : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3'
                } gap-3 relative z-10`}>
                  {Object.entries(plots).map(([key, p]) => {
                    const isSelected = activePlot === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActivePlot(key as PlotKey)}
                        className={`flex flex-col text-left p-4 rounded-xl transition-all duration-200 border-2 cursor-pointer ${
                          isSelected
                            ? 'bg-secondary-container/50 border-secondary shadow-md'
                            : 'bg-surface-container-lowest/90 hover:bg-surface-container-lowest border-transparent shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                              isSelected
                                ? 'bg-secondary text-white'
                                : 'bg-surface-container-high text-on-surface-variant'
                            }`}
                          >
                            BLOCK {key}
                          </span>
                          {isSelected && (
                            <span className="flex h-2.5 w-2.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
                            </span>
                          )}
                        </div>
                        <p className="text-base font-extrabold text-primary leading-tight">{p.area}</p>
                        <p className="text-xs text-secondary font-bold mt-0.5 truncate">{p.crop}</p>
                        <p className="text-[11px] text-on-surface-variant truncate">{p.subCrop}</p>
                        <div className="mt-3 flex items-center gap-1 text-secondary text-xs font-semibold">
                          <span className="material-symbols-outlined text-[16px]">eco</span>
                          <span className="truncate">{p.stageName}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2.5 pt-2 flex items-center justify-between text-on-surface-variant text-[11px] px-1 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    {bi('દક્ષિણ ઢાળ (South slope)', 'South-facing slope (દક્ષિણ ઢાળ)', 'Dakshin Dhalan (South slope)').primary}
                  </span>
                  <span>{bi('બોરવેલ લાઇન: ઉત્તર કોરિડોર', 'Borewell Line: North Corridor', 'Borewell Line: Uttar Corridor').primary}</span>
                </div>
              </div>
            </div>

            {/* Primary Action: + Add New Farm / Plot Button */}
            <button
              type="button"
              onClick={openAddModal}
              className="w-full h-14 bg-secondary hover:bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[24px]">add_circle</span>
              <span>{bi('+ નવો પ્લોટ ઉમેરો (+ Add New Plot)', '+ Add New Farm / Plot (+ નવો પ્લોટ ઉમેરો)', '+ Naya Plot Jodein (+ Add New Plot)').primary}</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT COLUMN (lg:col-span-5): Dynamic Plot Details, IoT, & History      */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-5">

            {/* Dynamic Plot Details Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/30 space-y-4">
              {/* Header with Stage Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-secondary font-bold uppercase tracking-wider">
                      Active View
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="text-[11px] text-on-surface-variant">
                      {currentPlot.provenance}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-primary mt-0.5">
                    {currentPlot.title}
                  </h2>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-secondary-container text-secondary text-xs font-bold">
                  {currentPlot.stageBadge}
                </span>
              </div>

              {/* Stage Progress Bar */}
              <div className="w-full bg-surface-container-low rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-secondary h-full rounded-full transition-all duration-500"
                  style={{ width: currentPlot.progressBar }}
                />
              </div>

              {/* Quick Status Rows */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-secondary">vital_signs</span>
                    <span className="text-xs text-on-surface-variant font-medium">Crop Health / પાક સ્થિતિ</span>
                  </div>
                  <span className="text-xs font-bold text-secondary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    {currentPlot.health}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-secondary">opacity</span>
                    <span className="text-xs text-on-surface-variant font-medium">Soil Moisture / ભેજ</span>
                  </div>
                  <span className="text-xs font-bold text-primary">
                    {currentPlot.moisture}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-secondary">terrain</span>
                    <span className="text-xs text-on-surface-variant font-medium">Soil Type / જમીન પ્રકાર</span>
                  </div>
                  <span className="text-xs font-bold text-primary truncate max-w-[180px]">
                    {currentPlot.soilType}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-secondary">water</span>
                    <span className="text-xs text-on-surface-variant font-medium">Irrigation / પિયત</span>
                  </div>
                  <span className="text-xs font-bold text-primary">
                    {currentPlot.irrigation}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-secondary">sensors</span>
                    <span className="text-xs text-on-surface-variant font-medium">Last Telemetry Sync</span>
                  </div>
                  <span className="text-xs font-medium text-on-surface-variant">
                    {currentPlot.syncTime}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Selected Plot */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/ai-camera')}
                  className="flex items-center justify-center gap-1.5 h-12 px-3 rounded-xl bg-secondary hover:bg-primary text-white text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[19px]">photo_camera</span>
                  <span>Scan Crop Leaf</span>
                </button>

                <button
                  type="button"
                  onClick={openEditModal}
                  className="flex items-center justify-center gap-1.5 h-12 px-3 rounded-xl bg-surface-container-high hover:bg-surface-variant text-primary text-xs font-bold transition-all active:scale-[0.98] border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[19px]">edit</span>
                  <span>Edit Plot Details</span>
                </button>
              </div>
            </div>

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
