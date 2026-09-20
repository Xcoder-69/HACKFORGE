import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import type { Language } from '../i18n/translations';

interface NavItemDef {
  to: string;
  icon: string;
  matchAliases?: string[];
  labels: Record<Language, { primary: string; sub: string }>;
}

const NAV_ITEMS: NavItemDef[] = [
  {
    to: '/home',
    icon: 'home',
    matchAliases: ['/my-farm'],
    labels: {
      gu: { primary: 'હોમ', sub: 'Home' },
      en: { primary: 'Home', sub: 'Mera Khet' },
      hi: { primary: 'Mera Khet', sub: 'Home' },
    },
  },
  {
    to: '/recommendations',
    icon: 'eco',
    labels: {
      gu: { primary: 'પાક ભલામણ', sub: 'Crops' },
      en: { primary: 'Crop Advice', sub: 'Fasal Salah' },
      hi: { primary: 'Fasal Salah', sub: 'Crops' },
    },
  },
  {
    to: '/weather-soil',
    icon: 'wb_sunny',
    labels: {
      gu: { primary: 'હવામાન & જમીન', sub: 'Weather' },
      en: { primary: 'Weather & Soil', sub: 'Mausam & Mitti' },
      hi: { primary: 'Mausam & Mitti', sub: 'Weather' },
    },
  },
  {
    to: '/ai-camera',
    icon: 'photo_camera',
    matchAliases: ['/diagnosis'],
    labels: {
      gu: { primary: 'AI કેમેરા', sub: 'AI Doctor' },
      en: { primary: 'AI Camera', sub: 'Fasal Doctor' },
      hi: { primary: 'AI Fasal Doctor', sub: 'Leaf Scanner' },
    },
  },
  {
    to: '/market',
    icon: 'storefront',
    labels: {
      gu: { primary: 'મંડી ભાવ', sub: 'Mandi Rates' },
      en: { primary: 'Mandi Prices', sub: 'Mandi Bhav' },
      hi: { primary: 'Mandi Bhav', sub: 'Market Rates' },
    },
  },
  {
    to: '/expenses',
    icon: 'receipt_long',
    matchAliases: ['/profit'],
    labels: {
      gu: { primary: 'ખેતી ખર્ચ', sub: 'Expenses' },
      en: { primary: 'Expense Ledger', sub: 'Kharach Tracker' },
      hi: { primary: 'Kharach Tracker', sub: 'Expenses' },
    },
  },
  {
    to: '/alerts',
    icon: 'notifications',
    labels: {
      gu: { primary: 'કિસાન એલર્ટ', sub: 'Alerts' },
      en: { primary: 'Farmer Alerts', sub: 'Kisan Alerts' },
      hi: { primary: 'Kisan Alerts', sub: 'Urgent Notices' },
    },
  },
  {
    to: '/ai-assistant',
    icon: 'chat',
    matchAliases: ['/chat'],
    labels: {
      gu: { primary: 'AI સલાહકાર', sub: 'AI Advisory' },
      en: { primary: 'AI Advisory', sub: 'AI Salahkar' },
      hi: { primary: 'AI Salahkar', sub: 'Farming Advisory' },
    },
  },
];

