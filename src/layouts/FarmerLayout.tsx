import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import type { Language } from '../i18n/translations';

export const FarmerLayout: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-on-surface antialiased">
      {/* ========================================================================= */}
      {/* DESKTOP TOP NAVIGATION BAR (Visible on md: and larger screens - Web Mode) */}
      {/* ========================================================================= */}
      <header className="hidden md:flex sticky top-0 inset-x-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_1px_10px_rgba(22,58,45,0.06)] px-6 lg:px-10 h-20 items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/home')}>
          <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[26px]">eco</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-primary tracking-tight leading-tight">
              AgroMind AI
            </span>
            <span className="text-xs text-secondary font-bold">
              Smart Autonomous Farm Platform
            </span>
          </div>
        </div>

        {/* Primary Desktop Navigation Links */}
        <nav className="flex items-center gap-1 xl:gap-2 flex-wrap">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>{t('nav.home')}</span>
          </NavLink>

          <NavLink
            to="/recommendations"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">eco</span>
            <span>Crops</span>
          </NavLink>

          <NavLink
            to="/weather-soil"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
            <span>Weather</span>
          </NavLink>

          <NavLink
            to="/ai-camera"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            <span>AI Camera</span>
          </NavLink>

          <NavLink
            to="/market"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            <span>Mandi</span>
          </NavLink>

          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Expenses</span>
          </NavLink>

          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            <span>Alerts</span>
          </NavLink>

          <NavLink
            to="/ai-assistant"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>AI Advisory</span>
          </NavLink>
        </nav>

        {/* Right Desktop Controls (Language, Profile & Admin link) */}
        <div className="flex items-center gap-3">
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-surface-container rounded-full p-1 border border-outline-variant/30 text-xs">
            {(['gu', 'hi', 'en'] as Language[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                  language === code
                    ? 'bg-secondary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {code === 'gu' ? 'ગુજ' : code === 'hi' ? 'हिन्दी' : 'EN'}
              </button>
            ))}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.name ? user.name.charAt(0) : 'R'}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-primary truncate">
                {user?.name || 'Rameshbhai Patel'}
              </span>
              <span className="text-[10px] text-on-surface-variant">
                {user?.district || 'Surat'} • Verified Farmer
              </span>
            </div>
          </div>

          {/* Switch to Enterprise KVK Admin View */}
          <NavLink
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-primary text-xs font-bold transition-colors border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">admin_panel_settings</span>
            <span>KVK Admin</span>
          </NavLink>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTENT CONTAINER (Responsive for both Web & App Viewports)          */}
      {/* ========================================================================= */}
      <main className="flex-1 pb-24 md:pb-12 w-full">
        <Outlet />
      </main>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Visible strictly on mobile screens < md)     */}
      {/* ========================================================================= */}
      <nav
        aria-label="Farmer Mobile Navigation"
        className="flex md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(22,58,45,0.08)] pb-safe"
      >
        <div className="max-w-lg mx-auto w-full h-18 px-3 flex items-center justify-around">
          {/* 1. Home */}
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 flex-1 transition-all active:scale-95 ${
                isActive ? 'text-secondary font-extrabold' : 'text-on-surface-variant hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[24px]">home</span>
            <span className="text-[10px] mt-0.5 tracking-tight">{t('nav.home')}</span>
          </NavLink>

          {/* 2. My Farm */}
          <NavLink
            to="/my-farm"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 flex-1 transition-all active:scale-95 ${
                isActive ? 'text-secondary font-extrabold' : 'text-on-surface-variant hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[24px]">agriculture</span>
            <span className="text-[10px] mt-0.5 tracking-tight">{t('nav.myFarm')}</span>
          </NavLink>

          {/* 3. AI Camera (Prominent Elevated Center Button) */}
          <NavLink
            to="/ai-camera"
            className="flex flex-col items-center justify-center -mt-6 flex-1 group"
          >
            <div className="w-14 h-14 rounded-full bg-secondary text-white shadow-[0_8px_20px_rgba(27,108,59,0.35)] group-hover:bg-primary transition-transform group-active:scale-90 flex items-center justify-center border-4 border-surface-container-lowest">
              <span className="material-symbols-outlined text-[28px]">photo_camera</span>
            </div>
            <span className="text-[10px] font-bold text-secondary mt-0.5 tracking-tight">
              {t('nav.camera')}
            </span>
          </NavLink>

          {/* 4. Market */}
          <NavLink
            to="/market"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 flex-1 transition-all active:scale-95 ${
                isActive ? 'text-secondary font-extrabold' : 'text-on-surface-variant hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[24px]">storefront</span>
            <span className="text-[10px] mt-0.5 tracking-tight">{t('nav.market')}</span>
          </NavLink>

          {/* 5. Profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 flex-1 transition-all active:scale-95 ${
                isActive ? 'text-secondary font-extrabold' : 'text-on-surface-variant hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[24px]">person</span>
            <span className="text-[10px] mt-0.5 tracking-tight">{t('nav.profile')}</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
