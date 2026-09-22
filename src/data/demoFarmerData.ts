// Dedicated Demo Farmer Dataset for AgroMind AI
// Contains all hackathon sample records for Rameshbhai Patel (Surat, Gujarat)
// STRICT ISOLATION RULE: This data is accessible ONLY when authenticated as the Demo User.

import type {
  UserProfile,
  FarmParcel,
  PlotInfo,
  ExpenseItem,
  RevenueItem,
  SoilReportRecord,
  DiagnosisResult,
} from '../types';

export const DEMO_AUTH_USER_ID = '34f08041-d117-4f95-bee4-7a908f4131e8';
export const DEMO_PHONE = '9876543210';
export const DEMO_OTP = '8249';

export const DEMO_PROFILE: UserProfile = {
  id: DEMO_AUTH_USER_ID,
  name: 'Rameshbhai Patel',
  phone: DEMO_PHONE,
  district: 'Surat',
  city: 'Kamrej',
  village: 'Kamrej Gam (કામરેજ ગામ)',
  taluka: 'Kamrej',
  pincode: '394185',
  ageGroup: '35-45 yrs',
  pmKisanId: 'GJ-SUR-88412',
  role: 'farmer',
  kycDone: true,
  isDemo: true,
  onboardingCompleted: true,
  language: 'gu',
  smsAlerts: true,
  whatsappAlerts: true,
  voiceAssistance: true,
};

export const DEMO_FARM: FarmParcel = {
  id: 'farm_demo_01',
  farmerId: DEMO_AUTH_USER_ID,
  totalArea: 4.5,
  cultivableArea: 4.0,
  fallowArea: 0.5,
  unit: 'Acre (એકર)',
  ownership: 'Own Land',
  soilType: 'Deep Black Cotton Soil (કાળી કાંપવાળી)',
  waterSources: ['Borewell', 'Canal'],
  irrigationTechnique: 'Drip Irrigation',
  waterAvailability: '12 Months',
  coordinates: {
    lat: 21.2721,
    lng: 72.9546,
    accuracy: '4.2m (High Precision)',
  },
  season: 'Kharif 2026',
  surveyNo: 'Block 142/A',
  landmark: 'Near Canal / નહેર પાસે',
  selectedCrops: ['cotton', 'groundnut'],
};

const now = Date.now();
export const DEMO_PLOTS: Record<string, PlotInfo> = {
  A: {
    id: 'plot_demo_A',
    key: 'A',
    title: 'Plot Details: Block A (બ્લોક એ - કપાસ)',
    crop: 'Shankar-6 Cotton',
    subCrop: 'કપાસ',
    variety: 'Gujarat Cotton Hybrid-16',
    area: '2.5 Acres',
    stageBadge: 'Flowering (Day 54/150)',
    stageName: 'Flowering Stage',
    dayCount: 'Day 54',
    plantingDate: new Date(now - 54 * 86400000).toISOString().split('T')[0],
    progressBar: '36%',
    health: 'Good (તંદુરસ્ત)',
    moisture: '68% (Optimal / ઉત્તમ)',
    soilType: 'Deep Black Cotton Soil (કાળી કાંપવાળી)',
    irrigation: 'Drip (Next: Tomorrow 7:00 AM)',
    syncTime: 'Today, 09:30 AM',
    provenance: 'Measured • IoT Probes',
  },
  B: {
    id: 'plot_demo_B',
    key: 'B',
    title: 'Plot Details: Block B (બ્લોક બી - મગફળી)',
    crop: 'GG-20 Groundnut',
    subCrop: 'મગફળી',
    variety: 'Gujarat Groundnut-20',
    area: '2.0 Acres',
    stageBadge: 'Vegetative (Day 32/110)',
    stageName: 'Vegetative Stage',
    dayCount: 'Day 32',
    plantingDate: new Date(now - 32 * 86400000).toISOString().split('T')[0],
    progressBar: '29%',
    health: 'Excellent (ઉત્કૃષ્ટ)',
    moisture: '72% (Adequate / યોગ્ય)',
    soilType: 'Sandy Loamy Soil (ગોરાડુ જમીન)',
    irrigation: 'Sprinkler (Next: Thursday)',
    syncTime: 'Today, 08:15 AM',
    provenance: 'Estimated • Sentinel-2 + Weather',
  },
};

export const DEMO_SOIL_REPORT: SoilReportRecord = {
  id: 'soil_demo_01',
  uploadedAt: new Date(now - 14 * 86400000).toISOString(),
  labName: 'Navsari Agricultural University Soil Testing Lab (KVK Surat)',
  sampleDate: '2026-08-14',
  ph: 7.4,
  nitrogenKgHa: 182,
  phosphorusKgHa: 24,
  potassiumKgHa: 310,
  organicCarbonPercent: 0.58,
  micronutrients: {
    zincPpm: 0.65,
    ironPpm: 4.8,
    manganesePpm: 5.2,
  },
  notes: 'Sample taken from Block A & B topsoil. Low phosphorus requires Single Super Phosphate (SSP) split dressing.',
};

