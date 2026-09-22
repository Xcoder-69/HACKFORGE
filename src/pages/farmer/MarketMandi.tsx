import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { marketService } from '../../services/marketService';
import { filterAndSortMultilingual } from '../../utils/multilingualSearch';
import type { MandiRecord } from '../../types';

export const MarketMandi: React.FC = () => {
  const navigate = useNavigate();
  const { language, bi } = useLanguage();

  const [mandiList, setMandiList] = useState<MandiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('All');
  const [showGatePassModal, setShowGatePassModal] = useState<MandiRecord | null>(null);
  const [passGenerated, setPassGenerated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    marketService.getMarketPrices(selectedCropFilter).then((data) => {
      if (isMounted) {
        setMandiList(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedCropFilter]);

  const filteredMandi = filterAndSortMultilingual(
    mandiList,
    search,
    (m) => ({
      primaryGu: m.cropGu,
      primaryEn: m.crop,
      primaryHi: m.cropHi || m.crop,
      secondaryGu: [m.mandi, m.district, m.recGu],
      secondaryEn: [m.mandi, m.district, m.recommendation],
      secondaryHi: [m.mandi, m.district, m.recHi || m.recommendation],
    }),
    language
  );

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
      <div className="bg-[#163A2D] text-white py-4 sm:py-6 px-3 sm:px-6 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1">
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">storefront</span>
              <span className="truncate">{bi('ગુજરાત APMC નેટવર્ક • માર્કેટ યાર્ડ ભાવ', 'Gujarat APMC Network • Mandi Intelligence', 'गुजरात APMC नेटवर्क • मंडी भाव').primary}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              {bi('લાઇવ મંડી બજાર ભાવ', 'Mandi Market Intelligence', 'लाइव मंडी बाजार भाव').primary}
            </h1>
            <p className="text-emerald-300/90 text-[11px] sm:text-xs font-semibold mt-0.5">
              {bi('લાઇવ મંડી ભાવ, આવક જથ્થો અને વેચાણ સલાહ', 'Live Modal Prices, Arrival Volumes & Advisories', 'लाइव मंडी भाव व एडवाइजरी').primary}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/profit')}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">trending_up</span>
              <span className="truncate">{bi('આવક અને નફો', 'Revenue & Profit', 'आय व लाभ').primary}</span>
            </button>
            <button
              onClick={() => navigate('/expenses')}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors border border-white/20"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">receipt_long</span>
              <span className="truncate">{bi('ખેતી ખર્ચ', 'Input Costs', 'लागत खर्च').primary}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 md:px-8 pt-3 sm:pt-6 space-y-4 sm:space-y-6">
        {/* Sell Advice Highlight Banner */}
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px] sm:text-[26px]">lightbulb</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                  AgroMind AI
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-800">Updated 10m ago</span>
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-black text-[#163A2D] mt-1 leading-snug">
                Cotton Price Rally: Hold for 7-10 Days for +₹250/Qtl Margin
              </h3>
              <p className="text-xs sm:text-sm text-[#414844] mt-0.5 line-clamp-2 sm:line-clamp-none">
                Surat APMC arrival volumes are currently high, depressing spot rates. Demand from export mills in Rajkot is picking up for Grade-A Shankar-6.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedCropFilter('Cotton')}
            className="w-full md:w-auto px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#163A2D] text-white rounded-xl text-xs font-bold shrink-0 hover:bg-emerald-950 transition-colors shadow text-center"
          >
            {bi('કપાસ ટ્રેન્ડ જુઓ', 'View Cotton Trends', 'कपास ट्रेंड देखें').primary}
          </button>
        </div>

        {/* Search & Commodity Filter Bar */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm border border-[#E5E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717974] text-[18px] sm:text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder={bi(
                'પાક અથવા મંડી શોધો (કપાસ, સુરત, Rajkot)...',
                'Search commodity or mandi (e.g. Cotton, Surat)...',
                'फसल या मंडी खोजें (कपास, सूरत, Rajkot)...'
              ).primary}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 sm:h-11 pl-9 sm:pl-10 pr-9 sm:pr-10 rounded-xl border border-[#C1C8C3] text-xs sm:text-sm font-semibold focus:border-emerald-600 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 flex items-center justify-center"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'All', gu: 'બધા પાક', en: 'All Crops', hi: 'सभी फसलें' },
              { id: 'Cotton', gu: 'કપાસ', en: 'Cotton', hi: 'कपास' },
              { id: 'Groundnut', gu: 'મગફળી', en: 'Groundnut', hi: 'मूंगफली' },
              { id: 'Sugarcane', gu: 'શેરડી', en: 'Sugarcane', hi: 'गन्ना' },
              { id: 'Cumin', gu: 'જીરું', en: 'Cumin', hi: 'जीरा' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedCropFilter(chip.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCropFilter === chip.id
                    ? 'bg-[#163A2D] text-white shadow'
                    : 'bg-[#F6F3EA] text-[#414844] hover:bg-[#E5E2DA]'
                }`}
              >
                {bi(chip.gu, chip.en, chip.hi).primary}
              </button>
            ))}
          </div>
        </div>

        {/* Mandi Rate Cards Grid or Empty State */}
        {filteredMandi.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center border border-[#E5E2DA] space-y-3 sm:space-y-4 shadow-sm max-w-xl mx-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-700">
              <span className="material-symbols-outlined text-2xl sm:text-3xl">storefront</span>
            </div>
            <h3 className="font-extrabold text-lg sm:text-xl text-[#163A2D]">
              {bi(
                `"${search}" માટે કોઈ મંડી ભાવ મળ્યા નથી`,
                `No mandi rates found for "${search}"`,
                `"${search}" के लिए कोई मंडी भाव नहीं मिले`
              ).primary}
            </h3>
            <p className="text-xs text-[#717974] leading-relaxed">
              {bi(
                'કૃપા કરીને અન્ય પાક અથવા મંડીનું નામ લખીને પ્રયત્ન કરો.',
                'Try searching with alternative crop or mandi names.',
                'कृपया अन्य फसल या मंडी नाम लिखकर खोजें।'
              ).primary}
            </p>
            <button
              onClick={() => setSearch('')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              <span>{bi('શોધ સાફ કરો', 'Clear Search', 'खोज साफ़ करें').primary}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {filteredMandi.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-[#E5E2DA] hover:border-emerald-400 transition-all flex flex-col justify-between space-y-3 sm:space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] sm:text-xs font-bold text-[#717974] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-emerald-700">location_on</span>
                        {item.mandi} • {item.distance}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-[#163A2D] mt-0.5 sm:mt-1">
                        {bi(item.cropGu, item.crop, item.cropHi || item.crop).primary}
                      </h3>
                      <p className="text-[11px] sm:text-xs font-semibold text-emerald-800">
                        {bi(item.cropGu, item.crop, item.cropHi || item.crop).secondary}
                      </p>
                    </div>

                    <span
                      className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black shrink-0 ${
                        item.recommendation === 'SELL NOW'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.recommendation === 'HOLD'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {bi(
                        item.recGu?.split(' ')[0] || (item.recommendation === 'SELL NOW' ? 'વેચો' : item.recommendation === 'HOLD' ? 'રોકો' : 'સાચવો'),
                        item.recommendation,
                        item.recHi?.split(' ')[0] || (item.recommendation === 'SELL NOW' ? 'Becho' : item.recommendation === 'HOLD' ? 'Roko' : 'Hold')
                      ).primary}
                    </span>
                  </div>

                  {/* Price Display */}
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA] flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#717974] uppercase block">
                        {bi('મોડલ ભાવ', 'Modal Rate', 'मॉडल भाव').primary}
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-[#163A2D] mt-0.5">
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
                      <span className="text-[10px] text-[#717974] block mt-0.5">
                        {bi('આજનો ભાવ', 'Today', 'आज का भाव').primary}
                      </span>
                    </div>
                  </div>

                  {/* Range and volume */}
                  <div className="grid grid-cols-2 gap-2 mt-2.5 sm:mt-3 text-xs">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#E5E2DA]">
                      <span className="text-[#717974] block text-[10px] uppercase font-semibold">
                        {bi('ભાવ રેન્જ', 'Price Range', 'भाव दायरा').primary}
                      </span>
                      <span className="font-bold text-[#163A2D] text-xs sm:text-sm">
                        ₹{item.minPrice} - ₹{item.maxPrice}
                      </span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#E5E2DA]">
                      <span className="text-[#717974] block text-[10px] uppercase font-semibold">
                        {bi('દૈનિક આવક', 'Daily Arrival', 'दैनिक आवक').primary}
                      </span>
                      <span className="font-bold text-[#163A2D] text-xs sm:text-sm">{item.arrivals}</span>
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-xs text-[#414844] mt-2 bg-[#FCF9F0] p-2 sm:p-2.5 rounded-xl border border-[#E5E2DA] leading-snug">
                    💡 <strong>{bi('સલાહ:', 'Advice:', 'सलाह:').primary}</strong>{' '}
                    {bi(item.recGu, item.recommendation, item.recHi || item.recommendation).primary}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setShowGatePassModal(item)}
                  className="w-full py-2.5 sm:py-3 bg-[#163A2D] hover:bg-emerald-950 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[17px] sm:text-[18px]">confirmation_number</span>
                  <span>{bi('ગેટ પાસ બુક કરો', 'Book Gate Pass', 'गेट पास बुक करें').primary}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book Mandi Slot Modal */}
      {showGatePassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E2DA]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E2DA]">
              <div>
                <h3 className="text-lg font-extrabold text-[#163A2D]">
                  {bi('APMC મંડી ગેટ પાસ', 'APMC Mandi Gate Pass', 'एपीएमसी मंडी गेट पास').primary}
                </h3>
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
                <h4 className="text-xl font-black text-[#163A2D]">
                  {bi('સ્લોટ સફળતાપૂર્વક બુક થયો!', 'Slot Booked Successfully!', 'स्लॉट सफलतापूर्वक बुक हुआ!').primary}
                </h4>
                <p className="text-xs text-[#717974]">
                  Token: <strong>SRT-2026-8812</strong> • Gate 2 Entry (08:00 AM)
                </p>
                <p className="text-xs text-emerald-800 font-semibold">
                  {bi('મોબાઇલ પર SMS કન્ફર્મેશન મોકલેલ છે.', 'SMS confirmation dispatched to registered mobile.', 'पंजीकृत मोबाइल पर एसएमएस भेजा गया है।').primary}
                </p>
              </div>
            ) : (
              <form onSubmit={handleGeneratePass} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#717974] block mb-1">
                    {bi('કૃષિ પાક (Commodity)', 'Commodity (કૃષિ પાક)', 'कृषि उत्पाद (Commodity)').primary}
                  </label>
                  <input
                    type="text"
                    value={bi(showGatePassModal.cropGu, showGatePassModal.crop, showGatePassModal.cropHi || showGatePassModal.crop).primary}
                    readOnly
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F3EA] border border-[#E5E2DA] text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#717974] block mb-1">
                      {bi('અંદાજિત જથ્થો (ક્વિન્ટલ)', 'Est. Quantity (Qtl)', 'अनुमानित मात्रा (क्विंटल)').primary}
                    </label>
                    <input
                      type="number"
                      defaultValue="20"
                      className="w-full h-10 px-3 rounded-xl border border-[#C1C8C3] text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#717974] block mb-1">
                      {bi('વાહન પ્રકાર', 'Vehicle Type', 'वाहन प्रकार').primary}
                    </label>
                    <select className="w-full h-10 px-3 rounded-xl border border-[#C1C8C3] text-xs font-bold bg-white">
                      <option>{bi('ટ્રેક્ટર ટ્રોલી (Tractor)', 'Tractor Trailer (ટ્રેક્ટર)', 'ट्रैक्टर ट्रॉली').primary}</option>
                      <option>{bi('પિકઅપ ટેમ્પો (Pickup)', 'Pickup Tempo (છોટા હાથી)', 'पिकअप टेम्पो').primary}</option>
                      <option>{bi('બળદ ગાડું (Cart)', 'Bullock Cart (ગાડું)', 'बैलगाड़ी').primary}</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowGatePassModal(null)}
                    className="px-4 py-2 bg-[#F1EEE5] text-[#414844] rounded-xl text-xs font-bold"
                  >
                    {bi('રદ કરો (Cancel)', 'Cancel', 'रद्द करें').primary}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#163A2D] text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-950"
                  >
                    {bi('બુકિંગ કન્ફર્મ કરો', 'Confirm Booking', 'बुकिंग पक्की करें').primary}
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
