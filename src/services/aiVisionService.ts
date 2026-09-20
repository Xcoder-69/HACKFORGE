import { DiagnosisResult } from '../types';
import { storageService, STORAGE_KEYS } from './storageService';
import { syncEngine } from '../lib/syncEngine';
import { analyzeImageWithGemini, GeminiDiagnosisResult } from './geminiVisionService';
import { locationService } from './locationService';
import { cropDatabaseService } from './cropDatabaseService';
import type { IAiVisionService, DiagnoseRequest } from '../contracts/ai.contract';

interface DiagnoseParams extends DiagnoseRequest {}

/**
 * User-friendly error messages mapped from internal error codes.
 * These are shown in the UI — no raw technical errors leak through.
 */
const FRIENDLY_ERRORS: Record<string, { en: string; gu: string }> = {
  GEMINI_API_KEY_MISSING: {
    en: 'AI Camera is not configured yet. Please add your Gemini API key in settings.',
    gu: 'AI કેમેરો હજુ સેટ નથી. કૃપા કરીને Gemini API key ઉમેરો.',
  },
  RATE_LIMITED: {
    en: 'AI service is busy right now. Please wait a minute and try again.',
    gu: 'AI સેવા હાલમાં વ્યસ્ત છે. કૃપા કરીને એક મિનિટ રાહ જુઓ.',
  },
  INVALID_API_KEY: {
    en: 'The AI API key is invalid. Please check your configuration.',
    gu: 'AI API key અમાન્ય છે. કૃપા કરીને તમારી સેટિંગ્સ તપાસો.',
  },
  API_ERROR: {
    en: 'Could not reach the AI service. Check your internet connection and try again.',
    gu: 'AI સેવા સુધી પહોંચી શકાયું નથી. ઈન્ટરનેટ કનેક્શન ચેક કરો.',
  },
  EMPTY_RESPONSE: {
    en: 'AI could not analyze this image. Try a clearer, well-lit photo of the leaf.',
    gu: 'AI આ છબીનું વિશ્લેષણ કરી શક્યું નથી. પાનનો સ્પષ્ટ ફોટો ફરી લો.',
  },
  PARSE_ERROR: {
    en: 'AI returned unexpected results. Please try again with a different photo.',
    gu: 'AI એ અણધાર્યું પરિણામ આપ્યું. કૃપા કરીને બીજો ફોટો અજમાવો.',
  },
  NO_IMAGE: {
    en: 'No image provided. Please capture or upload a crop photo first.',
    gu: 'કોઈ છબી નથી. કૃપા કરીને પહેલાં પાક કે પાનનો ફોટો લો.',
  },
  IMAGE_TOO_LARGE: {
    en: 'Image is too large (max 4MB). Please use a smaller photo.',
    gu: 'છબી ખૂબ મોટી છે (મહત્તમ 4MB). નાનો ફોટો વાપરો.',
  },
};

function getFriendlyError(code: string): string {
  return FRIENDLY_ERRORS[code]?.en || FRIENDLY_ERRORS.API_ERROR.en;
}

