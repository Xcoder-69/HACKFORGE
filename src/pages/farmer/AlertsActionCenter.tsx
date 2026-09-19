import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface AlertItem {
  id: string;
  category: 'urgent' | 'weather' | 'irrigation';
  categoryLabel: string;
  titleEn: string;
  titleGu: string;
  severity: 'Critical' | 'High' | 'Medium';
  severityColor: string;
  time: string;
  descriptionEn: string;
  descriptionGu: string;
  actionText: string;
  actionRoute: string;
  isRead: boolean;
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alert-1',
    category: 'urgent',
    categoryLabel: 'Pest Outbreak / જીવાત',
    titleEn: 'Pink Bollworm Infestation in Kamrej Cluster',
    titleGu: 'કામરેજ વિસ્તારમાં ગુલાબી ઈયળનો ઉપદ્રવ',
    severity: 'Critical',
    severityColor: 'bg-red-100 text-red-800 border-red-300',
    time: '25 mins ago',
    descriptionEn: 'Cluster telemetry detected >8 adult moths per trap in neighboring cotton fields. Immediate pheromone trap installation required.',
    descriptionGu: 'નજીકના કપાસના ખેતરોમાં ટ્રેપ દીઠ ૮ થી વધુ પુખ્ત ફૂદાં નોંધાયા છે. તાત્કાલિક ફેરોમોન ટ્રેપ લગાવો.',
    actionText: 'Scan Field with AI Camera',
    actionRoute: '/ai-camera',
    isRead: false,
  },
  {
    id: 'alert-2',
    category: 'weather',
    categoryLabel: 'Weather Advisory / હવામાન',
    titleEn: 'Heavy Convective Rain Forecast (28mm)',
    titleGu: 'સોમવારે બપોરે ભારે વરસાદની શક્યતા (૨૮ મીમી)',
    severity: 'High',
    severityColor: 'bg-amber-100 text-amber-800 border-amber-300',
    time: '2 hours ago',
    descriptionEn: 'IMD Surat warns of strong convective thunderstorms on Monday afternoon. Delay pesticide spray and clear field drainage furrows.',
    descriptionGu: 'દવા છંટકાવ મુલતવી રાખો અને પાળા સાફ કરો જેથી પાણી ભરાઈ ન રહે.',
    actionText: 'Check Weather & Spray Window',
    actionRoute: '/weather-soil',
    isRead: false,
  },
  {
    id: 'alert-3',
    category: 'irrigation',
    categoryLabel: 'Soil & Nutrition / ખાતર',
    titleEn: 'Phosphorus Deficit in Block A Root Zone',
    titleGu: 'બ્લોક A માં ફોસ્ફરસની અછત નોંધાઈ',
    severity: 'Medium',
    severityColor: 'bg-blue-100 text-blue-800 border-blue-300',
    time: 'Yesterday',
    descriptionEn: 'Soil sensor readings indicate available P is below 24 kg/ha. Apply 25kg Single Super Phosphate (SSP) with next irrigation cycle.',
    descriptionGu: 'જમીન વિશ્લેષણ મુજબ ૨૫ કિગ્રા એસએસપી ખાતર આપવાની ભલામણ છે.',
    actionText: 'Track Fertilizer in Expenses',
    actionRoute: '/expenses',
    isRead: false,
  },
];

