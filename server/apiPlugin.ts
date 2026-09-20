/**
 * Vite Server Plugin — Backend API Routes
 * Handles /api/* requests server-side during development.
 * In production, these routes are handled by Supabase Edge Functions.
 *
 * SECURITY: GEMINI_API_KEY and MANDI_API_KEY are read from process.env (server-side only).
 * No API keys are ever sent to the browser.
 *
 * AI CAMERA: Analyzes uploaded image independently of farmer profile.
 * Returns cropInfo + marketInfo based on detected crop + user location.
 * NO weather, soil, farm-size, or farmer-specific data.
 */

import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import * as fs from 'fs';
import * as path from 'path';

const GEMINI_MODEL = 'gemini-3.8-flash';

// ─── Gujarat District Coordinates for Market Distance Calculation ────
const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  surat: { lat: 21.1702, lng: 72.8311 },
  rajkot: { lat: 22.3039, lng: 70.8022 },
  junagadh: { lat: 21.5222, lng: 70.4579 },
  bhavnagar: { lat: 21.7645, lng: 72.1519 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  mehsana: { lat: 23.5880, lng: 72.3693 },
  amreli: { lat: 21.6032, lng: 71.2221 },
  bharuch: { lat: 21.7051, lng: 72.9959 },
  navsari: { lat: 20.9467, lng: 72.9520 },
  anand: { lat: 22.5645, lng: 72.9289 },
  kutch: { lat: 23.2420, lng: 69.6669 },
  jamnagar: { lat: 22.4707, lng: 70.0577 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  narmada: { lat: 21.8787, lng: 73.4956 },
  prakasam: { lat: 15.8281, lng: 80.0444 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  delhi: { lat: 28.7041, lng: 77.1025 },
  kolhapur: { lat: 16.7050, lng: 74.2433 },
  pune: { lat: 18.5204, lng: 73.8567 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
};

// ─── Haversine Distance Calculator ──────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Crop Database (Server-Side Copy) ────────────────────────────────
interface CropInfoServer {
  cropName: string;
  cropNameGu: string;
  cropType: string;
  cropTypeGu: string;
  scientificName: string;
  typicalSeason: string;
  typicalSeasonGu: string;
  typicalGrowthDuration: string;
  waterRequirement: string;
  waterRequirementGu: string;
  commonPests: string[];
  commonDiseases: string[];
  generalCultivationInfo: string;
  generalCultivationInfoGu: string;
}

const CROP_DB: Record<string, CropInfoServer> = {
  maize: {
    cropName: 'Maize (Corn)', cropNameGu: 'મકાઈ (Maize)',
    cropType: 'Cereal Grain Crop', cropTypeGu: 'ધાન્ય પાક',
    scientificName: 'Zea mays',
    typicalSeason: 'Kharif & Rabi', typicalSeasonGu: 'ખરીફ અને રવિ',
    typicalGrowthDuration: '90 - 115 Days',
    waterRequirement: 'Medium', waterRequirementGu: 'મધ્યમ પાણી (૫૦૦-૮૦૦ મીમી)',
    commonPests: ['Fall Armyworm', 'Stem Borer', 'Shoot Fly'],
    commonDiseases: ['Northern Corn Leaf Blight', 'Common Rust', 'Banded Leaf & Sheath Blight'],
    generalCultivationInfo: 'Thrives in well-drained loamy soil with pH 6.0–7.5. Requires adequate nitrogen top-dressing at knee-high and tasseling stages.',
    generalCultivationInfoGu: 'સારી નિતારવાળી ગોરાડુ જમીન અનુકૂળ. ઘૂંટણ ઊંચાઈ અને ફૂલ અવસ્થાએ પૂરક નાઇટ્રોજન ખાતર આપવું.',
  },
  cotton: {
    cropName: 'Cotton', cropNameGu: 'કપાસ (Cotton)',
    cropType: 'Fibre Cash Crop', cropTypeGu: 'રેસાયુક્ત રોકડિયો પાક',
    scientificName: 'Gossypium hirsutum',
    typicalSeason: 'Kharif', typicalSeasonGu: 'ખરીફ (ચોમાસુ)',
    typicalGrowthDuration: '150 - 180 Days',
    waterRequirement: 'Medium', waterRequirementGu: 'મધ્યમ પાણી (નિયમિત ડ્રિપ)',
    commonPests: ['Pink Bollworm', 'Whitefly', 'Jassids', 'Thrips'],
    commonDiseases: ['Bacterial Blight', 'Cotton Leaf Curl Virus', 'Alternaria Leaf Spot'],
    generalCultivationInfo: 'Ideal for deep black cotton soils. Maintain pheromone traps for early bollworm monitoring; avoid waterlogging.',
    generalCultivationInfoGu: 'કાળી જમીન માટે આદર્શ. ગુલાબી ઇયળ માટે ફેરોમોન ટ્રેપ લગાવો.',
  },
  groundnut: {
    cropName: 'Groundnut (Peanut)', cropNameGu: 'મગફળી (Groundnut)',
    cropType: 'Oilseed Legume', cropTypeGu: 'તેલીબિયાં કઠોળ પાક',
    scientificName: 'Arachis hypogaea',
    typicalSeason: 'Kharif & Summer', typicalSeasonGu: 'ખરીફ અને ઉનાળુ',
    typicalGrowthDuration: '105 - 125 Days',
    waterRequirement: 'Low', waterRequirementGu: 'ઓછુંથી મધ્યમ પાણી',
    commonPests: ['Aphids', 'White Grub', 'Leaf Miner'],
    commonDiseases: ['Tikka Disease (Cercospora)', 'Collar Rot', 'Rust'],
    generalCultivationInfo: 'Sandy loam preferred for pod penetration. Gypsum application at pegging improves pod filling.',
    generalCultivationInfoGu: 'રેતાળ ગોરાડુ જમીન ઉત્તમ. સુયા બેસવાની અવસ્થાએ જીપ્સમ આપવું.',
  },
  wheat: {
    cropName: 'Wheat', cropNameGu: 'ઘઉં (Wheat)',
    cropType: 'Staple Cereal Crop', cropTypeGu: 'મુખ્ય ધાન્ય પાક',
    scientificName: 'Triticum aestivum',
    typicalSeason: 'Rabi (Winter)', typicalSeasonGu: 'રવિ (શિયાળુ)',
    typicalGrowthDuration: '110 - 130 Days',
    waterRequirement: 'Medium', waterRequirementGu: 'મધ્યમ પાણી (૪-૬ પિયત)',
    commonPests: ['Aphids', 'Termites', 'Armyworm'],
    commonDiseases: ['Yellow Rust', 'Brown Rust', 'Powdery Mildew', 'Karnal Bunt'],
    generalCultivationInfo: 'Requires cool winter conditions. Critical irrigation at Crown Root Initiation (21 days) and Flowering.',
    generalCultivationInfoGu: 'શિયાળાની ઠંડી અનુકૂળ. મુગટ મૂળ ફૂટવાની અવસ્થાએ પિયત અતિ મહત્વનું.',
  },
  rice: {
    cropName: 'Paddy (Rice)', cropNameGu: 'ડાંગર / ચોખા',
    cropType: 'Staple Cereal Grain', cropTypeGu: 'મુખ્ય ધાન્ય પાક',
    scientificName: 'Oryza sativa',
    typicalSeason: 'Kharif & Summer', typicalSeasonGu: 'ખરીફ અને ઉનાળુ',
    typicalGrowthDuration: '115 - 145 Days',
    waterRequirement: 'High', waterRequirementGu: 'વધુ પાણી (૧૦૦૦-૧૨૫૦ મીમી)',
    commonPests: ['Brown Planthopper', 'Stem Borer', 'Leaf Folder'],
    commonDiseases: ['Blast', 'Bacterial Leaf Blight', 'Sheath Rot'],
    generalCultivationInfo: 'Best in clayey loam soils. Maintain 2–5cm shallow standing water during tillering.',
    generalCultivationInfoGu: 'ચીકણી ગોરાડુ જમીન અનુકૂળ.',
  },
  tomato: {
    cropName: 'Tomato', cropNameGu: 'ટામેટા (Tomato)',
    cropType: 'Vegetable Cash Crop', cropTypeGu: 'શાકભાજી રોકડિયો પાક',
    scientificName: 'Solanum lycopersicum',
    typicalSeason: 'Year-round', typicalSeasonGu: 'વર્ષભર',
    typicalGrowthDuration: '120 - 150 Days',
    waterRequirement: 'Medium', waterRequirementGu: 'મધ્યમ પાણી (ડ્રિપ)',
    commonPests: ['Fruit Borer', 'Whitefly', 'Leaf Miner'],
    commonDiseases: ['Early Blight', 'Late Blight', 'Tomato Leaf Curl Virus'],
    generalCultivationInfo: 'Staking supports fruit quality. Use yellow sticky traps for whitefly management.',
    generalCultivationInfoGu: 'મંડપ પદ્ધતિથી ફળની ગુણવત્તા વધે. પીળા ચીકણા ટ્રેપ વાપરો.',
  },
  soybean: {
    cropName: 'Soybean', cropNameGu: 'સોયાબીન',
    cropType: 'Oilseed & Protein Legume', cropTypeGu: 'તેલીબિયાં પ્રોટીન પાક',
    scientificName: 'Glycine max',
    typicalSeason: 'Kharif', typicalSeasonGu: 'ખરીફ',
    typicalGrowthDuration: '90 - 105 Days',
    waterRequirement: 'Medium', waterRequirementGu: 'મધ્યમ પાણી',
    commonPests: ['Girdle Beetle', 'Stem Fly', 'Tobacco Caterpillar'],
    commonDiseases: ['Yellow Mosaic Virus', 'Anthracnose', 'Bacterial Pustule'],
    generalCultivationInfo: 'Fixes atmospheric nitrogen. Seed inoculation with Rhizobium culture recommended.',
    generalCultivationInfoGu: 'જમીનમાં નાઇટ્રોજન વધારે છે. રાઇઝોબિયમ કલ્ચર વાપરવું.',
  },
  potato: {
    cropName: 'Potato', cropNameGu: 'બટાટા (Potato)',
    cropType: 'Tuber Vegetable Crop', cropTypeGu: 'કંદમૂળ પાક',
    scientificName: 'Solanum tuberosum',
    typicalSeason: 'Rabi (Winter)', typicalSeasonGu: 'રવિ (શિયાળુ)',
    typicalGrowthDuration: '80 - 110 Days',
    waterRequirement: 'Medium', waterRequirementGu: 'મધ્યમ પાણી',
    commonPests: ['Potato Tuber Moth', 'Aphids', 'Cutworms'],
    commonDiseases: ['Late Blight', 'Early Blight', 'Black Scurf'],
    generalCultivationInfo: 'Well-drained loose sandy loam essential. Earthing-up critical at 30–35 days.',
    generalCultivationInfoGu: 'ગોરાડુ પોચી જમીન જરૂરી. ૩૦-૩૫ દિવસે માટી ચડાવવી.',
  },
  sugarcane: {
    cropName: 'Sugarcane', cropNameGu: 'શેરડી (Sugarcane)',
    cropType: 'Commercial Cash Crop', cropTypeGu: 'ઔદ્યોગિક રોકડિયો પાક',
    scientificName: 'Saccharum officinarum',
    typicalSeason: 'Perennial (10 - 12 Months)', typicalSeasonGu: 'વાર્ષિક પાક',
    typicalGrowthDuration: '300 - 365 Days',
    waterRequirement: 'High', waterRequirementGu: 'વધુ પાણી (૧૫૦૦-૨૦૦૦ મીમી)',
    commonPests: ['Early Shoot Borer', 'Top Borer', 'Pyrilla'],
    commonDiseases: ['Red Rot', 'Smut', 'Wilt'],
    generalCultivationInfo: 'Requires deep rich soil. Trash mulching conserves moisture.',
    generalCultivationInfoGu: 'દક્ષિણ ગુજરાતની નહેર પિયત માટે ઉત્તમ.',
  },
};

function lookupCropInfo(cropName: string): CropInfoServer {
  if (!cropName) return getDefaultCropInfo('Unknown Crop');
  const normalized = cropName.toLowerCase().replace(/[^a-z]/g, '');
  for (const [key, info] of Object.entries(CROP_DB)) {
    if (normalized.includes(key) || key.includes(normalized) ||
        info.cropName.toLowerCase().includes(cropName.toLowerCase()) ||
        cropName.toLowerCase().includes(key)) {
      return info;
    }
  }
  return getDefaultCropInfo(cropName);
}

function getDefaultCropInfo(name: string): CropInfoServer {
  return {
    cropName: name || 'Agricultural Crop', cropNameGu: `${name} (ખેતી પાક)`,
    cropType: 'Field Crop', cropTypeGu: 'ખેતી પાક',
    scientificName: 'Plantae species',
    typicalSeason: 'Kharif / Rabi', typicalSeasonGu: 'ખરીફ / રવિ',
    typicalGrowthDuration: '90 - 120 Days',
    waterRequirement: 'Medium', waterRequirementGu: 'મધ્યમ પિયત',
    commonPests: ['Aphids', 'Caterpillars', 'Stem Borers'],
    commonDiseases: ['Leaf Spot', 'Fungal Blight', 'Powdery Mildew'],
    generalCultivationInfo: 'Ensure balanced NPK fertilization and weekly leaf scouting for early pest detection.',
    generalCultivationInfoGu: 'જરૂરિયાત મુજબ ખાતર અને નીંદણ નિયંત્રણ કરવું.',
  };
}

// ─── Gemini Vision Prompt ────────────────────────────────────────────
const DIAGNOSIS_PROMPT = `You are AgroMind AI — an expert agronomist vision assistant for Indian farmers (Gujarat, India).

TASK: Analyze the uploaded image and provide a structured crop identification and health diagnosis.

STEP 1 — IMAGE VALIDATION:
First determine if this image shows a crop, plant, leaf, field, or agriculture-related subject.

If the image does NOT show any crop/plant/leaf/agricultural subject:
Return JSON with:
{
  "isCropImage": false,
  "friendlyMessage": "This doesn't look like a crop or plant image. Please upload a close-up photo of a leaf, plant, or crop for diagnosis.",
  "friendlyMessageGu": "આ છબી પાક કે છોડ જેવી દેખાતી નથી. કૃપા કરીને પાન, છોડ કે પાકનો ક્લોઝ-અપ ફોટો અપલોડ કરો.",
  "crop": "", "cropType": "", "growthStage": "", "visualQuality": "Not Applicable",
  "possibleIssue": "Not a crop", "possiblePest": "None",
  "diseaseName": "", "diseaseGu": "", "confidence": 0, "confidenceLabel": "0% (Not a crop)",
  "severity": "Low", "symptoms": [], "treatments": [], "warning": "", "disclaimer": ""
}

STEP 2 — If the image IS a crop/plant/leaf:
Identify the crop accurately from visual features:
- Maize (Corn)
- Cotton
- Groundnut (Peanut)
- Wheat
- Soybean
- Tomato
- Potato
- Rice (Paddy)
- Or whichever crop is shown.

Determine:
1. crop: English name (e.g., "Maize", "Cotton", "Groundnut", "Wheat")
2. cropType: Classification (e.g., "Cereal Grain", "Fibre Cash Crop", "Oilseed Legume", "Staple Cereal")
3. growthStage: Estimated stage (e.g., "Vegetative", "Flowering / Tasseling", "Pod / Boll Formation", "Grain Filling", "Maturation")
4. visualQuality: Photo quality assessment (e.g., "High Quality Close-up", "Clear Natural Daylight", "Macro Texture")

Check if the plant looks HEALTHY (no visible disease or pest damage):
If healthy, return:
{
  "isCropImage": true,
  "isHealthy": true,
  "crop": "<detected crop name>",
  "cropType": "<classification>",
  "growthStage": "<estimated stage>",
  "visualQuality": "<photo quality>",
  "possibleIssue": "None — Healthy Crop",
  "possiblePest": "None detected",
  "healthMessage": "Your crop looks healthy! No visible signs of disease or pest damage detected.",
  "healthMessageGu": "તમારો પાક સ્વસ્થ દેખાય છે! રોગ કે જીવાતનું કોઈ દૃશ્ય ચિહ્ન જણાયું નથી.",
  "diseaseName": "Healthy / No Disease",
  "diseaseGu": "સ્વસ્થ / કોઈ રોગ નથી",
  "confidence": <integer between 70 and 97>,
  "confidenceLabel": "<confidence>% Visual Pattern Match (Healthy Foliage Metric)",
  "severity": "Low",
  "symptoms": ["Normal chlorophyll pigmentation", "Intact leaf margin", "No necrotic lesions"],
  "treatments": [],
  "warning": "Continue regular scouting. Monitor again in 5-7 days.",
  "disclaimer": "AI health assessment based on visual pattern analysis. Field scouting recommended."
}

STEP 3 — If disease or pest IS detected:
Return full pathology:
{
  "isCropImage": true,
  "isHealthy": false,
  "crop": "<detected crop name in English>",
  "cropType": "<classification>",
  "growthStage": "<estimated stage>",
  "visualQuality": "<photo quality>",
  "possibleIssue": "<specific disease or physiological disorder name>",
  "possiblePest": "<specific pest if pest damage, else 'None detected'>",
  "diseaseName": "<disease or pest name in English (with scientific name in parentheses)>",
  "diseaseGu": "<disease or pest name in Gujarati>",
  "pestNameEn": "<pest name if applicable, else empty>",
  "pestNameGu": "<pest name in Gujarati if applicable, else empty>",
  "scientificName": "<scientific/Latin binomial name>",
  "confidence": <integer between 70 and 97 representing visual pattern similarity metric>,
  "confidenceLabel": "<confidence>% Visual Pattern Match (Model Confidence Metric)",
  "severity": "<Mild | Moderate | High | Severe>",
  "symptoms": [
    "<specific symptom observed on the leaf 1>",
    "<symptom 2>",
    "<symptom 3>"
  ],
  "treatments": [
    { "type": "Chemical / રાસાયણિક", "action": "<CIBRC registered pesticide/fungicide>", "dosage": "<exact dosage per litre or acre>" },
    { "type": "Biological / જૈવિક", "action": "<bio-agent or organic remedy>", "dosage": "<exact dosage>" },
    { "type": "Cultural / ખેતી પદ્ધતિ", "action": "<cultural/field practice>", "dosage": "<frequency/timing>" }
  ],
  "warning": "AI diagnostic estimate. Confirm with your local KVK agronomist before applying chemicals.",
  "disclaimer": "AI inference based on visual pattern similarity. Consult a certified agronomist for confirmed diagnosis."
}

CRITICAL RULES:
- ALWAYS return valid JSON only. No markdown, no commentary outside JSON.
- DO NOT use the word 'accuracy' for confidence — use 'Visual Pattern Match' or 'Model Confidence Metric'.
- Provide real, authentic botanical diagnosis based strictly on the uploaded image.
- NEVER return fixed or default diagnosis.
- Do NOT assume the crop is Cotton. Identify from visual evidence only.
- Do NOT return market prices, weather, or farmer information.
`;

// ─── Helper: Read JSON body from request ─────────────────────────────
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
      if (body.length > 6 * 1024 * 1024) {
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

// ─── Gemini API call (server-side only) ───────────────────────────────
async function callGemini(imageBase64: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: 'GEMINI_API_KEY is not configured on the server.', status: 500 };
  }

  // Strip data URL prefix
  const base64Data = imageBase64.includes(',')
    ? imageBase64.split(',')[1]
    : imageBase64;

  let mimeType = 'image/jpeg';
  const mimeMatch = imageBase64.match(/^data:(image\/\w+);/);
  if (mimeMatch) mimeType = mimeMatch[1];

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{
      parts: [
        { text: DIAGNOSIS_PROMPT },
        { text: 'Diagnose this crop leaf image.' },
        { inlineData: { mimeType, data: base64Data } },
      ],
    }],
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  };

  let response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  // Fallback to gemini-3.5-flash-lite on transient capacity issues
  if (!response.ok && (response.status === 503 || response.status === 429 || response.status === 500)) {
    const FALLBACK_MODEL = 'gemini-3.5-flash-lite';
    console.warn(`[API] Gemini ${GEMINI_MODEL} returned ${response.status}. Falling back to ${FALLBACK_MODEL}...`);
    const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${FALLBACK_MODEL}:generateContent?key=${apiKey}`;
    response = await fetch(fallbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API] Gemini error ${response.status}:`, errorText.substring(0, 300));
    return { error: `Gemini API returned ${response.status}`, status: response.status, detail: errorText.substring(0, 200) };
  }

  const data = await response.json();
  const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!textContent) {
    return { error: 'Gemini returned an empty response.', status: 502 };
  }

  const cleaned = textContent
    .replace(/^```json?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return { success: true, result: JSON.parse(cleaned) };
  } catch {
    console.error('[API] Failed to parse Gemini JSON:', cleaned.substring(0, 200));
    return { error: 'Gemini returned unparseable response.', status: 502 };
  }
}

// ─── Helper: Government Mandi API Lookup ─────────────────────────────
interface MandiResult {
  dataAvailable: boolean;
  market: string;
  marketDistrict: string;
  modalPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  arrivalDate: string;
  priceSource: 'government_api_live' | 'csv_historical' | 'unavailable';
  distanceKm: number | null;
  distanceLabel: string;
}

async function fetchMandiPrice(crop: string, lat: number, lng: number): Promise<MandiResult> {
  const mandiApiKey = process.env.MANDI_API_KEY;
  const unavailable: MandiResult = {
    dataAvailable: false, market: 'No Mandi Data', marketDistrict: '',
    modalPrice: null, minPrice: null, maxPrice: null,
    arrivalDate: '', priceSource: 'unavailable',
    distanceKm: null, distanceLabel: 'Distance unavailable',
  };

  // Normalize crop name for API matching
  const cropAliases: Record<string, string[]> = {
    'maize': ['Maize', 'Sweet Corn'],
    'cotton': ['Cotton'],
    'groundnut': ['Groundnut'],
    'wheat': ['Wheat'],
    'rice': ['Paddy(Common)', 'Paddy(Basmati)', 'Rice'],
    'tomato': ['Tomato'],
    'potato': ['Potato'],
    'soybean': ['Soyabean'],
    'sugarcane': ['Sugarcane'],
    'chilli': ['Green Chilli', 'Dry Chillies', 'Chili Red'],
    'banana': ['Banana', 'Banana - Green'],
  };

  const normalizedCrop = crop.toLowerCase().replace(/[^a-z]/g, '');
  const searchTerms: string[] = [crop];
  for (const [key, aliases] of Object.entries(cropAliases)) {
    if (normalizedCrop.includes(key) || key.includes(normalizedCrop)) {
      searchTerms.push(...aliases);
    }
  }

  // 1. Try Government Live API
  if (mandiApiKey) {
    for (const term of searchTerms) {
      try {
        const govApiUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${mandiApiKey}&format=json&limit=50&filters%5Bcommodity%5D=${encodeURIComponent(term)}`;
        const res = await fetch(govApiUrl, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const json = await res.json();
          const records = json.records || [];
          if (records.length > 0) {
            // Find nearest market by district coordinate matching
            let bestRecord = records[0];
            let bestDistance = Infinity;

            for (const rec of records) {
              const district = rec.district?.toLowerCase().replace(/[^a-z]/g, '') || '';
              const distCoords = DISTRICT_COORDINATES[district];
              if (distCoords) {
                const dist = haversineKm(lat, lng, distCoords.lat, distCoords.lng);
                if (dist < bestDistance) {
                  bestDistance = dist;
                  bestRecord = rec;
                }
              }
            }

            // If no coordinate match found, try Gujarat preference
            if (bestDistance === Infinity) {
              const gujaratRec = records.find((r: any) => r.state?.toLowerCase() === 'gujarat');
              if (gujaratRec) bestRecord = gujaratRec;
              // Calculate approximate distance using state center
              bestDistance = -1;
            }

            const modal = parseFloat(bestRecord.modal_price || bestRecord.modalPrice);
            const min = parseFloat(bestRecord.min_price || bestRecord.minPrice);
            const max = parseFloat(bestRecord.max_price || bestRecord.maxPrice);

            if (!isNaN(modal) && modal > 0) {
              const distKm = bestDistance > 0 ? Math.round(bestDistance) : null;
              return {
                dataAvailable: true,
                market: bestRecord.market || 'APMC Market',
                marketDistrict: bestRecord.district || '',
                modalPrice: modal,
                minPrice: !isNaN(min) ? min : null,
                maxPrice: !isNaN(max) ? max : null,
                arrivalDate: bestRecord.arrival_date || new Date().toISOString().split('T')[0],
                priceSource: 'government_api_live',
                distanceKm: distKm,
                distanceLabel: distKm ? `~${distKm} km` : 'Distance not calculated',
              };
            }
          }
        }
      } catch (e: any) {
        console.warn(`[API] Mandi API lookup failed for "${term}":`, e.message);
      }
    }
  }

  // 2. Fallback to CSV Historical Data
  try {
    const csvPath = path.resolve(process.cwd(), 'server', 'data', 'mandi_data.json');
    if (fs.existsSync(csvPath)) {
      const csvData = JSON.parse(fs.readFileSync(csvPath, 'utf-8'));
      const records = csvData.records || [];
      const matching = records.filter((r: any) => {
        const commodity = r.commodity?.toLowerCase() || '';
        return searchTerms.some(term => commodity.includes(term.toLowerCase()) || term.toLowerCase().includes(commodity));
      });

      if (matching.length > 0) {
        // Find nearest by district coordinates
        let bestRecord = matching[0];
        let bestDistance = Infinity;

        for (const rec of matching) {
          const district = rec.district?.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, '') || '';
          const distCoords = DISTRICT_COORDINATES[district];
          if (distCoords) {
            const dist = haversineKm(lat, lng, distCoords.lat, distCoords.lng);
            if (dist < bestDistance) {
              bestDistance = dist;
              bestRecord = rec;
            }
          }
        }

        // Gujarat fallback
        if (bestDistance === Infinity) {
          const gujaratMatch = matching.find((r: any) => r.state?.toLowerCase() === 'gujarat');
          if (gujaratMatch) bestRecord = gujaratMatch;
        }

        const distKm = bestDistance < Infinity && bestDistance > 0 ? Math.round(bestDistance) : null;
        return {
          dataAvailable: true,
          market: bestRecord.market || 'APMC Market',
          marketDistrict: bestRecord.district || '',
          modalPrice: bestRecord.modalPrice ?? null,
          minPrice: bestRecord.minPrice ?? null,
          maxPrice: bestRecord.maxPrice ?? null,
          arrivalDate: bestRecord.arrivalDate || 'Historical CSV',
          priceSource: 'csv_historical',
          distanceKm: distKm,
          distanceLabel: distKm ? `~${distKm} km` : 'Distance not calculated',
        };
      }
    }
  } catch (e: any) {
    console.warn('[API] Mandi CSV lookup failed:', e.message);
  }

  return unavailable;
}

