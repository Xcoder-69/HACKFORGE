import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface MandiRecord {
  id: string;
  mandi: string;
  district: string;
  distance: string;
  crop: string;
  cropGu: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
  arrivals: string;
  recommendation: 'SELL NOW' | 'HOLD' | 'FAIR';
  recGu: string;
}

const MANDI_DATA: MandiRecord[] = [
  {
    id: 'm-1',
    mandi: 'Surat APMC',
    district: 'Surat',
    distance: '14 km (Nearest)',
    crop: 'Cotton (Shankar-6)',
    cropGu: 'કપાસ (શંકર-૬)',
    minPrice: 6900,
    maxPrice: 7450,
    modalPrice: 7250,
    trend: 'up',
    change: '+₹180',
    arrivals: '2,400 Qtl',
    recommendation: 'HOLD',
    recGu: '૧૦ દિવસ રોકો (ભાવ વધવાની શક્યતા)',
  },
  {
    id: 'm-2',
    mandi: 'Surat APMC',
    district: 'Surat',
    distance: '14 km (Nearest)',
    crop: 'Groundnut (GG-20)',
    cropGu: 'મગફળી (જીજી-૨૦)',
    minPrice: 6400,
    maxPrice: 6980,
    modalPrice: 6880,
    trend: 'up',
    change: '+₹110',
    arrivals: '1,650 Qtl',
    recommendation: 'SELL NOW',
    recGu: 'વેચાણ કરો (ઊંચા ભાવ)',
  },
  {
    id: 'm-3',
    mandi: 'Rajkot APMC',
    district: 'Rajkot',
    distance: '320 km (Export Benchmark)',
    crop: 'Cotton (Shankar-6)',
    cropGu: 'કપાસ (શંકર-૬)',
    minPrice: 7100,
    maxPrice: 7600,
    modalPrice: 7420,
    trend: 'up',
    change: '+₹220',
    arrivals: '14,200 Qtl',
    recommendation: 'HOLD',
    recGu: 'ભાવ મજબૂત',
  },
  {
    id: 'm-4',
    mandi: 'Rajkot APMC',
    district: 'Rajkot',
    distance: '320 km',
    crop: 'Groundnut (GG-20 Bold)',
    cropGu: 'મગફળી (બોલ્ડ દાણા)',
    minPrice: 6600,
    maxPrice: 7250,
    modalPrice: 7120,
    trend: 'up',
    change: '+₹160',
    arrivals: '8,900 Qtl',
    recommendation: 'SELL NOW',
    recGu: 'મહત્તમ નફો',
  },
  {
    id: 'm-5',
    mandi: 'Navsari APMC',
    district: 'Navsari',
    distance: '38 km',
    crop: 'Sugarcane (Factory Gate)',
    cropGu: 'શેરડી (સુગર ફેક્ટરી)',
    minPrice: 3300,
    maxPrice: 3500,
    modalPrice: 3420,
    trend: 'stable',
    change: '₹0',
    arrivals: '6,200 Ton',
    recommendation: 'SELL NOW',
    recGu: 'નિયમિત ડિલિવરી',
  },
  {
    id: 'm-6',
    mandi: 'Unjha APMC',
    district: 'Mehsana',
    distance: '380 km (Spice Hub)',
    crop: 'Cumin (Jeera)',
    cropGu: 'જીરું (ઊંઝા યાર્ડ)',
    minPrice: 24500,
    maxPrice: 29800,
    modalPrice: 28400,
    trend: 'up',
    change: '+₹650',
    arrivals: '4,500 Qtl',
    recommendation: 'SELL NOW',
    recGu: 'રેકોર્ડ ભાવ',
  },
];

