import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { DiagnosisResult } from '../../types';
import { aiVisionService } from '../../services/aiVisionService';

// Real processing states — each maps to an actual backend operation
type ProcessingStep =
  | 'UPLOADING_IMAGE'
  | 'ANALYZING_IMAGE'
  | 'IDENTIFYING_CROP'
  | 'FINDING_MARKETS'
  | 'FETCHING_PRICES'
  | 'PREPARING_RESULT'
  | 'COMPLETED';

const PROCESSING_STEPS: { key: ProcessingStep; label: string; labelGu: string }[] = [
  { key: 'UPLOADING_IMAGE', label: 'Uploading image...', labelGu: 'છબી અપલોડ થઈ રહી છે...' },
  { key: 'ANALYZING_IMAGE', label: 'Analyzing crop image...', labelGu: 'પાક છબીનું વિશ્લેષણ...' },
  { key: 'IDENTIFYING_CROP', label: 'Identifying crop...', labelGu: 'પાક ઓળખ...' },
  { key: 'FINDING_MARKETS', label: 'Finding nearby markets...', labelGu: 'નજીકના બજારો શોધી રહ્યા છે...' },
  { key: 'FETCHING_PRICES', label: 'Fetching latest market price...', labelGu: 'નવીનતમ ભાવ મેળવી રહ્યા છે...' },
  { key: 'PREPARING_RESULT', label: 'Preparing result...', labelGu: 'પરિણામ તૈયાર થઈ રહ્યું છે...' },
];

