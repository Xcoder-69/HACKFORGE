import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FarmerRecord, DiagnosisResult, MandiRecord } from '../../types';
import { storageService, STORAGE_KEYS } from '../../services/storageService';
import { alertService } from '../../services/alertService';
import { aiVisionService } from '../../services/aiVisionService';
import { marketService } from '../../services/marketService';

const INITIAL_FARMERS: FarmerRecord[] = [
  {
    id: 'f-1',
    name: 'Ramesh Patel',
    code: 'KVK-SRT-8821',
    village: 'Kamrej',
    district: 'Surat',
    acreage: '4.5 Ac',
    plots: '2 Geo-Fenced Plots',
    crop: 'Cotton (Shankar-6)',
    cropBadgeColor: 'bg-emerald-100 text-emerald-800',
    ndvi: 0.76,
    ndviLabel: 'Optimal Canopy',
    ndviColor: 'text-emerald-700 bg-emerald-600',
    lastActivity: 'Scanned leaf (45m ago)',
    kycDone: true,
  },
  {
    id: 'f-2',
    name: 'Manji Chavda',
    code: 'KVK-SRT-4910',
    village: 'Olpad',
    district: 'Surat',
    acreage: '8.0 Ac',
    plots: '3 Geo-Fenced Plots',
    crop: 'Groundnut (GG-20)',
    cropBadgeColor: 'bg-amber-100 text-amber-900',
    ndvi: 0.62,
    ndviLabel: 'Moderate Vigour',
    ndviColor: 'text-amber-700 bg-amber-500',
    lastActivity: 'Checked Mandi (2h ago)',
    kycDone: true,
  },
  {
    id: 'f-3',
    name: 'Arvind Solanki',
    code: 'KVK-SRT-9032',
    village: 'Bardoli',
    district: 'Surat',
    acreage: '11.4 Ac',
    plots: '4 Geo-Fenced Plots',
    crop: 'Sugarcane (Co-86032)',
    cropBadgeColor: 'bg-emerald-100 text-emerald-800',
    ndvi: 0.79,
    ndviLabel: 'Robust Growth',
    ndviColor: 'text-emerald-700 bg-emerald-600',
    lastActivity: 'Logged Irrigation (4h ago)',
    kycDone: true,
  },
  {
    id: 'f-4',
    name: 'Bhavesh Desai',
    code: 'KVK-BHC-3109',
    village: 'Ankleshwar',
    district: 'Bharuch',
    acreage: '3.2 Ac',
    plots: '1 Plot',
    crop: 'Pigeon Pea (Tuver)',
    cropBadgeColor: 'bg-orange-100 text-orange-900',
    ndvi: 0.48,
    ndviLabel: 'Moisture Deficit',
    ndviColor: 'text-red-700 bg-red-500',
    lastActivity: 'Requested Soil Test (Yesterday)',
    kycDone: false,
  },
];

