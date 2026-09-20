import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { storageService } from '../../services/storageService';
import {
  INDIA_STATES_AND_DISTRICTS,
  getCitiesForDistrict,
  getAreasForCity,
} from '../../data/indiaGeoData';

const PREFS_KEY = 'agromind_farmer_prefs';

export const FarmerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const { language, setLanguage, bi } = useLanguage();

  const savedPrefs = storageService.get(PREFS_KEY, {
    sms: true,
    whatsapp: true,
    voice: true,
    pin: '1234',
  });

  const [smsAlerts, setSmsAlerts] = useState(savedPrefs.sms);
  const [whatsappAlerts, setWhatsappAlerts] = useState(savedPrefs.whatsapp);
  const [voiceAssistance, setVoiceAssistance] = useState(savedPrefs.voice);
  const [newPin, setNewPin] = useState(savedPrefs.pin || '1234');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [fullName, setFullName] = useState(user?.name || 'Ramesh Patel');
  const [phone, setPhone] = useState(user?.phone || '9876543210');
  const [district, setDistrict] = useState(user?.district || 'Surat');
  const [city, setCity] = useState(user?.city || user?.taluka || 'Kamrej');
  const [taluka, setTaluka] = useState(user?.taluka || user?.city || 'Kamrej');
  const [village, setVillage] = useState(user?.village || 'Kamrej Gam');
  const [isCustomVillage, setIsCustomVillage] = useState(false);
  const [pmKisanId, setPmKisanId] = useState(user?.pmKisanId || 'GJ-SUR-88412');

  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setPhone(user.phone || '9876543210');
      setDistrict(user.district || 'Surat');
      setCity(user.city || user.taluka || 'Kamrej');
      setTaluka(user.taluka || user.city || 'Kamrej');
      setVillage(user.village || 'Kamrej Gam');
      setPmKisanId(user.pmKisanId || 'GJ-SUR-88412');
    }
  }, [user]);

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);
    const cities = getCitiesForDistrict(newDist);
    const firstCity = cities[0] || `${newDist} City`;
    setCity(firstCity);
    setTaluka(firstCity);
    const areas = getAreasForCity(firstCity, newDist);
    setVillage(areas[0] || `${firstCity} Main Village`);
    setIsCustomVillage(false);
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setTaluka(newCity);
    const areas = getAreasForCity(newCity, district);
    setVillage(areas[0] || `${newCity} Main Village`);
    setIsCustomVillage(false);
  };

  const updatePreferences = (updated: Partial<typeof savedPrefs>) => {
    const current = storageService.get(PREFS_KEY, savedPrefs);
    storageService.set(PREFS_KEY, { ...current, ...updated });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: fullName,
      phone,
      district,
      city,
      taluka,
      village,
      pmKisanId,
    });
    setShowEditModal(false);
    showToast('Profile updated successfully! / પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ.');
  };

  const handleUpdatePin = () => {
    updatePreferences({ pin: newPin });
    setShowPinModal(false);
    showToast('Security PIN updated successfully! / પિન સફળતાપૂર્વક બદલાયો.');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full min-h-screen bg-[#FCF9F0] text-[#1C1C17] pb-28 md:pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#163A2D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-[#163A2D] text-white py-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>{bi('ખેડૂત પ્રોફાઇલ & KYC • Farmer Account', 'Farmer Account & KYC • ખેડૂત પ્રોફાઇલ', 'किसान प्रोफाइल & KYC • Farmer Account').primary}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {bi('ખેડૂત પ્રોફાઇલ અને સેટિંગ્સ', 'Farmer Profile & Preferences', 'किसान प्रोफाइल और प्राथमिकताएं').primary}
            </h1>
            <p className="text-emerald-300/90 text-xs font-semibold mt-0.5">
              {bi('Farmer Profile & Account Settings', 'ખેડૂત પ્રોફાઇલ અને ખાતા સેટિંગ્સ', 'Farmer Profile & Settings').primary}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>{bi('સંપાદન કરો / Edit Details', 'Edit Details / સંપાદન', 'संपादित करें / Edit Details').primary}</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>{bi('લૉગઆઉટ / Logout', 'Logout / લૉગઆઉટ', 'लॉगआउट / Logout').primary}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Farmer ID & Verified Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E5E2DA] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-900 border-2 border-emerald-600 flex items-center justify-center font-black text-2xl shadow-md">
                  RP
                </div>
                <span
                  className="absolute -bottom-1 -right-1 bg-emerald-600 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md"
                  title="PM-Kisan Verified"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-[#163A2D]">{fullName}</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    100% KYC Verified
                  </span>
                </div>
                <p className="text-sm font-semibold text-emerald-700">રમેશભાઈ ગોવિંદભાઈ પટેલ</p>
                <p className="text-xs text-[#717974] flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">location_on</span>
                  {village}, {taluka}, {district}, Gujarat
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-[#F6F3EA] sm:bg-transparent p-3 sm:p-0 rounded-2xl">
              <span className="text-xs uppercase font-bold text-[#717974] block">PM-KISAN ID</span>
              <span className="text-base font-extrabold text-[#163A2D] bg-emerald-100 px-3 py-1 rounded-full inline-block mt-0.5">
                {pmKisanId}
              </span>
              <p className="text-xs text-[#717974] mt-1">+91 {phone}</p>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-[#F1EEE5]">
            <div className="bg-[#F6F3EA] p-3 rounded-2xl border border-[#E5E2DA]">
              <span className="text-[11px] text-[#717974] font-bold uppercase block">Total Land</span>
              <span className="text-base font-black text-[#163A2D]">10 Vigha (5.5 Ac)</span>
            </div>
            <div className="bg-[#F6F3EA] p-3 rounded-2xl border border-[#E5E2DA]">
              <span className="text-[11px] text-[#717974] font-bold uppercase block">Soil Type</span>
              <span className="text-base font-black text-emerald-800">Black Cotton</span>
            </div>
            <div className="bg-[#F6F3EA] p-3 rounded-2xl border border-[#E5E2DA]">
              <span className="text-[11px] text-[#717974] font-bold uppercase block">Irrigation</span>
              <span className="text-base font-black text-[#163A2D]">Micro-Drip (90%)</span>
            </div>
            <div className="bg-[#F6F3EA] p-3 rounded-2xl border border-[#E5E2DA]">
              <span className="text-[11px] text-[#717974] font-bold uppercase block">KVK Station</span>
              <span className="text-base font-black text-emerald-800">KVK Surat</span>
            </div>
          </div>
        </div>

        {/* Section: Language & Voice Advisory */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E5E2DA] space-y-5">
          <h3 className="text-lg font-extrabold text-[#163A2D] flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700">translate</span>
            <span>{bi('ભાષા અને સહાય સેટિંગ્સ (Language)', 'Language & Audio Settings', 'Bhasha aur Sahayata Settings').primary}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => {
                setLanguage('gu');
                showToast(bi('ભાષા ગુજરાતી + English સેટ થઈ.', 'Language set to Gujarati + English.', 'Bhasha Gujarati + English set ho gayi.').primary);
              }}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                language === 'gu'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500'
                  : 'border-[#E5E2DA] hover:border-emerald-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-base text-[#163A2D]">ગુજરાતી (Gujarati)</span>
                {language === 'gu' && (
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                )}
              </div>
              <p className="text-xs text-[#717974] mt-1">{bi('ગુજરાતી + English પ્રાથમિકતા', 'Gujarati + English Priority', 'Gujarati + English Priority').primary}</p>
            </button>

            <button
              onClick={() => {
                setLanguage('hi');
                showToast(bi('ભાષા Hinglish સેટ થઈ.', 'Language set to Hinglish.', 'Bhasha Hinglish set ho gayi.').primary);
              }}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                language === 'hi'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500'
                  : 'border-[#E5E2DA] hover:border-emerald-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-base text-[#163A2D]">Hinglish (Hindi)</span>
                {language === 'hi' && (
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                )}
              </div>
              <p className="text-xs text-[#717974] mt-1">{bi('Hinglish કિસાન ભાષા', 'Hinglish Farmer Language', 'Hinglish Kisan Bhasha').primary}</p>
            </button>

            <button
              onClick={() => {
                setLanguage('en');
                showToast(bi('ભાષા English સેટ થઈ.', 'Language set to English.', 'Bhasha English set ho gayi.').primary);
              }}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                language === 'en'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500'
                  : 'border-[#E5E2DA] hover:border-emerald-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-base text-[#163A2D]">English</span>
                {language === 'en' && (
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                )}
              </div>
              <p className="text-xs text-[#717974] mt-1">{bi('ગ્લોબલ સ્ટાન્ડર્ડ', 'Global Standard', 'Global Standard').primary}</p>
            </button>
          </div>

          {/* Voice toggle */}
          <div className="pt-3 border-t border-[#F1EEE5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-700 text-[24px]">record_voice_over</span>
              <div>
                <h4 className="font-bold text-sm text-[#163A2D]">Voice Audio Readout (અવાજથી સલાહ સાંભળો)</h4>
                <p className="text-xs text-[#717974]">Speak diagnostic steps and mandi prices in Gujarati</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={voiceAssistance}
              onChange={(e) => {
                setVoiceAssistance(e.target.checked);
                updatePreferences({ voice: e.target.checked });
              }}
              className="w-5 h-5 accent-emerald-700 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Section: Alert Channels */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E5E2DA] space-y-4">
          <h3 className="text-lg font-extrabold text-[#163A2D] flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700">campaign</span>
            <span>Alert & Advisory Channels (સૂચના ચેનલ)</span>
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-700 text-[22px]">sms</span>
                <div>
                  <h4 className="font-bold text-sm text-[#163A2D]">SMS Weather & Mandi Flash</h4>
                  <p className="text-xs text-[#717974]">Daily APMC prices and rain warnings directly on phone</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => {
                  setSmsAlerts(e.target.checked);
                  updatePreferences({ sms: e.target.checked });
                }}
                className="w-5 h-5 accent-emerald-700 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600 text-[22px]">chat</span>
                <div>
                  <h4 className="font-bold text-sm text-[#163A2D]">WhatsApp Audio Advisory</h4>
                  <p className="text-xs text-[#717974]">Weekly 1-minute voice bulletin from KVK Surat agronomist</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => {
                  setWhatsappAlerts(e.target.checked);
                  updatePreferences({ whatsapp: e.target.checked });
                }}
                className="w-5 h-5 accent-emerald-700 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section: Security & PIN */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E5E2DA] space-y-4">
          <h3 className="text-lg font-extrabold text-[#163A2D] flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700">lock</span>
            <span>Security & PIN (સુરક્ષા અને પિન)</span>
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA]">
            <div>
              <h4 className="font-bold text-sm text-[#163A2D]">4-Digit Farmer Login PIN</h4>
              <p className="text-xs text-[#717974]">Used for fast one-tap authentication on this device</p>
            </div>
            <button
              onClick={() => setShowPinModal(true)}
              className="px-4 py-2 bg-[#163A2D] text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-900 transition-colors shrink-0"
            >
              Change PIN / પિન બદલો
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E2DA]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E2DA]">
              <h3 className="text-xl font-extrabold text-[#163A2D]">Edit Profile Details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-[#F1EEE5] flex items-center justify-center text-[#1C1C17]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#717974] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-[#C1C8C3] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-semibold text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#717974] block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-[#C1C8C3] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-semibold text-sm"
                  required
                />
              </div>

              {/* Cascading All-India District & City Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#717974] block mb-1">
                    District / જિલ્લો (All India)
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#C1C8C3] font-semibold text-sm bg-white focus:border-emerald-600 focus:outline-none"
                  >
                    {INDIA_STATES_AND_DISTRICTS.map((g) => (
                      <optgroup key={g.state} label={`📍 ${g.state} (${g.districts.length})`}>
                        {g.districts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#717974] block mb-1">
                    Taluka / તાલુકો
                  </label>
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#C1C8C3] font-semibold text-sm bg-white focus:border-emerald-600 focus:outline-none"
                  >
                    {getCitiesForDistrict(district).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Taluka / Area / Village Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#717974]">
                    Area / Village / ગામ / ફળિયું
                  </label>
                  {isCustomVillage && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomVillage(false);
                        const areas = getAreasForCity(city, district);
                        setVillage(areas[0] || '');
                      }}
                      className="text-[11px] text-emerald-700 font-bold hover:underline"
                    >
                      ← Select from List
                    </button>
                  )}
                </div>

                {!isCustomVillage ? (
                  <select
                    value={village}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setIsCustomVillage(true);
                        setVillage('');
                      } else {
                        setVillage(e.target.value);
                      }
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-[#C1C8C3] font-semibold text-sm bg-white focus:border-emerald-600 focus:outline-none"
                  >
                    {getAreasForCity(city, district).map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                    <option value="__CUSTOM__">➕ + Custom Village / અન્ય ગામ લખો...</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Enter village or hamlet name..."
                    className="w-full h-11 px-4 rounded-xl border-2 border-emerald-600 font-semibold text-sm bg-white focus:outline-none"
                    autoFocus
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[#717974] block mb-1">PM-KISAN ID</label>
                <input
                  type="text"
                  value={pmKisanId}
                  onChange={(e) => setPmKisanId(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-[#C1C8C3] font-semibold text-sm"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F1EEE5] text-[#414844] font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#163A2D] text-white font-bold text-sm shadow hover:bg-emerald-900"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIN Change Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E5E2DA] text-center">
            <h3 className="text-lg font-extrabold text-[#163A2D]">Set New 4-Digit PIN</h3>
            <p className="text-xs text-[#717974] mt-1">Enter your new security PIN for AgroMind AI</p>

            <div className="my-5">
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4-digit PIN"
                className="w-40 mx-auto text-center text-2xl tracking-widest font-black py-2.5 rounded-xl border-2 border-[#C1C8C3] focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-2.5 bg-[#F1EEE5] rounded-xl text-xs font-bold text-[#414844]"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePin}
                className="flex-1 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-800"
              >
                Update PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