export const aiVisionService: IAiVisionService = {
  /**
   * Diagnoses leaf image using Gemini Vision API through the backend.
   * Enriches result with crop database info and market data.
   * 
   * INDEPENDENT of farmer profile — uses only:
   * 1. The uploaded image (for crop identification)
   * 2. User's current location (for market lookup only)
   */
  async diagnoseLeaf(params: DiagnoseParams): Promise<DiagnosisResult> {
    const { imageBase64 } = params;

    // Validate: image required
    if (!imageBase64) {
      throw new Error(getFriendlyError('NO_IMAGE'));
    }

    // Validate: size limit (< 4MB)
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const approximateSizeBytes = (base64Data.length * 3) / 4;
    if (approximateSizeBytes > 4 * 1024 * 1024) {
      throw new Error(getFriendlyError('IMAGE_TOO_LARGE'));
    }

    // Get user's current location for market lookup (NOT farm location)
    let lat: number | undefined;
    let lng: number | undefined;
    try {
      const savedLoc = locationService.getSavedLocation();
      lat = savedLoc.latitude;
      lng = savedLoc.longitude;
    } catch {
      // Location unavailable — backend will use default Gujarat coordinates
    }

    // Call Gemini Vision through backend (passes lat/lng for market enrichment)
    let geminiResult: GeminiDiagnosisResult;
    try {
      geminiResult = await analyzeImageWithGemini(imageBase64, lat, lng);
    } catch (err: any) {
      const code = err?.message || 'API_ERROR';
      throw new Error(getFriendlyError(code));
    }

    // CASE 1: Not a crop image — return a special "invalid image" result
    if (!geminiResult.isCropImage) {
      const invalidResult: DiagnosisResult = {
        id: `scan-${Date.now()}`,
        crop: 'Unknown',
        diseaseName: geminiResult.friendlyMessage || 'Not a crop image',
        diseaseGu: geminiResult.friendlyMessageGu || 'આ પાકની છબી નથી',
        confidence: 0,
        confidenceLabel: 'Image Not Recognized',
        severity: 'Low',
        severityColor: 'text-amber-700 bg-amber-100',
        symptoms: [],
        treatments: [],
        warning: geminiResult.friendlyMessage || 'Please upload a clear photo of a crop leaf for diagnosis.',
        timestamp: new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        imageUrl: imageBase64.substring(0, 200),
        isAiEstimate: false,
        isOfflineFallback: false,
        disclaimer: 'The uploaded image was not recognized as a crop or plant. Please try again with a clear leaf photo.',
      };
      // Don't save invalid scans to history
      return invalidResult;
    }

    // Get crop database info (independent of farm)
    const detectedCropName = geminiResult.crop || 'Unknown';
    const cropDbInfo = cropDatabaseService.getCropInformation(detectedCropName);

    // Build cropInfo from database
    const cropInfo = {
      cropName: cropDbInfo.cropName,
      cropNameGu: cropDbInfo.cropNameGu,
      cropType: cropDbInfo.cropType,
      cropTypeGu: cropDbInfo.cropTypeGu,
      scientificName: cropDbInfo.scientificName,
      typicalSeason: cropDbInfo.typicalSeason,
      typicalSeasonGu: cropDbInfo.typicalSeasonGu,
      typicalGrowthDuration: cropDbInfo.typicalGrowthDuration,
      waterRequirement: cropDbInfo.waterRequirement,
      waterRequirementGu: cropDbInfo.waterRequirementGu,
      commonPests: cropDbInfo.commonPests,
      commonDiseases: cropDbInfo.commonDiseases,
      generalCultivationInfo: cropDbInfo.generalCultivationInfo,
      generalCultivationInfoGu: cropDbInfo.generalCultivationInfoGu,
    };

    // Build marketInfo from backend response
    const backendMarketInfo = geminiResult.marketInfo;
    const marketInfo = backendMarketInfo ? {
      nearestMarket: backendMarketInfo.nearestMarket || 'No data',
      distanceKm: backendMarketInfo.distanceKm ?? null,
      distanceLabel: backendMarketInfo.distanceLabel || 'Distance unavailable',
      modalPrice: backendMarketInfo.modalPrice ?? null,
      minPrice: backendMarketInfo.minPrice ?? null,
      maxPrice: backendMarketInfo.maxPrice ?? null,
      reportedDate: backendMarketInfo.reportedDate || '',
      source: backendMarketInfo.source || 'Unavailable',
      priceTrend: backendMarketInfo.priceTrend || 'Insufficient Data' as const,
      trend7dPercent: backendMarketInfo.trend7dPercent ?? null,
      trend30dPercent: backendMarketInfo.trend30dPercent ?? null,
      marketActivity: backendMarketInfo.marketActivity || 'Insufficient Data' as const,
      marketActivityReason: backendMarketInfo.marketActivityReason || '',
      dataAvailable: backendMarketInfo.dataAvailable ?? false,
    } : undefined;

    // Determine visible condition label
    const visibleCondition: 'Healthy' | 'At Risk' | 'Unknown' =
      geminiResult.isHealthy ? 'Healthy' :
      geminiResult.severity === 'Severe' || geminiResult.severity === 'High' ? 'At Risk' :
      geminiResult.possibleIssue && geminiResult.possibleIssue !== 'None — Healthy Crop' ? 'At Risk' :
      'Unknown';

    // CASE 2: Healthy crop
    if (geminiResult.isHealthy) {
      const healthyResult: DiagnosisResult = {
        id: `scan-${Date.now()}`,
        crop: detectedCropName,
        cropType: geminiResult.cropType || cropDbInfo.cropType,
        growthStage: geminiResult.growthStage || 'Vegetative',
        visualQuality: geminiResult.visualQuality || 'Standard',
        visibleCondition: 'Healthy',
        possibleIssue: 'None — Healthy Crop',
        possiblePest: 'None detected',
        diseaseName: geminiResult.healthMessage || 'Healthy — No Disease Detected',
        diseaseGu: geminiResult.healthMessageGu || 'સ્વસ્થ — કોઈ રોગ નથી',
        confidence: geminiResult.confidence || 0,
        confidenceLabel: geminiResult.confidenceLabel || (geminiResult.confidence ? `${geminiResult.confidence}% Visual Pattern Match` : 'Confidence unavailable'),
        severity: 'Low',
        severityColor: 'text-emerald-700 bg-emerald-100',
        symptoms: geminiResult.symptoms || [],
        treatments: [],
        warning: geminiResult.warning || 'Continue regular monitoring. Take photos every 3-5 days.',
        timestamp: new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        imageUrl: imageBase64.substring(0, 200),
        isAiEstimate: true,
        isOfflineFallback: false,
        disclaimer: geminiResult.disclaimer || 'AI health assessment. Regular field scouting recommended.',
        cropInfo,
        marketInfo,
      };
      await this.saveScan(healthyResult);
      return healthyResult;
    }

    // CASE 3: Disease / Pest detected — full diagnosis
    const diagnosisResult: DiagnosisResult = {
      id: `scan-${Date.now()}`,
      crop: detectedCropName,
      cropType: geminiResult.cropType || cropDbInfo.cropType,
      growthStage: geminiResult.growthStage || 'Vegetative',
      visualQuality: geminiResult.visualQuality || 'Standard',
      visibleCondition,
      possibleIssue: geminiResult.possibleIssue || geminiResult.diseaseName || 'Unknown',
      possiblePest: geminiResult.possiblePest || 'None detected',
      diseaseName: geminiResult.diseaseName,
      diseaseGu: geminiResult.diseaseGu,
      pestNameEn: geminiResult.pestNameEn,
      pestNameGu: geminiResult.pestNameGu,
      scientificName: geminiResult.scientificName,
      confidence: geminiResult.confidence,
      confidenceLabel: geminiResult.confidenceLabel || (geminiResult.confidence ? `${geminiResult.confidence}% Visual Pattern Match` : 'Confidence unavailable'),
      severity: geminiResult.severity,
      severityColor:
        geminiResult.severity === 'Severe' || geminiResult.severity === 'High'
          ? 'text-red-700 bg-red-100'
          : geminiResult.severity === 'Moderate'
          ? 'text-orange-700 bg-orange-100'
          : 'text-yellow-700 bg-yellow-100',
      symptoms: geminiResult.symptoms || [],
      treatments: geminiResult.treatments || [],
      warning: geminiResult.warning,
      timestamp: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      imageUrl: imageBase64.substring(0, 200),
      isAiEstimate: true,
      isOfflineFallback: false,
      disclaimer: geminiResult.disclaimer,
      cropInfo,
      marketInfo,
    };

    await this.saveScan(diagnosisResult);
    return diagnosisResult;
  },

  /**
   * Retrieves all previous scans from persistent storage
   */
  getScanHistory(): DiagnosisResult[] {
    return storageService.get<DiagnosisResult[]>(STORAGE_KEYS.SCANS, []);
  },

  /**
   * Saves a new scan to history and enqueues to offline sync
   */
  async saveScan(scan: DiagnosisResult): Promise<void> {
    const history = this.getScanHistory();
    const updated = [scan, ...history.filter((s) => s.id !== scan.id)].slice(0, 30);
    storageService.set(STORAGE_KEYS.SCANS, updated);

    // Queue sync for backend database persistence
    const currentUser = storageService.get<{ id: string } | null>(STORAGE_KEYS.USER, null);
    syncEngine.enqueue({
      tableName: 'crop_scans',
      operation: 'INSERT',
      recordId: scan.id,
      userId: currentUser?.id,
      payload: {
        id: scan.id,
        farmer_id: currentUser?.id || 'usr_demo',
        crop: scan.crop,
        stage: scan.stage,
        disease_name: scan.diseaseName,
        disease_gu: scan.diseaseGu,
        pest_name_en: scan.pestNameEn,
        pest_name_gu: scan.pestNameGu,
        scientific_name: scan.scientificName,
        confidence: scan.confidence,
        confidence_label: scan.confidenceLabel,
        severity: scan.severity,
        severity_color: scan.severityColor,
        symptoms: scan.symptoms,
        treatments: scan.treatments,
        remedies: scan.remedies,
        warning: scan.warning,
        image_url: scan.imageUrl?.substring(0, 200),
        is_ai_estimate: scan.isAiEstimate,
        is_offline_fallback: scan.isOfflineFallback ?? false,
        disclaimer: scan.disclaimer,
      },
    });
  },

  /**
   * Subscribes to changes in scan history
   */
  subscribeToScans(callback: (scans: DiagnosisResult[]) => void): () => void {
    return storageService.subscribe<DiagnosisResult[]>(STORAGE_KEYS.SCANS, callback);
  },
};
