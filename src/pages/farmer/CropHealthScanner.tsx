import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { DiagnosisResult } from '../../types';
import { aiVisionService } from '../../services/aiVisionService';

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
  const [showHistory, setShowHistory] = useState(false);
  const [pastScans, setPastScans] = useState<DiagnosisResult[]>([]);

  useEffect(() => {
    setPastScans(aiVisionService.getScanHistory());
    const unsub = aiVisionService.subscribeToScans((scans) => setPastScans(scans));
    return unsub;
  }, []);

  const handleCapture = async (imageData?: string) => {
    setIsScanning(true);
    try {
      const img = imageData || capturedImage || undefined;
      const result = await aiVisionService.diagnoseLeaf({
        imageBase64: img,
        crop: cropSelection,
        stage: stageSelection,
      });
      setDiagnosis(result);
    } catch (err) {
      console.error('Diagnosis failed:', err);
    } finally {
      setIsScanning(false);
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
          </div>
        ) : (
          /* Diagnosis Results Drawer / View */
          <div className="flex-1 bg-[#FCF9F0] text-[#1C1C17] p-4 md:p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Header result badge */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA] space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
                        {diagnosis.severity} Severity
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {diagnosis.confidenceLabel || `${diagnosis.confidence}% Confidence`}
                      </span>
                      {diagnosis.isAiEstimate && (
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          AI Estimate
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-[#163A2D] mt-2">
                      {diagnosis.pestNameEn || diagnosis.diseaseName}
                    </h2>
                    <p className="text-base font-bold text-emerald-700">{diagnosis.pestNameGu || diagnosis.diseaseGu}</p>
                    {diagnosis.scientificName && (
                      <p className="text-xs italic text-[#717974]">{diagnosis.scientificName}</p>
                    )}
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[32px]">pest_control</span>
                  </div>
                </div>

                {/* Weather / Critical Warning */}
                {diagnosis.warning && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs md:text-sm text-amber-900">
                    <span className="material-symbols-outlined text-amber-700 text-[20px] shrink-0">warning</span>
                    <span>{diagnosis.warning}</span>
                  </div>
                )}
              </div>

              {/* Symptoms Identified */}
              {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
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
              )}

              {/* Prescribed Remedies */}
              {((diagnosis.remedies && diagnosis.remedies.length > 0) || (diagnosis.treatments && diagnosis.treatments.length > 0)) && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E2DA]">
                  <h3 className="text-lg font-bold text-[#163A2D] mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-700">medication</span>
                    <span>Immediate Prescribed Actions (ઉપાયો અને દવાઓ)</span>
                  </h3>

                  <div className="space-y-3">
                    {(diagnosis.remedies || diagnosis.treatments || []).map((rem, rIdx) => (
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
                          {scan.diseaseName || scan.pestNameEn}
                        </h4>
                        <p className="text-xs text-emerald-700">{scan.diseaseGu || scan.pestNameGu}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-700">{scan.confidence}% match</span>
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
