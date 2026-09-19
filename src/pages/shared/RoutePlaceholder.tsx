import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface RoutePlaceholderProps {
  title: string;
  subtitle: string;
  icon: string;
  screenId?: string;
}

const ALL_SCREENS = [
  { path: '/', name: '01. Language & Welcome', icon: 'translate', screenId: '376520c8f67f4bcbb6d732206c60f8cb' },
  { path: '/login', name: '02. Login & Register', icon: 'lock_open', screenId: 'dfabadb31c1641bf8aa28c665eae628d' },
  { path: '/onboarding', name: '04. Farmer Onboarding', icon: 'how_to_reg', screenId: 'b51a6976367e47809c5bbc82d7800a74' },
  { path: '/home', name: 'Home Dashboard', icon: 'home', screenId: '118f45f5ee6741db854be784a38ded99' },
  { path: '/my-farm', name: '03. My Farm & Plots', icon: 'agriculture', screenId: 'c5b718bb60514b068711834427d30204' },
  { path: '/weather-soil', name: '06. Weather & Soil', icon: 'wb_sunny', screenId: 'c8f5b5c5bf644d22aa214abc56edb004' },
  { path: '/recommendations', name: '05. Crop Planning', icon: 'eco', screenId: 'b3b928fd1f964a04b28f929d25b75866' },
  { path: '/ai-camera', name: '09. Crop Scanner', icon: 'photo_camera', screenId: '93efd68da4a84c3b85bca120cdff5416' },
  { path: '/expenses', name: '07. Expense Tracker', icon: 'receipt_long', screenId: '1de9af41a0ea447c9bac0a11c0750e13' },
  { path: '/profit', name: '08. Profit & Yield', icon: 'trending_up', screenId: '546c97a7f77a401e927911a565268806' },
  { path: '/alerts', name: '10. Alerts & Actions', icon: 'notifications', screenId: '1afdd99d24c843c9ab051e751553e428' },
  { path: '/profile', name: '11. Farmer Profile', icon: 'person', screenId: '30b5304864444383867755b37981f5d8' },
  { path: '/admin', name: '12. KVK Admin Command', icon: 'admin_panel_settings', screenId: 'd280f34a680841c7a682e8b9033c08b5' },
];

export const RoutePlaceholder: React.FC<RoutePlaceholderProps> = ({
  title,
  subtitle,
  icon,
  screenId,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();

  const isOnboarding = location.pathname === '/onboarding';

  return (
    <div className="max-w-md mx-auto p-4 pt-6 flex flex-col items-center text-center">
      {/* Top Header Card */}
      <div className="w-full bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col items-center mb-5">
        <div className="w-16 h-16 rounded-3xl bg-secondary-container text-secondary flex items-center justify-center mb-3 shadow-sm">
          <span className="material-symbols-outlined text-[34px] fill">{icon}</span>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-outline text-[11px] font-mono font-semibold mb-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          {location.pathname}
        </span>

        <h2 className="text-xl font-extrabold text-primary font-sans mb-1">{title}</h2>
        <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed mb-3">{subtitle}</p>

        {screenId && (
          <span className="text-[10px] font-mono px-3 py-1 rounded-lg bg-surface-container-low text-outline border border-outline-variant/30">
            Stitch Screen: {screenId}
          </span>
        )}
      </div>

      {/* User Status Bar */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-3.5 mb-5 shadow-sm border border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-left">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
            {user ? user.name.charAt(0) : '🌾'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary">
              {user ? user.name : 'Guest Farmer'}
            </span>
            <span className="text-[10px] text-on-surface-variant">
              {user ? `${user.district || 'Gujarat'} • +91 ${user.phone}` : 'Not logged in'}
            </span>
          </div>
        </div>

        {user ? (
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login?tab=login');
            }}
            className="text-[11px] font-bold text-error hover:bg-error/10 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">logout</span>
            Sign Out
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login?tab=login')}
            className="text-[11px] font-bold text-secondary hover:bg-secondary/10 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">login</span>
            Log In
          </button>
        )}
      </div>

      {/* Contextual Flow Action Buttons */}
      {isOnboarding ? (
        <div className="w-full space-y-2 mb-6">
          <button
            type="button"
            onClick={() => navigate('/my-farm')}
            className="w-full min-h-[50px] px-4 rounded-xl bg-secondary hover:bg-primary text-white text-sm font-bold shadow transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Complete Setup & Enter My Farm</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full min-h-[44px] px-4 rounded-xl bg-surface-container-lowest text-primary text-xs font-semibold border border-outline-variant/30 hover:bg-surface-container transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Login & Registration</span>
          </button>
        </div>
      ) : (
        <div className="w-full flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex-1 min-h-[46px] px-3 rounded-xl bg-secondary hover:bg-primary text-white text-xs font-bold shadow transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Farmer Home</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="min-h-[46px] px-3 rounded-xl bg-surface-container-lowest text-primary text-xs font-semibold border border-outline-variant/30 hover:bg-surface-container transition-all flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">language</span>
            <span>{t('nav.title')}</span>
          </button>
        </div>
      )}

      {/* Complete Route Navigator Grid */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30 text-left">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">explore</span>
            Quick Screen Switcher
          </span>
          <span className="text-[10px] text-outline font-mono">12 Screens</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {ALL_SCREENS.map((s) => {
            const isCurrent = location.pathname === s.path;
            return (
              <button
                key={s.path}
                type="button"
                onClick={() => navigate(s.path)}
                className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-2 border ${
                  isCurrent
                    ? 'bg-secondary/10 border-secondary text-secondary font-bold shadow-sm'
                    : 'bg-surface-container-low/60 hover:bg-surface-container border-transparent text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] flex-shrink-0 text-secondary">
                  {s.icon}
                </span>
                <span className="text-[11px] truncate">{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