// ─── Helper: Market Trend & Activity Analysis ────────────────────────
interface MarketTrendResult {
  trend7dPercent: number | null;
  trend30dPercent: number | null;
  priceTrend: 'Rising' | 'Stable' | 'Falling' | 'Insufficient Data';
  marketActivity: 'High' | 'Moderate' | 'Low' | 'Insufficient Data';
  marketActivityReason: string;
  historicalTrend: 'up' | 'down' | 'stable';
  predictedPrice: number | null;
  recommendation: 'SELL NOW' | 'HOLD' | 'FAIR';
}

function computeMarketTrend(crop: string, currentPrice: number | null): MarketTrendResult {
  const insufficient: MarketTrendResult = {
    trend7dPercent: null, trend30dPercent: null,
    priceTrend: 'Insufficient Data',
    marketActivity: 'Insufficient Data',
    marketActivityReason: 'Insufficient historical data to determine market activity.',
    historicalTrend: 'stable', predictedPrice: null, recommendation: 'FAIR',
  };

  try {
    const csvPath = path.resolve(process.cwd(), 'server', 'data', 'mandi_data.json');
    if (!fs.existsSync(csvPath)) return insufficient;

    const csvData = JSON.parse(fs.readFileSync(csvPath, 'utf-8'));
    const records = (csvData.records || []).filter((r: any) =>
      r.commodity?.toLowerCase().includes(crop.toLowerCase()) ||
      crop.toLowerCase().includes(r.commodity?.toLowerCase() || '')
    );

    const prices = records.map((r: any) => r.modalPrice).filter((p: any) => typeof p === 'number' && p > 0);
    const marketCount = new Set(records.map((r: any) => r.market)).size;

    if (prices.length < 2) return insufficient;

    // Moving averages
    const ma3 = prices.slice(-3).reduce((a: number, b: number) => a + b, 0) / Math.min(prices.length, 3);
    const ma7 = prices.slice(-7).reduce((a: number, b: number) => a + b, 0) / Math.min(prices.length, 7);
    const ma30 = prices.slice(-30).reduce((a: number, b: number) => a + b, 0) / Math.min(prices.length, 30);

    // Trend percentages
    const referencePrice = currentPrice || ma3;
    const trend7d = prices.length >= 7 ? ((referencePrice - ma7) / ma7) * 100 : null;
    const trend30d = prices.length >= 30 ? ((referencePrice - ma30) / ma30) * 100 : null;

    // Linear regression for slope
    const n = prices.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i; sumY += prices[i]; sumXY += i * prices[i]; sumX2 += i * i;
    }
    const denom = n * sumX2 - sumX * sumX;
    const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;

    const priceTrend: 'Rising' | 'Stable' | 'Falling' =
      slope > 1 ? 'Rising' : slope < -1 ? 'Falling' : 'Stable';

    // Market activity based on number of reporting markets + price above average
    let marketActivity: 'High' | 'Moderate' | 'Low' = 'Moderate';
    let marketActivityReason = '';

    if (marketCount >= 5 && currentPrice && currentPrice > ma7 * 1.02) {
      marketActivity = 'High';
      marketActivityReason = `Price is above recent average and the crop is reported in ${marketCount} markets.`;
    } else if (marketCount >= 3) {
      marketActivity = 'Moderate';
      marketActivityReason = `Crop is reported in ${marketCount} markets with stable activity.`;
    } else {
      marketActivity = 'Low';
      marketActivityReason = `Limited market reporting (${marketCount} market${marketCount === 1 ? '' : 's'}).`;
    }

    // Prediction
    const baseForPrediction = currentPrice || ma3;
    const predictedPrice = Math.round(baseForPrediction + slope * 7);

    // Recommendation
    let recommendation: 'SELL NOW' | 'HOLD' | 'FAIR' = 'FAIR';
    if (currentPrice && currentPrice > ma7 * 1.08) {
      recommendation = 'SELL NOW';
    } else if (priceTrend === 'Rising') {
      recommendation = 'HOLD';
    }

    return {
      trend7dPercent: trend7d !== null ? Math.round(trend7d * 10) / 10 : null,
      trend30dPercent: trend30d !== null ? Math.round(trend30d * 10) / 10 : null,
      priceTrend,
      marketActivity,
      marketActivityReason,
      historicalTrend: slope > 1 ? 'up' : slope < -1 ? 'down' : 'stable',
      predictedPrice,
      recommendation,
    };
  } catch (e: any) {
    console.warn('[API] Market trend computation error:', e.message);
    return insufficient;
  }
}

