// AgroMind AI Domain Types & Data Models

export type UserRole = 'farmer' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  district: string;
  city?: string;
  village: string;
  taluka?: string;
  pincode?: string;
  ageGroup?: string;
  pmKisanId?: string;
  role: UserRole;
  kycDone?: boolean;
  language?: 'gu' | 'hi' | 'en';
  smsAlerts?: boolean;
  whatsappAlerts?: boolean;
  voiceAssistance?: boolean;
  onboardingCompleted?: boolean;
  isDemo?: boolean;
}

export type UnitType = 'Vigha (વીઘા)' | 'Acre (એકર)' | 'Guntha (ગુંઠા)' | 'Hectare (હેક્ટર)';
export type OwnershipType = 'Own Land' | 'Leased' | 'Shared';

export interface FarmParcel {
  id: string;
  farmerId: string;
  totalArea: number;
  cultivableArea: number;
  fallowArea: number;
  unit: UnitType;
  ownership: OwnershipType;
  soilType: string;
  waterSources: string[];
  irrigationTechnique: string;
  waterAvailability: string;
  coordinates: {
    lat: number;
    lng: number;
    accuracy?: string;
  };
  season: string;
  surveyNo?: string;
  landmark?: string;
  selectedCrops: string[];
}

export type PlotKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | (string & {});

export interface PlotInfo {
  id: string;
  key: PlotKey;
  title: string;
  crop: string;
  subCrop: string;
  variety: string;
  area: string;
  stageBadge: string;
  stageName: string;
  dayCount: string;
  plantingDate?: string;
  progressBar: string;
  health: string;
  moisture: string;
  soilType: string;
  irrigation: string;
  syncTime: string;
  provenance: string;
}

export interface CropRec {
  id: string;
  nameEn: string;
  nameGu: string;
  nameHi: string;
  variety: string;
  matchScore: number;
  expectedProfit: string;
  duration: string;
  waterNeed: 'Low' | 'Medium' | 'High';
  waterNeedGu: string;
  mandiPrice: string;
  priceTrend: 'up' | 'stable' | 'down';
  soilSuitability: string;
  description: string;
  recommendedReasonGu: string;
  riskFactor: 'Low' | 'Moderate' | 'High';
  stages: { name: string; days: string; detail: string }[];
}

export type ExpenseCategory = 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Labor' | 'Machinery' | 'Irrigation';

export interface ExpenseItem {
  id: string;
  date: string;
  category: ExpenseCategory;
  categoryGu: string;
  title: string;
  plot: string;
  amount: number;
  paymentMethod: 'UPI' | 'Cash' | 'Mandli Credit';
}

export interface RevenueItem {
  id: string;
  season: string;
  crop: string;
  plot: string;
  yieldQuintals: number;
  pricePerQuintal: number;
  totalRevenue: number;
  date: string;
}

export interface FinancialOverview {
  totalExpenses: number;
  budget: number;
  budgetPercent: number;
  expectedRevenue: number;
  projectedNetProfit: number;
  roiPercent: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
}

export interface WeatherForecastDay {
  day: string;
  dayGu: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon: string;
  rainProb: number;
  rainMm: string;
  sprayScore: 'Optimal' | 'Safe' | 'Moderate' | 'Unsafe';
}

export interface SoilTelemetry {
  moisturePercent: number;
  moistureStatus: string;
  moistureStatusGu: string;
  tempCelsius: number;
  phLevel: number;
  phStatus: string;
  nitrogenKgHa: number;
  phosphorusKgHa: number;
  potassiumKgHa: number;
  organicCarbonPercent: number;
  lastSyncTime: string;
  stationId: string;
}

export interface MandiRecord {
  id: string;
  mandi: string;
  district: string;
  distance: string;
  crop: string;
  cropGu: string;
  cropHi?: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
  arrivals: string;
  recommendation: 'SELL NOW' | 'HOLD' | 'FAIR';
  recGu: string;
  recHi?: string;
}

