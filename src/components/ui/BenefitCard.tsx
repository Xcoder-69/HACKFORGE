import React from 'react';

interface BenefitCardProps {
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  title: string;
  subtitle: string;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({
  icon,
  iconBgClass,
  iconColorClass,
  title,
  subtitle,
}) => {
  return (
    <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-[0_1px_4px_rgba(22,58,45,0.06)] border border-outline-variant/15 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${iconBgClass} flex items-center justify-center ${iconColorClass} flex-shrink-0`}>
        <span className="material-symbols-outlined text-[22px] fill">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-primary truncate leading-tight">{title}</p>
        <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
};
