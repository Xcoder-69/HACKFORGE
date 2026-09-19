import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { farmService } from '../../services/farmService';
import { storageService, STORAGE_KEYS } from '../../services/storageService';
import type { FarmParcel } from '../../types';
import {
  INDIA_STATES_AND_DISTRICTS,
  getCitiesForDistrict,
  getAreasForCity,
} from '../../data/indiaGeoData';

type UnitType = 'Vigha (વીઘા)' | 'Acre (એકર)' | 'Guntha (ગુંઠા)' | 'Hectare (હેક્ટર)';
type OwnershipType = 'Own Land' | 'Leased' | 'Shared';

interface CropOption {
  id: string;
  name: string;
  sub: string;
  desc: string;
  img: string;
  selected: boolean;
}

export const Onboarding: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Wizard Step State (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Profile & Location States
  const [farmerName, setFarmerName] = useState(user?.name || 'Ramesh Patel / રમેશભાઈ પટેલ');
  const [phone, setPhone] = useState(user?.phone || '9876543210');
  const [ageGroup, setAgeGroup] = useState('35-45 yrs');
  const [district, setDistrict] = useState(user?.district || 'Surat');
  const [city, setCity] = useState(user?.city || user?.taluka || 'Kamrej');
  const [taluka, setTaluka] = useState(user?.taluka || user?.city || 'Kamrej');
  const [village, setVillage] = useState(user?.village || 'Kamrej');
  const [isCustomVillage, setIsCustomVillage] = useState(false);
  const [pincode, setPincode] = useState('394185');
  const [surveyNo, setSurveyNo] = useState('Block 142/A');
  const [landmark, setLandmark] = useState('Near Canal / નહેર પાસે');

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

  // Step 2: GPS Farm Location States
  const [lat, setLat] = useState('21.2721');
  const [lng, setLng] = useState('72.9546');
  const [accuracy, setAccuracy] = useState('4.2m (High Precision)');

  // Step 3: Land & Irrigation States
  const [unit, setUnit] = useState<UnitType>('Vigha (વીઘા)');
  const [totalArea, setTotalArea] = useState<number>(4.5);
  const [cultivableArea, setCultivableArea] = useState<number>(4.0);
  const [fallowArea, setFallowArea] = useState<number>(0.5);
  const [ownership, setOwnership] = useState<OwnershipType>('Own Land');
  const [soilType, setSoilType] = useState('Deep Black Cotton Soil (કાળી કાંપવાળી)');
  const [waterSource, setWaterSource] = useState<string[]>(['Borewell', 'Canal']);
  const [irrigationTechnique, setIrrigationTechnique] = useState('Drip Irrigation');
  const [waterAvailability, setWaterAvailability] = useState('12 Months');

  // Step 4: Soil & Crop Selection States
  const [season, setSeason] = useState('Kharif Season');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['cotton', 'groundnut']);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleCrop = (id: string) => {
    if (selectedCrops.includes(id)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter((c) => c !== id));
      } else {
        showToast('Please keep at least 1 primary crop selected');
      }
    } else {
      setSelectedCrops([...selectedCrops, id]);
    }
  };

  const toggleWaterSource = (source: string) => {
    if (waterSource.includes(source)) {
      if (waterSource.length > 1) {
        setWaterSource(waterSource.filter((s) => s !== source));
      }
    } else {
      setWaterSource([...waterSource, source]);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Finish Onboarding & persist all collected farm data
      const farmParcel: FarmParcel = {
        id: 'farm_' + Date.now(),
        farmerId: user?.id || 'usr_demo',
        totalArea,
        cultivableArea,
        fallowArea,
        unit,
        ownership,
        soilType,
        waterSources: waterSource,
        irrigationTechnique,
        waterAvailability,
        coordinates: {
          lat: parseFloat(lat) || 21.2721,
          lng: parseFloat(lng) || 72.9546,
          accuracy,
        },
        season,
        surveyNo,
        landmark,
        selectedCrops,
      };
      farmService.saveFarmParcel(farmParcel);

      // Update farmer account
      updateProfile({
        name: farmerName,
        phone,
        district,
        city,
        village,
        taluka,
        pincode,
        ageGroup,
        kycDone: true,
      });

      // Synchronize plots
      const currentPlots = farmService.getPlots();
      if (currentPlots.A) {
        currentPlots.A.area = `${(cultivableArea * 0.6).toFixed(1)} ${unit.includes('Vigha') ? 'Vigha' : 'Acres'}`;
        currentPlots.A.soilType = soilType;
        currentPlots.A.irrigation = irrigationTechnique;
        farmService.savePlot(currentPlots.A);
      }
      if (currentPlots.B) {
        currentPlots.B.area = `${(cultivableArea * 0.4).toFixed(1)} ${unit.includes('Vigha') ? 'Vigha' : 'Acres'}`;
        currentPlots.B.soilType = soilType;
        currentPlots.B.irrigation = irrigationTechnique;
        farmService.savePlot(currentPlots.B);
      }

      showToast('Farm parcel registered successfully with Sentinel-2 link!');
      setTimeout(() => {
        navigate('/my-farm');
      }, 600);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/login');
    }
  };

  const progressPercentages = [25, 50, 75, 100];
  const stepTitles = [
    'Farmer Profile / ખેડૂત પરિચય',
    'Farm Location / ખેતરનું સ્થળ',
    'Land & Irrigation / જમીન અને સિંચાઈ',
    'Soil & Crops / પાક પસંદગી',
  ];

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased flex flex-col pt-safe pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Go back"
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-primary leading-none">AgroMind AI</span>
              <span className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                Consolidated Farmer Onboarding
              </span>
            </div>
          </div>
        </div>

        {/* Step Counter Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-extrabold tracking-wide">
            STEP {currentStep} OF 4
          </span>
        </div>
      </header>

      {/* Main Container - Responsive for Web (max-w-4xl) & Mobile */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 space-y-5">
        {/* Wizard Progress Bar */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-secondary uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                STEP {currentStep} OF 4
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-primary mt-0.5">
                {stepTitles[currentStep - 1]}
              </h1>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-extrabold text-secondary">
                {progressPercentages[currentStep - 1]}% Done
              </span>
              <span className="text-[10px] text-on-surface-variant">
                {currentStep === 4 ? 'Almost Finished!' : `${5 - currentStep} min remaining`}
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-secondary h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentages[currentStep - 1]}%` }}
            />
          </div>

          {/* Interactive Step Pills */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { num: 1, label: '1. Profile', icon: 'person' },
              { num: 2, label: '2. Location', icon: 'pin_drop' },
              { num: 3, label: '3. Land & Water', icon: 'water_drop' },
              { num: 4, label: '4. Soil & Crops', icon: 'agriculture' },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                  currentStep === s.num
                    ? 'bg-secondary text-white border-secondary shadow-sm'
                    : currentStep > s.num
                    ? 'bg-secondary-container/60 text-secondary border-transparent'
                    : 'bg-surface-container-low text-on-surface-variant border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {currentStep > s.num ? 'check_circle' : s.icon}
                </span>
                <span className="truncate w-full text-center text-[11px]">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* STEP 1: FARMER PROFILE                                                */}
        {/* ===================================================================== */}
        {currentStep === 1 && (
          <div className="bg-surface-container-lowest p-5 sm:p-7 rounded-2xl shadow-sm border border-outline-variant/30 space-y-5 animate-in fade-in duration-200">
            {/* Avatar & Photo */}
            <div className="flex flex-col items-center text-center py-2">
              <div className="relative">
                <img
                  src="/farmer-hero.jpg"
                  alt="Farmer Avatar"
                  className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-secondary-container"
                />
                <button
                  type="button"
                  onClick={() => showToast('Photo uploaded successfully!')}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </button>
              </div>
              <span className="text-sm font-bold text-primary mt-2">Farmer Photo / ફોટો ઉમેરો</span>
              <span className="text-[11px] text-on-surface-variant">
                Optional • Quick identification for APMC Mandi gate pass
              </span>
            </div>

            {/* Grid for Name & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-primary flex items-center justify-between">
                  <span>Full Name / ખેડૂતનું નામ</span>
                  <span className="text-[11px] text-secondary font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">verified</span> Pre-filled
                  </span>
                </label>
                <div className="bg-surface-container-low rounded-xl p-3 flex items-center gap-2.5 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-secondary">badge</span>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full bg-transparent font-bold text-sm text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-primary">
                  Mobile Number / મોબાઈલ નંબર
                </label>
                <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between border border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">phonelink_lock</span>
                    <span className="font-bold text-sm text-primary">+91 {phone}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-secondary text-[10px] font-bold">
                    ✓ OTP Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Age Group Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary block">
                Farmer Age Group / ઉંમર (વૈકલ્પિક)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['18-25', '26-35', '35-45 yrs', '45+ yrs'].map((ag) => (
                  <button
                    key={ag}
                    type="button"
                    onClick={() => setAgeGroup(ag)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all ${
                      ageGroup === ag
                        ? 'bg-secondary text-white shadow-sm'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {ag}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Details Grid */}
            <div className="pt-2 border-t border-outline-variant/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">
                  Location Details / સ્થળની વિગતો
                </span>
                <span className="text-[11px] text-secondary font-bold flex items-center gap-1 bg-secondary-container/50 px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[14px]">my_location</span>
                  Auto GPS Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* 1. All India District Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary">District / જિલ્લો</label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-primary focus:outline-none"
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

                {/* 2. City / Taluka Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary">City / Taluka / તાલુકો</label>
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-primary focus:outline-none"
                  >
                    {getCitiesForDistrict(district).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Taluka / Area / Village Selection */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-primary">Village / ગામ</label>
                    {isCustomVillage && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomVillage(false);
                          const areas = getAreasForCity(city, district);
                          setVillage(areas[0] || '');
                        }}
                        className="text-[10px] text-secondary font-bold hover:underline"
                      >
                        ← List
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
                      className="w-full bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-primary focus:outline-none"
                    >
                      {getAreasForCity(city, district).map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                      <option value="__CUSTOM__">➕ + Custom Village...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="Village / area name..."
                      className="w-full bg-surface-container-low p-2.5 rounded-xl border-2 border-secondary text-xs font-bold text-primary focus:outline-none"
                      autoFocus
                    />
                  )}
                </div>

                {/* 4. PIN Code */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary">PIN Code</label>
                  <input
                    type="text"
                    value={pincode}
                    maxLength={6}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary">
                    Survey / ખાતા નં. (વૈકલ્પિક)
                  </label>
                  <input
                    type="text"
                    value={surveyNo}
                    onChange={(e) => setSurveyNo(e.target.value)}
                    className="w-full bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 text-xs font-semibold text-primary focus:outline-none"
                    placeholder="e.g. Block 142/A"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary">
                    Landmark / સીમાચિહ્ન (વૈકલ્પિક)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 text-xs font-semibold text-primary focus:outline-none"
                    placeholder="e.g. Near Canal"
                  />
                </div>
              </div>
            </div>

            {/* Next CTA */}
            <button
              type="button"
              onClick={handleNext}
              className="w-full h-13 bg-secondary hover:bg-primary text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-4"
            >
              <span>Next: Farm Location / ખેતરનું સ્થળ</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 2: FARM LOCATION (MAP PIN DROP)                                  */}
        {/* ===================================================================== */}
        {currentStep === 2 && (
          <div className="bg-surface-container-lowest p-5 sm:p-7 rounded-2xl shadow-sm border border-outline-variant/30 space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">pin_drop</span>
                Pinpoint Farm Parcel on Map / ખેતર નકશા પર પસંદ કરો
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Accurate boundaries power Sentinel-2 satellite NDVI index, hyper-local rainfall forecasting, and heat stress alerts.
              </p>
            </div>

            {/* Stylized Interactive Map Preview */}
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border-2 border-secondary/40 shadow-inner bg-surface-container">
              {/* Agricultural Satellite Texture / Field Map Simulation */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-primary/10 to-surface-container flex items-center justify-center">
                {/* Cadastral Polygon Simulation */}
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 border-2 border-dashed border-secondary bg-secondary-container/25 rounded-3xl flex items-center justify-center shadow-lg">
                  {/* Pulsing GPS Center Pin */}
                  <div className="flex flex-col items-center animate-bounce">
                    <span className="material-symbols-outlined text-[36px] text-secondary fill drop-shadow-md">
                      location_on
                    </span>
                    <span className="text-[10px] font-mono font-extrabold bg-primary text-white px-2 py-0.5 rounded-full shadow">
                      Kamrej Plot
                    </span>
                  </div>
                </div>
              </div>

              {/* Map Controls Overlay */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => showToast('GPS re-calibrated (+- 3.1m)')}
                  className="w-10 h-10 rounded-xl bg-surface-container-lowest shadow-md text-primary flex items-center justify-center hover:bg-surface-container active:scale-95"
                  title="Current GPS Location"
                >
                  <span className="material-symbols-outlined text-[20px]">my_location</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Satellite layer active')}
                  className="w-10 h-10 rounded-xl bg-surface-container-lowest shadow-md text-secondary flex items-center justify-center hover:bg-surface-container active:scale-95"
                  title="Satellite View"
                >
                  <span className="material-symbols-outlined text-[20px]">satellite_alt</span>
                </button>
              </div>

              {/* Telemetry Bar at bottom of map */}
              <div className="absolute bottom-3 inset-x-3 bg-surface-container-lowest/90 backdrop-blur-md p-3 rounded-xl shadow-sm border border-outline-variant/30 flex items-center justify-between text-xs font-mono">
                <span className="text-primary font-bold">
                  Lat: {lat}° N, Lng: {lng}° E
                </span>
                <span className="text-secondary font-bold">{accuracy}</span>
              </div>
            </div>

            {/* Parcel Meta Confirmation */}
            <div className="p-3.5 rounded-xl bg-secondary-container/40 border border-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[22px]">verified</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-primary">
                    i-Khedut Surat Survey No. #842 Matched
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    Cadastral farm coordinates verified with Revenue Department records
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation CTAs */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 h-13 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs transition-all"
              >
                Back / પાછા
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-[2] h-13 bg-secondary hover:bg-primary text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>Next: Land & Irrigation / જમીન & સિંચાઈ</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 3: LAND & IRRIGATION INFRASTRUCTURE                              */}
        {/* ===================================================================== */}
        {currentStep === 3 && (
          <div className="bg-surface-container-lowest p-5 sm:p-7 rounded-2xl shadow-sm border border-outline-variant/30 space-y-5 animate-in fade-in duration-200">
            {/* Land Size Unit & Stepper */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[20px]">square_foot</span>
                  Total Land Size / કુલ જમીન વિસ્તાર
                </label>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-secondary text-[11px] font-bold">
                  Required / ફરજિયાત
                </span>
              </div>

              {/* Unit Selector Pills */}
              <div className="grid grid-cols-4 gap-2">
                {(['Vigha (વીઘા)', 'Acre (એકર)', 'Guntha (ગુંઠા)', 'Hectare (હેક્ટર)'] as UnitType[]).map(
                  (u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`h-11 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                        unit === u
                          ? 'bg-secondary text-white shadow-sm'
                          : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span>{u.split(' ')[0]}</span>
                      <span className="text-[10px] opacity-80">{u.split(' ')[1]}</span>
                    </button>
                  )
                )}
              </div>

              {/* Stepper Input */}
              <div className="bg-surface-container-low rounded-2xl p-4 flex items-center justify-between border border-outline-variant/30">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-primary">{totalArea.toFixed(1)}</span>
                  <span className="text-sm font-bold text-secondary">{unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTotalArea((prev) => Math.max(0.5, prev - 0.5))}
                    className="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary font-bold text-lg flex items-center justify-center shadow-sm hover:bg-surface-container active:scale-95 transition-all"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => setTotalArea((prev) => prev + 0.5)}
                    className="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary font-bold text-lg flex items-center justify-center shadow-sm hover:bg-surface-container active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container flex items-center justify-between text-xs text-on-surface-variant">
                <span>Standard Gujarat Conversion:</span>
                <span className="font-bold text-primary bg-surface-container-lowest px-2 py-0.5 rounded shadow-sm">
                  1 Acre ≈ 2.5 Vigha (વીઘા)
                </span>
              </div>
            </div>

            {/* Land Ownership */}
            <div className="space-y-2 pt-2 border-t border-outline-variant/20">
              <label className="text-xs font-bold text-primary block">
                Land Ownership Status / જમીન માલિકી પ્રકાર
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['Own Land', 'Leased', 'Shared'] as OwnershipType[]).map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOwnership(o)}
                    className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                      ownership === o
                        ? 'bg-secondary text-white border-secondary shadow-sm'
                        : 'bg-surface-container-low text-on-surface border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <span>{o}</span>
                    <span className="text-[10px] opacity-80">
                      {o === 'Own Land' ? 'પોતાની જમીન' : o === 'Leased' ? 'ગણોત (ભાડે)' : 'ભાગીદારી'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Detected Soil Type Card */}
            <div className="p-4 rounded-2xl bg-secondary-container/40 border-2 border-secondary space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">grass</span>
                  <div>
                    <span className="text-xs font-extrabold text-primary block">
                      AI Detected Soil: Deep Black Cotton Soil
                    </span>
                    <span className="text-[11px] text-secondary font-bold">
                      કાળી કાંપવાળી જમીન (94% Regional Match)
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-secondary text-white text-[10px] font-bold">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                High moisture retention, rich in clay montmorillonite. Ideal for Cotton (કપાસ), Sugarcane (શેરડી), and Groundnut (મગફળી).
              </p>
            </div>

            {/* Primary Water Source & Irrigation */}
            <div className="space-y-3 pt-2 border-t border-outline-variant/20">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-secondary text-[18px]">water</span>
                  Water Source / પાણીનો સ્ત્રોત
                </label>
                <span className="text-[10px] text-on-surface-variant">Multi-select</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { name: 'Borewell', sub: 'બોરવેલ', icon: 'cyclone' },
                  { name: 'Canal', sub: 'નર્મદા કેનાલ', icon: 'waves' },
                  { name: 'Open Well', sub: 'કૂવો', icon: 'water_drop' },
                  { name: 'Farm Pond', sub: 'ખેત તલાવડી', icon: 'pool' },
                ].map((ws) => {
                  const isSel = waterSource.includes(ws.name);
                  return (
                    <button
                      key={ws.name}
                      type="button"
                      onClick={() => toggleWaterSource(ws.name)}
                      className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                        isSel
                          ? 'bg-secondary text-white border-secondary shadow-sm'
                          : 'bg-surface-container-low text-on-surface border-transparent hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{ws.icon}</span>
                      <span>{ws.name}</span>
                      <span className="text-[10px] opacity-80">{ws.sub}</span>
                    </button>
                  );
                })}
              </div>

              {/* Irrigation Technique */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-primary block">
                  Irrigation Technique / પિયત પદ્ધતિ
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'Drip Irrigation', sub: 'ટપક સિંચાઈ (70% બચત)', icon: 'opacity' },
                    { name: 'Sprinkler System', sub: 'ફુવારા પદ્ધતિ', icon: 'grain' },
                    { name: 'Flood / Furrow', sub: 'ધોરિયા પિયત', icon: 'water_full' },
                    { name: 'Rain Gun', sub: 'રેઈન ગન', icon: 'mode_fan' },
                  ].map((it) => (
                    <button
                      key={it.name}
                      type="button"
                      onClick={() => setIrrigationTechnique(it.name)}
                      className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                        irrigationTechnique === it.name
                          ? 'bg-secondary text-white border-secondary shadow-sm'
                          : 'bg-surface-container-low text-on-surface border-transparent hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{it.icon}</span>
                      <span className="text-center">{it.name}</span>
                      <span className="text-[10px] opacity-80 text-center">{it.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation CTAs */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 h-13 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs transition-all"
              >
                Back / પાછા
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-[2] h-13 bg-secondary hover:bg-primary text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>Next: Soil & Crops / પાક પસંદગી</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 4: SOIL & CROPS SELECTION                                        */}
        {/* ===================================================================== */}
        {currentStep === 4 && (
          <div className="bg-surface-container-lowest p-5 sm:p-7 rounded-2xl shadow-sm border border-outline-variant/30 space-y-5 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">agriculture</span>
                  Crop Selection & Allocation / મુખ્ય પાક પસંદગી
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-secondary text-[11px] font-bold">
                  Surat Tapi Cluster
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Select active crops for autonomous AI pest/disease diagnosis, APMC mandi rate tracking, and irrigation schedule recommendations.
              </p>
            </div>

            {/* Farming Season Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary block">
                Farming Season / ખેતી સીઝન
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Kharif Season', sub: 'ચોમાસુ (જૂન-ઓક્ટો)' },
                  { name: 'Rabi Season', sub: 'શિયાળુ (નવે-ફેબ્રુ)' },
                  { name: 'Zaid Season', sub: 'ઉનાળુ (માર્ચ-મે)' },
                ].map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSeason(s.name)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all flex flex-col items-center justify-center ${
                      season === s.name
                        ? 'bg-secondary text-white shadow-sm'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] opacity-80">{s.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-Crop Acreage Allocation Bar */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  Multi-Crop Acreage Allocation
                </span>
                <span className="text-xs font-bold text-secondary">Total: 4.5 Vigha</span>
              </div>

              {/* Progress Stack Bar */}
              <div className="w-full bg-surface-container-high h-3.5 rounded-full overflow-hidden flex">
                <div className="bg-secondary h-full" style={{ width: '66.6%' }} title="Cotton: 3.0 Vigha" />
                <div className="bg-amber-600 h-full" style={{ width: '22.2%' }} title="Groundnut: 1.0 Vigha" />
                <div className="bg-outline-variant h-full" style={{ width: '11.2%' }} title="Fallow: 0.5 Vigha" />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5 text-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0" />
                  <span>Cotton: 3.0 V</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
                  <span>Groundnut: 1.0 V</span>
                </div>
                <div className="flex items-center gap-1.5 text-outline">
                  <span className="w-2.5 h-2.5 rounded-full bg-outline-variant shrink-0" />
                  <span>Fallow: 0.5 V</span>
                </div>
              </div>
            </div>

            {/* Recommended Crops Multi-select Cards */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-primary">
                  Select Crops / પાક પસંદ કરો
                </label>
                <span className="text-[11px] text-secondary font-bold">
                  Tap to add or remove
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'cotton',
                    name: 'Cotton / કપાસ',
                    sub: 'BT-2 Shankar-6 Hybrid (160-180 Days)',
                    tag: 'Active (3.0 Vigha)',
                    icon: 'eco',
                  },
                  {
                    id: 'groundnut',
                    name: 'Groundnut / મગફળી',
                    sub: 'Gujarat Groundnut-20 (High Oil)',
                    tag: 'Active (1.0 Vigha)',
                    icon: 'grass',
                  },
                  {
                    id: 'sugarcane',
                    name: 'Sugarcane / શેરડી',
                    sub: 'Co-86032 Tapi Sugar Belt',
                    tag: 'Perennial',
                    icon: 'nature',
                  },
                  {
                    id: 'banana',
                    name: 'Banana / કેળા',
                    sub: 'Grand Naine (G9) Drip Suitable',
                    tag: 'Cash Crop',
                    icon: 'park',
                  },
                  {
                    id: 'wheat',
                    name: 'Wheat / ઘઉં',
                    sub: 'GW-496 / Lokwan Winter Rotation',
                    tag: 'Rabi Staple',
                    icon: 'grain',
                  },
                  {
                    id: 'chilli',
                    name: 'Vegetables & Chilli / મરચી',
                    sub: 'Daily APMC Mandi Harvest',
                    tag: 'High Return',
                    icon: 'nutrition',
                  },
                ].map((crop) => {
                  const isSelected = selectedCrops.includes(crop.id);
                  return (
                    <div
                      key={crop.id}
                      onClick={() => toggleCrop(crop.id)}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-secondary-container/50 border-secondary shadow-sm'
                          : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                          isSelected ? 'bg-secondary text-white' : 'bg-surface-container-high text-primary'
                        }`}>
                          <span className="material-symbols-outlined text-[22px]">{crop.icon}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-primary">{crop.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container-lowest text-secondary font-bold">
                              {crop.tag}
                            </span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant truncate mt-0.5">
                            {crop.sub}
                          </span>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-secondary text-white' : 'border border-outline-variant text-transparent'
                      }`}>
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Crop Rotation Synergies Note */}
            <div className="p-3 bg-secondary-container/30 rounded-xl border border-secondary/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">published_with_changes</span>
                <span className="text-primary font-medium">
                  Previous: <strong>Wheat GW-496</strong> → Ideal biological nitrogen balance for Cotton!
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-secondary text-white text-[10px] font-bold">
                +18% Yield Boost
              </span>
            </div>

            {/* Final Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 h-13 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs transition-all"
              >
                Back / પાછા
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex-[2] h-13 bg-secondary hover:bg-primary text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>Complete Onboarding & Enter My Farm</span>
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