export const FarmerLayout: React.FC = () => {
  const { language, setLanguage, t, bi } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Desktop Sidebar collapsed state (defaults to expanded, persists in localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agromind_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('agromind_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Mobile drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const desktopSidebarRef = useRef<HTMLElement>(null);

  // Close desktop sidebar when clicking on any blank space outside the sidebar
  useEffect(() => {
    if (isSidebarCollapsed) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        window.innerWidth >= 1024 &&
        desktopSidebarRef.current &&
        !desktopSidebarRef.current.contains(e.target as Node)
      ) {
        setIsSidebarCollapsed(true);
        localStorage.setItem('agromind_sidebar_collapsed', 'true');
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isSidebarCollapsed]);

  // Close drawer when route changes
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Check if a navigation item is active (including aliases)
  const isItemActive = (item: NavItemDef) => {
    if (location.pathname === item.to) return true;
    if (item.matchAliases?.includes(location.pathname)) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-on-surface antialiased">
      {/* ========================================================================= */}
      {/* 1. FIXED DESKTOP LEFT SIDEBAR (Strictly min-width: 1024px / lg+)           */}
      {/* ========================================================================= */}
      <aside
        ref={desktopSidebarRef}
        aria-label="Farmer Desktop Sidebar"
        className={`hidden lg:flex fixed top-0 bottom-0 left-0 z-40 h-screen flex-col justify-between bg-surface-container-lowest border-r border-outline-variant/30 shadow-[4px_0_24px_rgba(22,58,45,0.06)] transition-all duration-300 select-none ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Top Header: Logo and Brand (Click logo to toggle open / close) */}
        <div className="flex flex-col">
          <div className="h-18 px-3 flex items-center justify-center border-b border-outline-variant/20">
            <button
              type="button"
              onClick={toggleSidebar}
              className={`flex items-center rounded-2xl transition-all duration-200 cursor-pointer ${
                isSidebarCollapsed
                  ? 'justify-center w-12 h-12 hover:bg-surface-container-low hover:scale-105'
                  : 'gap-3 w-full p-2 hover:bg-surface-container-low/80'
              }`}
              title={isSidebarCollapsed ? 'Click logo to open sidebar' : 'Click logo to close sidebar'}
              aria-label={isSidebarCollapsed ? 'Open navigation sidebar' : 'Close navigation sidebar'}
            >
              <img
                src="/logo.png?v=2"
                alt="AgroMind Logo"
                className="w-10 h-10 object-contain shrink-0 transition-transform drop-shadow-sm"
              />
              {!isSidebarCollapsed && (
                <div className="flex flex-col text-left min-w-0 overflow-hidden animate-in fade-in duration-200">
                  <span className="text-base font-extrabold text-primary tracking-tight leading-tight truncate">
                    AgroMind AI
                  </span>
                  <span className="text-[10px] text-secondary font-bold tracking-wide uppercase truncate">
                    {bi('કિસાન ઇન્ટેલિજન્સ', 'Kisan Intelligence', 'किसान इंटेलिजेंस').primary}
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Vertical Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-230px)]">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item);
              const labelInfo = item.labels[language] || item.labels.en;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`group relative flex items-center rounded-xl font-bold transition-all ${
                    isSidebarCollapsed
                      ? 'justify-center h-12 w-full'
                      : 'gap-3 px-3.5 py-2.5 text-sm'
                  } ${
                    active
                      ? 'bg-secondary text-white shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                  }`}
                >
                  {/* Icon */}
                  <span
                    className={`material-symbols-outlined shrink-0 text-[22px] transition-transform group-hover:scale-110 ${
                      active ? 'fill' : ''
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Label (when expanded) */}
                  {!isSidebarCollapsed && (
                    <div className="flex flex-col text-left min-w-0 flex-1">
                      <span className="truncate tracking-tight font-bold text-sm leading-tight">
                        {labelInfo.primary}
                      </span>
                      <span
                        className={`text-[10px] truncate leading-tight mt-0.5 ${
                          active ? 'text-white/80' : 'text-on-surface-variant/70'
                        }`}
                      >
                        {labelInfo.sub}
                      </span>
                    </div>
                  )}

                  {/* Active Indicator Dot (when expanded) */}
                  {!isSidebarCollapsed && active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  )}

                  {/* Floating Tooltip (when collapsed) */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      <div className="font-bold">{labelInfo.primary}</div>
                      <div className="text-[10px] opacity-80">{labelInfo.sub}</div>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Controls (Language, Profile, Admin Switch) */}
        <div className="p-3 border-t border-outline-variant/20 bg-surface-container-low/40 space-y-2">
          {/* Language Switcher */}
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between bg-surface-container rounded-xl p-1 border border-outline-variant/30 text-xs">
              {(['gu', 'hi', 'en'] as Language[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  className={`flex-1 py-1 rounded-lg font-bold transition-all text-center text-[11px] ${
                    language === code
                      ? 'bg-secondary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {code === 'gu' ? 'ગુજરાતી' : code === 'hi' ? 'Hinglish' : 'EN'}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const next: Language = language === 'gu' ? 'hi' : language === 'hi' ? 'en' : 'gu';
                  setLanguage(next);
                }}
                title={`Language: ${language.toUpperCase()}`}
                className="w-10 h-8 rounded-lg bg-surface-container hover:bg-surface-variant text-primary text-xs font-extrabold flex items-center justify-center border border-outline-variant/30 transition-colors"
              >
                {language.toUpperCase()}
              </button>
            </div>
          )}

          {/* KVK Admin Switcher */}
          <NavLink
            to="/admin"
            title={t('nav.admin')}
            className={`flex items-center rounded-xl bg-surface-container-high hover:bg-surface-variant text-primary text-xs font-bold transition-colors border border-outline-variant/30 ${
              isSidebarCollapsed ? 'justify-center h-10 w-full' : 'gap-2 px-3 py-2'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">
              admin_panel_settings
            </span>
            {!isSidebarCollapsed && (
              <span className="truncate">{t('nav.admin')}</span>
            )}
          </NavLink>

          {/* Farmer Profile Pill */}
          <div
            onClick={() => navigate('/profile')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/profile')}
            className={`flex items-center rounded-xl bg-surface-container hover:bg-surface-variant cursor-pointer transition-colors border border-outline-variant/30 ${
              isSidebarCollapsed ? 'justify-center h-11 w-full' : 'gap-2.5 p-2'
            }`}
            title="Farmer Profile"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {user?.name ? user.name.charAt(0) : 'R'}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0 overflow-hidden text-left">
                <span className="text-xs font-bold text-primary truncate leading-tight">
                  {user?.name || 'Rameshbhai Patel'}
                </span>
                <span className="text-[10px] text-on-surface-variant truncate">
                  {user?.district || 'Surat'} • Kisan
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE & TABLET TOP HEADER (Strictly screens < 1024px / lg:hidden)      */}
      {/* ========================================================================= */}
      <header className="sticky top-0 inset-x-0 z-40 flex lg:hidden bg-surface-container-lowest/95 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_1px_10px_rgba(22,58,45,0.06)] px-3 sm:px-4 h-16 items-center justify-between">
        {/* Logo & Brand */}
        <div
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer shrink-0"
          onClick={() => navigate('/home')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/home')}
          aria-label="AgroMind AI Home"
        >
          <img
            src="/logo.png?v=2"
            alt="AgroMind Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0 drop-shadow-sm"
          />
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-extrabold text-primary tracking-tight leading-tight whitespace-nowrap">
              AgroMind AI
            </span>
            <span className="text-[10px] text-secondary font-bold">
              {bi('કિસાન પોર્ટલ (Kisan Portal)', 'Kisan Portal (કિસાન પોર્ટલ)', 'किसान पोर्टल (Kisan Portal)').primary}
            </span>
          </div>
        </div>

        {/* Right Controls: Language Switcher, Profile, Hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Switcher (Tablet) */}
          <div className="hidden sm:flex items-center bg-surface-container rounded-full p-0.5 border border-outline-variant/30 text-xs shrink-0">
            {(['gu', 'hi', 'en'] as Language[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`px-2 py-0.5 rounded-full font-bold transition-all text-[11px] ${
                  language === code
                    ? 'bg-secondary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {code === 'gu' ? 'ગુજ' : code === 'hi' ? 'Hinglish' : 'EN'}
              </button>
            ))}
          </div>

          {/* Profile Pill */}
          <div
            onClick={() => navigate('/profile')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/profile')}
            aria-label="View Farmer Profile"
            className="flex items-center cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              {user?.name ? user.name.charAt(0) : 'R'}
            </div>
          </div>

          {/* Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label={t('nav.menu')}
            aria-expanded={isDrawerOpen}
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/40 shrink-0 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MOBILE & TABLET SLIDE-OVER DRAWER (Responsive & Compact)               */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          id="farmer-navigation-drawer"
        >
          {/* Backdrop Overlay with click-to-dismiss */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container: Proportional width and compact mobile-first height */}
          <div
            ref={drawerRef}
            className="relative w-72 max-w-[78vw] bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 border-r border-outline-variant/30 animate-in slide-in-from-left duration-250"
          >
            <div>
              {/* Unified Compact Mobile Header with Farmer Profile & Close */}
              <div className="p-3.5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/60">
                <div
                  onClick={() => {
                    navigate('/profile');
                    setIsDrawerOpen(false);
                  }}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                  title="Farmer Profile"
                >
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    {user?.name ? user.name.charAt(0) : 'M'}
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-xs font-bold text-primary truncate leading-tight">
                      {user?.name || 'Mahendra Suryavanshi'}
                    </span>
                    <span className="text-[10px] text-secondary font-bold truncate">
                      {user?.district || 'Surat'} • Kisan
                    </span>
                  </div>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label={t('nav.close')}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Compact Navigation Items List */}
              <nav className="p-2 space-y-0.5" aria-label="Mobile Drawer Navigation">
                {NAV_ITEMS.map((item) => {
                  const active = isItemActive(item);
                  const labelInfo = item.labels[language] || item.labels.en;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-secondary text-white shadow-xs font-bold'
                          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`material-symbols-outlined text-[20px] ${active ? 'fill' : ''}`}>
                          {item.icon}
                        </span>
                        <div className="flex flex-col text-left">
                          <span className="truncate font-bold leading-tight">{labelInfo.primary}</span>
                          <span className={`text-[10px] leading-tight ${active ? 'text-white/80' : 'text-on-surface-variant/70'}`}>
                            {labelInfo.sub}
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[15px] opacity-40">
                        chevron_right
                      </span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Compact Drawer Footer */}
            <div className="p-3 border-t border-outline-variant/20 space-y-2 bg-surface-container-low/40">
              {/* Compact Language Switcher Pill */}
              <div className="flex items-center justify-between bg-surface-container rounded-xl p-0.5 border border-outline-variant/30 text-xs">
                {(['gu', 'hi', 'en'] as Language[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLanguage(code)}
                    className={`flex-1 py-1 rounded-lg font-bold transition-all text-center text-[11px] ${
                      language === code
                        ? 'bg-secondary text-white shadow-xs'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {code === 'gu' ? 'ગુજરાતી' : code === 'hi' ? 'Hinglish' : 'EN'}
                  </button>
                ))}
              </div>

              {/* Compact KVK Admin Switch */}
              <NavLink
                to="/admin"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-primary text-xs font-bold transition-colors border border-outline-variant/30"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    admin_panel_settings
                  </span>
                  <span>{t('nav.admin')}</span>
                </div>
                <span className="material-symbols-outlined text-[15px] text-on-surface-variant">
                  open_in_new
                </span>
              </NavLink>

              <div className="text-[9px] text-on-surface-variant text-center pt-0.5 opacity-60">
                AgroMind AI • v1.0
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT CONTAINER (Responsive Padding Offset for Desktop Sidebar)  */}
      {/* ========================================================================= */}
      <main
        className={`flex-1 pb-24 md:pb-12 w-full transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Outlet />
      </main>

      {/* ========================================================================= */}
      {/* 5. MOBILE BOTTOM NAVIGATION BAR (Visible strictly on mobile screens < md)  */}
      {/* ========================================================================= */}
      <nav
        aria-label="Farmer Mobile Navigation"
        className="flex md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(22,58,45,0.08)] pb-safe"
      >
        <div className="max-w-lg mx-auto w-full h-18 px-3 flex items-center justify-around">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const active = isItemActive(item);
            const labelInfo = item.labels[language] || item.labels.en;
            const isElevated = item.to === '/ai-camera';

            if (isElevated) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center -mt-6 flex-1 group"
                >
                  <div className="w-13 h-13 rounded-full bg-secondary text-white shadow-[0_8px_20px_rgba(27,108,59,0.35)] group-hover:bg-primary transition-transform group-active:scale-90 flex items-center justify-center border-4 border-surface-container-lowest">
                    <span className="material-symbols-outlined text-[26px]">{item.icon}</span>
                  </div>
                  <span className="text-[10px] font-bold text-secondary mt-0.5 tracking-tight leading-tight">
                    {labelInfo.primary}
                  </span>
                  <span className="text-[8px] text-secondary/80 font-medium leading-none">
                    {labelInfo.sub}
                  </span>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 flex-1 transition-all active:scale-95 ${
                    isActive ? 'text-secondary font-extrabold' : 'text-on-surface-variant hover:text-primary'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="text-[10px] mt-0.5 tracking-tight font-bold leading-tight">
                  {labelInfo.primary}
                </span>
                <span className="text-[8px] opacity-75 font-normal leading-none">
                  {labelInfo.sub}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
