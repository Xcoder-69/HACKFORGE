import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { financialService } from '../../services/financialService';
import { farmService } from '../../services/farmService';
import type { ExpenseItem, ExpenseCategory } from '../../types';

export const ExpenseTracker: React.FC = () => {
  const navigate = useNavigate();
  const { language, bi } = useLanguage();
  const { user } = useAuth();

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => financialService.getExpenses());
  const [plots, setPlots] = useState(() => farmService.getPlots());
  const [filterPlot, setFilterPlot] = useState<string>('All');
  const [filterCat, setFilterCat] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const unsub = financialService.subscribe(() => {
      setExpenses(financialService.getExpenses());
      setPlots(farmService.getPlots());
    });
    return unsub;
  }, []);

  // Form state
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formCat, setFormCat] = useState<ExpenseCategory>('Fertilizers');
  const [formTitle, setFormTitle] = useState('');
  const [formPlot, setFormPlot] = useState(() => {
    const plotKeys = Object.keys(plots);
    return plotKeys.length > 0 ? (plots[plotKeys[0]]?.name || 'Block A') : 'General Farm';
  });
  const [formAmount, setFormAmount] = useState('');
  const [formPay, setFormPay] = useState<'UPI' | 'Cash' | 'Mandli Credit'>('UPI');

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const budget = 65000;
  const budgetPercent = Math.min(100, Math.round((totalExpense / budget) * 100));

  const filteredExpenses = expenses.filter((e) => {
    if (filterPlot !== 'All' && !e.plot.includes(filterPlot)) return false;
    if (filterCat !== 'All' && e.category !== filterCat) return false;
    return true;
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAmount) return;

    financialService.addExpense({
      date: formDate,
      category: formCat,
      categoryGu: formCat === 'Fertilizers' ? 'ખાતર' : formCat === 'Seeds' ? 'બિયારણ' : formCat === 'Labor' ? 'મજૂરી' : 'અન્ય',
      title: formTitle,
      plot: formPlot,
      amount: parseFloat(formAmount),
      paymentMethod: formPay,
    });

    setShowAddModal(false);
    setFormTitle('');
    setFormAmount('');
  };

  return (
    <div className="w-full min-h-screen bg-[#FCF9F0] text-[#1C1C17] pb-24 md:pb-12">
      {/* Top Header */}
      <div className="bg-[#163A2D] text-white py-4 sm:py-6 px-3 sm:px-6 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1">
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">receipt_long</span>
              <span>{bi('ખેતી ખર્ચ હિસાબ', 'Farm Financial Ledger', 'खेत वित्तीय लेजर').primary}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              {bi('ખેતી ખર્ચ અને બજેટ ટ્રેકર', 'Farm Expense Tracker', 'खेत खर्च व बजट ट्रैकर').primary}
            </h1>
            <p className="text-emerald-300/90 text-[11px] sm:text-xs font-semibold mt-0.5">
              {bi('ખેતી ખર્ચ અને બજેટ હિસાબ', 'Farm Expense & Budget Tracker', 'खेत खर्च और बजट ट्रैकर').primary}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[20px]">add</span>
              <span className="truncate">{bi('+ નવો ખર્ચ', '+ Add Expense', '+ नया खर्च').primary}</span>
            </button>
            <button
              onClick={() => navigate('/profit')}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors border border-white/20"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">trending_up</span>
              <span className="truncate">{bi('નફો અને આવક', 'Profit & Revenue', 'लाभ व आय').primary}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 md:px-8 pt-3 sm:pt-6 space-y-4 sm:space-y-6">
        {/* KPI Cards - 2x2 on mobile, 4x1 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E5E2DA] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] sm:text-xs text-[#717974] font-bold uppercase block truncate">Season OpEx</span>
              <div className="text-xl sm:text-3xl font-black text-[#163A2D] mt-0.5 sm:mt-1 truncate">
                ₹{totalExpense.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-emerald-700 font-semibold mt-1 block truncate">
                {budgetPercent}% of budget
              </span>
              <div className="w-full bg-[#E5E2DA] h-1.5 sm:h-2 rounded-full overflow-hidden mt-1.5 sm:mt-3">
                <div
                  className={`h-full rounded-full ${
                    budgetPercent > 90 ? 'bg-red-600' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E5E2DA] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] sm:text-xs text-[#717974] font-bold uppercase block truncate">Cost / Acre</span>
              <div className="text-xl sm:text-3xl font-black text-[#163A2D] mt-0.5 sm:mt-1 truncate">₹8,845</div>
            </div>
            <span className="text-[10px] sm:text-xs text-emerald-700 font-semibold mt-1 block truncate">
              Across 5.5 Acres
            </span>
          </div>

          <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E5E2DA] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] sm:text-xs text-[#717974] font-bold uppercase block truncate">Mandli Credit</span>
              <div className="text-xl sm:text-3xl font-black text-amber-700 mt-0.5 sm:mt-1 truncate">₹21,000</div>
            </div>
            <span className="text-[10px] sm:text-xs text-[#717974] font-semibold mt-1 block truncate">
              Due post-harvest
            </span>
          </div>

          <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E5E2DA] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] sm:text-xs text-[#717974] font-bold uppercase block truncate">AI Efficiency</span>
              <div className="text-xl sm:text-3xl font-black text-emerald-700 mt-0.5 sm:mt-1 truncate">92 / 100</div>
            </div>
            <span className="text-[10px] sm:text-xs text-emerald-800 font-semibold mt-1 block truncate">
              12% below avg.
            </span>
          </div>
        </div>

        {/* AI Financial Insight Banner */}
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex items-start gap-2.5 sm:gap-3 shadow-sm">
          <span className="material-symbols-outlined text-emerald-700 text-[20px] sm:text-[26px] mt-0.5 shrink-0">insights</span>
          <div>
            <h4 className="font-extrabold text-xs sm:text-base text-emerald-950">
              AI Smart Cost Analysis (ખર્ચ બચત વિશ્લેષણ):
            </h4>
            <p className="text-[11px] sm:text-sm text-emerald-900 mt-0.5 sm:mt-1 leading-snug sm:leading-relaxed">
              Your precision fertigation via drip in Block A saved ₹3,400 in fertilizer run-off compared to flood irrigation. Consider settling the Sahakari Mandli seed loan before September 15 to benefit from the 3% prompt repayment interest subvention.
            </p>
          </div>
        </div>

        {/* Filters & Ledger Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm border border-[#E5E2DA] space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 pb-3 sm:pb-4 border-b border-[#E5E2DA]">
            <h2 className="text-base sm:text-xl font-extrabold text-[#163A2D] flex items-center gap-1.5 sm:gap-2">
              <span className="material-symbols-outlined text-emerald-700 text-[18px] sm:text-[22px]">list_alt</span>
              <span>Expenses Ledger ({filteredExpenses.length})</span>
            </h2>

            {/* Filters */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-[#F6F3EA] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-[#E5E2DA] text-xs">
                <span className="text-[#717974] font-bold">Plot:</span>
                <select
                  value={filterPlot}
                  onChange={(e) => setFilterPlot(e.target.value)}
                  className="bg-transparent font-bold text-[#163A2D] outline-none cursor-pointer text-xs"
                >
                  <option value="All">All Plots</option>
                  {Object.keys(plots).length > 0 ? (
                    Object.values(plots).map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="Block A">Block A</option>
                      <option value="Block B">Block B</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#F6F3EA] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-[#E5E2DA] text-xs">
                <span className="text-[#717974] font-bold">Category:</span>
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="bg-transparent font-bold text-[#163A2D] outline-none cursor-pointer text-xs"
                >
                  <option value="All">All Categories</option>
                  <option value="Seeds">Seeds</option>
                  <option value="Fertilizers">Fertilizers</option>
                  <option value="Pesticides">Pesticides</option>
                  <option value="Labor">Labor</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Irrigation">Irrigation</option>
                </select>
              </div>
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                <span className="material-symbols-outlined text-[30px]">receipt_long</span>
              </div>
              <h4 className="font-bold text-[#163A2D] text-base">
                {bi('કોઈ ખર્ચ નોંધાયેલ નથી', 'No Expenses Recorded Yet', 'Koi kharch darj nahi hai').primary}
              </h4>
              <p className="text-xs text-[#717974] max-w-sm mx-auto">
                {bi(
                  'બિયારણ, ખાતર, દવાઓ અથવા મજૂરી ખર્ચ ઉમેરવા માટે ઉપર "+ નવો ખર્ચ" બટન દબાવો.',
                  'Click "+ Add Expense" above to record your seeds, fertilizer, labor, or fuel costs.',
                  'Naya kharch jodne ke liye upar button dabayein.'
                ).primary}
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>{bi('+ પ્રથમ ખર્ચ ઉમેરો', '+ Add First Expense', '+ Pehla Kharch Jodein').primary}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Card List View (md:hidden) */}
              <div className="block md:hidden space-y-2.5">
                {filteredExpenses.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#F6F3EA]/70 border border-[#E5E2DA] space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-[#163A2D] leading-tight">{item.title}</h4>
                        <span className="text-[11px] text-[#717974]">{item.date} • {item.plot}</span>
                      </div>
                      <span className="text-base font-black text-[#163A2D] shrink-0">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-[#E5E2DA]/60">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-[#1C1C17] border border-[#E5E2DA]">
                        {item.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (hidden md:block) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#F1EEE5] text-[#717974] text-xs font-bold uppercase">
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2">Category</th>
                      <th className="py-3 px-2">Description</th>
                      <th className="py-3 px-2">Plot</th>
                      <th className="py-3 px-2">Method</th>
                      <th className="py-3 px-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1EEE5]">
                    {filteredExpenses.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FCF9F0] transition-colors">
                        <td className="py-3.5 px-2 text-xs text-[#717974] whitespace-nowrap">{item.date}</td>
                        <td className="py-3.5 px-2">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 font-bold text-[#163A2D]">{item.title}</td>
                        <td className="py-3.5 px-2 text-xs font-semibold text-[#414844]">{item.plot}</td>
                        <td className="py-3.5 px-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F6F3EA] text-[#1C1C17] border border-[#E5E2DA]">
                            {item.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right font-black text-base text-[#163A2D] whitespace-nowrap">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-[#E5E2DA]">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#E5E2DA]">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#163A2D]">Record Farm Expense</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#F1EEE5] flex items-center justify-center text-[#1C1C17]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#717974] block mb-1">Expense Title / Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Zinc Sulphate 25kg"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-[#C1C8C3] focus:border-emerald-600 text-sm font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#717974] block mb-1">Category</label>
                  <select
                    value={formCat}
                    onChange={(e) => setFormCat(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl border border-[#C1C8C3] text-sm font-semibold bg-white"
                  >
                    <option value="Fertilizers">Fertilizers (ખાતર)</option>
                    <option value="Seeds">Seeds (બિયારણ)</option>
                    <option value="Pesticides">Pesticides (દવા)</option>
                    <option value="Labor">Labor (મજૂરી)</option>
                    <option value="Machinery">Machinery (ટ્રેક્ટર)</option>
                    <option value="Irrigation">Irrigation (સિંચાઈ)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#717974] block mb-1">Plot</label>
                  <select
                    value={formPlot}
                    onChange={(e) => setFormPlot(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#C1C8C3] text-sm font-semibold bg-white"
                  >
                    {Object.keys(plots).length > 0 ? (
                      Object.values(plots).map((p) => (
                        <option key={p.id} value={p.name}>{p.name} ({p.crop})</option>
                      ))
                    ) : (
                      <>
                        <option value="General Farm">General Farm</option>
                        <option value="Plot 1">Plot 1</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#717974] block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-[#C1C8C3] focus:border-emerald-600 text-sm font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#717974] block mb-1">Payment Method</label>
                  <select
                    value={formPay}
                    onChange={(e) => setFormPay(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl border border-[#C1C8C3] text-sm font-semibold bg-white"
                  >
                    <option value="UPI">UPI / PhonePe / GPay</option>
                    <option value="Cash">Cash (રોકડ)</option>
                    <option value="Mandli Credit">Sahakari Mandli Credit</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F1EEE5] text-[#414844] font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#163A2D] text-white font-bold text-sm shadow hover:bg-emerald-900"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
