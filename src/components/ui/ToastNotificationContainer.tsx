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
      className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none"
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

        const isAlert = toast.type === 'alert';
        const isWarning = toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        const borderColor = isAlert
          ? 'border-red-500/50'
          : isWarning
          ? 'border-amber-500/50'
          : isSuccess
          ? 'border-emerald-500/50'
          : 'border-[#163A2D]/30';

        const iconBg = isAlert
          ? 'bg-red-100 text-red-700'
          : isWarning
          ? 'bg-amber-100 text-amber-800'
          : isSuccess
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-[#163A2D]/10 text-[#163A2D]';

        const iconName = isAlert
          ? 'crisis_alert'
          : isWarning
          ? 'warning'
          : isSuccess
          ? 'check_circle'
          : 'notifications';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border ${borderColor} flex items-start gap-3 transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
              <span className="material-symbols-outlined text-[20px]">{iconName}</span>
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs sm:text-sm font-extrabold text-[#163A2D] truncate">{title}</h4>
                <button
                  type="button"
                  onClick={() => notificationService.dismissToast(toast.id)}
                  className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0"
                  aria-label="Dismiss notification"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              {message && <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">{message}</p>}

              {toast.actionRoute && (
                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (toast.actionRoute) {
                        navigate(toast.actionRoute);
                      }
                      notificationService.dismissToast(toast.id);
                    }}
                    className="text-[11px] font-bold text-[#2F7D4A] hover:text-[#163A2D] flex items-center gap-1 transition-colors"
                  >
                    <span>{toast.actionText || 'View Details'}</span>
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