export interface DiagnosisTreatment {
  type: string;
  action: string;
  dosage: string;
}

export interface CropInfoData {
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
}

export interface MarketInfoData {
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
  selectedLocationName?: string;
}

export interface DiagnosisResult {
  id: string;
  crop: string;
  stage?: string;
  cropType?: string;
  growthStage?: string;
  visualQuality?: string;
  visibleCondition?: 'Healthy' | 'At Risk' | 'Unknown';
  possibleIssue?: string | null;
  possiblePest?: string | null;
  observedSymptoms?: string[];
  needsExpertVerification?: boolean;
  diseaseName: string;
  diseaseGu: string;
  pestNameEn?: string;
  pestNameGu?: string;
  scientificName?: string;
  confidence: number;
  confidenceLabel: string;
  severity: 'Mild' | 'Moderate' | 'High' | 'Severe' | 'Low';
  severityColor: string;
  symptoms: string[];
  treatments: DiagnosisTreatment[];
  remedies?: {
    type: 'Organic / જૈવિક' | 'Chemical / રાસાયણિક' | 'Cultural / વ્યવસ્થાપન' | string;
    action: string;
    dosage: string;
  }[];
  warning: string;
  timestamp: string;
  imageUrl?: string;
  isAiEstimate: boolean;
  isOfflineFallback?: boolean;
  disclaimer: string;
  cropInfo?: CropInfoData;
  marketInfo?: MarketInfoData;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  textEn: string;
  textGu: string;
  time: string;
  suggestions?: string[];
  timestamp?: number;
  isAiEstimate?: boolean;
  isOfflineFallback?: boolean;
}

export type AlertType = 'weather' | 'crop' | 'market' | 'soil' | 'diagnosis' | 'recommendation' | 'irrigation';
export type AlertStatus = 'NEW' | 'READ' | 'RESOLVED' | 'EXPIRED';
export type AlertPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertSource = 'Open-Meteo' | 'Mandi/market data' | 'Uploaded laboratory report' | 'AI crop analysis' | 'Agronomic Engine';

export interface AlertAction {
  label: string;
  route: string;
}

export interface AlertItem {
  id: string;
  key: string;
  type: AlertType;
  title: string;
  titleEn: string;
  titleGu?: string;
  titleHi?: string;
  message: string;
  descriptionEn: string;
  descriptionGu?: string;
  descriptionHi?: string;
  priority: AlertPriority;
  severity: AlertPriority;
  severityColor?: string;
  createdAt: string;
  expiresAt?: string;
  status: AlertStatus;
  read: boolean;
  isRead: boolean; // Backwards-compatible alias
  isCompleted?: boolean;
  relatedCropId?: string;
  relatedFarmId?: string;
  plotId?: string;
  source: AlertSource;
  action?: AlertAction;
  actionText: string;
  actionRoute: string;
  category: 'urgent' | 'weather' | 'irrigation' | 'market' | 'soil' | 'crop';
  categoryLabel: string;
  time: string;
  dataValues?: Record<string, any>;
}

export interface SoilReportRecord {
  id: string;
  uploadedAt: string;
  labName?: string;
  sampleDate?: string;
  ph?: number;
  nitrogenKgHa?: number; // N
  phosphorusKgHa?: number; // P
  potassiumKgHa?: number; // K
  organicCarbonPercent?: number; // OC
  micronutrients?: {
    zincPpm?: number;
    ironPpm?: number;
    manganesePpm?: number;
  };
  notes?: string;
}

export interface FarmerRecord {
  id: string;
  name: string;
  code: string;
  village: string;
  district: string;
  acreage: string;
  plots: string;
  crop: string;
  cropBadgeColor: string;
  ndvi: number;
  ndviLabel: string;
  ndviColor: string;
  lastActivity: string;
  kycDone: boolean;
}
