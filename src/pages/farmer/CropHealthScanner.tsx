import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface DiagnosisResult {
  pestNameEn: string;
  pestNameGu: string;
  scientificName: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'High' | 'Severe';
  crop: string;
  stage: string;
  symptoms: string[];
  remedies: {
    type: 'Organic / જૈવિક' | 'Chemical / રાસાયણિક' | 'Cultural / વ્યવસ્થાપન';
    action: string;
    dosage: string;
  }[];
  warning: string;
}

const SAMPLE_DIAGNOSES: Record<string, DiagnosisResult> = {
  cotton_bollworm: {
    pestNameEn: 'Pink Bollworm Infestation',
    pestNameGu: 'ગુલાબી ઈયળનો ઉપદ્રવ (Pink Bollworm)',
    scientificName: 'Pectinophora gossypiella',
    confidence: 96.4,
    severity: 'High',
    crop: 'Bt Cotton (કપાસ)',
    stage: 'Squaring & Flowering Stage',
    symptoms: [
      'Rosetted or flared squares (કમળ જેવી બંધ કળીઓ)',
      'Entry pin-holes in developing green bolls',
      'Premature boll dropping and stained lint',
    ],
    remedies: [
      {
        type: 'Organic / જૈવિક',
        action: 'Install Pheromone Traps with Gossyplure Septa',
        dosage: '5-8 traps / acre at canopy height',
      },
      {
        type: 'Chemical / રાસાયણિક',
        action: 'Emamectin Benzoate 5% SG or Chlorantraniliprole 18.5% SC',
        dosage: '5g per 10L water in late afternoon',
      },
      {
        type: 'Cultural / વ્યવસ્થાપન',
        action: 'Collect and bury dropped rosetted flowers in deep soil pit',
        dosage: 'Daily field sanitation',
      },
    ],
    warning: 'Convective rainfall expected within 48h. Perform spraying only before rain or in clear weather window.',
  },
  groundnut_tikka: {
    pestNameEn: 'Tikka Leaf Spot (Cercospora)',
    pestNameGu: 'ટિક્કા રોગ / પાન પર ટપકાં (Tikka Leaf Spot)',
    scientificName: 'Cercospora arachidicola',
    confidence: 94.8,
    severity: 'Moderate',
    crop: 'Groundnut GG-20 (મગફળી)',
    stage: 'Pegging Stage',
    symptoms: [
      'Circular dark brown/black spots with yellow chlorotic halo',
      'Lower leaves defoliating early',
    ],
    remedies: [
      {
        type: 'Chemical / રાસાયણિક',
        action: 'Carbendazim 12% + Mancozeb 63% WP (Saaf)',
        dosage: '25g per 15L spray pump',
      },
      {
        type: 'Organic / જૈવિક',
        action: 'Neem seed kernel extract (NSKE 5%)',
        dosage: '50ml per 10L water',
      },
    ],
    warning: 'High humidity (>70%) accelerates spore proliferation. Ensure good air circulation.',
  },
};

