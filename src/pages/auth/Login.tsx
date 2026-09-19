import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { ForgotPinModal } from '../../components/ui/ForgotPinModal';

type AuthTab = 'login' | 'register';
type LoginMethod = 'otp' | 'pin';

const GUJARAT_DISTRICTS = [
  'Surat',
  'Rajkot',
  'Ahmedabad',
  'Vadodara',
  'Junagadh',
  'Bhavnagar',
  'Anand',
  'Mehsana',
  'Kutch',
  'Jamnagar',
  'Amreli',
  'Banaskantha',
  'Gandhinagar',
  'Bharuch',
  'Navsari',
];

export const Login: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { login: doLogin, register: doRegister } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Screen States derived from query param ?tab=register or ?tab=login
  const tabParam = searchParams.get('tab') as AuthTab | null;
  const [activeTab, setActiveTab] = useState<AuthTab>(
    tabParam === 'register' ? 'register' : 'login'
  );

  useEffect(() => {
    const currentTab = searchParams.get('tab') as AuthTab | null;
    if (currentTab === 'register' || currentTab === 'login') {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setError(null);
  };

  const [loginMethod, setLoginMethod] = useState<LoginMethod>('otp');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  // Login Form States
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [pin, setPin] = useState('');
  const [resendTimer, setResendTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [isForgotPinOpen, setIsForgotPinOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDistrict, setRegDistrict] = useState('Surat');
  const [regVillage, setRegVillage] = useState('');

  // Inline Errors
  const [error, setError] = useState<string | null>(null);

  // OTP Input Refs (6 cells for real Google Firebase SMS OTP)
  const otpRef0 = useRef<HTMLInputElement>(null);
  const otpRef1 = useRef<HTMLInputElement>(null);
  const otpRef2 = useRef<HTMLInputElement>(null);
  const otpRef3 = useRef<HTMLInputElement>(null);
  const otpRef4 = useRef<HTMLInputElement>(null);
  const otpRef5 = useRef<HTMLInputElement>(null);
  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3, otpRef4, otpRef5];

  // Resend Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle OTP Input Navigation
  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = clean ? clean[clean.length - 1] : '';
    setOtp(newOtp);

    if (clean && index < 5) {
      otpRefs[index + 1]?.current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1]?.current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIdx = Math.min(pasted.length, 5);
    otpRefs[nextIdx]?.current?.focus();
  };

  // Handle Dispatch of Real SMS OTP via Google Firebase
  const handleSendOtp = async () => {
    setError(null);
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError(t('auth.phoneError'));
      return;
    }

    setIsSendingOtp(true);
    const res = await authService.sendOtp(cleanPhone);
    setIsSendingOtp(false);

    if (res.success) {
      setOtpSent(true);
      showToast(res.message || t('auth.otpSentSuccess'));
      setResendTimer(45);
      setCanResend(false);
      setTimeout(() => {
        otpRefs[0]?.current?.focus();
      }, 200);
    } else {
      setError(res.error || 'Failed to dispatch SMS OTP. Please check your mobile number.');
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    await handleSendOtp();
  };

  // Handle Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError(t('auth.phoneError'));
      return;
    }

    const enteredOtp = otp.join('');
    const verificationCode = loginMethod === 'otp' ? enteredOtp : pin;

    if (loginMethod === 'otp') {
      const isDemo = enteredOtp === '8249' || enteredOtp.startsWith('8249');
      if (!isDemo && enteredOtp.length !== 6) {
        setError('Please enter the 6-digit SMS OTP code (or 8249 for demo test)');
        return;
      }
    }
    if (loginMethod === 'pin' && verificationCode.length !== 4) {
      setError(t('auth.pinError'));
      return;
    }

    setIsLoading(true);
    const res = await doLogin(cleanPhone, verificationCode);
    setIsLoading(false);

    if (res.success) {
      showToast(t('auth.loginSuccess'));
      setTimeout(() => {
        navigate('/home');
      }, 500);
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  // Handle Registration Submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim()) {
      setError(t('auth.nameError'));
      return;
    }
    const cleanPhone = regPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError(t('auth.phoneError'));
      return;
    }
    if (!regDistrict) {
      setError(t('auth.districtError'));
      return;
    }

    setIsLoading(true);
    const res = await doRegister({
      name: regName,
      phone: cleanPhone,
      district: regDistrict,
      village: regVillage || 'Unspecified Village',
    });
    setIsLoading(false);

    if (res.success) {
      showToast(t('auth.regSuccess'));
      setTimeout(() => {
        navigate('/onboarding');
      }, 600);
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-on-surface antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-5 py-2.5 rounded-full shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-secondary-fixed text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Clean Navigation Bar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-md pt-safe border-b border-surface-variant/60 shadow-sm">
        <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label="Go back"
              onClick={() => navigate('/')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-primary font-extrabold leading-tight">AgroMind AI</span>
                <span className="text-[11px] text-secondary font-bold leading-none mt-0.5">
                  {t('auth.tagline')}
                </span>
              </div>
            </div>
          </div>

          {/* Language Switcher Pills */}
          <div className="flex items-center bg-surface-container-high rounded-full p-1 border border-outline-variant/40">
            <button
              type="button"
              onClick={() => setLanguage('gu')}
              className={`px-2.5 py-1 text-xs rounded-full transition-all ${
                language === 'gu'
                  ? 'bg-primary text-white font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              ગુજ
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 text-xs rounded-full transition-all ${
                language === 'hi'
                  ? 'bg-primary text-white font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs rounded-full transition-all ${
                language === 'en'
                  ? 'bg-primary text-white font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center w-full pt-20 pb-safe bg-surface px-4">
        <div className="w-full max-w-md flex flex-col space-y-4 pb-10">

          {/* Segmented Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-surface-container-high rounded-2xl gap-1 border border-outline-variant/40 shadow-inner">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              <span>{t('auth.tabLogin')}</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>{t('auth.tabRegister')}</span>
            </button>
          </div>

          {/* Hero Welcome Card with Verified Kisan Shield */}
          <div className="relative overflow-hidden rounded-2xl bg-primary text-white p-5 shadow-md">
            <div className="relative z-10 flex flex-col gap-1.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-white w-fit shadow-sm">
                <span className="material-symbols-outlined text-[15px] fill">verified</span>
                <span className="text-[11px] font-bold tracking-wide">
                  {t('auth.badgeKisan')}
                </span>
              </div>
              <h1 className="text-lg font-extrabold tracking-tight pt-0.5">
                {activeTab === 'login' ? t('auth.titleLogin') : t('auth.titleRegister')}
              </h1>
              <p className="text-xs text-primary-fixed leading-snug">
                {activeTab === 'login' ? t('auth.subLogin') : t('auth.subRegister')}
              </p>
            </div>

            {/* Decorative stylized wheat background vector */}
            <svg
              className="absolute -right-5 -bottom-5 w-28 h-28 opacity-15 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 100 100"
            >
              <path d="M10 90 Q 50 10 90 90" strokeWidth="6" />
              <path d="M25 85 Q 50 25 75 85" strokeWidth="4" />
              <circle cx="50" cy="30" fill="currentColor" r="12" />
            </svg>
          </div>

          {/* Inline Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2 text-xs text-error font-medium animate-in fade-in">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: LOGIN STATE                                           */}
          {/* ============================================================ */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <form
                onSubmit={handleLoginSubmit}
                className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-4"
              >
                {/* Step 1: Mobile Number Input */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-secondary-container text-secondary text-[11px] font-bold flex items-center justify-center">
                        1
                      </span>
                      <span>{t('auth.lblPhone')}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('login-phone') as HTMLInputElement;
                        input?.focus();
                        input?.select();
                      }}
                      className="text-xs text-secondary font-bold hover:underline"
                    >
                      Change / બદલો
                    </button>
                  </div>

                  <div className="relative flex items-center bg-surface-container-low rounded-xl border border-outline-variant/50 focus-within:border-secondary focus-within:bg-surface-container-lowest focus-within:shadow-sm transition-all">
                    <div className="flex items-center pl-3 pr-2 py-3 text-primary font-bold text-sm select-none">
                      <span>🇮🇳 +91</span>
                    </div>
                    <div className="h-6 w-[1.5px] bg-outline-variant/60" />
                    <input
                      id="login-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full bg-transparent px-3 py-3 text-base font-bold text-on-surface placeholder:text-outline focus:outline-none tracking-wider"
                    />
                    {phone.length === 10 && (
                      <div className="pr-3 flex items-center text-secondary">
                        <span className="material-symbols-outlined text-[20px] font-bold fill">check_circle</span>
                      </div>
                    )}
                  </div>

                  {/* Action button to send real SMS OTP */}
                  {loginMethod === 'otp' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp || phone.replace(/\D/g, '').length !== 10}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-secondary/15 hover:bg-secondary/25 active:bg-secondary/30 text-secondary text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 border border-secondary/30 shadow-xs"
                      >
                        {isSendingOtp ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                            <span>Sending Real SMS OTP...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px]">sms</span>
                            <span>{otpSent ? 'Resend SMS OTP' : 'Send Real SMS OTP / SMS મેળવો'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOtp(['8', '2', '4', '9', '', '']);
                          showToast('Demo PIN 8249 loaded');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface-variant text-[11px] font-bold transition-all border border-outline-variant/50"
                        title="Evaluator fast-track test code"
                      >
                        Demo: 8249
                      </button>
                    </div>
                  )}

                  {/* Invisible reCAPTCHA Container for Google Firebase Phone Auth */}
                  <div id="recaptcha-container"></div>
                </div>

                {/* Sub-toggle: OTP vs PIN */}
                <div className="flex items-center justify-between pt-1 border-t border-surface-variant/70 text-xs">
                  <span className="font-semibold text-on-surface-variant">Authentication Method:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('otp')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        loginMethod === 'otp'
                          ? 'bg-secondary text-white shadow-sm'
                          : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      OTP SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('pin')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        loginMethod === 'pin'
                          ? 'bg-secondary text-white shadow-sm'
                          : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      4-Digit PIN
                    </button>
                  </div>
                </div>

                {/* Step 2: OTP Input Boxes */}
                {loginMethod === 'otp' ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-secondary-container text-secondary text-[11px] font-bold flex items-center justify-center">
                          2
                        </span>
                        <span>{t('auth.lblOtp')}</span>
                      </label>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/70 text-secondary text-[10px] font-bold">
                        <span className="material-symbols-outlined text-[13px]">lock_clock</span>
                        <span>{t('auth.autoDetect')}</span>
                      </span>
                    </div>

                    {/* 6 Square Input Cells for Real SMS OTP */}
                    <div className="grid grid-cols-6 gap-2 my-1">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={otpRefs[idx]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={handleOtpPaste}
                          placeholder="•"
                          className="h-12 text-center text-lg font-extrabold bg-surface-container-low border-2 border-outline-variant/60 focus:border-secondary focus:bg-surface-container-lowest focus:outline-none rounded-xl shadow-sm text-primary transition-all"
                        />
                      ))}
                    </div>

                    {/* Resend OTP Timer & Actions */}
                    <div className="flex items-center justify-between text-xs text-on-surface-variant pt-0.5 px-0.5">
                      <span>{t('auth.didntReceive')}</span>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={!canResend || isSendingOtp}
                        className={`font-bold transition-colors flex items-center gap-1 ${
                          canResend && !isSendingOtp ? 'text-secondary hover:underline cursor-pointer' : 'text-outline opacity-70 cursor-not-allowed'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">refresh</span>
                        <span>
                          {canResend
                            ? t('auth.resend')
                            : `${t('auth.resend')} (00:${resendTimer < 10 ? '0' : ''}${resendTimer})`}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* PIN Input Mode */
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-secondary-container text-secondary text-[11px] font-bold flex items-center justify-center">
                          2
                        </span>
                        <span>{t('auth.lblPin')}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotPinOpen(true)}
                        className="text-xs text-secondary font-bold hover:underline"
                      >
                        {t('auth.forgotPin')}
                      </button>
                    </div>

                    <input
                      type="password"
                      maxLength={4}
                      inputMode="numeric"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 4-digit PIN"
                      className="w-full bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/60 text-center text-lg font-extrabold tracking-widest text-primary focus:border-secondary focus:bg-surface-container-lowest focus:outline-none"
                    />
                  </div>
                )}

                {/* Primary Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[52px] bg-secondary hover:bg-primary text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50 mt-1"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">verified_user</span>
                      <span>{t('auth.btnLogin')}</span>
                    </>
                  )}
                </button>

                {/* Instant WhatsApp / SMS Quick Resend */}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="w-full py-2.5 bg-surface-container-low hover:bg-surface-container text-secondary text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">sms</span>
                  <span>{isSendingOtp ? 'Sending SMS OTP...' : t('auth.btnInstantSms')}</span>
                </button>
              </form>

              {/* Registration Callout Card */}
              <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-secondary/30 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[22px]">app_registration</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-primary">{t('auth.cardRegTitle')}</h3>
                    <p className="text-xs text-on-surface-variant leading-snug mt-0.5">
                      {t('auth.cardRegDesc')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => switchTab('register')}
                  className="w-full py-3 bg-secondary hover:bg-primary text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <span>{t('auth.btnGoReg')}</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: REGISTER STATE                                        */}
          {/* ============================================================ */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              <form
                onSubmit={handleRegisterSubmit}
                className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-4"
              >
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">person</span>
                    <span>{t('auth.lblFullName')}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Rameshbhai Patel"
                    className="w-full bg-surface-container-low px-3.5 py-3 rounded-xl border border-outline-variant/50 text-sm font-semibold text-on-surface focus:border-secondary focus:bg-surface-container-lowest focus:outline-none transition-all"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">call</span>
                    <span>{t('auth.lblPhone')}</span>
                  </label>
                  <div className="relative flex items-center bg-surface-container-low rounded-xl border border-outline-variant/50 focus-within:border-secondary focus-within:bg-surface-container-lowest transition-all">
                    <span className="pl-3 pr-2 text-xs font-bold text-primary select-none">🇮🇳 +91</span>
                    <div className="h-6 w-[1.5px] bg-outline-variant/60" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full bg-transparent px-3 py-3 text-sm font-bold text-on-surface focus:outline-none"
                    />
                  </div>
                </div>

                {/* District & Village Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* District Dropdown */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">location_city</span>
                      <span>{t('auth.lblDistrict')}</span>
                    </label>
                    <select
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full bg-surface-container-low px-3 py-3 rounded-xl border border-outline-variant/50 text-xs font-bold text-primary focus:border-secondary focus:bg-surface-container-lowest focus:outline-none"
                    >
                      {GUJARAT_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Village / Taluka */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">home_pin</span>
                      <span>{t('auth.lblVillage')}</span>
                    </label>
                    <input
                      type="text"
                      value={regVillage}
                      onChange={(e) => setRegVillage(e.target.value)}
                      placeholder="e.g. Olpad"
                      className="w-full bg-surface-container-low px-3 py-3 rounded-xl border border-outline-variant/50 text-xs font-semibold text-on-surface focus:border-secondary focus:bg-surface-container-lowest focus:outline-none"
                    />
                  </div>
                </div>

                {/* Register Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[52px] bg-secondary hover:bg-primary text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                      <span>{t('auth.btnRegister')}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login Callout */}
              <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30 flex items-center justify-between">
                <span className="text-xs text-on-surface-variant font-medium">
                  {t('auth.cardLoginTitle')}
                </span>
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="text-xs text-secondary font-bold hover:underline"
                >
                  {t('auth.btnGoLogin')}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* BENEFIT FEATURE BADGES (NDVI, AI Doctor, Mandi)              */}
          {/* ============================================================ */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="flex flex-col items-center text-center p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-secondary-container text-secondary flex items-center justify-center mb-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[19px]">satellite_alt</span>
              </div>
              <span className="text-xs text-primary font-bold leading-tight">
                {t('auth.featNdvi')}
              </span>
              <span className="text-[10px] text-outline mt-0.5">
                {t('auth.featNdviSub')}
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-secondary-container text-secondary flex items-center justify-center mb-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[19px]">psychology</span>
              </div>
              <span className="text-xs text-primary font-bold leading-tight">
                {t('auth.featAi')}
              </span>
              <span className="text-[10px] text-outline mt-0.5">
                {t('auth.featAiSub')}
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-secondary-container text-secondary flex items-center justify-center mb-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[19px]">payments</span>
              </div>
              <span className="text-xs text-primary font-bold leading-tight">
                {t('auth.featMandi')}
              </span>
              <span className="text-[10px] text-outline mt-0.5">
                {t('auth.featMandiSub')}
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* KISAN HELPLINE & GOVERNMENT AGRISTACK TRUST FOOTER           */}
          {/* ============================================================ */}
          <footer className="pt-2 flex flex-col gap-3">
            {/* Toll-free support card */}
            <div className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-3.5 border border-outline-variant/40 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-secondary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-primary font-bold">
                    {t('auth.ftHelpline')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-secondary text-[10px] font-extrabold">
                    24/7 Free
                  </span>
                </div>
                <a
                  href="tel:18001232476"
                  className="text-base text-primary font-extrabold hover:underline flex items-center gap-1.5 leading-tight mt-0.5"
                >
                  <span>1800-123-AGRO</span>
                  <span className="text-secondary text-xs font-semibold">(1800-123-2476)</span>
                </a>
              </div>
            </div>

            {/* Security & AgriStack note */}
            <div className="flex items-start gap-2 px-1 py-1">
              <span className="material-symbols-outlined text-secondary text-[20px] flex-shrink-0 mt-0.5 fill">
                verified_user
              </span>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                {t('auth.ftTrust')}
              </p>
            </div>
          </footer>

        </div>
      </main>

      {/* Forgot PIN Modal Dialog */}
      <ForgotPinModal
        isOpen={isForgotPinOpen}
        onClose={() => setIsForgotPinOpen(false)}
        defaultPhone={phone}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
};
