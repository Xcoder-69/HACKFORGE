import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-surface-container-low text-on-surface">
      {/* Desktop Sidebar Navigation */}
      <aside className="w-64 bg-primary text-white flex flex-col justify-between p-6 border-r border-outline-variant/20 hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[24px]">eco</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">AgroMind Enterprise</h1>
              <span className="text-xs text-secondary-fixed">KVK Command Center</span>
            </div>
          </div>

          <nav className="space-y-2">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-secondary text-white shadow-sm' : 'text-surface-variant hover:bg-primary-light'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>Overview & Telemetry</span>
            </NavLink>

            <NavLink
              to="/home"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-surface-variant hover:bg-primary-light transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">phone_android</span>
              <span>Switch to Farmer View</span>
            </NavLink>
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10 text-xs text-white/60">
          <p className="font-medium">Bit N Build'26 Gujarat</p>
          <p>KVK Extension Support Node</p>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/30 px-6 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">eco</span>
            <span className="font-bold text-primary">AgroMind KVK Admin</span>
          </div>
          <NavLink to="/home" className="text-xs font-semibold text-secondary px-3 py-1.5 rounded-full bg-secondary-container">
            Farmer App
          </NavLink>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