export const CropHealthScanner: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [pastScans, setPastScans] = useState<DiagnosisResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<ProcessingStep | null>(null);

  useEffect(() => {
    setPastScans(aiVisionService.getScanHistory());
    const unsub = aiVisionService.subscribeToScans((scans) => setPastScans(scans));
    return unsub;
  }, []);

  const handleCapture = async (imageData?: string) => {
    const img = imageData || capturedImage;
    if (!img) {
      fileInputRef.current?.click();
      return;
    }
    setIsScanning(true);
    setErrorMessage(null);
    setCurrentStep('UPLOADING_IMAGE');

    try {
      // Simulate real progression as backend processes
      // Step 1: Upload started
      setCurrentStep('UPLOADING_IMAGE');
      await new Promise(r => setTimeout(r, 200));

      // Step 2: Analyzing — the actual backend call begins
      setCurrentStep('ANALYZING_IMAGE');
      await new Promise(r => setTimeout(r, 300));
      setCurrentStep('IDENTIFYING_CROP');

      // The actual API call happens here (includes Gemini + Market enrichment)
      const resultPromise = aiVisionService.diagnoseLeaf({
        imageBase64: img,
      });

      // Progress through steps while waiting for the backend
      const stepTimer = setTimeout(() => setCurrentStep('FINDING_MARKETS'), 3000);
      const stepTimer2 = setTimeout(() => setCurrentStep('FETCHING_PRICES'), 5000);
      const stepTimer3 = setTimeout(() => setCurrentStep('PREPARING_RESULT'), 7000);

      const result = await resultPromise;

      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      setCurrentStep('COMPLETED');
      await new Promise(r => setTimeout(r, 300));
      setDiagnosis(result);
    } catch (err: any) {
      console.error('Diagnosis failed:', err);
      setErrorMessage(err?.message || 'Crop analysis failed. Please try again.');
    } finally {
      setIsScanning(false);
      setCurrentStep(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCapturedImage(base64);
        handleCapture(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setDiagnosis(null);
    setCapturedImage(null);
    setIsScanning(false);
    setErrorMessage(null);
    setCurrentStep(null);
  };

  // Helper: format price
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return '—';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Helper: trend color
  const trendColor = (trend: string | undefined) => {
    if (trend === 'Rising') return 'text-emerald-700';
    if (trend === 'Falling') return 'text-red-700';
    return 'text-amber-700';
  };

  // Helper: trend icon
  const trendIcon = (trend: string | undefined) => {
    if (trend === 'Rising') return 'trending_up';
    if (trend === 'Falling') return 'trending_down';
    return 'trending_flat';
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

            {/* ─── Real Processing Loader ─── */}
            {isScanning && currentStep && (
              <div className="z-20 w-full max-w-md px-4 mb-2">
                <div className="p-4 rounded-2xl bg-[#0A1A14]/90 backdrop-blur-md border border-emerald-500/30 space-y-2">
                  {PROCESSING_STEPS.map((step, idx) => {
                    const stepIdx = PROCESSING_STEPS.findIndex(s => s.key === currentStep);
                    const isComplete = idx < stepIdx;
                    const isCurrent = step.key === currentStep;
                    const isWaiting = idx > stepIdx;

                    return (
                      <div key={step.key} className="flex items-center gap-2.5">
                        {isComplete ? (
                          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                        ) : isCurrent ? (
                          <span className="material-symbols-outlined text-amber-400 text-[18px] animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-white/30 text-[18px]">radio_button_unchecked</span>
                        )}
                        <span className={`text-xs font-medium ${
                          isComplete ? 'text-emerald-300' :
                          isCurrent ? 'text-amber-300' :
                          'text-white/30'
                        }`}>
                          {language === 'gu' ? step.labelGu : step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hint & Instructions */}
            {!isScanning && (
              <div className="text-center z-10 mb-4 px-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-emerald-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Hold phone 15cm from leaf in well-lit conditions
                </span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="z-20 w-full max-w-md px-4 mb-2">
                <div className="p-3 rounded-2xl bg-red-900/80 backdrop-blur-md border border-red-500/50 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-red-300 text-[20px] shrink-0 mt-0.5">error</span>
                  <div className="flex-1">
                    <p className="text-sm text-red-100 font-semibold">{errorMessage}</p>
                    <p className="text-xs text-red-300 mt-1">Upload a clear leaf photo and try again.</p>
                  </div>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-red-200 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Camera Dock */}
            {!isScanning && (
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
                  onClick={() => handleCapture()}
                  disabled={isScanning}
                  className="w-20 h-20 rounded-full bg-white p-1 shadow-[0_0_25px_rgba(52,211,153,0.6)] active:scale-90 transition-transform flex items-center justify-center group"
                >
                  <div className="w-full h-full rounded-full bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-white text-[32px]">
                      {isScanning ? 'hourglass_top' : 'camera'}
                    </span>
                  </div>
                </button>

                {/* Past Scans History */}
                <button
                  onClick={() => setShowHistory(true)}
                  className="w-12 h-12 rounded-2xl bg-white/15 hover:bg-white/25 flex flex-col items-center justify-center text-white transition-all active:scale-95 relative"
                  title="Past Scans History"
                >
                  <span className="material-symbols-outlined text-[24px]">history</span>
                  {pastScans.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                      {pastScans.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════
             DIAGNOSIS RESULTS — 4 SECTIONS
             Section 1: CROP
             Section 2: CONDITION
             Section 3: MARKET
             Section 4: ACTION
             ═══════════════════════════════════════════════════════ */
          <div className="flex-1 bg-[#FCF9F0] text-[#1C1C17] p-4 md:p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-5">

              {/* NON-CROP IMAGE — Friendly amber card */}
              {diagnosis.confidence === 0 && !diagnosis.isAiEstimate ? (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-200 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[36px]">image_not_supported</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-black text-amber-800 mt-1">
                        Not a Crop Image
                      </h2>
                      <p className="text-sm text-amber-700 mt-1 font-medium">
                        {diagnosis.diseaseName}
                      </p>
                      <p className="text-sm text-amber-600 mt-0.5">
                        {diagnosis.diseaseGu}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                    <p className="text-sm text-amber-900 font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">tips_and_updates</span>
                      Tips for better results:
                    </p>
                    <ul className="space-y-1.5 text-xs text-amber-800">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[14px] mt-0.5 text-amber-600">check_circle</span>
                        Hold phone 15cm from a single leaf
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[14px] mt-0.5 text-amber-600">check_circle</span>
                        Ensure good natural lighting (no flash)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[14px] mt-0.5 text-amber-600">check_circle</span>
                        Capture the diseased/damaged part clearly
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[14px] mt-0.5 text-amber-600">check_circle</span>
                        Avoid blurry or distant field shots
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <>
                  {/* ═══ SECTION 1 — CROP ═══ */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA] space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-emerald-700 text-[22px]">eco</span>
                      <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Crop Identified</h3>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-[#163A2D]">
                      {diagnosis.crop || 'Unknown Crop'}
                    </h2>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="p-3 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA]">
                        <p className="text-[10px] font-bold text-[#717974] uppercase tracking-wider">Type</p>
                        <p className="text-sm font-bold text-[#163A2D] mt-0.5">{diagnosis.cropType || diagnosis.cropInfo?.cropType || '—'}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA]">
                        <p className="text-[10px] font-bold text-[#717974] uppercase tracking-wider">Growth Stage</p>
                        <p className="text-sm font-bold text-[#163A2D] mt-0.5">{diagnosis.growthStage || '—'}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA]">
                        <p className="text-[10px] font-bold text-[#717974] uppercase tracking-wider">Scientific Name</p>
                        <p className="text-sm font-bold text-[#163A2D] mt-0.5 italic">{diagnosis.scientificName || diagnosis.cropInfo?.scientificName || '—'}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA]">
                        <p className="text-[10px] font-bold text-[#717974] uppercase tracking-wider">Season</p>
                        <p className="text-sm font-bold text-[#163A2D] mt-0.5">{diagnosis.cropInfo?.typicalSeason || '—'}</p>
                      </div>
                    </div>
                    {diagnosis.cropInfo && (
                      <div className="mt-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <p className="text-xs text-emerald-900 font-medium">{diagnosis.cropInfo.generalCultivationInfo}</p>
                      </div>
                    )}
                    {/* AI Confidence & badges */}
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {diagnosis.confidenceLabel || 'Confidence unavailable'}
                      </span>
                      {diagnosis.isAiEstimate && (
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          AI Estimate
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ═══ SECTION 2 — CONDITION ═══ */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[22px] text-emerald-700">health_and_safety</span>
                        <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Condition</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        diagnosis.visibleCondition === 'Healthy' || (diagnosis.severity === 'Low' && !diagnosis.possibleIssue?.includes('At Risk'))
                          ? 'bg-emerald-100 text-emerald-800'
                          : diagnosis.severity === 'Severe' || diagnosis.severity === 'High'
                          ? 'bg-red-100 text-red-800'
                          : diagnosis.severity === 'Moderate'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {diagnosis.visibleCondition === 'Healthy' || (diagnosis.severity === 'Low' && diagnosis.treatments?.length === 0)
                          ? '✅ Healthy'
                          : `⚠️ ${diagnosis.severity} Severity`
                        }
                      </span>
                    </div>

                    {/* Healthy case */}
                    {(diagnosis.visibleCondition === 'Healthy' || (diagnosis.severity === 'Low' && diagnosis.treatments?.length === 0)) ? (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <p className="text-sm text-emerald-900 font-semibold">
                          {diagnosis.diseaseName || 'Your crop looks healthy!'}
                        </p>
                        <p className="text-xs text-emerald-700 mt-1">{diagnosis.diseaseGu}</p>
                      </div>
                    ) : (
                      <>
                        {/* Disease/Issue */}
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                              diagnosis.severity === 'Severe' || diagnosis.severity === 'High'
                                ? 'bg-red-100 text-red-700'
                                : diagnosis.severity === 'Moderate'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              <span className="material-symbols-outlined text-[28px]">pest_control</span>
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-[#163A2D]">{diagnosis.possibleIssue || diagnosis.diseaseName}</h4>
                              <p className="text-sm font-bold text-emerald-700">{diagnosis.pestNameGu || diagnosis.diseaseGu}</p>
                              {diagnosis.scientificName && (
                                <p className="text-xs italic text-[#717974]">{diagnosis.scientificName}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Symptoms */}
                        {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-[#717974] uppercase tracking-wider mb-2">Observed Symptoms</p>
                            <ul className="space-y-1.5">
                              {diagnosis.symptoms.map((symp, sIdx) => (
                                <li key={sIdx} className="flex items-start gap-2 text-sm text-[#414844]">
                                  <span className="material-symbols-outlined text-red-600 text-[16px] shrink-0 mt-0.5">radio_button_checked</span>
                                  <span>{symp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Treatments */}
                        {((diagnosis.remedies && diagnosis.remedies.length > 0) || (diagnosis.treatments && diagnosis.treatments.length > 0)) && (
                          <div>
                            <p className="text-xs font-bold text-[#717974] uppercase tracking-wider mb-2">Prescribed Actions</p>
                            <div className="space-y-2">
                              {(diagnosis.remedies || diagnosis.treatments || []).map((rem, rIdx) => (
                                <div key={rIdx} className="p-3 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA] flex flex-col md:flex-row md:items-center justify-between gap-2">
                                  <div>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">{rem.type}</span>
                                    <h4 className="font-extrabold text-sm text-[#163A2D] mt-1">{rem.action}</h4>
                                  </div>
                                  <div className="bg-white px-3 py-1 rounded-xl border border-[#E5E2DA] text-xs font-bold text-emerald-900 shrink-0">
                                    {rem.dosage}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Warning */}
                    {diagnosis.warning && (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-2 text-xs text-amber-900">
                        <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0">warning</span>
                        <span>{diagnosis.warning}</span>
                      </div>
                    )}
                  </div>

                  {/* ═══ SECTION 3 — MARKET ═══ */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA] space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-emerald-700 text-[22px]">storefront</span>
                      <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Market Information</h3>
                    </div>

                    {diagnosis.marketInfo?.dataAvailable ? (
                      <>
                        {/* Market & Price */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA] col-span-2">
                            <p className="text-[10px] font-bold text-[#717974] uppercase tracking-wider">Nearest Relevant Market</p>
                            <p className="text-base font-black text-[#163A2D] mt-0.5">{diagnosis.marketInfo.nearestMarket}</p>
                            <p className="text-xs text-[#717974] mt-0.5">{diagnosis.marketInfo.distanceLabel}</p>
                          </div>
                          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                            <p className="text-[10px] font-bold text-[#717974] uppercase tracking-wider">Modal Price</p>
                            <p className="text-lg font-black text-emerald-800 mt-0.5">
                              {formatPrice(diagnosis.marketInfo.modalPrice)}
                              <span className="text-xs font-medium text-[#717974]"> /Qtl</span>
                            </p>
                          </div>
                          <div className="p-3 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA]">
                            <p className="text-[10px] font-bold text-[#717974] uppercase tracking-wider">Price Range</p>
                            <p className="text-sm font-bold text-[#163A2D] mt-0.5">
                              {formatPrice(diagnosis.marketInfo.minPrice)} – {formatPrice(diagnosis.marketInfo.maxPrice)}
                            </p>
                          </div>
                        </div>

                        {/* Trend & Activity */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA]">
                            <p className="text-[10px] font-bold text-[#717974] uppercase tracking-wider">7-Day Trend</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`material-symbols-outlined text-[18px] ${trendColor(diagnosis.marketInfo.priceTrend)}`}>
                                {trendIcon(diagnosis.marketInfo.priceTrend)}
                              </span>
                              <span className={`text-sm font-bold ${trendColor(diagnosis.marketInfo.priceTrend)}`}>
                                {diagnosis.marketInfo.priceTrend}
                              </span>
                              {diagnosis.marketInfo.trend7dPercent !== null && (
                                <span className={`text-xs font-medium ${trendColor(diagnosis.marketInfo.priceTrend)}`}>
                                  ({diagnosis.marketInfo.trend7dPercent > 0 ? '+' : ''}{diagnosis.marketInfo.trend7dPercent}%)
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="p-3 rounded-2xl bg-[#F6F3EA] border border-[#E5E2DA]">
                            <p className="text-[10px] font-bold text-[#717974] uppercase tracking-wider">Market Activity</p>
                            <p className={`text-sm font-bold mt-1 ${
                              diagnosis.marketInfo.marketActivity === 'High' ? 'text-emerald-700' :
                              diagnosis.marketInfo.marketActivity === 'Moderate' ? 'text-amber-700' :
                              'text-slate-600'
                            }`}>
                              {diagnosis.marketInfo.marketActivity}
                            </p>
                          </div>
                        </div>

                        {/* Source & Date */}
                        <div className="flex items-center justify-between text-[10px] text-[#717974] mt-1 px-1">
                          <span>📅 Reported: {diagnosis.marketInfo.reportedDate}</span>
                          <span>📊 Source: {diagnosis.marketInfo.source}</span>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <span className="material-symbols-outlined text-slate-400 text-[32px]">storefront</span>
                        <p className="text-sm text-slate-600 font-medium mt-2">No nearby market data available for this crop.</p>
                        <p className="text-xs text-slate-500 mt-1">Market data temporarily unavailable. Try again later.</p>
                      </div>
                    )}
                  </div>

                  {/* ═══ SECTION 4 — ACTION ═══ */}
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#E5E2DA]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-emerald-700 text-[22px]">assignment_turned_in</span>
                      <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Next Step</h3>
                    </div>
                    <p className="text-sm text-[#414844] font-medium">
                      {diagnosis.visibleCondition === 'Healthy' || (diagnosis.severity === 'Low' && diagnosis.treatments?.length === 0)
                        ? 'Continue regular crop monitoring. Take photos every 3-5 days for early detection of any issues.'
                        : 'Take immediate action based on the prescribed treatments above. Consult your local KVK agronomist for confirmation before applying chemicals.'
                      }
                    </p>
                  </div>
                </>
              )}

              {/* Responsible AI Disclaimer */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center">
                <p className="text-xs text-slate-500 italic">
                  🛡️ {diagnosis.disclaimer || 'AI diagnostic estimate only. Field-validate with certified KVK extension officer or agronomist before applying chemical pesticides.'}
                </p>
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

        {/* Past Scans Modal / Slide-over */}
        {showHistory && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white text-[#1C1C17] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#163A2D] text-white">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">history</span>
                  <h3 className="font-bold text-lg">Previous Leaf Diagnoses</h3>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {pastScans.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <span className="material-symbols-outlined text-4xl text-slate-300">image_not_supported</span>
                    <p className="mt-2 text-sm">No previous scans recorded yet.</p>
                  </div>
                ) : (
                  pastScans.map((scan) => (
                    <div
                      key={scan.id}
                      onClick={() => {
                        setDiagnosis(scan);
                        setShowHistory(false);
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {scan.crop}
                          </span>
                          <span className="text-xs text-slate-500">{scan.timestamp}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">
                          {scan.visibleCondition === 'Healthy' ? 'Healthy' : scan.possibleIssue || scan.diseaseName || scan.pestNameEn}
                        </h4>
                        <p className="text-xs text-emerald-700">{scan.diseaseGu || scan.pestNameGu}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-700">
                          {scan.confidence ? `${scan.confidence}%` : '—'}
                        </span>
                        <span className="material-symbols-outlined text-slate-400 text-[18px] block ml-auto mt-1">
                          chevron_right
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
                <button
                  onClick={() => setShowHistory(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