export const AlertsActionCenter: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'weather' | 'irrigation'>('all');

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const markAllRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, isRead: true })));
  };

  const toggleRead = (id: string) => {
    setAlerts(
      alerts.map((a) => (a.id === id ? { ...a, isRead: !a.isRead } : a))
    );
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'all') return true;
    return a.category === filter;
  });

  return (
    <div className="w-full min-h-screen bg-[#FCF9F0] text-[#1C1C17] pb-24 md:pb-12">
      {/* Top Header */}
      <div className="bg-[#163A2D] text-white py-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              <span>Live Priority Radar • ચેતવણી અને કાર્યો</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Alerts & Recommended Action Center
            </h1>
            <p className="text-emerald-100/80 text-sm mt-0.5">
              Autonomous agronomic hazard detection and real-time field task prioritization
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={markAllRead}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm flex items-center gap-1.5 transition-colors border border-white/20"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              <span>Mark All Read / બધું વંચાઈ ગયું</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Unread Counter Banner */}
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-[#E5E2DA] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                unreadCount > 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <span className="material-symbols-outlined text-[26px]">
                {unreadCount > 0 ? 'crisis_alert' : 'check_circle'}
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base md:text-lg text-[#163A2D]">
                {unreadCount > 0
                  ? `${unreadCount} Actionable Field Alerts Pending`
                  : 'All Farm Alerts Cleared'}
              </h3>
              <p className="text-xs text-[#717974]">
                {unreadCount > 0
                  ? '૩ નવી ચેતવણીઓ તાત્કાલિક ધ્યાન માંગે છે'
                  : 'બધી ચેતવણીઓનું નિરાકરણ થઈ ગયું છે'}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            Live Sync Active
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all shrink-0 ${
              filter === 'all'
                ? 'bg-[#163A2D] text-white shadow-sm'
                : 'bg-white text-[#414844] hover:bg-[#F1EEE5] border border-[#E5E2DA]'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              filter === 'urgent'
                ? 'bg-[#163A2D] text-white shadow-sm'
                : 'bg-white text-[#414844] hover:bg-[#F1EEE5] border border-[#E5E2DA]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>Urgent / તાત્કાલિક</span>
          </button>
          <button
            onClick={() => setFilter('weather')}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              filter === 'weather'
                ? 'bg-[#163A2D] text-white shadow-sm'
                : 'bg-white text-[#414844] hover:bg-[#F1EEE5] border border-[#E5E2DA]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-amber-600">wb_sunny</span>
            <span>Weather Forecast</span>
          </button>
          <button
            onClick={() => setFilter('irrigation')}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              filter === 'irrigation'
                ? 'bg-[#163A2D] text-white shadow-sm'
                : 'bg-white text-[#414844] hover:bg-[#F1EEE5] border border-[#E5E2DA]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">water_drop</span>
            <span>Soil & Nutrients</span>
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl p-5 md:p-6 transition-all shadow-sm border ${
                alert.isRead
                  ? 'bg-white/80 border-[#E5E2DA] opacity-75'
                  : 'bg-white border-l-4 border-l-red-500 border-[#E5E2DA] shadow-md'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.severity === 'Critical'
                        ? 'bg-red-100 text-red-700'
                        : alert.severity === 'High'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {alert.category === 'urgent'
                        ? 'pest_control'
                        : alert.category === 'weather'
                        ? 'thunderstorm'
                        : 'science'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${alert.severityColor}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs font-semibold text-[#717974]">{alert.categoryLabel}</span>
                      <span className="text-xs text-[#717974]">• {alert.time}</span>
                    </div>

                    <h3 className="font-extrabold text-base md:text-lg text-[#163A2D] mt-1">
                      {alert.titleEn}
                    </h3>
                    <p className="text-xs md:text-sm font-semibold text-emerald-800">{alert.titleGu}</p>
                    <p className="text-xs md:text-sm text-[#414844] mt-2 leading-relaxed">
                      {alert.descriptionEn}
                    </p>
                    <p className="text-xs text-[#717974] mt-1 italic">
                      {alert.descriptionGu}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center md:flex-col gap-2 shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => navigate(alert.actionRoute)}
                    className="flex-1 md:w-full px-4 py-2 bg-[#163A2D] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>{alert.actionText}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>

                  <button
                    onClick={() => toggleRead(alert.id)}
                    className="px-3 py-2 bg-[#F6F3EA] hover:bg-[#E5E2DA] text-[#1C1C17] rounded-xl text-xs font-semibold transition-colors shrink-0"
                  >
                    {alert.isRead ? 'Mark Unread' : 'Dismiss'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
