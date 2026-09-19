// Data Initializer for AgroMind AI
// Pre-populates clean, realistic agricultural seed data for Gujarat context if storage is empty

import { storageService, STORAGE_KEYS } from './storageService';
import type {
  UserProfile,
  FarmParcel,
  PlotInfo,
  ExpenseItem,
  RevenueItem,
  AlertItem,
  DiagnosisResult,
  FarmerRecord,
} from '../types';

export const initializeDefaultData = (): void => {
  const isInitialized = storageService.get<boolean>(STORAGE_KEYS.INITIALIZED, false);
  if (isInitialized) return;

  // 1. Default Farmer User
  const defaultUser: UserProfile = {
    id: 'usr_9876543210',
    name: 'Rameshbhai Patel',
    phone: '9876543210',
    district: 'Surat',
    village: 'Kamrej',
    taluka: 'Kamrej',
    pincode: '394185',
    ageGroup: '35-45 yrs',
    pmKisanId: 'GJ-SUR-88412',
    role: 'farmer',
    kycDone: true,
    language: 'gu',
    smsAlerts: true,
    whatsappAlerts: true,
    voiceAssistance: true,
  };
  storageService.set(STORAGE_KEYS.USER, defaultUser);
  storageService.set(STORAGE_KEYS.TOKEN, 'mock_jwt_farmer_token_valid');

  // 2. Default Farm Parcel
  const defaultFarm: FarmParcel = {
    id: 'farm_01',
    farmerId: defaultUser.id,
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
  storageService.set(STORAGE_KEYS.FARM, defaultFarm);

  // 3. Default Plots
  const defaultPlots: Record<string, PlotInfo> = {
    A: {
      id: 'plot_A',
      key: 'A',
      title: 'Plot Details: Block A (બ્લોક એ - કપાસ)',
      crop: 'Shankar-6 Cotton',
      subCrop: 'કપાસ (Day 54)',
      variety: 'Gujarat Cotton Hybrid-16',
      area: '2.5 Acres',
      stageBadge: 'Flowering (Day 54/150)',
      stageName: 'Flowering Stage',
      dayCount: 'Day 54',
      progressBar: '36%',
      health: 'Good (તંદુરસ્ત)',
      moisture: '68% (Optimal / ઉત્તમ)',
      soilType: 'Black Cotton Soil (કાળી કાંપવાળી)',
      irrigation: 'Drip (Next: Tomorrow 7:00 AM)',
      syncTime: 'Today, 09:30 AM',
      provenance: 'Measured • IoT Probes',
    },
    B: {
      id: 'plot_B',
      key: 'B',
      title: 'Plot Details: Block B (બ્લોક બી - મગફળી)',
      crop: 'GG-20 Groundnut',
      subCrop: 'મગફળી (Day 32)',
      variety: 'Gujarat Groundnut-20',
      area: '2.0 Acres',
      stageBadge: 'Vegetative (Day 32/110)',
      stageName: 'Vegetative Stage',
      dayCount: 'Day 32',
      progressBar: '29%',
      health: 'Excellent (ઉત્કૃષ્ટ)',
      moisture: '72% (Adequate / યોગ્ય)',
      soilType: 'Sandy Loamy Soil (ગોરાડુ જમીન)',
      irrigation: 'Sprinkler (Next: Thursday)',
      syncTime: 'Today, 08:15 AM',
      provenance: 'Estimated • Sentinel-2 + Weather',
    },
  };
  storageService.set(STORAGE_KEYS.PLOTS, defaultPlots);

  // 4. Default Expenses Ledger (7 initial items matching prototype)
  const defaultExpenses: ExpenseItem[] = [
    { id: 'exp-1', date: '18 Aug 2026', category: 'Fertilizers', categoryGu: 'ખાતર', title: 'Single Super Phosphate (SSP) 50kg x 3', plot: 'Block A', amount: 1450, paymentMethod: 'UPI' },
    { id: 'exp-2', date: '12 Aug 2026', category: 'Labor', categoryGu: 'મજૂરી', title: 'Weeding & intercultural hoeing (4 workers)', plot: 'Block A', amount: 3200, paymentMethod: 'Cash' },
    { id: 'exp-3', date: '04 Aug 2026', category: 'Pesticides', categoryGu: 'દવા', title: 'Emamectin Benzoate 5% SG (Pest Control)', plot: 'Block A', amount: 980, paymentMethod: 'UPI' },
    { id: 'exp-4', date: '28 Jul 2026', category: 'Seeds', categoryGu: 'બિયારણ', title: 'Certified Gujarat Cotton G.Cot-16 Bt Packets', plot: 'Block A', amount: 8400, paymentMethod: 'Mandli Credit' },
    { id: 'exp-5', date: '25 Jul 2026', category: 'Machinery', categoryGu: 'ટ્રેક્ટર / ડીઝલ', title: 'Deep Ploughing & Rotavator (6 hours tractor)', plot: 'Block A & B', amount: 7200, paymentMethod: 'Cash' },
    { id: 'exp-6', date: '15 Jul 2026', category: 'Seeds', categoryGu: 'બિયારણ', title: 'Gujarat Groundnut GG-20 Seed Stock 120kg', plot: 'Block B', amount: 12600, paymentMethod: 'Mandli Credit' },
    { id: 'exp-7', date: '02 Jul 2026', category: 'Irrigation', categoryGu: 'સિંચાઈ', title: 'Drip Lateral Filters & Flush Valve Service', plot: 'Both Plots', amount: 2400, paymentMethod: 'UPI' },
  ];
  storageService.set(STORAGE_KEYS.EXPENSES, defaultExpenses);

  // 5. Default Revenue Record
  const defaultRevenue: RevenueItem[] = [
    {
      id: 'rev-1',
      season: 'Kharif 2026 (Projected)',
      crop: 'Cotton & Groundnut',
      plot: 'Block A & B',
      yieldQuintals: 64,
      pricePerQuintal: 2625,
      totalRevenue: 168000,
      date: '2026-10-15',
    },
  ];
  storageService.set(STORAGE_KEYS.REVENUE, defaultRevenue);

  // 6. Default Alerts
  const defaultAlerts: AlertItem[] = [
    {
      id: 'alert-1',
      category: 'urgent',
      categoryLabel: 'Pest Outbreak / જીવાત',
      titleEn: 'Pink Bollworm Infestation in Kamrej Cluster',
      titleGu: 'કામરેજ વિસ્તારમાં ગુલાબી ઈયળનો ઉપદ્રવ',
      severity: 'Critical',
      severityColor: 'bg-red-100 text-red-800 border-red-300',
      time: '25 mins ago',
      descriptionEn: 'Cluster telemetry detected >8 adult moths per trap in neighboring cotton fields. Immediate pheromone trap installation required.',
      descriptionGu: 'નજીકના કપાસના ખેતરોમાં ટ્રેપ દીઠ ૮ થી વધુ પુખ્ત ફૂદાં નોંધાયા છે. તાત્કાલિક ફેરોમોન ટ્રેપ લગાવો.',
      actionText: 'Scan Field with AI Camera',
      actionRoute: '/ai-camera',
      isRead: false,
    },
    {
      id: 'alert-2',
      category: 'weather',
      categoryLabel: 'Weather Advisory / હવામાન',
      titleEn: 'Heavy Convective Rain Forecast (28mm)',
      titleGu: 'સોમવારે બપોરે ભારે વરસાદની શક્યતા (૨૮ મીમી)',
      severity: 'High',
      severityColor: 'bg-amber-100 text-amber-800 border-amber-300',
      time: '2 hours ago',
      descriptionEn: 'IMD Surat warns of strong convective thunderstorms on Monday afternoon. Delay pesticide spray and clear field drainage furrows.',
      descriptionGu: 'દવા છંટકાવ મુલતવી રાખો અને પાળા સાફ કરો જેથી પાણી ભરાઈ ન રહે.',
      actionText: 'Check Weather & Spray Window',
      actionRoute: '/weather-soil',
      isRead: false,
    },
    {
      id: 'alert-3',
      category: 'irrigation',
      categoryLabel: 'Soil & Nutrition / ખાતર',
      titleEn: 'Phosphorus Deficit in Block A Root Zone',
      titleGu: 'બ્લોક A માં ફોસ્ફરસની અછત નોંધાઈ',
      severity: 'Medium',
      severityColor: 'bg-blue-100 text-blue-800 border-blue-300',
      time: 'Yesterday',
      descriptionEn: 'Soil sensor readings indicate available P is below 24 kg/ha. Apply 25kg Single Super Phosphate (SSP) with next irrigation cycle.',
      descriptionGu: 'જમીન વિશ્લેષણ મુજબ ૨૫ કિગ્રા એસએસપી ખાતર આપવાની ભલામણ છે.',
      actionText: 'Track Fertilizer in Expenses',
      actionRoute: '/expenses',
      isRead: false,
    },
  ];
  storageService.set(STORAGE_KEYS.ALERTS, defaultAlerts);

  // 7. Default Scan Diagnoses History
  const defaultScans: DiagnosisResult[] = [
    {
      id: 'scan-1',
      crop: 'Cotton',
      diseaseName: 'Pink Bollworm (Pectinophora gossypiella)',
      diseaseGu: 'ગુલાબી ઈયળ (પિંક બોલવોર્મ)',
      confidence: 94,
      confidenceLabel: '94% Match (High Confidence)',
      severity: 'High',
      severityColor: 'text-red-700 bg-red-100',
      symptoms: [
        'Rosetted flowers with petal tying',
        'Premature boll opening and lint staining',
        'Entry holes plugged with frass in medium-sized bolls',
      ],
      treatments: [
        { type: 'Chemical / રાસાયણિક', action: 'Emamectin Benzoate 5% SG', dosage: '5g per 10L water' },
        { type: 'Biological / જૈવિક', action: 'Install Gossyplure Pheromone Traps', dosage: '5 traps per acre' },
        { type: 'Cultural / દેશી', action: 'Hand-pick and destroy rosetted flowers', dosage: 'Daily morning sweep' },
      ],
      warning: 'AI diagnostic estimate. Confirm with your local KVK agronomist before spraying.',
      timestamp: 'Today, 10:15 AM',
      isAiEstimate: true,
      disclaimer: 'AI inference estimate based on leaf & boll visual patterns. Consult agronomist for certified advice.',
    },
  ];
  storageService.set(STORAGE_KEYS.SCANS, defaultScans);

  // 8. Default Admin Farmers
  const defaultFarmers: FarmerRecord[] = [
    {
      id: 'f-1',
      name: 'Ramesh Patel',
      code: 'KVK-SRT-8821',
      village: 'Kamrej',
      district: 'Surat',
      acreage: '4.5 Ac',
      plots: '2 Geo-Fenced Plots',
      crop: 'Cotton (Shankar-6)',
      cropBadgeColor: 'bg-emerald-100 text-emerald-800',
      ndvi: 0.76,
      ndviLabel: 'Optimal Canopy',
      ndviColor: 'text-emerald-700 bg-emerald-600',
      lastActivity: 'Scanned leaf (45m ago)',
      kycDone: true,
    },
    {
      id: 'f-2',
      name: 'Manji Chavda',
      code: 'KVK-SRT-4910',
      village: 'Olpad',
      district: 'Surat',
      acreage: '8.0 Ac',
      plots: '3 Geo-Fenced Plots',
      crop: 'Groundnut (GG-20)',
      cropBadgeColor: 'bg-amber-100 text-amber-900',
      ndvi: 0.62,
      ndviLabel: 'Moderate Vigour',
      ndviColor: 'text-amber-700 bg-amber-500',
      lastActivity: 'Checked Mandi (2h ago)',
      kycDone: true,
    },
    {
      id: 'f-3',
      name: 'Arvind Solanki',
      code: 'KVK-SRT-9032',
      village: 'Bardoli',
      district: 'Surat',
      acreage: '11.4 Ac',
      plots: '4 Geo-Fenced Plots',
      crop: 'Sugarcane (Co-86032)',
      cropBadgeColor: 'bg-emerald-100 text-emerald-800',
      ndvi: 0.79,
      ndviLabel: 'Robust Growth',
      ndviColor: 'text-emerald-700 bg-emerald-600',
      lastActivity: 'Logged Irrigation (4h ago)',
      kycDone: true,
    },
    {
      id: 'f-4',
      name: 'Bhavesh Desai',
      code: 'KVK-BHC-3109',
      village: 'Ankleshwar',
      district: 'Bharuch',
      acreage: '3.2 Ac',
      plots: '1 Plot',
      crop: 'Pigeon Pea (Tuver)',
      cropBadgeColor: 'bg-orange-100 text-orange-900',
      ndvi: 0.48,
      ndviLabel: 'Moisture Deficit',
      ndviColor: 'text-red-700 bg-red-500',
      lastActivity: 'Requested Soil Test (Yesterday)',
      kycDone: false,
    },
  ];
  storageService.set(STORAGE_KEYS.ADMIN_FARMERS, defaultFarmers);

  // Mark initialized
  storageService.set(STORAGE_KEYS.INITIALIZED, true);
};
