import React from 'react';
import type { Language } from '../../i18n/translations';
import { useLanguage } from '../../contexts/LanguageContext';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  const languages: { code: Language; name: string; english: string; symbol: string }[] = [
    { code: 'gu', name: 'ગુજરાતી', english: 'Gujarati + English', symbol: 'ગુ' },
    { code: 'hi', name: 'Hinglish', english: 'Hindi (Hinglish)', symbol: 'हि' },
    { code: 'en', name: 'English', english: 'Global Standard', symbol: 'EN' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 shadow-2xl border border-outline-variant/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-secondary text-[24px]">translate</span>
            <h3 className="font-bold text-base text-primary">
              {t('modal.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={t('modal.close')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container active:scale-95 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-2 py-4">
          {languages.map((item) => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                onClick={() => {
                  setLanguage(item.code);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all active:scale-[0.99] ${
                  isSelected
                    ? 'bg-secondary-container/30 border border-secondary/40 font-bold'
                    : 'hover:bg-surface-container/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      isSelected ? 'bg-secondary-container text-primary' : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {item.symbol}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-primary">{item.name}</p>
                    <p className="text-xs text-on-surface-variant">{item.english}</p>
                  </div>
                </div>

                {isSelected && (
                  <span className="material-symbols-outlined text-secondary text-[22px]">
                    check_circle
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
