import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { financialService } from '../../services/financialService';
import { farmService } from '../../services/farmService';

export const ProfitYieldOverview: React.FC = () => {
  const navigate = useNavigate();
  const { language, bi } = useLanguage();
  const { user } = useAuth();
  const [selectedMandi, setSelectedMandi] = useState('Surat APMC');
  const [financials, setFinancials] = useState(() => financialService.getFinancialOverview());
  const [plots, setPlots] = useState(() => farmService.getPlots());

  useEffect(() => {
    const unsub = financialService.subscribe(() => {
      setFinancials(financialService.getFinancialOverview());
      setPlots(farmService.getPlots());
    });
    return unsub;
  }, []);

  const mandiRates = [
    { mandi: 'Surat APMC', distance: '14 km', cotton: '₹7,250 / Qtl', groundnut: '₹6,880 / Qtl', trend: 'up' },
    { mandi: 'Navsari APMC', distance: '38 km', cotton: '₹7,180 / Qtl', groundnut: '₹6,920 / Qtl', trend: 'up' },
    { mandi: 'Bharuch APMC', distance: '55 km', cotton: '₹7,310 / Qtl', groundnut: '₹6,750 / Qtl', trend: 'down' },
    { mandi: 'Rajkot APMC', distance: '320 km (Benchmark)', cotton: '₹7,400 / Qtl', groundnut: '₹7,150 / Qtl', trend: 'up' },
  ];

  const historicalSeasons = user?.isDemo ? [
    {
      season: 'Kharif 2026 (Live Ledger)',
      cost: `₹${financials.totalExpenses.toLocaleString('en-IN')}`,
      revenue: `₹${financials.expectedRevenue.toLocaleString('en-IN')}`,
      netProfit: `₹${financials.projectedNetProfit.toLocaleString('en-IN')}`,
      roi: `${financials.roiPercent}%`,
    },
    { season: 'Rabi 2025-26', cost: '₹22,400', revenue: '₹68,500', netProfit: '₹46,100', roi: '205%' },
    { season: 'Kharif 2025', cost: '₹44,000', revenue: '₹1,42,000', netProfit: '₹98,000', roi: '222%' },
  ] : [
    {
      season: 'Current Season (Live Ledger)',
      cost: `₹${financials.totalExpenses.toLocaleString('en-IN')}`,
      revenue: `₹${financials.expectedRevenue.toLocaleString('en-IN')}`,
      netProfit: `₹${financials.projectedNetProfit.toLocaleString('en-IN')}`,
      roi: `${financials.roiPercent}%`,
    },
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
              {bi('નફો અને આવક વિશ્લેષણ', 'Profit, Yield & Revenue Overview', 'Munafa aur Aavak').primary}
            </h1>
            <p className="text-emerald-100/80 text-sm mt-0.5">
              {user?.isDemo
                ? 'Live financial projections for 10 Vigha landholding across Cotton & Groundnut'
                : `Live financial ledger & APMC projections for ${user?.name || 'Farmer'} (${user?.district || 'Gujarat'})`}
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
        {/* If real user has no ledger records, show welcoming empty state */}
        {!user?.isDemo && !financials.hasData ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E5E2DA] text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
              <span className="material-symbols-outlined text-[34px]">account_balance_wallet</span>
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-[#163A2D]">
                {bi('કોઈ નાણાકીય અથવા પાક ઉત્પાદન નોંધ નથી', 'No Financial or Harvest Ledger Recorded Yet', 'Koi kharch ya aavak record nahi hai').primary}
              </h3>
              <p className="text-xs text-[#717974] mt-1.5 leading-relaxed">
                {bi(
                  'તમારા બિયારણ, ખાતર, પિયત અને મજૂરી ખર્ચ નોંધો જેથી AI આપમેળે કુલ રોકાણ, અપેક્ષિત આવક, નેટ નફો અને APMC બજાર આધારિત ROI ગણી શકે.',
                  'Log your seed, fertilizer, irrigation, and labor expenses to calculate real seasonal ROI, net profit margins, and APMC modal price projections.',
                  'Apne kharche darj karein taaki AI net munafa aur ROI calculate kar sake.'
                ).primary}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/expenses')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#163A2D] hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span>{bi('+ પ્રથમ ખર્ચ ઉમેરો', '+ Add First Expense', '+ Pehla Kharch Jodein').primary}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/my-farm')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F6F3EA] hover:bg-[#ECE8DC] text-[#163A2D] text-xs sm:text-sm font-bold border border-[#E5E2DA] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">agriculture</span>
                <span>{bi('પ્લોટ સેટ કરો', 'Configure Plots', 'Plot Set Karein').primary}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Big Profit Hero Card */
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E5E2DA] relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Projected Net Profit Hero */}
              <div className="lg:col-span-5 space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
                  {user?.isDemo ? 'Kharif 2026 Projected Net Profit' : 'Season Projected Net Profit'}
                </span>
                <div className="text-4xl md:text-5xl font-black text-[#163A2D] mt-2">
                  ₹{financials.projectedNetProfit.toLocaleString('en-IN')}
                </div>
                <p className="text-sm font-bold text-emerald-700">
                  {financials.projectedNetProfit >= 0 ? '+21.8% vs Last Kharif Season (૨૧.૮% વધુ ચોખ્ખો નફો)' : 'Higher Expenses than Projected'}
                </p>
                <p className="text-xs text-[#717974] leading-relaxed">
                  Dynamically calculated from recorded operational ledger expenses and APMC benchmark modal prices.
                </p>
              </div>

              {/* Financial Breakdown Equation */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#F6F3EA] p-4 rounded-2xl border border-[#E5E2DA]">
                  <span className="text-xs font-bold text-[#717974] uppercase block">Expected Revenue</span>
                  <span className="text-2xl font-black text-emerald-800 mt-1 block">
                    ₹{financials.expectedRevenue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-[#717974] mt-1 block">
                    {user?.isDemo ? '64 Qtl Total Harvest' : 'Projected Harvest Value'}
                  </span>
                </div>

                <div className="bg-[#F6F3EA] p-4 rounded-2xl border border-[#E5E2DA]">
                  <span className="text-xs font-bold text-[#717974] uppercase block">Total Cultivation Cost</span>
                  <span className="text-2xl font-black text-red-700 mt-1 block">
                    -₹{financials.totalExpenses.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-[#717974] mt-1 block">Recorded in Ledger</span>
                </div>

                <div className="bg-[#F6F3EA] p-4 rounded-2xl border border-[#E5E2DA]">
                  <span className="text-xs font-bold text-[#717974] uppercase block">Return on Investment</span>
                  <span className="text-2xl font-black text-[#163A2D] mt-1 block">
                    {financials.roiPercent}%
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                    ₹{(financials.roiPercent / 100).toFixed(2)} return per ₹1
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Harvest Projections by Plot */}
        {user?.isDemo ? (
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
        ) : Object.keys(plots).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(plots).map(([key, plot]) => (
              <div key={key} className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA] space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      {plot.name} • {plot.area}
                    </span>
                    <h3 className="text-xl font-black text-[#163A2D] mt-2">{plot.crop}</h3>
                    <p className="text-xs text-[#717974]">{plot.stageName}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-lg">
                    🌱
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 py-3 border-y border-[#F1EEE5] text-center">
                  <div>
                    <span className="text-[11px] text-[#717974] block">Soil Type</span>
                    <span className="text-xs md:text-sm font-bold text-[#163A2D]">{plot.soilType}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#717974] block">Irrigation</span>
                    <span className="text-xs md:text-sm font-bold text-emerald-800">{plot.irrigation}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#717974]">Planting Date:</span>
                  <span className="font-bold text-[#163A2D]">{plot.sowingDate || 'Active Season'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

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
