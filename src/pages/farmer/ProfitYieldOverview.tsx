import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export const ProfitYieldOverview: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedMandi, setSelectedMandi] = useState('Surat APMC');

  const mandiRates = [
    { mandi: 'Surat APMC', distance: '14 km', cotton: '₹7,250 / Qtl', groundnut: '₹6,880 / Qtl', trend: 'up' },
    { mandi: 'Navsari APMC', distance: '38 km', cotton: '₹7,180 / Qtl', groundnut: '₹6,920 / Qtl', trend: 'up' },
    { mandi: 'Bharuch APMC', distance: '55 km', cotton: '₹7,310 / Qtl', groundnut: '₹6,750 / Qtl', trend: 'down' },
    { mandi: 'Rajkot APMC', distance: '320 km (Benchmark)', cotton: '₹7,400 / Qtl', groundnut: '₹7,150 / Qtl', trend: 'up' },
  ];

  const historicalSeasons = [
    { season: 'Kharif 2026 (Est.)', cost: '₹48,650', revenue: '₹1,68,000', netProfit: '₹1,19,350', roi: '245%' },
    { season: 'Rabi 2025-26', cost: '₹22,400', revenue: '₹68,500', netProfit: '₹46,100', roi: '205%' },
    { season: 'Kharif 2025', cost: '₹44,000', revenue: '₹1,42,000', netProfit: '₹98,000', roi: '222%' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FCF9F0] text-[#1C1C17] pb-24 md:pb-12">
      {/* Top Header */}
      <div className="bg-[#163A2D] text-white py-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
              <span>Yield Economics & Mandi Intelligence • નફો અને આવક વિશ્લેષણ</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Profit, Yield & Revenue Overview
            </h1>
            <p className="text-emerald-100/80 text-sm mt-0.5">
              Live financial projections for 10 Vigha landholding across Cotton & Groundnut
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/market')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              <span>Live APMC Mandi</span>
            </button>
            <button
              onClick={() => navigate('/expenses')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-colors border border-white/20"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>View Expenses</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Big Profit Hero Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E5E2DA] relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Projected Net Profit Hero */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
                Kharif 2026 Projected Net Profit
              </span>
              <div className="text-4xl md:text-5xl font-black text-[#163A2D] mt-2">
                ₹1,19,350
              </div>
              <p className="text-sm font-bold text-emerald-700">
                +21.8% vs Last Kharif Season (૨૧.૮% વધુ ચોખ્ખો નફો)
              </p>
              <p className="text-xs text-[#717974] leading-relaxed">
                Calculated based on current Surat APMC modal prices, 94% satellite NDVI biomass index, and optimal soil moisture conditions.
              </p>
            </div>

            {/* Financial Breakdown Equation */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#F6F3EA] p-4 rounded-2xl border border-[#E5E2DA]">
                <span className="text-xs font-bold text-[#717974] uppercase block">Expected Revenue</span>
                <span className="text-2xl font-black text-emerald-800 mt-1 block">₹1,68,000</span>
                <span className="text-[11px] text-[#717974] mt-1 block">64 Qtl Total Harvest</span>
              </div>

              <div className="bg-[#F6F3EA] p-4 rounded-2xl border border-[#E5E2DA]">
                <span className="text-xs font-bold text-[#717974] uppercase block">Total Cultivation Cost</span>
                <span className="text-2xl font-black text-red-700 mt-1 block">-₹48,650</span>
                <span className="text-[11px] text-[#717974] mt-1 block">Recorded in Ledger</span>
              </div>

              <div className="bg-[#F6F3EA] p-4 rounded-2xl border border-[#E5E2DA]">
                <span className="text-xs font-bold text-[#717974] uppercase block">Return on Investment</span>
                <span className="text-2xl font-black text-[#163A2D] mt-1 block">245%</span>
                <span className="text-[11px] text-emerald-700 font-bold mt-1 block">₹2.45 return per ₹1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Harvest Projections by Plot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plot A: Cotton */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Block A • 6.5 Vigha
                </span>
                <h3 className="text-xl font-black text-[#163A2D] mt-2">Bt Cotton (G.Cot-16)</h3>
                <p className="text-xs text-[#717974]">Flowering & Boll Forming Stage</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg">
                ☁️
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#F1EEE5] text-center">
              <div>
                <span className="text-[11px] text-[#717974] block">Est. Yield</span>
                <span className="text-sm md:text-base font-black text-[#163A2D]">24 Qtl</span>
              </div>
              <div>
                <span className="text-[11px] text-[#717974] block">Mandi Rate</span>
                <span className="text-sm md:text-base font-black text-emerald-800">₹7,200/Qtl</span>
              </div>
              <div>
                <span className="text-[11px] text-[#717974] block">Est. Value</span>
                <span className="text-sm md:text-base font-black text-[#163A2D]">₹1,72,800</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#717974]">Projected Harvest Window:</span>
              <span className="font-bold text-[#163A2D]">15 Oct - 05 Nov 2026</span>
            </div>
          </div>

          {/* Plot B: Groundnut */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Block B • 3.5 Vigha
                </span>
                <h3 className="text-xl font-black text-[#163A2D] mt-2">Groundnut (GG-20)</h3>
                <p className="text-xs text-[#717974]">Pegging & Pod Filling Stage</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-lg">
                🥜
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#F1EEE5] text-center">
              <div>
                <span className="text-[11px] text-[#717974] block">Est. Yield</span>
                <span className="text-sm md:text-base font-black text-[#163A2D]">40 Qtl</span>
              </div>
              <div>
                <span className="text-[11px] text-[#717974] block">Mandi Rate</span>
                <span className="text-sm md:text-base font-black text-emerald-800">₹6,850/Qtl</span>
              </div>
              <div>
                <span className="text-[11px] text-[#717974] block">Est. Value</span>
                <span className="text-sm md:text-base font-black text-[#163A2D]">₹2,74,000</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#717974]">Projected Harvest Window:</span>
              <span className="font-bold text-[#163A2D]">28 Sep - 12 Oct 2026</span>
            </div>
          </div>
        </div>

        {/* Nearby APMC Mandi Rate Comparison */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA] space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E2DA]">
            <h3 className="text-lg font-extrabold text-[#163A2D] flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700">storefront</span>
              <span>Nearby APMC Mandi Rates & Arbitrage (નજીકના માર્કેટ યાર્ડ)</span>
            </h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full">
              Live Mandi Network
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {mandiRates.map((rate, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA] space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-[#163A2D]">{rate.mandi}</h4>
                    <span className="text-[11px] text-[#717974]">{rate.distance}</span>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      rate.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {rate.trend === 'up' ? 'trending_up' : 'trending_down'}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E5E2DA] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#717974]">Cotton:</span>
                    <span className="font-bold text-[#163A2D]">{rate.cotton}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#717974]">Groundnut:</span>
                    <span className="font-bold text-[#163A2D]">{rate.groundnut}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Season Performance */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA]">
          <h3 className="text-lg font-extrabold text-[#163A2D] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700">history_edu</span>
            <span>Historical Crop Profitability Track Record</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#F1EEE5] text-[#717974] text-xs font-bold uppercase">
                  <th className="py-3 px-2">Season</th>
                  <th className="py-3 px-2">Total OpEx</th>
                  <th className="py-3 px-2">Gross Revenue</th>
                  <th className="py-3 px-2">Net Profit</th>
                  <th className="py-3 px-2 text-right">ROI (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EEE5]">
                {historicalSeasons.map((h, i) => (
                  <tr key={i} className="hover:bg-[#FCF9F0] transition-colors">
                    <td className="py-3.5 px-2 font-bold text-[#163A2D]">{h.season}</td>
                    <td className="py-3.5 px-2 text-red-700 font-semibold">{h.cost}</td>
                    <td className="py-3.5 px-2 text-emerald-800 font-semibold">{h.revenue}</td>
                    <td className="py-3.5 px-2 font-black text-[#163A2D]">{h.netProfit}</td>
                    <td className="py-3.5 px-2 text-right font-extrabold text-emerald-700">{h.roi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
