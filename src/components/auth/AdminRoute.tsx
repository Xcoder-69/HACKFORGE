import React, { useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const AdminRoute: React.FC = () => {
  const { isAuthenticated, user, loginAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsVerifying(true);
    try {
      const res = await loginAdmin(accessCode || 'KVK2026');
      if (res.success) {
        navigate('/admin');
      } else {
        setErrorMessage(res.error || 'Invalid KVK Officer Credentials');
      }
    } catch {
      setErrorMessage('Network or validation error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // If logged in as farmer, show secure role authorization gate
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-outline-variant/30 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              KVK Role Required
            </span>
            <h2 className="text-xl font-extrabold text-primary mt-2">
              KVK Enterprise Command Center
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              You are currently authenticated as <strong>{user?.name || 'Farmer Account'}</strong>. This operational portal is restricted to authorized Krishi Vigyan Kendra (KVK) extension officers.
            </p>
          </div>

          <form onSubmit={handleVerify} className="pt-2 space-y-3 text-left">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                KVK Extension Access Code / ઓળખ કોડ
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter access code (Default: KVK2026)"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant text-[20px]">
                  key
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 px-1">
                <span className="text-[11px] text-on-surface-variant">
                  Evaluator Passcode: <code className="font-mono font-bold text-secondary">KVK2026</code>
                </span>
                <button
                  type="button"
                  onClick={() => setAccessCode('KVK2026')}
                  className="text-[11px] text-secondary hover:underline font-semibold"
                >
                  Fill Passcode
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 px-4 rounded-xl bg-secondary hover:bg-secondary-dark text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isVerifying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  <span>Authenticate KVK Officer</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-semibold text-xs transition-colors text-center"
            >
              Return to Farmer Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
