import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export const WeatherSoilIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'weather' | 'soil' | 'spray'>('weather');
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const weeklyForecast = [
    { day: 'Today', dayGu: 'આજે', tempMax: 33, tempMin: 24, condition: 'Partly Cloudy', icon: 'partly_cloudy_day', rainProb: 20, rainMm: '0.0 mm', sprayScore: 'Safe' },
    { day: 'Sun', dayGu: 'રવિ', tempMax: 34, tempMin: 25, condition: 'Sunny & Clear', icon: 'wb_sunny', rainProb: 5, rainMm: '0.0 mm', sprayScore: 'Optimal' },
    { day: 'Mon', dayGu: 'સોમ', tempMax: 32, tempMin: 24, condition: 'Isolated Showers', icon: 'rainy', rainProb: 65, rainMm: '14.2 mm', sprayScore: 'Unsafe' },
    { day: 'Tue', dayGu: 'મંગળ', tempMax: 30, tempMin: 23, condition: 'Moderate Rain', icon: 'thunderstorm', rainProb: 80, rainMm: '26.5 mm', sprayScore: 'Unsafe' },
    { day: 'Wed', dayGu: 'બુધ', tempMax: 31, tempMin: 23, condition: 'Passing Clouds', icon: 'cloud', rainProb: 30, rainMm: '2.1 mm', sprayScore: 'Moderate' },
    { day: 'Thu', dayGu: 'ગુરુ', tempMax: 33, tempMin: 24, condition: 'Warm & Humid', icon: 'wb_sunny', rainProb: 10, rainMm: '0.0 mm', sprayScore: 'Optimal' },
    { day: 'Fri', dayGu: 'શુક્ર', tempMax: 34, tempMin: 25, condition: 'Clear Sky', icon: 'sunny', rainProb: 5, rainMm: '0.0 mm', sprayScore: 'Optimal' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FCF9F0] text-[#1C1C17] pb-24 md:pb-12">
      {/* Top Header */}
      <div className="bg-[#163A2D] text-white py-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
              <span>Open-Meteo & IMD Live Radar • હવામાન અને જમીન બુદ્ધિમત્તા</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Weather & Soil Intelligence
            </h1>
            <p className="text-emerald-100/80 text-sm mt-0.5">
              Hyperlocal telemetry for Kamrej, Surat (21.27° N, 72.96° E) • Station: GJ-SUR-04
            </p>
          </div>

          {/* Action pills */}
          <div className="flex items-center gap-3">
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
        {/* Extreme Weather Advisory Banner */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">thunderstorm</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[11px] font-bold uppercase">
                  IMD Rain Advisory
                </span>
                <span className="text-xs text-amber-800 font-semibold">Forecast for Monday & Tuesday</span>
              </div>
              <p className="text-sm font-bold text-[#163A2D] mt-0.5">
                Convective rainfall (25-40mm) anticipated in Surat district. Postpone foliar pesticide sprays.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('spray')}
            className="px-3.5 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold shrink-0 transition-colors"
          >
            Check Spray Window
          </button>
        </div>

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
            {/* Current Real-time Condition Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E5E2DA] relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl -z-0 pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Main Gauge / Temp */}
                <div className="md:col-span-6 flex items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner shrink-0">
                    <span className="material-symbols-outlined text-[54px]">partly_cloudy_day</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-1 rounded-full">
                      Kamrej Micro-Station • Live
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-5xl md:text-6xl font-black text-[#163A2D]">31°C</span>
                      <span className="text-base font-semibold text-[#717974]">Feels like 34°C</span>
                    </div>
                    <p className="text-sm font-bold text-[#414844] mt-0.5">
                      Partly Cloudy • પવન દિશા: દક્ષિણ-પશ્ચિમ (SW)
                    </p>
                  </div>
                </div>

                {/* Micro-metrics Grid */}
                <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#F6F3EA] p-3 rounded-2xl border border-[#E5E2DA]">
                    <span className="text-xs text-[#717974] block">Humidity</span>
                    <span className="text-base font-extrabold text-[#163A2D] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-blue-600 text-sm">humidity_mid</span>
                      68%
                    </span>
                  </div>
                  <div className="bg-[#F6F3EA] p-3 rounded-2xl border border-[#E5E2DA]">
                    <span className="text-xs text-[#717974] block">Wind Velocity</span>
                    <span className="text-base font-extrabold text-[#163A2D] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-teal-600 text-sm">air</span>
                      14 km/h
                    </span>
                  </div>
                  <div className="bg-[#F6F3EA] p-3 rounded-2xl border border-[#E5E2DA]">
                    <span className="text-xs text-[#717974] block">Evapotransp.</span>
                    <span className="text-base font-extrabold text-[#163A2D] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-amber-600 text-sm">water</span>
                      4.8 mm/d
                    </span>
                  </div>
                  <div className="bg-[#F6F3EA] p-3 rounded-2xl border border-[#E5E2DA]">
                    <span className="text-xs text-[#717974] block">UV Index</span>
                    <span className="text-base font-extrabold text-[#163A2D] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-amber-500 text-sm">wb_sunny</span>
                      7 (High)
                    </span>
                  </div>
                </div>
              </div>
            </div>

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
                <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold">
                  Current: SAFE FOR SPRAYING
                </span>
              </div>

              {/* Hours Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6">
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-emerald-900">06:00 - 09:00 AM</span>
                  <div className="my-1.5 font-black text-emerald-700 text-lg">OPTIMAL</div>
                  <span className="text-[11px] text-[#717974]">Wind: 8 km/h • 26°C</span>
                </div>
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-emerald-900">09:00 - 11:00 AM</span>
                  <div className="my-1.5 font-black text-emerald-700 text-lg">SAFE</div>
                  <span className="text-[11px] text-[#717974]">Wind: 12 km/h • 29°C</span>
                </div>
                <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-amber-900">11:00 AM - 03:00 PM</span>
                  <div className="my-1.5 font-black text-amber-700 text-lg">CAUTION</div>
                  <span className="text-[11px] text-[#717974]">High Heat (34°C) Evap</span>
                </div>
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-emerald-900">03:00 - 06:00 PM</span>
                  <div className="my-1.5 font-black text-emerald-700 text-lg">OPTIMAL</div>
                  <span className="text-[11px] text-[#717974]">Wind: 10 km/h • 30°C</span>
                </div>
                <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-red-900">Monday Morning</span>
                  <div className="my-1.5 font-black text-red-700 text-lg">NO SPRAY</div>
                  <span className="text-[11px] text-[#717974]">Heavy Rain Risk (65%)</span>
                </div>
                <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-red-900">Tuesday All Day</span>
                  <div className="my-1.5 font-black text-red-700 text-lg">NO SPRAY</div>
                  <span className="text-[11px] text-[#717974]">Showers Expected</span>
                </div>
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
    </div>
  );
};
