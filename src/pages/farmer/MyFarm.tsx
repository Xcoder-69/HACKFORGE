import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { farmService } from '../../services/farmService';
import type { PlotKey, PlotInfo, FarmParcel } from '../../types';

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
  const { t } = useLanguage();
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
    setFormPlotName(activePlot === 'A' ? 'Block A (કપાસ)' : 'Block B (મગફળી)');
    setFormArea(activePlot === 'A' ? '2.5' : '2.0');
    setFormCrop(activePlot === 'A' ? 'Cotton (કપાસ)' : 'Groundnut (મગફળી)');
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormPlotName('Block C (નવો પ્લોટ)');
    setFormArea('1.5');
    setFormCrop('Wheat (ઘઉં)');
    setIsModalOpen(true);
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
      setActivePlot(created.key);
      showToast(`New plot "${formPlotName}" registered with Sentinel-2 link!`);
    }
    setIsModalOpen(false);
  };

  const currentPlot = plots[activePlot];

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
                <span>Edit Farm / સુધારો</span>
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
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-extrabold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">potted_plant</span>
                Active Crops:
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-surface-container-lowest font-bold text-primary shadow-xs border border-outline-variant/20">
                Plot A: <span className="text-secondary">{plots.A?.crop || 'Cotton'}</span> ({plots.A?.stageBadge || 'Flowering'})
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-surface-container-lowest font-bold text-primary shadow-xs border border-outline-variant/20">
                Plot B: <span className="text-secondary">{plots.B?.crop || 'Groundnut'}</span> ({plots.B?.stageBadge || 'Vegetative'})
              </span>
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
                {/* Metric 1 */}
                <div className="bg-surface-container-low p-3 rounded-xl flex flex-col justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-1 text-on-surface-variant mb-1">
                    <span className="material-symbols-outlined text-[17px] text-secondary">crop_free</span>
                    <span className="text-[11px] font-semibold">Total Land</span>
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-primary block leading-tight">4.5 Acres</span>
                    <span className="text-[10px] text-on-surface-variant">કુલ જમીન</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-surface-container-low p-3 rounded-xl flex flex-col justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-1 text-on-surface-variant mb-1">
                    <span className="material-symbols-outlined text-[17px] text-secondary">grid_view</span>
                    <span className="text-[11px] font-semibold">Active Plots</span>
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-primary block leading-tight">2 Plots</span>
                    <span className="text-[10px] text-on-surface-variant">Block A & B (સક્રિય)</span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-surface-container-low p-3 rounded-xl flex flex-col justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-1 text-on-surface-variant mb-1">
                    <span className="material-symbols-outlined text-[17px] text-secondary">psychiatry</span>
                    <span className="text-[11px] font-semibold">Crops Planted</span>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-primary block truncate leading-tight">Cotton + Nut</span>
                    <span className="text-[10px] text-on-surface-variant truncate block">કપાસ + મગફળી</span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-surface-container-low p-3 rounded-xl flex flex-col justify-between border border-outline-variant/20">
                  <div className="flex items-center gap-1 text-on-surface-variant mb-1">
                    <span className="material-symbols-outlined text-[17px] text-secondary">water_drop</span>
                    <span className="text-[11px] font-semibold">Irrigation</span>
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-primary block leading-tight">Drip (68%)</span>
                    <span className="text-[10px] text-on-surface-variant">ટપક પદ્ધતિ</span>
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
                    Parcel Map / ખેતર નકશો
                  </h2>
                </div>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  Tap to switch plot
                </span>
              </div>

              {/* Stylized Visual Field Graphic */}
              <div className="relative w-full rounded-2xl bg-surface-container p-3 overflow-hidden border border-outline-variant/30">
                {/* Water canal line running in middle */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 bg-secondary-container/70 z-0 flex flex-col justify-around items-center">
                  <span className="w-1 h-3 bg-secondary rounded-full" />
                  <span className="w-1 h-3 bg-secondary rounded-full" />
                  <span className="w-1 h-3 bg-secondary rounded-full" />
                  <span className="w-1 h-3 bg-secondary rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {/* BLOCK A BUTTON */}
                  <button
                    type="button"
                    onClick={() => setActivePlot('A')}
                    className={`flex flex-col text-left p-4 rounded-xl transition-all duration-200 border-2 ${
                      activePlot === 'A'
                        ? 'bg-secondary-container/50 border-secondary shadow-md'
                        : 'bg-surface-container-lowest/90 hover:bg-surface-container-lowest border-transparent shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                        activePlot === 'A' ? 'bg-secondary text-white' : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        BLOCK A
                      </span>
                      {activePlot === 'A' && (
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
                        </span>
                      )}
                    </div>
                    <p className="text-base font-extrabold text-primary leading-tight">2.5 Acres</p>
                    <p className="text-xs text-secondary font-bold mt-0.5">{plots.A.crop}</p>
                    <p className="text-[11px] text-on-surface-variant">{plots.A.subCrop}</p>
                    <div className="mt-3 flex items-center gap-1 text-secondary text-xs font-semibold">
                      <span className="material-symbols-outlined text-[16px]">eco</span>
                      <span>{plots.A.stageName}</span>
                    </div>
                  </button>

                  {/* BLOCK B BUTTON */}
                  <button
                    type="button"
                    onClick={() => setActivePlot('B')}
                    className={`flex flex-col text-left p-4 rounded-xl transition-all duration-200 border-2 ${
                      activePlot === 'B'
                        ? 'bg-secondary-container/50 border-secondary shadow-md'
                        : 'bg-surface-container-lowest/90 hover:bg-surface-container-lowest border-transparent shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                        activePlot === 'B' ? 'bg-secondary text-white' : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        BLOCK B
                      </span>
                      {activePlot === 'B' && (
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
                        </span>
                      )}
                    </div>
                    <p className="text-base font-extrabold text-primary leading-tight">2.0 Acres</p>
                    <p className="text-xs text-secondary font-bold mt-0.5">{plots.B.crop}</p>
                    <p className="text-[11px] text-on-surface-variant">{plots.B.subCrop}</p>
                    <div className="mt-3 flex items-center gap-1 text-on-surface-variant text-xs font-semibold">
                      <span className="material-symbols-outlined text-[16px]">grass</span>
                      <span>{plots.B.stageName}</span>
                    </div>
                  </button>
                </div>

                <div className="mt-2.5 pt-2 flex items-center justify-between text-on-surface-variant text-[11px] px-1 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary" /> South-facing slope
                  </span>
                  <span>Borewell Line: North Corridor</span>
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
              <span>+ Add New Farm / Plot (નવો પ્લોટ ઉમેરો)</span>
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

              {/* Submit / Cancel Buttons */}
              <div className="pt-3 space-y-2">
                <button
                  type="submit"
                  className="w-full h-12 bg-secondary hover:bg-primary text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Save Farm Details / પ્લોટ સાચવો</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full h-10 text-on-surface-variant hover:text-primary text-xs font-semibold transition-colors"
                >
                  Cancel / રદ કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
