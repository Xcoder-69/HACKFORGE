import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface RoutePlaceholderProps {
  title: string;
  subtitle: string;
  icon: string;
  screenId?: string;
}

export const RoutePlaceholder: React.FC<RoutePlaceholderProps> = ({
  title,
  subtitle,
  icon,
  screenId,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="max-w-md mx-auto p-4 pt-10 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-3xl bg-secondary-container text-secondary flex items-center justify-center mb-4 shadow-sm">
        <span className="material-symbols-outlined text-[32px] fill">{icon}</span>
      </div>

      <h2 className="text-xl font-bold text-primary font-sans mb-1">{title}</h2>
      <p className="text-xs text-on-surface-variant max-w-xs mb-4">{subtitle}</p>

      {screenId && (
        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-surface-container text-outline mb-6">
          Stitch Screen: {screenId}
        </span>
      )}

      <div className="w-full space-y-2">
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 px-4 rounded-xl bg-secondary text-white text-sm font-bold shadow hover:bg-primary transition-all active:scale-[0.98]"
        >
          {t('nav.title')} (Home / Language)
        </button>
      </div>
    </div>
  );
};
