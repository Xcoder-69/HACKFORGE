import React from 'react';
import type { Language } from '../../i18n/translations';

interface LanguageCardProps {
  code: Language;
  name: string;
  sub: string;
  badgeSymbol: string;
  isSelected: boolean;
  selectedLabel: string;
  onSelect: (lang: Language) => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({
  code,
  name,
  sub,
  badgeSymbol,
  isSelected,
  selectedLabel,
  onSelect,
}) => {
  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onSelect(code)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(code);
        }
      }}
      className={`group cursor-pointer relative flex items-center justify-between p-3.5 px-4 rounded-2xl transition-all duration-200 active:scale-[0.99] border-2 ${
        isSelected
          ? 'border-secondary bg-secondary-container/20 shadow-[0_2px_12px_rgba(47,125,74,0.12)]'
          : 'border-transparent bg-surface-container-lowest hover:bg-surface-container/50 shadow-[0_1px_4px_rgba(22,58,45,0.05)]'
      }`}
    >
      <div className="flex items-center gap-3.5">
        {/* Language Initial Avatar */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-colors ${
            isSelected
              ? 'bg-secondary-container text-primary font-extrabold'
              : 'bg-surface-container text-on-surface-variant font-bold'
          }`}
        >
          {badgeSymbol}
        </div>

        {/* Text and Active Label */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-primary font-sans">{name}</span>
            {isSelected && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary text-white text-[11px] font-semibold tracking-wide">
                {selectedLabel}
              </span>
            )}
          </div>
          <span className="text-xs text-on-surface-variant font-medium mt-0.5">{sub}</span>
        </div>
      </div>

      {/* Radio Checkmark Circle */}
      <div
        className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
          isSelected
            ? 'bg-secondary text-white shadow-sm'
            : 'bg-surface-container text-transparent'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">check</span>
      </div>
    </div>
  );
};