// ─── Vite Plugin ─────────────────────────────────────────────────────
export function apiServerPlugin(): Plugin {
  return {
    name: 'agromind-api-server',
    configureServer(server: ViteDevServer) {
      // Load .env variables into process.env for the server
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        for (const line of envContent.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx === -1) continue;
          const key = trimmed.substring(0, eqIdx).trim();
          const val = trimmed.substring(eqIdx + 1).trim();
          if (!key.startsWith('VITE_') && !process.env[key]) {
            process.env[key] = val;
          }
        }
        console.log('[API] Backend env loaded. GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
        console.log('[API] MANDI_API_KEY present:', !!process.env.MANDI_API_KEY);
      }

      // Register middleware BEFORE Vite's own middleware
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        // ─── POST /api/ai/analyze-crop ───────────────────────────
        if (req.url === '/api/ai/analyze-crop' && req.method === 'POST') {
          try {
            const bodyStr = await readBody(req);
            const body = JSON.parse(bodyStr);
            const { imageBase64, lat = 21.1702, lng = 72.8311 } = body;

            if (!imageBase64) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'imageBase64 is required' }));
            }

            const startTime = Date.now();

            // Step 1: Gemini Analysis
            console.log('[API] Step 1: Analyzing image with Gemini...');
            const geminiResult = await callGemini(imageBase64);

            if (geminiResult.error) {
              res.statusCode = geminiResult.status || 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: geminiResult.error }));
            }

            const diagnosis = geminiResult.result;

            // If not a crop, return validation result directly
            if (diagnosis.isCropImage === false) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, result: diagnosis, processingTimeMs: Date.now() - startTime }));
            }

            // Step 2: Extract detected crop (NEVER default to Cotton)
            const detectedCrop = diagnosis.crop || 'Unknown';
            console.log(`[API] Step 2: Detected crop = "${detectedCrop}"`);

            // Step 3: Crop Information from database
            console.log('[API] Step 3: Looking up crop database...');
            const cropInfo = lookupCropInfo(detectedCrop);

            // Step 4: Market lookup (parallel with trend)
            console.log(`[API] Step 4: Fetching market data for "${detectedCrop}" near (${lat}, ${lng})...`);
            const mandiResult = await fetchMandiPrice(detectedCrop, lat, lng);

            // Step 5: Market trend analysis
            console.log('[API] Step 5: Computing market trend...');
            const trendResult = computeMarketTrend(detectedCrop, mandiResult.modalPrice);

            // Build structured marketInfo
            const marketInfo = {
              nearestMarket: mandiResult.market,
              distanceKm: mandiResult.distanceKm,
              distanceLabel: mandiResult.distanceLabel,
              modalPrice: mandiResult.modalPrice,
              minPrice: mandiResult.minPrice,
              maxPrice: mandiResult.maxPrice,
              reportedDate: mandiResult.arrivalDate,
              source: mandiResult.priceSource === 'government_api_live'
                ? 'Government Mandi API (Live)'
                : mandiResult.priceSource === 'csv_historical'
                ? 'Government Mandi Data (Historical CSV)'
                : 'Unavailable',
              priceTrend: trendResult.priceTrend,
              trend7dPercent: trendResult.trend7dPercent,
              trend30dPercent: trendResult.trend30dPercent,
              marketActivity: trendResult.marketActivity,
              marketActivityReason: trendResult.marketActivityReason,
              dataAvailable: mandiResult.dataAvailable,
              recommendation: trendResult.recommendation,
            };

            // Build enriched response (NO weather, NO farm data)
            const enrichedResult = {
              ...diagnosis,
              detectedCrop,
              cropType: diagnosis.cropType || cropInfo.cropType,
              growthStage: diagnosis.growthStage || 'Vegetative',
              visualQuality: diagnosis.visualQuality || 'Standard Resolution',
              possibleIssue: diagnosis.possibleIssue || diagnosis.diseaseName || 'None',
              possiblePest: diagnosis.possiblePest || diagnosis.pestNameEn || 'None detected',
              cropInfo: {
                cropName: cropInfo.cropName,
                cropNameGu: cropInfo.cropNameGu,
                cropType: cropInfo.cropType,
                cropTypeGu: cropInfo.cropTypeGu,
                scientificName: cropInfo.scientificName,
                typicalSeason: cropInfo.typicalSeason,
                typicalSeasonGu: cropInfo.typicalSeasonGu,
                typicalGrowthDuration: cropInfo.typicalGrowthDuration,
                waterRequirement: cropInfo.waterRequirement,
                waterRequirementGu: cropInfo.waterRequirementGu,
                commonPests: cropInfo.commonPests,
                commonDiseases: cropInfo.commonDiseases,
                generalCultivationInfo: cropInfo.generalCultivationInfo,
                generalCultivationInfoGu: cropInfo.generalCultivationInfoGu,
              },
              marketInfo,
            };

            const processingTimeMs = Date.now() - startTime;
            console.log(`[API] Complete. Processing time: ${processingTimeMs}ms`);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              success: true,
              result: enrichedResult,
              processingTimeMs,
            }));
          } catch (err: any) {
            console.error('[API] analyze-crop error:', err.message);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Internal server error: ' + err.message }));
          }
        }

        // ─── Health check ────────────────────────────────────────
        if (req.url === '/api/health') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            status: 'ok',
            geminiConfigured: !!process.env.GEMINI_API_KEY,
            mandiConfigured: !!process.env.MANDI_API_KEY,
            model: GEMINI_MODEL,
          }));
        }

        // Unknown API route
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'API route not found' }));
      });
    },
  };
}