export const KvkAdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Moderation state
  const [moderationStatus, setModerationStatus] = useState<'pending' | 'approved' | 'corrected' | 'flagged'>('pending');
  const [farmers, setFarmers] = useState<FarmerRecord[]>([]);
  const [scans, setScans] = useState<DiagnosisResult[]>([]);
  const [mandiRecords, setMandiRecords] = useState<MandiRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [cropFilter, setCropFilter] = useState('All');

  // Advisory Studio state
  const [advisoryTitle, setAdvisoryTitle] = useState('Pre-Monsoon Heavy Rain Warning (45mm Forecast)');
  const [advisoryTarget, setAdvisoryTarget] = useState('Surat District — Kamrej & Olpad Talukas');
  const [advisoryDispatched, setAdvisoryDispatched] = useState(false);
  const [channelApp, setChannelApp] = useState(true);
  const [channelWhatsapp, setChannelWhatsapp] = useState(true);
  const [channelSms, setChannelSms] = useState(true);

  // Selected telemetry farmer modal
  const [telemetryFarmer, setTelemetryFarmer] = useState<FarmerRecord | null>(null);

  useEffect(() => {
    // Load farmers
    const storedFarmers = storageService.get<FarmerRecord[]>(STORAGE_KEYS.ADMIN_FARMERS, INITIAL_FARMERS);
    setFarmers(storedFarmers);

    // Load scans
    setScans(aiVisionService.getScanHistory());
    const unsubScans = aiVisionService.subscribeToScans((s) => setScans(s));

    // Load mandi records
    marketService.getMandiRecords().then(setMandiRecords);

    return unsubScans;
  }, []);

  const handleApprove = () => {
    setModerationStatus('approved');
  };

  const handleToggleKyc = (id: string) => {
    const updated = farmers.map((f) => (f.id === id ? { ...f, kycDone: !f.kycDone } : f));
    setFarmers(updated);
    storageService.set(STORAGE_KEYS.ADMIN_FARMERS, updated);
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    alertService.addAlert({
      category: 'weather',
      categoryLabel: 'KVK Emergency Advisory / પ્રસારણ',
      titleEn: advisoryTitle,
      titleGu: 'કેવીકે સુરત તરફથી ખાસ હવામાન સલાહ',
      severity: 'Critical',
      severityColor: 'bg-red-100 text-red-800 border-red-300',
      time: 'Just now',
      descriptionEn: `Broadcast to ${advisoryTarget}: IMD alerts 45mm rainfall. Postpone chemical foliar spray and clear drainage furrows. Channels: ${channelApp ? 'App ' : ''}${channelWhatsapp ? 'WhatsApp ' : ''}${channelSms ? 'SMS' : ''}`,
      descriptionGu: 'તાત્કાલિક કેવીકે પ્રસારણ: આગામી ૩૬ કલાકમાં ભારે વરસાદની શક્યતા હોવાથી દવા છંટકાવ મુલતવી રાખો.',
      actionText: 'Check Weather & Spray Window',
      actionRoute: '/weather-soil',
    });
    setAdvisoryDispatched(true);
    setTimeout(() => setAdvisoryDispatched(false), 3500);
  };

  const filteredFarmers = farmers.filter((f) => {
    if (districtFilter !== 'All' && !f.district.toLowerCase().includes(districtFilter.toLowerCase())) return false;
    if (cropFilter !== 'All' && !f.crop.toLowerCase().includes(cropFilter.toLowerCase())) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q) || f.village.toLowerCase().includes(q);
    }
    return true;
  });

  const latestScan = scans.length > 0 ? scans[0] : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E5E2DA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              ICAR-KVK Gujarat Command Node
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#163A2D] mt-1">
            AgroMind Enterprise & KVK Command Center
          </h1>
          <p className="text-xs md:text-sm text-[#717974] mt-0.5">
            Navsari Agricultural University Extension Hub • Regional Telemetry, AI Diagnosis Moderation & Dispatch Studio
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
            Season: Kharif 2026 Active
          </span>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-[#163A2D] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">phone_android</span>
            <span>Farmer App View</span>
          </button>
        </div>
      </div>

      {/* Top KPI Summary Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enrolled */}
        <div className="bg-white p-5 rounded-3xl border border-[#E5E2DA] shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-[#717974] uppercase tracking-wider">Total Enrolled</span>
              <h2 className="text-3xl font-black text-[#163A2D] mt-1">12,450</h2>
              <p className="text-xs text-[#717974]">Registered Farmers</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">groups</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1EEE5] flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span> +340 this week
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
              94% PM-Kisan
            </span>
          </div>
        </div>

        {/* GIS Coverage */}
        <div className="bg-white p-5 rounded-3xl border border-[#E5E2DA] shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-[#717974] uppercase tracking-wider">GIS Coverage</span>
              <h2 className="text-3xl font-black text-[#163A2D] mt-1">38,240 <span className="text-sm font-normal text-[#717974]">Acres</span></h2>
              <p className="text-xs text-[#717974]">Active Monitored Plots</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">crop_free</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1EEE5] flex items-center justify-between text-xs">
            <span className="text-[#414844] font-medium">Surat, Bharuch & Navsari</span>
            <span className="text-emerald-700 font-bold">3 Districts</span>
          </div>
        </div>

        {/* AI Scans Today */}
        <div className="bg-white p-5 rounded-3xl border border-[#E5E2DA] shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-[#717974] uppercase tracking-wider">Diagnostic Pipeline</span>
              <h2 className="text-3xl font-black text-[#163A2D] mt-1">3,482</h2>
              <p className="text-xs text-[#717974]">AI Scans Today</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1EEE5] flex items-center justify-between text-xs">
            <span className="text-[#717974]">Confidence: 92.4%</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px]">
              14 Pending Triage
            </span>
          </div>
        </div>

        {/* Hazard Alerts */}
        <div className="bg-white p-5 rounded-3xl border border-[#E5E2DA] shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-[#717974] uppercase tracking-wider">Active Agro Hazards</span>
              <h2 className="text-3xl font-black text-red-700 mt-1">4 Alerts</h2>
              <p className="text-xs text-[#717974]">Surat Climatic Zone</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1EEE5] flex items-center justify-between text-xs">
            <span className="text-red-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" /> Pre-Rain Convective
            </span>
            <button
              onClick={() => navigate('/weather-soil')}
              className="text-emerald-700 font-bold hover:underline"
            >
              View Radar
            </button>
          </div>
        </div>
      </section>

      {/* Main Two-Column Master Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Operations & Moderation (8 cols) */}
        <div className="lg:col-span-8 space-y-8 min-w-0">
          {/* Section A: AI Diagnosis Moderation Queue */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E5E2DA] overflow-hidden">
            <div className="p-5 bg-[#F6F3EA] border-b border-[#E5E2DA] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#163A2D] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base md:text-lg text-[#163A2D]">
                    AI Diagnosis Moderation Queue
                  </h3>
                  <p className="text-xs text-[#717974]">
                    Triage pending visual validations before field-level SMS & voice dispatch
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                14 Pending Review
              </span>
            </div>

            {/* Moderation Card #AG-1024 */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Visualizer */}
                <div className="md:col-span-5 space-y-2">
                  <div className="relative rounded-2xl overflow-hidden bg-[#163A2D] aspect-[4/3] shadow-inner flex items-center justify-center group">
                    {/* Simulated or uploaded foliage specimen */}
                    {latestScan?.imageUrl ? (
                      <img src={latestScan.imageUrl} alt="Scanned Leaf" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <span className="material-symbols-outlined text-[54px] text-emerald-400">
                          psychiatry
                        </span>
                        <p className="text-xs text-emerald-200 mt-1">{latestScan?.crop || 'Cotton Shankar-6'} Foliage</p>
                        <span className="text-[10px] text-amber-300">{latestScan?.symptoms?.[0] || 'Marginal yellowing + leaf curling'}</span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[11px] font-bold">
                      #{latestScan?.id || 'AG-1024'}
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px]">
                      {latestScan?.timestamp || 'Captured 45m ago'}
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-[#717974] px-1">
                    <span>Kamrej (21.27° N, 72.96° E)</span>
                    <span>OnePlus Nord CE</span>
                  </div>
                </div>

                {/* AI Telemetry & Diagnosis Breakdown */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#F1EEE5]">
                      <span className="text-xs font-bold text-[#163A2D] bg-[#F6F3EA] px-2.5 py-1 rounded-lg">
                        {latestScan?.crop || 'Cotton (Shankar-6)'} • Plot 2 (2.2 Ac)
                      </span>
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        {latestScan?.confidence || 70}% Model Confidence
                      </span>
                    </div>

                    <div className="mt-3 p-3.5 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA] space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="uppercase font-bold text-[#717974]">Preliminary Model Inference</span>
                        <span className="text-emerald-700 font-bold">Vision-Transformer Agro-v4</span>
                      </div>
                      <h4 className="font-extrabold text-base text-[#163A2D]">
                        {latestScan?.diseaseName || 'Jassid Infestation / લીલા તડતડિયા'} <span className="font-normal text-xs text-[#717974]">({latestScan?.scientificName || 'Amrasca biguttula'})</span>
                      </h4>
                      <p className="text-xs text-[#414844] leading-relaxed">
                        {latestScan?.symptoms?.[0] || 'Observed pattern: Marginal leaf yellowing, pronounced downward hopperburn curling indicative of second-instar nymph feeding.'}
                      </p>
                    </div>

                    {/* Farmer credit */}
                    <div className="mt-3 p-2.5 rounded-xl bg-white border border-[#E5E2DA] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center">
                          RP
                        </div>
                        <span className="font-bold text-[#163A2D]">Ramesh Patel</span>
                        <span className="text-[#717974]">+91 98765 43210</span>
                      </div>
                      <span className="text-emerald-700 font-semibold text-[11px]">Verified Farmer</span>
                    </div>
                  </div>

                  {/* Agronomist Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    {moderationStatus === 'pending' ? (
                      <>
                        <button
                          onClick={handleApprove}
                          className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          <span>Verify & Approve Diagnosis</span>
                        </button>

                        <button
                          onClick={() => setModerationStatus('corrected')}
                          className="py-2.5 px-3 bg-[#F1EEE5] hover:bg-[#E5E2DA] text-[#163A2D] rounded-xl text-xs font-bold transition-colors"
                        >
                          Correct Treatment
                        </button>

                        <button
                          onClick={() => setModerationStatus('flagged')}
                          className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-800 rounded-xl text-xs font-bold transition-colors"
                        >
                          Flag Inconclusive
                        </button>
                      </>
                    ) : (
                      <div className="w-full p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                          Status: {moderationStatus.toUpperCase()} by Dr. Arvind Mehta (Lead Agronomist)
                        </span>
                        <button
                          onClick={() => setModerationStatus('pending')}
                          className="text-xs text-emerald-800 underline font-semibold"
                        >
                          Undo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Farmer Registry & Field Telemetry Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E5E2DA] overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E2DA]">
              <div>
                <h3 className="font-extrabold text-lg text-[#163A2D]">
                  Farmer Registry & Field Telemetry
                </h3>
                <p className="text-xs text-[#717974]">
                  Real-time IoT nodes, satellite NDVI vegetative health, and recent field actions
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#717974] font-bold">
                  {filteredFarmers.length} of 12,450 plots
                </span>
              </div>
            </div>

            {/* Interactive Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search farmer name, village, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#C1C8C3] text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#C1C8C3] text-xs font-semibold bg-white"
                >
                  <option value="All">All Districts</option>
                  <option value="Surat">Surat (Kamrej, Olpad, Bardoli)</option>
                  <option value="Bharuch">Bharuch (Ankleshwar)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={cropFilter}
                  onChange={(e) => setCropFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#C1C8C3] text-xs font-semibold bg-white"
                >
                  <option value="All">All Crops</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Groundnut">Groundnut</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Pigeon Pea">Pigeon Pea</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#F1EEE5] text-[#717974] text-xs font-bold uppercase">
                    <th className="py-3 px-2">Farmer Name & ID</th>
                    <th className="py-3 px-2">Village</th>
                    <th className="py-3 px-2">Acreage</th>
                    <th className="py-3 px-2">Primary Crop</th>
                    <th className="py-3 px-2">Satellite NDVI</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Telemetry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EEE5]">
                  {filteredFarmers.map((farmer) => (
                    <tr key={farmer.id} className="hover:bg-[#FCF9F0] transition-colors">
                      <td className="py-3.5 px-2">
                        <div className="font-extrabold text-sm text-[#163A2D]">{farmer.name}</div>
                        <div className="text-[11px] text-[#717974]">{farmer.code}</div>
                      </td>
                      <td className="py-3.5 px-2 text-xs font-semibold text-[#414844]">{farmer.village}</td>
                      <td className="py-3.5 px-2 text-xs font-bold text-[#163A2D]">{farmer.acreage}</td>
                      <td className="py-3.5 px-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${farmer.cropBadgeColor}`}>
                          {farmer.crop}
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-[#163A2D]">{farmer.ndvi}</span>
                          <div className="w-14 h-2 rounded-full bg-[#E5E2DA] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${farmer.ndviColor.split(' ')[1]}`}
                              style={{ width: `${farmer.ndvi * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] text-[#717974] font-medium">{farmer.ndviLabel}</span>
                      </td>
                      <td className="py-3.5 px-2">
                        <button
                          onClick={() => handleToggleKyc(farmer.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            farmer.kycDone
                              ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          }`}
                          title="Click to toggle KYC verification status"
                        >
                          {farmer.kycDone ? 'KYC Done' : 'Pending'}
                        </button>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <button
                          onClick={() => setTelemetryFarmer(farmer)}
                          className="px-3 py-1.5 rounded-xl bg-[#F1EEE5] hover:bg-[#163A2D] hover:text-white text-[#163A2D] text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">sensors</span>
                          <span>Telemetry</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Dispatch Studio & APMC Feeds (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Section C: Broadcast Advisory Studio */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E5E2DA] overflow-hidden">
            <div className="p-5 bg-[#163A2D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[22px]">campaign</span>
                <div>
                  <h3 className="font-extrabold text-base">Broadcast Advisory Studio</h3>
                  <span className="text-[11px] text-emerald-200">ચેતવણી પ્રસારણ મોડ્યુલ</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                Live Hub
              </span>
            </div>

            <form onSubmit={handleDispatch} className="p-5 space-y-4">
              {advisoryDispatched && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
                  <span className="material-symbols-outlined text-emerald-700">check_circle</span>
                  <span>Dispatched advisory to 4,210 farmers via Push, WhatsApp, and SMS!</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#163A2D] block mb-1">Target Agro-Climatic Zone</label>
                <select
                  value={advisoryTarget}
                  onChange={(e) => setAdvisoryTarget(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#C1C8C3] text-xs font-semibold bg-white"
                >
                  <option>Surat District — Kamrej & Olpad Talukas</option>
                  <option>Surat District — Bardoli & Mahuva</option>
                  <option>Bharuch District — Ankleshwar Basin</option>
                  <option>All Southern Gujarat Farmers (38,240 Acres)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#163A2D] block mb-1">Advisory Title</label>
                <input
                  type="text"
                  value={advisoryTitle}
                  onChange={(e) => setAdvisoryTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#C1C8C3] text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#163A2D] block mb-1.5">Multi-Channel Channels</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F6F3EA] border border-[#E5E2DA] cursor-pointer text-center text-xs">
                    <input
                      type="checkbox"
                      checked={channelApp}
                      onChange={(e) => setChannelApp(e.target.checked)}
                      className="accent-emerald-700 mb-1"
                    />
                    <span className="font-bold text-[#163A2D]">App Push</span>
                    <span className="text-[10px] text-[#717974]">4.2k Active</span>
                  </label>

                  <label className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F6F3EA] border border-[#E5E2DA] cursor-pointer text-center text-xs">
                    <input
                      type="checkbox"
                      checked={channelWhatsapp}
                      onChange={(e) => setChannelWhatsapp(e.target.checked)}
                      className="accent-emerald-700 mb-1"
                    />
                    <span className="font-bold text-[#163A2D]">WhatsApp</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Voice Note</span>
                  </label>

                  <label className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F6F3EA] border border-[#E5E2DA] cursor-pointer text-center text-xs">
                    <input
                      type="checkbox"
                      checked={channelSms}
                      onChange={(e) => setChannelSms(e.target.checked)}
                      className="accent-emerald-700 mb-1"
                    />
                    <span className="font-bold text-[#163A2D]">SMS Blast</span>
                    <span className="text-[10px] text-[#717974]">TRAI DLT</span>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F6F3EA] border border-[#E5E2DA] text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#717974] block">KVK Dispatch Message</span>
                <p className="font-semibold text-[#163A2D] leading-relaxed">
                  "IMD alerts 45mm rainfall over Kamrej & Olpad in next 36 hrs. Postpone chemical foliar spray on Cotton and arrange drainage channels."
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#163A2D] hover:bg-emerald-950 text-white rounded-xl text-xs md:text-sm font-black shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">cell_tower</span>
                <span>Dispatch Advisory to 4,210 Farmers</span>
              </button>
            </form>
          </div>

          {/* Section D: Live Mandi Rates */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E5E2DA] overflow-hidden">
            <div className="p-5 bg-[#F6F3EA] border-b border-[#E5E2DA] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#163A2D]">Live APMC Rate Feeds</h3>
                <span className="text-[11px] text-[#717974]">Benchmark Gujarat Mandis</span>
              </div>
              <span className="material-symbols-outlined text-emerald-700">storefront</span>
            </div>

            <div className="p-4 space-y-3">
              {(mandiRecords.length > 0
                ? mandiRecords.slice(0, 3)
                : [
                    { id: '1', crop: 'Cotton (Shankar-6)', mandi: 'Surat APMC', modalPrice: 7450, arrivals: '2,400 bags', change: '+₹180 (2.4%)' },
                    { id: '2', crop: 'Groundnut (GG-20)', mandi: 'Rajkot APMC', modalPrice: 7590, arrivals: '1,850 bags', change: '+₹120 (1.6%)' },
                  ]
              ).map((rec: any) => (
                <div key={rec.id} className="p-3 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#163A2D]">{rec.crop}</h4>
                    <span className="text-[10px] text-[#717974]">{rec.mandi} • {rec.arrivals || 'Active'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-800">₹{rec.modalPrice?.toLocaleString('en-IN')} / Qtl</span>
                    <span className="text-[10px] text-emerald-700 font-bold block">↑ {rec.change || '+₹150'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Detail Modal */}
      {telemetryFarmer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E2DA] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DA]">
              <div>
                <h3 className="text-lg font-extrabold text-[#163A2D]">{telemetryFarmer.name}</h3>
                <span className="text-xs text-[#717974]">{telemetryFarmer.code} • {telemetryFarmer.village}</span>
              </div>
              <button
                onClick={() => setTelemetryFarmer(null)}
                className="w-8 h-8 rounded-full bg-[#F1EEE5] flex items-center justify-center text-[#1C1C17]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F6F3EA] rounded-xl">
                <span className="text-[#717974] block">Plot Area</span>
                <span className="font-bold text-[#163A2D] text-sm">{telemetryFarmer.acreage}</span>
              </div>
              <div className="p-3 bg-[#F6F3EA] rounded-xl">
                <span className="text-[#717974] block">Current Crop</span>
                <span className="font-bold text-[#163A2D] text-sm">{telemetryFarmer.crop}</span>
              </div>
              <div className="p-3 bg-[#F6F3EA] rounded-xl">
                <span className="text-[#717974] block">Sentinel-2 NDVI</span>
                <span className="font-bold text-emerald-800 text-sm">{telemetryFarmer.ndvi} ({telemetryFarmer.ndviLabel})</span>
              </div>
              <div className="p-3 bg-[#F6F3EA] rounded-xl">
                <span className="text-[#717974] block">Last Farmer Telemetry</span>
                <span className="font-bold text-[#163A2D] text-sm">{telemetryFarmer.lastActivity}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setTelemetryFarmer(null)}
                className="px-4 py-2 bg-[#163A2D] text-white rounded-xl text-xs font-bold"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