export const CropHealthScanner: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cropSelection, setCropSelection] = useState<'Cotton' | 'Groundnut' | 'Sugarcane'>('Cotton');
  const [stageSelection, setStageSelection] = useState('Flowering (45-60 d)');
  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  const handleCapture = () => {
    setIsScanning(true);
    // Simulate AI inference
    setTimeout(() => {
      setIsScanning(false);
      if (cropSelection === 'Groundnut') {
        setDiagnosis(SAMPLE_DIAGNOSES.groundnut_tikka);
      } else {
        setDiagnosis(SAMPLE_DIAGNOSES.cotton_bollworm);
      }
    }, 1600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
        handleCapture();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setDiagnosis(null);
    setCapturedImage(null);
    setIsScanning(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#163A2D] text-white flex flex-col justify-between">
      {/* Viewfinder Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#163A2D]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (diagnosis ? handleReset() : navigate(-1))}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div>
            <h1 className="font-extrabold text-base md:text-lg leading-tight">
              AI Crop Health Scanner
            </h1>
            <span className="text-xs text-emerald-300 font-medium">પાક રોગ નિદાન કેમેરો</span>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTorchOn(!torchOn)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              torchOn ? 'bg-amber-400 text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Toggle Flash"
          >
            <span className="material-symbols-outlined text-[20px]">
              {torchOn ? 'flash_on' : 'flash_off'}
            </span>
          </button>
          <button
            onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Flip Camera"
          >
            <span className="material-symbols-outlined text-[20px]">flip_camera_ios</span>
          </button>
        </div>
      </header>

      {/* Main Viewfinder Area */}
      <main className="flex-1 flex flex-col pt-16 pb-24 relative overflow-hidden bg-black">
        {/* Hidden file input for photo upload */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        {!diagnosis ? (
          /* Live Scanner Viewfinder */
          <div className="relative flex-1 flex flex-col items-center justify-between p-4 min-h-[500px]">
            {/* Top Selector Ribbon */}
            <div className="z-20 w-full max-w-md flex items-center gap-2 mt-2">
              {/* Crop Selector */}
              <div className="flex-1 bg-white/15 backdrop-blur-md rounded-2xl p-2 flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-semibold pl-2">Crop:</span>
                <select
                  value={cropSelection}
                  onChange={(e) => setCropSelection(e.target.value as any)}
                  className="bg-transparent text-white font-bold outline-none cursor-pointer pr-1"
                >
                  <option value="Cotton" className="bg-[#163A2D] text-white">Cotton (કપાસ)</option>
                  <option value="Groundnut" className="bg-[#163A2D] text-white">Groundnut (મગફળી)</option>
                  <option value="Sugarcane" className="bg-[#163A2D] text-white">Sugarcane (શેરડી)</option>
                </select>
              </div>

              {/* Stage Selector */}
              <div className="flex-1 bg-white/15 backdrop-blur-md rounded-2xl p-2 flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-semibold pl-2">Stage:</span>
                <select
                  value={stageSelection}
                  onChange={(e) => setStageSelection(e.target.value)}
                  className="bg-transparent text-white font-bold outline-none cursor-pointer pr-1 truncate max-w-[120px]"
                >
                  <option value="Flowering (45-60 d)" className="bg-[#163A2D] text-white">Flowering (45-60d)</option>
                  <option value="Vegetative (20-35 d)" className="bg-[#163A2D] text-white">Vegetative (20-35d)</option>
                  <option value="Pod/Boll Dev (60-90 d)" className="bg-[#163A2D] text-white">Boll Dev (60-90d)</option>
                </select>
              </div>
            </div>

            {/* Viewfinder Target & Reticle */}
            <div className="relative w-72 h-72 md:w-96 md:h-96 my-auto flex items-center justify-center">
              {/* Background simulated leaf preview or uploaded photo */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden bg-[#0A1A14] flex items-center justify-center border border-white/20 shadow-2xl">
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured Foliage"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2 opacity-60">
                    <span className="material-symbols-outlined text-[64px] text-emerald-400 animate-pulse">
                      filter_center_focus
                    </span>
                    <p className="text-xs text-emerald-200">
                      Center diseased leaf or pest damage inside the reticle
                    </p>
                  </div>
                )}
              </div>

              {/* Reticle Corners */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl pointer-events-none" />

              {/* Scanning animation bar */}
              {isScanning && (
                <div className="absolute inset-x-4 h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-pulse top-1/2 -translate-y-1/2 transition-all duration-300" />
              )}
            </div>

            {/* Hint & Instructions */}
            <div className="text-center z-10 mb-4 px-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Hold phone 15cm from leaf in well-lit conditions
              </span>
            </div>

            {/* Bottom Camera Dock */}
            <div className="w-full max-w-md flex items-center justify-around py-4 z-20">
              {/* Upload gallery photo */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-2xl bg-white/15 hover:bg-white/25 flex flex-col items-center justify-center text-white transition-all active:scale-95"
                title="Upload Photo"
              >
                <span className="material-symbols-outlined text-[24px]">photo_library</span>
              </button>

              {/* Big Shutter Button */}
              <button
                onClick={handleCapture}
                disabled={isScanning}
                className="w-20 h-20 rounded-full bg-white p-1 shadow-[0_0_25px_rgba(52,211,153,0.6)] active:scale-90 transition-transform flex items-center justify-center group"
              >
                <div className="w-full h-full rounded-full bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-white text-[32px]">
                    {isScanning ? 'hourglass_top' : 'camera'}
                  </span>
                </div>
              </button>

              {/* Manual Disease Library link */}
              <button
                onClick={() => navigate('/recommendations')}
                className="w-12 h-12 rounded-2xl bg-white/15 hover:bg-white/25 flex flex-col items-center justify-center text-white transition-all active:scale-95"
                title="Pest Library"
              >
                <span className="material-symbols-outlined text-[24px]">menu_book</span>
              </button>
            </div>
          </div>
        ) : (
          /* Diagnosis Results Drawer / View */
          <div className="flex-1 bg-[#FCF9F0] text-[#1C1C17] p-4 md:p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Header result badge */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA] space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
                        {diagnosis.severity} Severity
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {diagnosis.confidence}% Confidence
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-[#163A2D] mt-2">
                      {diagnosis.pestNameEn}
                    </h2>
                    <p className="text-base font-bold text-emerald-700">{diagnosis.pestNameGu}</p>
                    <p className="text-xs italic text-[#717974]">{diagnosis.scientificName}</p>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[32px]">pest_control</span>
                  </div>
                </div>

                {/* Weather Warning */}
                {diagnosis.warning && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs md:text-sm text-amber-900">
                    <span className="material-symbols-outlined text-amber-700 text-[20px] shrink-0">warning</span>
                    <span>{diagnosis.warning}</span>
                  </div>
                )}
              </div>

              {/* Symptoms Identified */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA]">
                <h3 className="text-lg font-bold text-[#163A2D] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700">visibility</span>
                  <span>Diagnostic Symptoms Observed (લક્ષણો)</span>
                </h3>
                <ul className="space-y-2">
                  {diagnosis.symptoms.map((symp, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2.5 text-sm text-[#414844]">
                      <span className="material-symbols-outlined text-red-600 text-[18px] shrink-0 mt-0.5">
                        radio_button_checked
                      </span>
                      <span>{symp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prescribed Remedies */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA]">
                <h3 className="text-lg font-bold text-[#163A2D] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700">medication</span>
                  <span>Immediate Prescribed Actions (ઉપાયો અને દવાઓ)</span>
                </h3>

                <div className="space-y-3">
                  {diagnosis.remedies.map((rem, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-4 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA] flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          {rem.type}
                        </span>
                        <h4 className="font-extrabold text-sm md:text-base text-[#163A2D] mt-1">
                          {rem.action}
                        </h4>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-xl border border-[#E5E2DA] text-xs md:text-sm font-bold text-emerald-900 shrink-0">
                        {rem.dosage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleReset}
                  className="w-full sm:flex-1 py-3 bg-[#F1EEE5] hover:bg-[#E5E2DA] text-[#163A2D] font-bold rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">restart_alt</span>
                  <span>Scan Another Leaf</span>
                </button>

                <button
                  onClick={() => navigate('/admin')}
                  className="w-full sm:flex-1 py-3 bg-[#163A2D] hover:bg-emerald-900 text-white font-bold rounded-2xl text-sm transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">support_agent</span>
                  <span>Consult KVK Agronomist</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
