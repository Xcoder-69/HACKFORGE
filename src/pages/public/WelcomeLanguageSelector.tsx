import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Language } from '../../i18n/translations';
import { LanguageCard } from '../../components/ui/LanguageCard';
import { LanguageModal } from '../../components/ui/LanguageModal';
import { BenefitCard } from '../../components/ui/BenefitCard';

import { useAuth } from '../../contexts/AuthContext';

export const WelcomeLanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const languageOptions: {
    code: Language;
    name: string;
    sub: string;
    badgeSymbol: string;
  }[] = [
    {
      code: 'gu',
      name: 'ગુજરાતી',
      sub: 'Gujarati • મુખ્ય પસંદગી',
      badgeSymbol: 'ગુ',
    },
    {
      code: 'hi',
      name: 'हिन्दी',
      sub: 'Hindi • आसान और सरल',
      badgeSymbol: 'हि',
    },
    {
      code: 'en',
      name: 'English',
      sub: 'English • Global standard',
      badgeSymbol: 'EN',
    },
  ];

  const handleStart = () => {
    // If farmer is already logged in, enter directly into farmer dashboard
    if (user) {
      navigate('/home');
    } else {
      // New farmer onboarding journey: start with quick registration tab
      navigate('/login?tab=register');
    }
  };

  const handleLogin = () => {
    navigate('/login?tab=login');
  };


  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low font-sans antialiased text-on-surface">
      {/* Fixed Sticky Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-surface-container-low/95 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_1px_8px_rgba(22,58,45,0.05)] pt-safe">
        <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between gap-2">
          {/* Back button and title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              aria-label={t('nav.back')}
              onClick={() => window.history.length > 1 ? navigate(-1) : null}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors active:scale-95 -ml-1"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            
            <div className="flex items-center gap-2 truncate">
              <span className="material-symbols-outlined text-secondary text-[26px]">eco</span>
              <h1 className="text-base font-bold text-primary truncate">
                {t('nav.title')}
              </h1>
            </div>
          </div>

          {/* Quick Language Pill Switcher */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            title={t('modal.title')}
            className="min-h-[38px] px-3.5 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant text-xs shadow-[0_1px_4px_rgba(22,58,45,0.08)] flex items-center gap-1.5 hover:bg-surface-container transition-all active:scale-95 border border-outline-variant/30 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">language</span>
            <span className="tracking-wide font-bold">{t('nav.lang')}</span>
          </button>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1 flex flex-col items-center pt-20 pb-8 px-4 w-full">
        <div className="w-full max-w-md flex flex-col space-y-5">
          
          {/* Brand & Mascot Intro Card */}
          <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest shadow-[0_2px_12px_rgba(22,58,45,0.06)] p-4 sm:p-5 flex flex-col items-center text-center border border-outline-variant/20">
            {/* Ambient Background Glows */}
            <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-secondary-container/40 blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-primary-fixed/40 blur-2xl pointer-events-none" />

            {/* Small Agricultural Trust Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/50 text-secondary mb-3">
              <span className="material-symbols-outlined text-[16px] fill">eco</span>
              <span className="text-[11px] tracking-wide uppercase font-extrabold">
                {t('brand.pill')}
              </span>
            </div>

            {/* Indian Farming Illustration Banner */}
            <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 shadow-sm group">
              <img
                src="/farmer-hero.jpg"
                alt="Indian progressive farmer standing happily in a sunlit agricultural field"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent flex flex-col justify-end p-3 text-left">
                <span className="text-[10px] text-primary-fixed uppercase tracking-wider font-bold">
                  {t('banner.tag')}
                </span>
                <p className="text-sm text-white font-bold leading-tight mt-0.5">
                  {t('banner.headline')}
                </p>
              </div>
            </div>

            {/* Welcoming Header */}
            <div className="space-y-1 max-w-xs">
              <h2 className="text-lg font-extrabold text-primary tracking-tight font-sans">
                {t('welcome.title')}
              </h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t('welcome.subtitle')}
              </p>
            </div>
          </div>

          {/* Interactive Language Selection Stack */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">translate</span>
                {t('lang.selectLabel')}
              </label>
              <span className="text-[11px] text-on-surface-variant font-medium">
                {t('lang.count')}
              </span>
            </div>

            <div
              className="space-y-2.5"
              role="radiogroup"
              aria-label="Language selection options"
            >
              {languageOptions.map((opt) => (
                <LanguageCard
                  key={opt.code}
                  code={opt.code}
                  name={opt.name}
                  sub={opt.sub}
                  badgeSymbol={opt.badgeSymbol}
                  isSelected={language === opt.code}
                  selectedLabel={t('lang.selected')}
                  onSelect={(selectedCode) => setLanguage(selectedCode)}
                />
              ))}
            </div>

            {/* Micro-Note with Icon */}
            <div className="flex items-center gap-1.5 pt-1 px-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[15px] text-outline flex-shrink-0">tune</span>
              <p className="text-[11px] text-on-surface-variant">
                {t('lang.note')}
              </p>
            </div>
          </div>

          {/* Key Benefits Preview Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <BenefitCard
              icon="sensors"
              iconBgClass="bg-primary-fixed/60"
              iconColorClass="text-primary"
              title={t('benefit1.title')}
              subtitle={t('benefit1.sub')}
            />
            <BenefitCard
              icon="currency_rupee"
              iconBgClass="bg-secondary-container"
              iconColorClass="text-secondary"
              title={t('benefit2.title')}
              subtitle={t('benefit2.sub')}
            />
          </div>

          {/* Actions Area */}
          <div className="flex flex-col space-y-2.5 pt-1">
            {/* Primary CTA: Get Started */}
            <button
              type="button"
              onClick={handleStart}
              className="w-full min-h-[52px] px-4 py-3 rounded-2xl bg-secondary hover:bg-primary text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 font-bold text-base tracking-wide"
            >
              <span>{t('btn.start')}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>

            {/* Secondary Action: Login */}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl bg-surface-container-lowest hover:bg-surface-container text-primary font-semibold text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm border border-outline-variant/20"
            >
              <span>{t('login.prompt')}</span>
              <span className="text-secondary font-bold underline underline-offset-4">
                {t('login.action')}
              </span>
            </button>
          </div>

          {/* Reassurance & Farmer Privacy Footer */}
          <div className="flex flex-col items-center text-center space-y-1 pt-2 pb-6">
            <div className="inline-flex items-center gap-1.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-secondary fill">verified_user</span>
              <span className="text-[11px] font-bold text-primary">
                {t('footer.trust')}
              </span>
            </div>
            <p className="text-[10px] text-outline max-w-xs leading-relaxed">
              {t('footer.offline')}
            </p>
          </div>

        </div>
      </main>

      {/* Language Quick-Switch Modal */}
      <LanguageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
