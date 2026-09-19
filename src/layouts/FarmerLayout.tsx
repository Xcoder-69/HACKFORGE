import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import type { Language } from '../i18n/translations';

interface NavItemDef {
  to: string;
  labelKey: string;
  fallbackLabel: string;
  icon: string;
  matchAliases?: string[];
}

const NAV_ITEMS: NavItemDef[] = [
  { to: '/home', labelKey: 'nav.home', fallbackLabel: 'Home', icon: 'home', matchAliases: ['/my-farm'] },
  { to: '/recommendations', labelKey: 'nav.crops', fallbackLabel: 'Crops', icon: 'eco' },
  { to: '/weather-soil', labelKey: 'nav.weather', fallbackLabel: 'Weather', icon: 'wb_sunny' },
  { to: '/ai-camera', labelKey: 'nav.camera', fallbackLabel: 'AI Camera', icon: 'photo_camera', matchAliases: ['/diagnosis'] },
  { to: '/market', labelKey: 'nav.mandi', fallbackLabel: 'Mandi', icon: 'storefront' },
  { to: '/expenses', labelKey: 'nav.expenses', fallbackLabel: 'Expenses', icon: 'receipt_long', matchAliases: ['/profit'] },
  { to: '/alerts', labelKey: 'nav.alerts', fallbackLabel: 'Alerts', icon: 'notifications' },
  { to: '/ai-assistant', labelKey: 'nav.advisory', fallbackLabel: 'AI Advisory', icon: 'chat', matchAliases: ['/chat'] },
];

export const FarmerLayout: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
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
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-white shadow-md shrink-0 transition-transform">
                <span className="material-symbols-outlined text-[24px]">eco</span>
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col text-left min-w-0 overflow-hidden animate-in fade-in duration-200">
                  <span className="text-base font-extrabold text-primary tracking-tight leading-tight truncate">
                    AgroMind AI
                  </span>
                  <span className="text-[10px] text-secondary font-bold tracking-wide uppercase truncate">
                    Kisan Intelligence
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Vertical Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-230px)]">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item);
              const label = t(item.labelKey) || item.fallbackLabel;

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
                    <span className="truncate flex-1 tracking-tight">{label}</span>
                  )}

                  {/* Active Indicator Dot (when expanded) */}
                  {!isSidebarCollapsed && active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  )}

                  {/* Floating Tooltip (when collapsed) */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {label}
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
                  {code === 'gu' ? 'ગુજરાતી' : code === 'hi' ? 'हिन्दी' : 'EN'}
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
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary flex items-center justify-center text-white shadow-md shrink-0">
            <span className="material-symbols-outlined text-[22px] sm:text-[24px]">eco</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-extrabold text-primary tracking-tight leading-tight whitespace-nowrap">
              AgroMind AI
            </span>
            <span className="text-[10px] text-secondary font-bold">
              Kisan Portal
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
                {code === 'gu' ? 'ગુજ' : code === 'hi' ? 'हिन्दी' : 'EN'}
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
      {/* 3. MOBILE & TABLET SLIDE-OVER DRAWER                                      */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          id="farmer-navigation-drawer"
        >
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div
            ref={drawerRef}
            className="relative w-[85vw] max-w-[320px] bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 border-r border-outline-variant/20 animate-in slide-in-from-left duration-300"
          >
            <div>
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-outline-variant/20 flex items-center justify-between">
                <div
                  className="flex items-center gap-2.5 cursor-pointer"
                  onClick={() => {
                    navigate('/home');
                    setIsDrawerOpen(false);
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-white shadow-md">
                    <span className="material-symbols-outlined text-[22px]">eco</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-primary text-base leading-tight block">
                      AgroMind AI
                    </span>
                    <span className="text-[10px] text-secondary font-bold">
                      Smart Autonomous Farm Platform
                    </span>
                  </div>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label={t('nav.close')}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/40"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              {/* Farmer Profile Card in Drawer */}
              <div
                onClick={() => {
                  navigate('/profile');
                  setIsDrawerOpen(false);
                }}
                className="mx-3 mt-3 p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/30 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                  {user?.name ? user.name.charAt(0) : 'R'}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold text-primary truncate">
                    {user?.name || 'Rameshbhai Patel'}
                  </span>
                  <span className="text-[10px] text-on-surface-variant truncate">
                    {user?.district || 'Surat'} • Verified Farmer
                  </span>
                </div>
              </div>

              {/* Navigation Items List */}
              <nav className="p-3 space-y-1" aria-label="Mobile Drawer Navigation">
                {NAV_ITEMS.map((item) => {
                  const active = isItemActive(item);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? 'bg-secondary text-white shadow-sm font-bold'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                        <span>{t(item.labelKey) || item.fallbackLabel}</span>
                      </div>
                      <span className="material-symbols-outlined text-[18px] opacity-60">
                        chevron_right
                      </span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-outline-variant/20 space-y-3 bg-surface-container-low/50">
              {/* Language Selector */}
              <div>
                <span className="text-[11px] font-bold text-on-surface-variant block mb-1.5">
                  {language === 'gu' ? 'ભાષા પસંદ કરો' : language === 'hi' ? 'भाषा चुनें' : 'Language'}
                </span>
                <div className="grid grid-cols-3 gap-1 bg-surface-container rounded-xl p-1 border border-outline-variant/30 text-xs">
                  {(['gu', 'hi', 'en'] as Language[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLanguage(code)}
                      className={`py-1.5 rounded-lg font-bold transition-all text-center ${
                        language === code
                          ? 'bg-secondary text-white shadow-sm'
                          : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {code === 'gu' ? 'ગુજરાતી' : code === 'hi' ? 'हिन्दी' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              {/* KVK Admin Navigation Link */}
              <NavLink
                to="/admin"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-primary text-xs font-bold transition-colors border border-outline-variant/30"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-secondary">
                    admin_panel_settings
                  </span>
                  <span>{t('nav.admin')}</span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  open_in_new
                </span>
              </NavLink>

              <div className="text-[10px] text-on-surface-variant text-center pt-1">
                AgroMind AI • Version 1.0.0
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
