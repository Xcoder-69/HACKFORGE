/**
 * Gemini Vision Service — Frontend Client
 * 
 * SECURITY: This file does NOT contain any API keys.
 * All Gemini calls go through the backend: POST /api/ai/analyze-crop
 * The backend reads GEMINI_API_KEY from server-side env (never exposed to browser).
 */

export interface GeminiDiagnosisResult {
  isCropImage: boolean;
  friendlyMessage?: string;
  friendlyMessageGu?: string;
  crop: string;
  cropType?: string;
  growthStage?: string;
  visualQuality?: string;
  isHealthy?: boolean;
  healthMessage?: string;
  healthMessageGu?: string;
  diseaseName: string;
  diseaseGu: string;
  pestNameEn?: string;
  pestNameGu?: string;
  scientificName?: string;
  confidence: number;
  confidenceLabel: string;
  severity: 'Mild' | 'Moderate' | 'High' | 'Severe' | 'Low';
  symptoms: string[];
  treatments: { type: string; action: string; dosage: string }[];
  warning: string;
  disclaimer: string;
  possibleIssue?: string | null;
  possiblePest?: string | null;
  // Enriched backend data
  cropInfo?: {
    cropName: string;
    cropNameGu?: string;
    cropType: string;
    cropTypeGu?: string;
    scientificName: string;
    typicalSeason: string;
    typicalSeasonGu?: string;
    typicalGrowthDuration: string;
    waterRequirement: string;
    waterRequirementGu?: string;
    commonPests: string[];
    commonDiseases: string[];
    generalCultivationInfo: string;
    generalCultivationInfoGu?: string;
  };
  marketInfo?: {
    nearestMarket: string;
    distanceKm: number | null;
    distanceLabel: string;
    modalPrice: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    reportedDate: string;
    source: string;
    priceTrend: 'Rising' | 'Stable' | 'Falling' | 'Insufficient Data';
    trend7dPercent: number | null;
    trend30dPercent?: number | null;
    marketActivity: 'High' | 'Moderate' | 'Low' | 'Insufficient Data';
    marketActivityReason: string;
    dataAvailable: boolean;
    recommendation?: string;
  };
}

/**
 * Sends the image to the backend API which securely calls Gemini.
 * No API keys are used or transmitted from the frontend.
 * 
 * @param imageBase64 - The base64-encoded image data
 * @param lat - User's current latitude (for market lookup)
 * @param lng - User's current longitude (for market lookup)
 */
export async function analyzeImageWithGemini(
  imageBase64: string,
  lat?: number,
  lng?: number
): Promise<GeminiDiagnosisResult> {
  const payload: any = { imageBase64 };
  if (lat !== undefined && lng !== undefined) {
    payload.lat = lat;
    payload.lng = lng;
  }

  const response = await fetch('/api/ai/analyze-crop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData?.error || '';

    if (response.status === 429) {
      throw new Error('RATE_LIMITED');
    }
    if (response.status === 400) {
      throw new Error('NO_IMAGE');
    }
    if (errorMsg.includes('GEMINI_API_KEY')) {
      throw new Error('GEMINI_API_KEY_MISSING');
    }
    throw new Error('API_ERROR');
  }

  const data = await response.json();

  if (!data.success || !data.result) {
    throw new Error('EMPTY_RESPONSE');
  }

  return data.result as GeminiDiagnosisResult;
}
