import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export const FarmerLayout: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low text-on-surface font-sans">
      {/* Main Page Content */}
      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      {/* Persistent 5-Item Farmer Bottom Navigation */}
      <nav 
        aria-label="Farmer Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest/95 backdrop-blur-lg border-t border-outline-variant/30 shadow-[0_-2px_12px_rgba(22,58,45,0.06)] pb-safe"
      >
        <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-around">
          {/* 1. Home */}
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 flex-1 transition-colors ${
                isActive ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[24px]">home</span>
            <span className="text-[11px] mt-0.5 tracking-tight">{t('nav.home')}</span>
          </NavLink>

          {/* 2. My Farm */}
          <NavLink
            to="/my-farm"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 flex-1 transition-colors ${
                isActive ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[24px]">agriculture</span>
            <span className="text-[11px] mt-0.5 tracking-tight">{t('nav.myFarm')}</span>
          </NavLink>

          {/* 3. AI Camera (Prominent Center Action) */}
          <NavLink
            to="/ai-camera"
            className="flex flex-col items-center justify-center -mt-5 flex-1 group"
          >
            <div className="w-13 h-13 p-3 rounded-full bg-secondary text-white shadow-lg group-hover:bg-primary transition-transform group-active:scale-95 flex items-center justify-center border-4 border-surface-container-lowest">
              <span className="material-symbols-outlined text-[26px]">photo_camera</span>
            </div>
            <span className="text-[11px] font-bold text-secondary mt-0.5 tracking-tight">
              {t('nav.camera')}
            </span>
          </NavLink>

          {/* 4. Market */}
          <NavLink
            to="/market"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 flex-1 transition-colors ${
                isActive ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[24px]">storefront</span>
            <span className="text-[11px] mt-0.5 tracking-tight">{t('nav.market')}</span>
          </NavLink>

          {/* 5. Profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 flex-1 transition-colors ${
                isActive ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[24px]">person</span>
            <span className="text-[11px] mt-0.5 tracking-tight">{t('nav.profile')}</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
