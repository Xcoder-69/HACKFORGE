import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { AlertItem, AlertStatus, AlertType } from '../../types';
import { alertService } from '../../services/alertService';

export const AlertsActionCenter: React.FC = () => {
  const navigate = useNavigate();
  const { language, bi } = useLanguage();

  const [alerts, setAlerts] = useState<AlertItem[]>(() => alertService.getAlerts());
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'active' | 'resolved' | 'all'>('active');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'critical' | 'weather' | 'crop' | 'market' | 'soil' | 'system'>('all');

  const runEvaluation = async () => {
    setIsEvaluating(true);
    try {
      await alertService.evaluateAllAlerts();
      setAlerts(alertService.getAlerts());
    } catch (err) {
      console.warn('[AlertsActionCenter] Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    runEvaluation();
    const unsub = alertService.subscribeToAlerts((updated) => setAlerts(updated));
    return unsub;
  }, []);

  const summary = alertService.getAlertSummary();

  const markAllRead = () => {
    alertService.markAllAsRead();
  };

  const toggleRead = (id: string) => {
    alertService.toggleRead(id);
  };

  const resolveAlert = (id: string) => {
    alertService.resolveAlert(id);
  };

  const deleteAlert = (id: string) => {
    alertService.deleteAlert(id);
  };

  const filteredAlerts = alerts.filter((a) => {
    // Status Filter
    if (statusFilter === 'active') {
      if (a.status === 'RESOLVED' || a.status === 'EXPIRED') return false;
    } else if (statusFilter === 'resolved') {
      if (a.status !== 'RESOLVED') return false;
    }

    // Category Filter: All, Critical, Weather, Crop, Market, Soil, System
    if (categoryFilter === 'critical') {
      if (a.priority !== 'Critical') return false;
    } else if (categoryFilter === 'weather') {
      if (a.type !== 'weather') return false;
    } else if (categoryFilter === 'crop') {
      if (a.type !== 'crop') return false;
    } else if (categoryFilter === 'market') {
      if (a.type !== 'market') return false;
    } else if (categoryFilter === 'soil') {
      if (a.type !== 'soil') return false;
    } else if (categoryFilter === 'system') {
      if (a.type !== 'diagnosis' && a.type !== 'recommendation' && a.type !== 'irrigation') return false;
    }

    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#FCF9F0] text-[#1C1C17] pb-24 md:pb-12 font-sans antialiased">
      {/* Top Header */}
      <div className="bg-[#163A2D] text-white py-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              <span>{bi('લાઇવ પ્રાયોરિટી રડાર • ચેતવણી અને કાર્યો', 'Live Priority Radar • Advisory & Field Actions', 'Live Priority Radar • Advisory va Khet Kary').primary}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {bi('ખેતર ચેતવણી અને સલાહ કેન્દ્ર', 'Alerts & Recommended Action Center', 'Khet Alert va Salah Kendra').primary}
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-0.5">
              {bi(
                'હવામાન, પાક તબક્કા, બજાર ભાવ અને જમીન રિપોર્ટ આધારિત વાસ્તવિક ચેતવણીઓ',
                'Real-time agronomic alerts generated strictly from live weather, crop milestones, market prices & lab reports',
                'Live mausam, fasal avastha, mandi bhav aur mitti report aadharit alerts'
              ).primary}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={runEvaluation}
              disabled={isEvaluating}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors border border-white/20 disabled:opacity-50"
              title="Re-run real-time telemetry and rule evaluation"
            >
              <span className={`material-symbols-outlined text-[18px] ${isEvaluating ? 'animate-spin' : ''}`}>sync</span>
              <span>{isEvaluating ? bi('તપાસ ચાલુ છે...', 'Evaluating...', 'Jaanch Jari Hai...').primary : bi('લાઇવ સ્કેન', 'Re-check Alerts', 'Live Scan').primary}</span>
            </button>

            <button
              type="button"
              onClick={markAllRead}
              className="px-3.5 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              <span>{bi('બધું વંચાઈ ગયું', 'Mark All Read', 'Sab Padha Gaya').primary}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Unread Counter Banner */}
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-[#E5E2DA] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                summary.activeCount > 0
                  ? summary.criticalCount > 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <span className="material-symbols-outlined text-[26px]">
                {summary.activeCount > 0 ? (summary.criticalCount > 0 ? 'crisis_alert' : 'warning') : 'check_circle'}
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base md:text-lg text-[#163A2D]">
                {summary.activeCount > 0
                  ? `${summary.activeCount} ${bi('સક્રિય ખેતર ચેતવણીઓ ધ્યાનાર્થે', 'Active Field Alerts Pending', 'Active Khet Alerts Pending').primary}`
                  : bi('બધી ચેતવણીઓનું નિરાકરણ થઈ ગયું છે', 'All Farm Alerts Cleared', 'Sabhi Alerts Clear Ho Gaye Hain').primary}
              </h3>
              <p className="text-xs text-[#717974] mt-0.5">
                {summary.activeCount > 0
                  ? `${summary.criticalCount > 0 ? `${summary.criticalCount} ${bi('તાત્કાલિક જોખમ', 'Critical priority', 'Critical alert').primary} • ` : ''}${summary.unreadCount} ${bi('નવી વણવાંચેલી ચેતવણીઓ', 'unread items', 'unpadhi alerts').primary}`
                  : bi('તમામ પરિમાણો સુરક્ષિત અને સામાન્ય સ્તરે કાર્યરત છે', 'All agronomic parameters are currently safe and optimal', 'Sabhi sanket surakshit aur samanya hain').primary}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200/60 text-xs font-bold rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              Live Rule Engine Active
            </span>
          </div>
        </div>

        {/* Status Tabs: Active vs Resolved vs All */}
        <div className="flex items-center gap-2 border-b border-[#E5E2DA] pb-2">
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'active'
                ? 'bg-[#163A2D] text-white shadow-sm'
                : 'bg-white text-[#414844] hover:bg-[#F1EEE5] border border-[#E5E2DA]'
            }`}
          >
            <span>{bi('સક્રિય ચેતવણીઓ', 'Active Alerts', 'Active Alerts').primary}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${statusFilter === 'active' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {summary.activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('resolved')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'resolved'
                ? 'bg-[#163A2D] text-white shadow-sm'
                : 'bg-white text-[#414844] hover:bg-[#F1EEE5] border border-[#E5E2DA]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{bi('ઉકેલાયેલ', 'Resolved', 'Resolved').primary}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${statusFilter === 'resolved' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {alerts.filter((a) => a.status === 'RESOLVED').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-[#163A2D] text-white shadow-sm'
                : 'bg-white text-[#414844] hover:bg-[#F1EEE5] border border-[#E5E2DA]'
            }`}
          >
            <span>{bi('તમામ', 'All History', 'Sabhi').primary}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {alerts.length}
            </span>
          </button>
        </div>

        {/* Category Pills: All, Critical, Weather, Crop, Market, Soil, System */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-[#163A2D] text-white'
                : 'bg-white text-slate-700 hover:bg-[#F1EEE5] border border-[#E5E2DA]'
            }`}
          >
            {bi('બધા (All)', 'All', 'Sabhi').primary}
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('critical')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              categoryFilter === 'critical'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white text-red-800 hover:bg-red-50 border border-red-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>{bi('કટોકટી (Critical)', 'Critical', 'Critical').primary}</span>
            <span className="text-[10px] font-mono opacity-80">({summary.criticalCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('weather')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              categoryFilter === 'weather'
                ? 'bg-[#163A2D] text-white'
                : 'bg-white text-slate-700 hover:bg-[#F1EEE5] border border-[#E5E2DA]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-amber-600">wb_sunny</span>
            <span>{bi('હવામાન (Weather)', 'Weather', 'Mausam').primary}</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('crop')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              categoryFilter === 'crop'
                ? 'bg-[#163A2D] text-white'
                : 'bg-white text-slate-700 hover:bg-[#F1EEE5] border border-[#E5E2DA]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-emerald-600">eco</span>
            <span>{bi('પાક તબક્કા (Crop)', 'Crop', 'Fasal').primary}</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('market')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              categoryFilter === 'market'
                ? 'bg-[#163A2D] text-white'
                : 'bg-white text-slate-700 hover:bg-[#F1EEE5] border border-[#E5E2DA]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-teal-600">storefront</span>
            <span>{bi('બજાર (Market)', 'Market', 'Mandi').primary}</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('soil')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              categoryFilter === 'soil'
                ? 'bg-[#163A2D] text-white'
                : 'bg-white text-slate-700 hover:bg-[#F1EEE5] border border-[#E5E2DA]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-amber-700">science</span>
            <span>{bi('જમીન રિપોર્ટ (Soil)', 'Soil', 'Mitti').primary}</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('system')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              categoryFilter === 'system'
                ? 'bg-[#163A2D] text-white'
                : 'bg-white text-slate-700 hover:bg-[#F1EEE5] border border-[#E5E2DA]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-purple-600">settings_suggest</span>
            <span>{bi('સિસ્ટમ & AI (System)', 'System', 'System').primary}</span>
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => {
              const isResolved = alert.status === 'RESOLVED';
              const isExpired = alert.status === 'EXPIRED';
              const isCrit = alert.priority === 'Critical';
              const isHigh = alert.priority === 'High';

              const title =
                language === 'gu' && alert.titleGu
                  ? alert.titleGu
                  : language === 'hi' && alert.titleHi
                  ? alert.titleHi
                  : alert.titleEn || alert.title;

              const description =
                language === 'gu' && alert.descriptionGu
                  ? alert.descriptionGu
                  : language === 'hi' && alert.descriptionHi
                  ? alert.descriptionHi
                  : alert.descriptionEn || alert.message;

              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl p-5 md:p-6 transition-all shadow-sm border ${
                    isResolved
                      ? 'bg-emerald-50/40 border-emerald-200/60 opacity-80'
                      : isExpired
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : !alert.read
                      ? isCrit
                        ? 'bg-white border-l-4 border-l-red-600 border-[#E5E2DA] shadow-md'
                        : isHigh
                        ? 'bg-white border-l-4 border-l-amber-500 border-[#E5E2DA] shadow-md'
                        : 'bg-white border-l-4 border-l-blue-500 border-[#E5E2DA] shadow-md'
                      : 'bg-white/90 border-[#E5E2DA]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Priority Icon Box */}
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isResolved
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCrit
                            ? 'bg-red-100 text-red-700'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[24px]">
                          {isResolved
                            ? 'check_circle'
                            : alert.type === 'weather'
                            ? 'thunderstorm'
                            : alert.type === 'crop'
                            ? 'spa'
                            : alert.type === 'market'
                            ? 'trending_up'
                            : alert.type === 'soil'
                            ? 'science'
                            : alert.type === 'diagnosis'
                            ? 'pest_control'
                            : 'notifications'}
                        </span>
                      </div>

                      {/* Content Body */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Priority Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${
                              isCrit
                                ? 'bg-red-50 text-red-800 border-red-200'
                                : isHigh
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {alert.priority}
                          </span>

                          {/* Source Badge with explicit Source: prefix */}
                          <span className="px-2 py-0.5 rounded-md bg-[#F6F3EA] text-[#163A2D] text-[11px] font-bold border border-[#E5E2DA] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">verified</span>
                            <span>Source: {alert.source}</span>
                          </span>

                          {/* Related Farm / Plot Badge when available */}
                          {(alert.plotId || alert.relatedCropId || alert.dataValues?.crop) && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 text-[11px] font-bold border border-emerald-200/60 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">potted_plant</span>
                              <span>
                                {alert.plotId ? `Plot ${alert.plotId.replace('plot_', '')}` : 'Farm'}
                                {alert.dataValues?.crop ? ` • ${alert.dataValues.crop}` : ''}
                              </span>
                            </span>
                          )}

                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                              isResolved
                                ? 'bg-emerald-100 text-emerald-900'
                                : isExpired
                                ? 'bg-slate-200 text-slate-700'
                                : alert.read
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-100 text-amber-900 animate-pulse'
                            }`}
                          >
                            {isResolved ? 'RESOLVED' : isExpired ? 'EXPIRED' : alert.read ? 'READ' : 'NEW'}
                          </span>

                          <span className="text-xs text-[#717974]">• {alert.time}</span>
                        </div>

                        {/* Title */}
                        <h3 className="font-extrabold text-base md:text-lg text-[#163A2D] leading-snug">
                          {title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs md:text-sm text-[#414844] leading-relaxed">
                          {description}
                        </p>

                        {/* Data Values Indicator if available */}
                        {alert.dataValues && (
                          <div className="pt-1 flex items-center gap-2 flex-wrap text-[11px] text-[#717974]">
                            {alert.dataValues.rainMm && (
                              <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">
                                Rainfall: {alert.dataValues.rainMm} mm
                              </span>
                            )}
                            {alert.dataValues.currentPrice && (
                              <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">
                                Rate: ₹{alert.dataValues.currentPrice}/Qtl
                              </span>
                            )}
                            {alert.dataValues.cropAgeDays != null && (
                              <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">
                                Age: Day {alert.dataValues.cropAgeDays}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex items-center md:flex-col gap-2 shrink-0 pt-2 md:pt-0">
                      {alert.actionRoute && (
                        <button
                          type="button"
                          onClick={() => {
                            alertService.markAsRead(alert.id);
                            navigate(alert.actionRoute);
                          }}
                          className="flex-1 md:w-full px-4 py-2 bg-[#163A2D] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <span>{alert.actionText || bi('પગલાં લો', 'Take Action', 'Action Lein').primary}</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      )}

                      {!isResolved && (
                        <button
                          type="button"
                          onClick={() => resolveAlert(alert.id)}
                          className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
                          title="Mark risk or advisory task as completed"
                        >
                          <span className="material-symbols-outlined text-[15px]">check</span>
                          <span>{bi('ઉકેલો', 'Resolve', 'Resolve').primary}</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1 w-full">
                        <button
                          type="button"
                          onClick={() => toggleRead(alert.id)}
                          className="flex-1 px-3 py-2 bg-[#F6F3EA] hover:bg-[#E5E2DA] text-[#1C1C17] rounded-xl text-xs font-semibold transition-colors shrink-0"
                        >
                          {alert.read ? bi('વણવાંચેલ કરો', 'Mark Unread', 'Unread').primary : bi('વંચાયેલ', 'Mark Read', 'Read').primary}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors shrink-0"
                          title="Dismiss alert"
                          aria-label="Dismiss alert"
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#E5E2DA] space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px]">verified</span>
              </div>
              <h3 className="font-extrabold text-lg text-[#163A2D]">
                {bi('કોઈ સક્રિય ચેતવણી નથી', 'No active alerts in this view', 'Is category mein koi active alert nahi hai').primary}
              </h3>
              <p className="text-xs sm:text-sm text-[#717974] max-w-md mx-auto">
                {bi(
                  'તમામ ખેતી પરિમાણો, હવામાન આગાહી અને પાક તબક્કા સામાન્ય અને સુરક્ષિત સ્તરે છે. જ્યારે નવું જોખમ કે ઘટના બનશે ત્યારે અહીં આપોઆપ ચેતવણી જોવા મળશે.',
                  'All agronomic parameters, weather forecasts, and crop stages are within safe thresholds. Real alerts will automatically appear here when new hazards or events are detected.',
                  'Sabhi fasal parameters aur mausam surakshit hain. Nayi ghatna par yahan alert apne aap aa jayega.'
                ).primary}
              </p>
              <button
                type="button"
                onClick={runEvaluation}
                className="mt-2 px-4 py-2 bg-[#163A2D] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>{bi('હમણાં જ તપાસ કરો', 'Scan Now', 'Abhi Check Karein').primary}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
