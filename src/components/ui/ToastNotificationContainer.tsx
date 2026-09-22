import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { notificationService, ToastItem } from '../../services/notificationService';

export const ToastNotificationContainer: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsub = notificationService.subscribe((updatedToasts) => {
      setToasts(updatedToasts);
    });
    return unsub;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 left-3 sm:left-auto sm:w-[400px] max-w-full z-50 flex flex-col gap-2.5 pointer-events-none"
    >
      {toasts.map((toast) => {
        const title =
          language === 'gu' && toast.titleGu
            ? toast.titleGu
            : language === 'hi' && toast.titleHi
            ? toast.titleHi
            : toast.title;

        const message =
          language === 'gu' && toast.messageGu
            ? toast.messageGu
            : language === 'hi' && toast.messageHi
            ? toast.messageHi
            : toast.message;

        const isMarket = toast.type === 'market' || toast.category === 'market';
        const isAlert = toast.type === 'alert' || toast.priority === 'Critical';
        const isWarning = toast.type === 'warning' || toast.priority === 'High';
        const isSuccess = toast.type === 'success';

        // Border & card tinting
        const borderColor = isAlert
          ? 'border-rose-500/60 ring-1 ring-rose-500/20'
          : isMarket
          ? 'border-emerald-500/60 ring-1 ring-emerald-500/20'
          : isWarning
          ? 'border-amber-500/60 ring-1 ring-amber-500/20'
          : isSuccess
          ? 'border-emerald-500/50'
          : 'border-[#163A2D]/30';

        // Left accent bar
        const accentColor = isAlert
          ? 'bg-rose-500'
          : isMarket
          ? 'bg-emerald-500'
          : isWarning
          ? 'bg-amber-500'
          : isSuccess
          ? 'bg-emerald-500'
          : 'bg-[#163A2D]';

        // Icon styling & icon name
        const iconBg = isAlert
          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
          : isMarket
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
          : isWarning
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
          : isSuccess
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-[#163A2D]/10 text-[#163A2D] dark:bg-emerald-900/30 dark:text-emerald-300';

        const iconName = isAlert
          ? 'crisis_alert'
          : isMarket
          ? 'trending_up'
          : isWarning
          ? (toast.category === 'weather' ? 'thunderstorm' : 'warning')
          : isSuccess
          ? 'check_circle'
          : 'notifications';

        // Multilingual category badge
        let categoryLabel = 'Advisory';
        let categoryClass = 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200';

        if (isMarket) {
          categoryLabel = language === 'gu' ? 'બજાર વેચાણ તક' : language === 'hi' ? 'Mandi Bikri Mauka' : 'Market Opportunity';
          categoryClass = 'bg-emerald-100 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300';
        } else if (isAlert) {
          categoryLabel = language === 'gu' ? 'અતિ તાકીદ ચેતવણી' : language === 'hi' ? 'Ati Gambhir Warning' : 'Critical Alert';
          categoryClass = 'bg-rose-100 text-rose-800 font-bold dark:bg-rose-950 dark:text-rose-300';
        } else if (toast.category === 'weather' || isWarning) {
          categoryLabel = language === 'gu' ? 'હવામાન ચેતવણી' : language === 'hi' ? 'Mausam Warning' : 'Weather Risk';
          categoryClass = 'bg-amber-100 text-amber-900 font-bold dark:bg-amber-950 dark:text-amber-300';
        } else if (toast.category === 'crop') {
          categoryLabel = language === 'gu' ? 'પાક સલાહ' : language === 'hi' ? 'Fasal Salah' : 'Crop Advisory';
          categoryClass = 'bg-teal-100 text-teal-900 font-bold dark:bg-teal-950 dark:text-teal-300';
        } else if (isSuccess) {
          categoryLabel = language === 'gu' ? 'સફળતા' : language === 'hi' ? 'Safal' : 'Completed';
          categoryClass = 'bg-emerald-100 text-emerald-800 font-bold';
        }

        const actionLabel =
          toast.actionText ||
          (isMarket
            ? (language === 'gu' ? 'બજાર ભાવ જુઓ' : language === 'hi' ? 'Mandi Bhav Dekhein' : 'Check Mandi')
            : (language === 'gu' ? 'વિગત જુઓ' : language === 'hi' ? 'Vistar Dekhein' : 'View Details'));

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto relative overflow-hidden bg-white/95 dark:bg-[#11221B]/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-2xl border ${borderColor} flex items-start gap-3 transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
          >
            {/* Colored left bar accent */}
            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${accentColor}`} />

            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg} shadow-sm ml-1`}>
              <span className="material-symbols-outlined text-[20px]">{iconName}</span>
            </div>

            <div className="flex-1 min-w-0 pr-0.5">
              <div className="flex items-center justify-between gap-1.5">
                <span className={`text-[10px] tracking-wide px-2 py-0.5 rounded-full ${categoryClass}`}>
                  {categoryLabel}
                </span>

                <button
                  type="button"
                  onClick={() => notificationService.dismissToast(toast.id)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors shrink-0 -mr-1"
                  aria-label="Dismiss notification"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              <h4 className="text-xs sm:text-sm font-extrabold text-[#163A2D] dark:text-white leading-snug mt-1 break-words">
                {title}
              </h4>

              {message && (
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-3 break-words">
                  {message}
                </p>
              )}

              {toast.actionRoute && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    AgroMind AI
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (toast.actionRoute) {
                        navigate(toast.actionRoute);
                      }
                      notificationService.dismissToast(toast.id);
                    }}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#163A2D] text-white hover:bg-[#204e3d] active:scale-95 flex items-center gap-1 shadow-sm transition-all"
                  >
                    <span>{actionLabel}</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
