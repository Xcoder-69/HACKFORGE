import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { authService } from '../../services/authService';

interface ForgotPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPhone?: string;
  onSuccess: (message: string) => void;
}

export const ForgotPinModal: React.FC<ForgotPinModalProps> = ({
  isOpen,
  onClose,
  defaultPhone = '',
  onSuccess,
}) => {
  const { t } = useLanguage();
  const [phone, setPhone] = useState(defaultPhone);
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (phone.replace(/\D/g, '').length !== 10) {
      setError(t('auth.phoneError'));
      return;
    }
    setError(null);
    setIsLoading(true);
    const res = await authService.sendOtp(phone);
    setIsLoading(false);
    if (res.success) {
      setOtpSent(true);
      setOtp('8249'); // Prefill demo OTP for quick testing
    } else {
      setError(res.error || 'Failed to send OTP');
    }
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError(t('auth.phoneError'));
      return;
    }
    if (otp.length !== 4) {
      setError(t('auth.otpError'));
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError(t('auth.pinError'));
      return;
    }
    if (newPin !== confirmPin) {
      setError(t('auth.pinMismatch'));
      return;
    }

    setIsLoading(true);
    const res = await authService.resetPin(cleanPhone, otp, newPin);
    setIsLoading(false);

    if (res.success) {
      onSuccess(t('auth.resetSuccess'));
      onClose();
    } else {
      setError(res.error || 'Failed to reset PIN');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 shadow-2xl border border-outline-variant/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">lock_reset</span>
            <h3 className="font-bold text-base text-primary">
              {t('auth.resetPinTitle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="my-3 p-3 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2 text-xs text-error font-medium">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleResetPin} className="space-y-4 py-4">
          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary">
              {t('auth.lblPhone')}
            </label>
            <div className="flex items-center bg-surface-container-low rounded-xl border border-outline-variant/50 focus-within:border-secondary focus-within:bg-surface-container-lowest transition-all">
              <span className="pl-3 pr-2 text-xs font-bold text-primary">🇮🇳 +91</span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="w-full bg-transparent p-3 text-sm font-bold text-on-surface focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="mr-2 px-3 py-1.5 text-xs font-bold rounded-lg bg-secondary text-white hover:bg-primary transition-all disabled:opacity-50"
              >
                {otpSent ? t('auth.resend') : 'Get OTP'}
              </button>
            </div>
          </div>

          {/* OTP Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-primary">
                {t('auth.lblOtp')}
              </label>
              {otpSent && (
                <span className="text-[11px] text-secondary font-semibold">
                  {t('auth.otpSentSuccess')}
                </span>
              )}
            </div>
            <input
              type="text"
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="4-digit OTP (demo: 8249)"
              className="w-full bg-surface-container-low p-3 rounded-xl border border-outline-variant/50 text-sm font-bold text-on-surface tracking-widest text-center focus:border-secondary focus:bg-surface-container-lowest focus:outline-none"
            />
          </div>

          {/* New PIN & Confirm PIN */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary">
                {t('auth.newPin')}
              </label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full bg-surface-container-low p-3 rounded-xl border border-outline-variant/50 text-sm font-bold text-on-surface tracking-widest text-center focus:border-secondary focus:bg-surface-container-lowest focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary">
                {t('auth.confirmPin')}
              </label>
              <input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full bg-surface-container-low p-3 rounded-xl border border-outline-variant/50 text-sm font-bold text-on-surface tracking-widest text-center focus:border-secondary focus:bg-surface-container-lowest focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-secondary hover:bg-primary text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">check</span>
                <span>{t('auth.btnResetPin')}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