export const DEMO_EXPENSES: ExpenseItem[] = [
  { id: 'exp-demo-1', date: '18 Aug 2026', category: 'Fertilizers', categoryGu: 'ખાતર', title: 'Single Super Phosphate (SSP) 50kg x 3', plot: 'Block A', amount: 1450, paymentMethod: 'UPI' },
  { id: 'exp-demo-2', date: '12 Aug 2026', category: 'Labor', categoryGu: 'મજૂરી', title: 'Weeding & intercultural hoeing (4 workers)', plot: 'Block A', amount: 3200, paymentMethod: 'Cash' },
  { id: 'exp-demo-3', date: '04 Aug 2026', category: 'Pesticides', categoryGu: 'દવા', title: 'Emamectin Benzoate 5% SG (Pest Control)', plot: 'Block A', amount: 980, paymentMethod: 'UPI' },
  { id: 'exp-demo-4', date: '28 Jul 2026', category: 'Seeds', categoryGu: 'બિયારણ', title: 'Certified Gujarat Cotton G.Cot-16 Bt Packets', plot: 'Block A', amount: 8400, paymentMethod: 'Mandli Credit' },
  { id: 'exp-demo-5', date: '25 Jul 2026', category: 'Machinery', categoryGu: 'ટ્રેક્ટર / ડીઝલ', title: 'Deep Ploughing & Rotavator (6 hours tractor)', plot: 'Block A & B', amount: 7200, paymentMethod: 'Cash' },
  { id: 'exp-demo-6', date: '15 Jul 2026', category: 'Seeds', categoryGu: 'બિયારણ', title: 'Gujarat Groundnut GG-20 Seed Stock 120kg', plot: 'Block B', amount: 12600, paymentMethod: 'Mandli Credit' },
  { id: 'exp-demo-7', date: '02 Jul 2026', category: 'Irrigation', categoryGu: 'સિંચાઈ', title: 'Drip Lateral Filters & Flush Valve Service', plot: 'Both Plots', amount: 2400, paymentMethod: 'UPI' },
];

export const DEMO_REVENUE: RevenueItem[] = [
  {
    id: 'rev-demo-1',
    season: 'Kharif 2026 (Projected)',
    crop: 'Cotton & Groundnut',
    plot: 'Block A & B',
    yieldQuintals: 64,
    pricePerQuintal: 2625,
    totalRevenue: 168000,
    date: '2026-10-15',
  },
];

export const DEMO_DIAGNOSES: DiagnosisResult[] = [
  {
    crop: 'Cotton (કપાસ)',
    stage: 'Flowering Stage (Day 54)',
    diseaseName: 'Early Stage Whitefly Infestation',
    diseaseGu: 'સફેદ માખી ઉપદ્રવ',
    pestNameEn: 'Whitefly (Bemisia tabaci)',
    pestNameGu: 'સફેદ માખી',
    scientificName: 'Bemisia tabaci',
    confidence: 94.2,
    confidenceLabel: 'High Diagnostic Certainty (ચોક્કસ નિદાન)',
    severity: 'Moderate',
    severityColor: 'amber',
    symptoms: [
      'Yellowing along leaf margins and minor curling',
      'Sticky honeydew exudate observed on underside of mid-canopy leaves',
      'Early sooty mold initiation in micro-patches',
    ],
    treatments: [
      {
        step: 1,
        title: 'Neem Oil Bio-Repellent (Azadirachtin 10,000 PPM)',
        dosage: '30 ml per 15L pump (2 ml/L)',
        instructions: 'Spray during early morning or late evening. Ensure thorough coverage under foliage.',
        type: 'organic',
        timing: 'Immediate — Next 24 Hours',
      },
      {
        step: 2,
        title: 'Yellow Sticky Traps (પીળા ચીકણા ટ્રેપ)',
        dosage: '12 to 15 traps per acre at canopy height',
        instructions: 'Hang above plant canopy to break reproductive adult flight cycles.',
        type: 'cultural',
        timing: 'Within 48 Hours',
      },
    ],
    remedies: [
      {
        type: 'Organic Prevention',
        action: 'Fermented butter-milk (ખાટી છાશ 500ml) + Hing (હીંગ 10g) spray for preventive deterring',
      },
    ],
    warning: 'Do not spray synthetic pyrethroids as they cause secondary whitefly resurgence.',
    disclaimer: 'AI diagnostic estimate. Field-validate with certified KVK extension officer before applying scheduled chemicals.',
    timestamp: 'Today, 10:15 AM',
  },
];

/**
 * Checks if a given user object or user ID corresponds to the Demo Account
 */
export function isDemoUser(userOrId: { id?: string; phone?: string } | string | null | undefined): boolean {
  if (!userOrId) return false;
  if (typeof userOrId === 'string') {
    return (
      userOrId === DEMO_AUTH_USER_ID ||
      userOrId === 'usr_9876543210' ||
      userOrId === 'usr_demo' ||
      userOrId === DEMO_PHONE ||
      userOrId === `+91${DEMO_PHONE}`
    );
  }
  return (
    userOrId.id === DEMO_AUTH_USER_ID ||
    userOrId.id === 'usr_9876543210' ||
    userOrId.id === 'usr_demo' ||
    userOrId.phone === DEMO_PHONE ||
    userOrId.phone === `+91${DEMO_PHONE}`
  );
}