export const MarketMandi: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('All');
  const [showGatePassModal, setShowGatePassModal] = useState<MandiRecord | null>(null);
  const [passGenerated, setPassGenerated] = useState(false);

  const filteredMandi = MANDI_DATA.filter((m) => {
    if (selectedCropFilter !== 'All' && !m.crop.includes(selectedCropFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.mandi.toLowerCase().includes(q) ||
        m.crop.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleGeneratePass = (e: React.FormEvent) => {
    e.preventDefault();
    setPassGenerated(true);
    setTimeout(() => {
      setPassGenerated(false);
      setShowGatePassModal(null);
    }, 2500);
  };

  return (
    <div className="w-full min-h-screen bg-[#FCF9F0] text-[#1C1C17] pb-24 md:pb-12">
      {/* Top Header */}
      <div className="bg-[#163A2D] text-white py-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              <span>Gujarat APMC Network • માર્કેટ યાર્ડ ભાવ અને વેચાણ સલાહ</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Mandi Market Intelligence
            </h1>
            <p className="text-emerald-100/80 text-sm mt-0.5">
              Live modal prices, mandi arrival volumes, and smart AI sell-or-hold advisories
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profit')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
              <span>Revenue & Profit Overview</span>
            </button>
            <button
              onClick={() => navigate('/expenses')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-colors border border-white/20"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>Input Costs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Sell Advice Highlight Banner */}
        <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[26px]">lightbulb</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase">
                  AgroMind Market Forecast
                </span>
                <span className="text-xs font-semibold text-emerald-800">Updated 10m ago</span>
              </div>
              <h3 className="text-base md:text-lg font-black text-[#163A2D] mt-1">
                Cotton Price Rally: Hold for 7-10 Days for +₹250/Qtl Margin
              </h3>
              <p className="text-xs md:text-sm text-[#414844] mt-0.5">
                Surat APMC arrival volumes are currently high, depressing spot rates. Demand from export mills in Rajkot is picking up for Grade-A Shankar-6.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedCropFilter('Cotton')}
            className="px-4 py-2.5 bg-[#163A2D] text-white rounded-xl text-xs font-bold shrink-0 hover:bg-emerald-950 transition-colors shadow"
          >
            View Cotton Trends
          </button>
        </div>

        {/* Search & Commodity Filter Bar */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#E5E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717974] text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search commodity or mandi (e.g. Cotton, Surat, Rajkot)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#C1C8C3] text-sm font-semibold focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['All', 'Cotton', 'Groundnut', 'Sugarcane', 'Cumin'].map((crop) => (
              <button
                key={crop}
                onClick={() => setSelectedCropFilter(crop)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCropFilter === crop
                    ? 'bg-[#163A2D] text-white shadow'
                    : 'bg-[#F6F3EA] text-[#414844] hover:bg-[#E5E2DA]'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Mandi Rate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMandi.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA] hover:border-emerald-400 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#717974] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-emerald-700">location_on</span>
                      {item.mandi} • {item.distance}
                    </span>
                    <h3 className="text-xl font-black text-[#163A2D] mt-1">{item.crop}</h3>
                    <p className="text-xs font-semibold text-emerald-800">{item.cropGu}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-black ${
                      item.recommendation === 'SELL NOW'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.recommendation === 'HOLD'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.recommendation}
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-4 p-4 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA] flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#717974] uppercase block">Modal Rate</span>
                    <div className="text-3xl font-black text-[#163A2D] mt-0.5">
                      ₹{item.modalPrice.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-bold inline-flex items-center gap-0.5 ${
                        item.trend === 'up' ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {item.trend === 'up' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                      {item.change}
                    </span>
                    <span className="text-[10px] text-[#717974] block mt-0.5">Today</span>
                  </div>
                </div>

                {/* Range and volume */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-[#E5E2DA]">
                    <span className="text-[#717974] block text-[10px] uppercase font-semibold">Min - Max Range</span>
                    <span className="font-bold text-[#163A2D]">
                      ₹{item.minPrice} - ₹{item.maxPrice}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E5E2DA]">
                    <span className="text-[#717974] block text-[10px] uppercase font-semibold">Daily Arrival</span>
                    <span className="font-bold text-[#163A2D]">{item.arrivals}</span>
                  </div>
                </div>

                <p className="text-xs text-[#414844] mt-2 bg-[#FCF9F0] p-2.5 rounded-xl border border-[#E5E2DA]">
                  💡 <strong>સલાહ:</strong> {item.recGu}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setShowGatePassModal(item)}
                className="w-full py-3 bg-[#163A2D] hover:bg-emerald-950 text-white rounded-2xl text-xs md:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                <span>Book Mandi Slot & Gate Pass</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Book Mandi Slot Modal */}
      {showGatePassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E2DA]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E2DA]">
              <div>
                <h3 className="text-lg font-extrabold text-[#163A2D]">APMC Mandi Gate Pass</h3>
                <span className="text-xs text-[#717974]">{showGatePassModal.mandi}</span>
              </div>
              <button
                onClick={() => setShowGatePassModal(null)}
                className="w-8 h-8 rounded-full bg-[#F1EEE5] flex items-center justify-center text-[#1C1C17]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {passGenerated ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center animate-bounce">
                  <span className="material-symbols-outlined text-[36px]">check</span>
                </div>
                <h4 className="text-xl font-black text-[#163A2D]">Slot Booked Successfully!</h4>
                <p className="text-xs text-[#717974]">
                  Token: <strong>SRT-2026-8812</strong> • Gate 2 Entry (08:00 AM)
                </p>
                <p className="text-xs text-emerald-800 font-semibold">
                  SMS confirmation dispatched to registered mobile.
                </p>
              </div>
            ) : (
              <form onSubmit={handleGeneratePass} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#717974] block mb-1">Commodity</label>
                  <input
                    type="text"
                    value={showGatePassModal.crop}
                    readOnly
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F3EA] border border-[#E5E2DA] text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#717974] block mb-1">Estimated Quantity (Qtl)</label>
                    <input
                      type="number"
                      defaultValue="20"
                      className="w-full h-10 px-3 rounded-xl border border-[#C1C8C3] text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#717974] block mb-1">Vehicle Type</label>
                    <select className="w-full h-10 px-3 rounded-xl border border-[#C1C8C3] text-xs font-bold bg-white">
                      <option>Tractor Trailer (ટ્રેક્ટર)</option>
                      <option>Pickup Tempo (છોટા હાથી)</option>
                      <option>Bullock Cart (ગાડું)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowGatePassModal(null)}
                    className="px-4 py-2 bg-[#F1EEE5] text-[#414844] rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#163A2D] text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-950"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
