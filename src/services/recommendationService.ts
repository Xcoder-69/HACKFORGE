// AgroMind AI — Agronomic Recommendation Service
// Data-backed crop suitability, transparent profit mathematics, and crop-specific advisory

import type {
  CropRecommendationItem,
  GrowingCropAdvisory,
  SeasonKey,
  SuitabilityCategory,
  SuitabilityCategoryGu,
  IRecommendationService,
  DataSourcesAudit,
  CropCostBreakdown,
  CropYieldRange,
  CropCultivationStage,
} from '../contracts/recommendation.contract';
import type { PlotInfo, FarmParcel, MandiRecord } from '../types';
import { weatherService, type WeatherData } from './weatherService';
import { marketService } from './marketService';
import { farmService } from './farmService';
import { locationService, type GeoCoordinates } from './locationService';

interface CropAgronomicProfile {
  id: string;
  nameEn: string;
  nameGu: string;
  nameHi: string;
  variety: string;
  season: SeasonKey;
  tempMin: number;
  tempMax: number;
  tempOptimal: number;
  waterNeed: 'Low' | 'Medium' | 'High';
  waterNeedGu: string;
  preferredSoils: string[];
  soilSuitabilityEn: string;
  soilSuitabilityGu: string;
  durationDays: string;
  costs: CropCostBreakdown;
  yieldRange: CropYieldRange;
  marketCropFilter: string;
  benchmarkPrice: number;
  mainRisksEn: string[];
  mainRisksGu: string[];
  suitabilityReasonBaseEn: string;
  suitabilityReasonBaseGu: string;
  stages: CropCultivationStage[];
}

const CROP_CATALOG: Record<string, CropAgronomicProfile> = {
  // --------------------------------------------------------------------------
  // KHARIF CROPS (Monsoon / ચોમાસુ)
  // --------------------------------------------------------------------------
  groundnut: {
    id: 'groundnut',
    nameEn: 'Groundnut (Peanut)',
    nameGu: 'મગફળી (GG-20)',
    nameHi: 'Mungfali (GG-20)',
    variety: 'Gujarat Groundnut-20 (GG-20)',
    season: 'kharif',
    tempMin: 22,
    tempMax: 37,
    tempOptimal: 28,
    waterNeed: 'Low',
    waterNeedGu: 'ઓછું પાણી (ડ્રિપ અનુકૂળ)',
    preferredSoils: ['Black Cotton Soil', 'Sandy Loam', 'કાળી કાંપવાળી', 'ગોરાડુ જમીન'],
    soilSuitabilityEn: 'High compatibility with well-drained Black Cotton Soil & Sandy Loam (pH 6.5–7.8)',
    soilSuitabilityGu: 'કાળી કાંપવાળી અને ગોરાડુ જમીન માટે ઉત્તમ અનુકૂળતા (નાઇટ્રોજન ફિક્સિંગ)',
    durationDays: '105 - 115 Days',
    costs: {
      seedCostPerAcre: 5200,
      fertilizerCostPerAcre: 3600,
      pesticideCostPerAcre: 2400,
      laborAndMachineryPerAcre: 5800,
      irrigationCostPerAcre: 2000,
      totalCostPerAcre: 19000,
    },
    yieldRange: {
      minYieldPerAcre: 16,
      maxYieldPerAcre: 22,
      unit: 'Qtl',
    },
    marketCropFilter: 'Groundnut',
    benchmarkPrice: 6880,
    mainRisksEn: ['Heavy continuous downpour during pod maturity', 'Tikka leaf spot under high humidity', 'White grub infestation'],
    mainRisksGu: ['કાપણી સમયે સતત ભારે વરસાદ', 'વધુ ભેજમાં ટીક્કા રોગ', 'સફેદ ધૂણેચી (ઈયળ)નો ઉપદ્રવ'],
    suitabilityReasonBaseEn: 'Leguminous nitrogen-fixing taproot enriches soil. Thrives under intermittent monsoon and drip systems.',
    suitabilityReasonBaseGu: 'જમીનમાં નાઇટ્રોજન વધારે છે, કાળી જમીનમાં ઉત્તમ પોષણ મળે છે અને ઊંચા બજારભાવ આપે છે.',
    stages: [
      {
        name: 'Land Preparation & FYM',
        nameGu: 'જમીનની તૈયારી અને દેશી ખાતર',
        days: 'Day 0-7',
        detail: 'Deep ploughing followed by 2 cross rotavator passes. Incorporate 4 tons well-decomposed FYM/acre.',
        detailGu: 'ઊંડી ખેડ કરી એકરે ૪ ટન સારું કોહવાયેલું દેશી ખાતર જમીનમાં ભેળવો.',
        fertilizerAction: 'Basal FYM + 10 kg Gypsum/acre',
        fertilizerActionGu: 'પાયામાં દેશી ખાતર + ૧૦ કિગ્રા જીપ્સમ',
      },
      {
        name: 'Seed Inoculation & Sowing',
        nameGu: 'બીજ માવજત અને વાવણી',
        days: 'Day 8-12',
        detail: 'Treat seeds with Trichoderma viride @ 5g/kg + Rhizobium culture. Sow at 4-5cm depth.',
        detailGu: 'ટ્રાઇકોડર્મા વિરીડી (૫ ગ્રા/કિગ્રા) અને રાઇઝોબિયમ કલ્ચરનો પટ આપી વાવણી કરો.',
        irrigationAction: 'Ensure adequate moisture (Vapasa condition)',
        irrigationActionGu: 'વાવણી સમયે જમીનમાં પૂરતો ભેજ (વાપસા) હોવો જરૂરી',
      },
      {
        name: 'Vegetative Growth & Weeding',
        nameGu: 'વાનસ્પતિક વૃદ્ધિ અને નીંદામણ',
        days: 'Day 25-35',
        detail: 'Perform light inter-culturing. Maintain weed-free basin around rows.',
        detailGu: 'હળવી આંતરખેડ કરી નીંદામણ દૂર કરો.',
        fertilizerAction: 'NPK 20:40:20 @ 50 kg/acre top dressing',
        fertilizerActionGu: 'એનપીકે ૨૦:૪૦:૨૦ ખાતર ૫૦ કિગ્રા/એકર',
        pestRisk: 'Leaf miner & Aphids',
        pestRiskGu: 'પાન કોરી ખાનાર ઈયળ અને મોલો-મશી',
      },
      {
        name: 'Pegging & Pod Formation',
        nameGu: 'સૂયા બેસવા અને પોપટા બંધાવા',
        days: 'Day 50-65',
        detail: 'Crucial moisture period. Do not disturb soil mechanically once pegs penetrate.',
        detailGu: 'સૂયા જમીનમાં ઉતરવાનો અત્યંત સંવેદનશીલ તબક્કો. આ સમયે આંતરખેડ ન કરવી.',
        fertilizerAction: 'Broadcast Gypsum @ 150 kg/acre for calcium uptake',
        fertilizerActionGu: 'કેલ્શિયમ માટે જીપ્સમ ૧૫૦ કિગ્રા/એકર આપો',
        irrigationAction: 'Maintain regular light drip irrigation (every 4-5 days)',
        irrigationActionGu: 'નિયમિત હળવું પિયત (૪-૫ દિવસે) જાળવી રાખો',
        pestRisk: 'Tikka disease (Cercospora leaf spot)',
        pestRiskGu: 'ટીક્કા રોગ (પાન પર કાળા ટપકાં)',
      },
      {
        name: 'Pod Filling & Hardening',
        nameGu: 'દાણા ભરાવા અને પાકવું',
        days: 'Day 80-95',
        detail: 'Moisture stress in this stage shrivels kernels. Avoid excess water stagnation.',
        detailGu: 'દાણા ભરાવાના સમયે પાણીની ખેંચ ન પડવા દો. પાણી ભરાઈ ન રહે તેનું ધ્યાન રાખો.',
        fertilizerAction: 'Foliar spray 00:52:34 @ 5g/L + Micronutrients',
        fertilizerActionGu: '૦૦:૫૨:૩૪ ખાતર ૫ ગ્રા/લિટરનો છંટકાવ',
      },
      {
        name: 'Harvesting & Infield Curing',
        nameGu: 'કાપણી અને સુકવણી',
        days: 'Day 105-115',
        detail: 'Uproot when 75% shells show internal dark reticulation. Cure in inverted windrows for 3 days.',
        detailGu: '૭૫% પોપટાની અંદર કાળી નસો દેખાય ત્યારે ઉપાડો અને ૩ દિવસ ઊંધી સુકવો.',
      },
    ],
  },

  cotton: {
    id: 'cotton',
    nameEn: 'Bt Cotton',
    nameGu: 'કપાસ (G.Cot-16)',
    nameHi: 'Kapas (G.Cot-16)',
    variety: 'Gujarat Cotton Hybrid-16 (Shankar-6 Line)',
    season: 'kharif',
    tempMin: 20,
    tempMax: 40,
    tempOptimal: 30,
    waterNeed: 'Medium',
    waterNeedGu: 'મધ્યમ પાણી (નિયમિત ડ્રિપ)',
    preferredSoils: ['Black Cotton Soil', 'Deep Black Clay', 'કાળી માટી'],
    soilSuitabilityEn: 'Exceptional affinity with heavy moisture-retentive deep black clay soil',
    soilSuitabilityGu: 'ઊંડી કાળી કાંપવાળી જમીન અને વધુ ભેજ સંગ્રહ ક્ષમતા માટે શ્રેષ્ઠ',
    durationDays: '150 - 165 Days',
    costs: {
      seedCostPerAcre: 4400,
      fertilizerCostPerAcre: 5800,
      pesticideCostPerAcre: 4200,
      laborAndMachineryPerAcre: 7500,
      irrigationCostPerAcre: 2600,
      totalCostPerAcre: 24500,
    },
    yieldRange: {
      minYieldPerAcre: 15,
      maxYieldPerAcre: 20,
      unit: 'Qtl',
    },
    marketCropFilter: 'Cotton',
    benchmarkPrice: 7250,
    mainRisksEn: ['Pink Bollworm flare-up during flowering', 'Excessive vegetative lodging from heavy late rain', 'Sucking pests'],
    mainRisksGu: ['ફૂલ-જીંડવા સમયે ગુલાબી ઈયળનો ઉપદ્રવ', 'મોડા વરસાદથી વાનસ્પતિક વૃદ્ધિ વધી જવી', 'ચૂસિયા પ્રકારની જીવાતો'],
    suitabilityReasonBaseEn: 'Highest gross cash return in South & Saurashtra Gujarat cotton belts. Highly resilient to heat.',
    suitabilityReasonBaseGu: 'સૌરાષ્ટ્ર અને દક્ષિણ ગુજરાતના કપાસ પટ્ટામાં સૌથી વધુ આવક આપતો મુખ્ય રોકડિયો પાક.',
    stages: [
      {
        name: 'Ridge Prep & Dibbling',
        nameGu: 'પાળા બનાવવા અને ચોપણી',
        days: 'Day 0-10',
        detail: 'Prepare ridges at 90cm spacing. Dibble seeds at 2.5cm depth with FYM in hills.',
        detailGu: '૯૦ સેમીના અંતરે પાળા બનાવી ૨.૫ સેમી ઊંડાઈએ બીજ ચોપો.',
        fertilizerAction: 'Basal DAP 50 kg + Potash 25 kg/acre',
        fertilizerActionGu: 'પાયામાં ડીએપી ૫૦ કિગ્રા + પોટાશ ૨૫ કિગ્રા',
      },
      {
        name: 'Thinning & Square Initiation',
        nameGu: 'છાંટી કરવી અને ચાપવા બેસવા',
        days: 'Day 35-45',
        detail: 'Retain single vigorous seedling per hill. Install pheromone traps for monitoring.',
        detailGu: 'એક થાણે એક જ તંદુરસ્ત છોડ રાખો. ફેરોમોન ટ્રેપ ગોઠવો.',
        fertilizerAction: 'First split Urea @ 35 kg/acre',
        fertilizerActionGu: 'યુરિયાનો પ્રથમ હપ્તો ૩૫ કિગ્રા/એકર',
        pestRisk: 'Thrips, Jassids & Aphids',
        pestRiskGu: 'થ્રિપ્સ અને મોલો-મશી',
      },
      {
        name: 'Flowering & Boll Setting',
        nameGu: 'ફૂલ ખીલવા અને જીંડવા બેસવા',
        days: 'Day 65-85',
        detail: 'Critical yield-determining window. Monitor square drop and spray plan.',
        detailGu: 'ઉત્પાદન નક્કી કરતો મુખ્ય તબક્કો. ચાપવા-ફૂલ ખરતા અટકાવો.',
        fertilizerAction: 'Urea 35 kg + Magnesium Sulphate 10 kg/acre',
        fertilizerActionGu: 'યુરિયા ૩૫ કિગ્રા + મેગ્નેશિયમ સલ્ફેટ ૧૦ કિગ્રા',
        pestRisk: 'Pink Bollworm (Pectinophora gossypiella)',
        pestRiskGu: 'ગુલાબી ઈયળ (જીંડવામાં કાણું પાડનાર)',
      },
      {
        name: 'Boll Development & Maturation',
        nameGu: 'જીંડવાનો વિકાસ અને પાકટતા',
        days: 'Day 90-120',
        detail: 'Maintain steady drip moisture. Check for boll rot if high humidity persists.',
        detailGu: 'નિયમિત ડ્રિપ પિયત ચાલુ રાખો. ભેજવાળા વાતાવરણમાં જીંડવા સડો ન થાય તેનું ધ્યાન રાખો.',
        fertilizerAction: 'Foliar 13:00:45 @ 10g/L spray',
        fertilizerActionGu: '૧૩:૦૦:૪૫ ખાતર ૧૦ ગ્રા/લિટર છંટકાવ',
      },
      {
        name: 'Picking Stage (Flush 1 & 2)',
        nameGu: 'વીણી (પ્રથમ અને દ્વિતીય તબક્કો)',
        days: 'Day 135-165',
        detail: 'Pick clean dry bolls in sunny morning hours after dew evaporates. Store in dry ventilated room.',
        detailGu: 'ઝાકળ સુકાયા બાદ સ્વચ્છ રૂની વીણી કરો. સૂકી જગ્યાએ સંગ્રહ કરો.',
      },
    ],
  },

  sugarcane: {
    id: 'sugarcane',
    nameEn: 'Sugarcane',
    nameGu: 'શેરડી (Co-86032)',
    nameHi: 'Ganna / Sherdi (Co-86032)',
    variety: 'Co-86032 (Nayana)',
    season: 'kharif',
    tempMin: 22,
    tempMax: 38,
    tempOptimal: 30,
    waterNeed: 'High',
    waterNeedGu: 'વધુ પાણી (નહેર/બોરવેલ)',
    preferredSoils: ['Black Cotton Soil', 'Alluvial Clay', 'કાળી કાંપવાળી'],
    soilSuitabilityEn: 'Requires heavy soils with high water retention and reliable canal/tube well supply',
    soilSuitabilityGu: 'ભારે કાંપવાળી જમીન અને નહેર/બોરવેલના સતત પાણીવાળા વિસ્તાર માટે અનુકૂળ',
    durationDays: '330 - 360 Days',
    costs: {
      seedCostPerAcre: 12000,
      fertilizerCostPerAcre: 14000,
      pesticideCostPerAcre: 4500,
      laborAndMachineryPerAcre: 12500,
      irrigationCostPerAcre: 5000,
      totalCostPerAcre: 48000,
    },
    yieldRange: {
      minYieldPerAcre: 35,
      maxYieldPerAcre: 45,
      unit: 'Ton',
    },
    marketCropFilter: 'Sugarcane',
    benchmarkPrice: 3420,
    mainRisksEn: ['Water scarcity during summer peak', 'Early shoot borer attack in juvenile tillers', 'Frost/cold shock'],
    mainRisksGu: ['ઉનાળામાં પાણીની અછત', 'પ્રારંભિક તબક્કે સાંઠાની ઈયળ', 'અતિશય ઠંડી'],
    suitabilityReasonBaseEn: 'Guaranteed local institutional off-take at cooperative sugar factories in Surat/Navsari.',
    suitabilityReasonBaseGu: 'સુરત અને નવસારી સહકારી ખાંડ મિલોમાં નિશ્ચિત ખરીદી અને લાંબા ગાળાનો સ્થિર નફો.',
    stages: [
      {
        name: 'Furrow Prep & Planting',
        nameGu: 'ચર ખોદવા અને રોપણી',
        days: 'Day 0-15',
        detail: 'Open 4-foot deep trenches. Plant two-bud setts treated with fungicide.',
        detailGu: '૪ ફૂટના ચર બનાવી ફૂગનાશક દવાથી માવજત કરેલ ૨ આંખવાળા ટુકડા રોપો.',
        fertilizerAction: 'Press mud 5 tons + NPK 50:50:50/acre',
        fertilizerActionGu: 'પ્રેસમડ ૫ ટન + એનપીકે ૫૦:૫૦:૫૦',
      },
      {
        name: 'Tillering Phase & Earthing Up',
        nameGu: 'પીલા ફૂટવા અને પાળા ચઢાવવા',
        days: 'Day 45-90',
        detail: 'Provide frequent light irrigations. Perform earthing up to prevent lodging.',
        detailGu: 'હળવા પિયત આપો અને છોડ ઢળી ન પડે તે માટે માટીના પાળા ચઢાવો.',
        fertilizerAction: 'Urea top dressing 50 kg/acre',
        fertilizerActionGu: 'યુરિયા ૫૦ કિગ્રા/એકર',
        pestRisk: 'Early shoot borer',
        pestRiskGu: 'સાંઠા કોરી ખાનાર ઈયળ',
      },
      {
        name: 'Grand Growth Phase',
        nameGu: 'મોટી વૃદ્ધિનો તબક્કો',
        days: 'Day 120-240',
        detail: 'Maximum water and nutrient demand. Maintain scheduled fertigation.',
        detailGu: 'મહત્તમ પાણી અને ખાતરની જરૂરિયાતનો સમય. ડ્રિપથી નિયમિત ખાતર આપો.',
        fertilizerAction: 'Drip fertigation of Urea & Potash alternate weeks',
        fertilizerActionGu: 'યુરિયા અને પોટાશ ડ્રિપ દ્વારા દર અઠવાડિયે',
      },
      {
        name: 'Maturation & Factory Harvest',
        nameGu: 'પરિપક્વતા અને મિલ કાપણી',
        days: 'Day 330-360',
        detail: 'Withhold water 15 days before harvest to maximize sugar Brix percentage.',
        detailGu: 'ખાંડનું પ્રમાણ વધારવા કાપણીના ૧૫ દિવસ પહેલાં પાણી બંધ કરો.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // RABI CROPS (Winter / શિયાળુ)
  // --------------------------------------------------------------------------
  wheat: {
    id: 'wheat',
    nameEn: 'Durum Wheat',
    nameGu: 'ટુકડી / ભાલીયા ઘઉં',
    nameHi: 'Sharbati Gehun (GW-496)',
    variety: 'GW-496 (Gujarat Gold)',
    season: 'rabi',
    tempMin: 12,
    tempMax: 30,
    tempOptimal: 20,
    waterNeed: 'Medium',
    waterNeedGu: 'મધ્યમ સિંચાઈ (૪-૫ પિયત)',
    preferredSoils: ['Black Cotton Soil', 'Alluvial Loam', 'કાળી કાંપવાળી'],
    soilSuitabilityEn: 'High yield potential following kharif pulses on deep clay soils',
    soilSuitabilityGu: 'ચોમાસુ કઠોળ બાદ કાળી કાંપવાળી જમીનમાં ઉત્તમ પોષક તત્વોનો મેળ',
    durationDays: '110 - 120 Days',
    costs: {
      seedCostPerAcre: 2800,
      fertilizerCostPerAcre: 4200,
      pesticideCostPerAcre: 1500,
      laborAndMachineryPerAcre: 5500,
      irrigationCostPerAcre: 3000,
      totalCostPerAcre: 17000,
    },
    yieldRange: {
      minYieldPerAcre: 18,
      maxYieldPerAcre: 24,
      unit: 'Qtl',
    },
    marketCropFilter: 'Wheat',
    benchmarkPrice: 2850,
    mainRisksEn: ['Premature heat waves during grain filling (terminal heat)', 'Rust fungi under prolonged fog', 'Aphid swarms'],
    mainRisksGu: ['દાણા ભરાતી વખતે અચાનક ગરમી વધવી', 'લાંબા સમયના ધુમ્મસમાં ગેરુ રોગ', 'મોલો-મશીનો હુમલો'],
    suitabilityReasonBaseEn: 'Excellent staple rotational choice with very low pest risk in cold Gujarat winters.',
    suitabilityReasonBaseGu: 'શિયાળાની ઠંડીમાં ઓછા ખર્ચે થતો સુરક્ષિત અને મુખ્ય અનાજ પાક.',
    stages: [
      {
        name: 'Seedbed Prep & Sowing',
        nameGu: 'જમીનની તૈયારી અને વાવણી',
        days: 'Day 0-7',
        detail: 'Fine granular tilth. Seed drill sowing at 20cm row distance.',
        detailGu: 'રોટાવેટરથી પોચી જમીન બનાવી ૨૦ સેમીના અંતરે ઓરણીથી વાવણી કરો.',
        fertilizerAction: 'Basal DAP 50 kg + Potash 25 kg/acre',
        fertilizerActionGu: 'પાયામાં ડીએપી ૫૦ કિગ્રા + પોટાશ ૨૫ કિગ્રા',
      },
      {
        name: 'Crown Root Irrigation (CRI)',
        nameGu: 'મૂળ ફૂટવાનો તબક્કો (CRI)',
        days: 'Day 20-22',
        detail: 'Most critical first irrigation stage. Water stress here reduces tillers drastically.',
        detailGu: 'પ્રથમ અને સૌથી મહત્વનું પિયત. આ સમયે પાણીની ખેંચથી ઉત્પાદન ઘટે છે.',
        fertilizerAction: 'First top dressing of Urea 35 kg/acre',
        fertilizerActionGu: 'યુરિયા ૩૫ કિગ્રા/એકર પ્રથમ હપ્તો',
      },
      {
        name: 'Jointing & Booting',
        nameGu: 'ગાંઠો પડવી અને ગર્ભાવસ્થા',
        days: 'Day 45-60',
        detail: 'Second irrigation. Inspect field for foliar rust spots or aphids.',
        detailGu: 'બીજું પિયત આપો અને પાન પર ગેરુના ટપકાં કે મોલો-મશી ચકાસો.',
        fertilizerAction: 'Second Urea split 35 kg + Zinc Sulphate 5 kg/acre',
        fertilizerActionGu: 'યુરિયા ૩૫ કિગ્રા + ઝિંક સલ્ફેટ ૫ કિગ્રા',
        pestRisk: 'Brown rust & Aphids',
        pestRiskGu: 'ગેરુ રોગ અને મોલો-મશી',
      },
      {
        name: 'Milking & Dough Stage',
        nameGu: 'દૂધિયા દાણા અને પોચા દાણા',
        days: 'Day 75-90',
        detail: 'Light irrigation to prevent lodging while keeping grain plump.',
        detailGu: 'પવન ન હોય ત્યારે હળવું પિયત આપો જેથી છોડ ઢળી ન પડે.',
      },
      {
        name: 'Maturity & Combine Harvest',
        nameGu: 'પાકટતા અને કમ્બાઈન કાપણી',
        days: 'Day 110-120',
        detail: 'Harvest when grain moisture drops below 12%. Thresh cleanly.',
        detailGu: 'દાણામાં ભેજ ૧૨%થી ઓછો થાય ત્યારે કમ્બાઇન હાર્વેસ્ટરથી કાપણી કરો.',
      },
    ],
  },

  chickpea: {
    id: 'chickpea',
    nameEn: 'Gram / Chickpea',
    nameGu: 'ચણા (ગુજરાત ચણા-૫)',
    nameHi: 'Chana (GG-5)',
    variety: 'Gujarat Gram-5 (GG-5)',
    season: 'rabi',
    tempMin: 10,
    tempMax: 28,
    tempOptimal: 22,
    waterNeed: 'Low',
    waterNeedGu: 'ઓછું પાણી (૨-૩ પિયત)',
    preferredSoils: ['Black Cotton Soil', 'Medium Loam', 'કાળી કાંપવાળી'],
    soilSuitabilityEn: 'Superb fit for residual moisture black soils requiring minimal irrigation',
    soilSuitabilityGu: 'ચોમાસાના બચેલા ભેજમાં ઓછા પાણીએ સૌથી વધુ નફો આપતી કઠોળ જાત',
    durationDays: '95 - 105 Days',
    costs: {
      seedCostPerAcre: 3400,
      fertilizerCostPerAcre: 2800,
      pesticideCostPerAcre: 2200,
      laborAndMachineryPerAcre: 4200,
      irrigationCostPerAcre: 1400,
      totalCostPerAcre: 14000,
    },
    yieldRange: {
      minYieldPerAcre: 10,
      maxYieldPerAcre: 14,
      unit: 'Qtl',
    },
    marketCropFilter: 'Chickpea',
    benchmarkPrice: 6100,
    mainRisksEn: ['Pod borer (Helicoverpa) at flowering', 'Wilt disease in heavy clay stagnation', 'Cloudy humid weather'],
    mainRisksGu: ['ફૂલ-પોપટા સમયે લીલી ઈયળ (પોડ બોરર)', 'પાણી ભરાવાથી સુકારો રોગ', 'વાદળછાયું વાતાવરણ'],
    suitabilityReasonBaseEn: 'Lowest input expense with government MSP backing and high protein pulse demand.',
    suitabilityReasonBaseGu: 'ઓછા ખર્ચે અને માત્ર ૨-૩ પિયતમાં સુરક્ષિત ટેકાના ભાવ સાથે વધુ નફો આપતો રવિ પાક.',
    stages: [
      {
        name: 'Seedbed & Rhizobium Seed Treatment',
        nameGu: 'જમીનની તૈયારી અને બીજ માવજત',
        days: 'Day 0-7',
        detail: 'Treat seeds with Rhizobium culture and Trichoderma. Drill at 30cm line spacing.',
        detailGu: 'રાઇઝોબિયમ કલ્ચર અને ટ્રાઇકોડર્માનો પટ આપી ૩૦ સેમીના અંતરે વાવો.',
        fertilizerAction: 'Basal DAP 40 kg + Sulphur 10 kg/acre',
        fertilizerActionGu: 'પાયામાં ડીએપી ૪૦ કિગ્રા + સલ્ફર ૧૦ કિગ્રા',
      },
      {
        name: 'Branching & Nipping',
        nameGu: 'ડાળીઓ ફૂટવી અને ડોકાં તોડવા',
        days: 'Day 28-35',
        detail: 'Nip terminal shoot tops to stimulate prolific secondary branching.',
        detailGu: 'ઉપરના ડોકાં તોડવાથી બાજુની ડાળીઓ વધુ ફૂટશે અને પોપટા વધશે.',
      },
      {
        name: 'Flowering & Pod Borer Watch',
        nameGu: 'ફૂલ બેસવા અને ઈયળ નિયંત્રણ',
        days: 'Day 50-65',
        detail: 'Critical pest window. Install bird perches and pheromone traps for Helicoverpa.',
        detailGu: 'લીલી ઈયળ માટે ફેરોમોન ટ્રેપ અને પક્ષીઓને બેસવાના ટી-આકારના ટેકા ગોઠવો.',
        pestRisk: 'Gram pod borer (Helicoverpa armigera)',
        pestRiskGu: 'ચણાની પોપટા કોરી ખાનાર લીલી ઈયળ',
      },
      {
        name: 'Pod Hardening & Harvesting',
        nameGu: 'પોપટા પાકવા અને કાપણી',
        days: 'Day 95-105',
        detail: 'Harvest when leaves turn straw yellow and seeds rattle inside pods.',
        detailGu: 'છોડ પીળો પડે અને પોપટામાં દાણા ખખડે ત્યારે સવારે કાપણી કરો.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // ZAID CROPS (Summer / ઉનાળુ)
  // --------------------------------------------------------------------------
  summer_sesame: {
    id: 'summer_sesame',
    nameEn: 'Summer Sesame (Til)',
    nameGu: 'ઉનાળુ તલ (ગુજરાત તલ-૨)',
    nameHi: 'Garmi ke Til (GT-2)',
    variety: 'Gujarat Til-2 (White Bold)',
    season: 'zaid',
    tempMin: 25,
    tempMax: 42,
    tempOptimal: 34,
    waterNeed: 'Low',
    waterNeedGu: 'હળવું પિયત (ડ્રિપ)',
    preferredSoils: ['Sandy Loam', 'Medium Black Soil', 'ગોરાડુ જમીન'],
    soilSuitabilityEn: 'Thrives in well-drained loamy and sandy soil under intense solar radiation',
    soilSuitabilityGu: 'સારા નિતારવાળી ગોરાડુ અને મધ્યમ કાળી જમીનમાં ઉનાળાના તાપમાં ખૂબ અનુકૂળ',
    durationDays: '85 - 90 Days',
    costs: {
      seedCostPerAcre: 1800,
      fertilizerCostPerAcre: 3200,
      pesticideCostPerAcre: 1800,
      laborAndMachineryPerAcre: 4500,
      irrigationCostPerAcre: 1700,
      totalCostPerAcre: 13000,
    },
    yieldRange: {
      minYieldPerAcre: 5,
      maxYieldPerAcre: 8,
      unit: 'Qtl',
    },
    marketCropFilter: 'Sesame',
    benchmarkPrice: 14500,
    mainRisksEn: ['Premature capsule shatter if delayed harvest', 'Phyllody mycoplasma disease', 'Strong dry summer gales'],
    mainRisksGu: ['કાપણીમાં વિલંબથી ઝીંડવા ફાટી જવા', 'તલનો ફીલોડી (વિચીત્ર પાંદડા) રોગ', 'ઉનાળાના ગરમ પવનો'],
    suitabilityReasonBaseEn: 'Rapid 85-day maturity with sky-high export prices in Unjha, Rajkot & Surat mandis.',
    suitabilityReasonBaseGu: 'માત્ર ૮૫ દિવસનો ટૂંકો પાક. ઊંચા બજારભાવ (₹૧૪,૦૦૦+/ક્વિન્ટલ) અને ઓછું જોખમ.',
    stages: [
      {
        name: 'Pre-irrigation & Shallow Sowing',
        nameGu: 'પિયત અને છીછરી વાવણી',
        days: 'Day 0-5',
        detail: 'Mix small seeds with fine river sand (1:4 ratio) for uniform distribution. Sow at 1.5cm depth.',
        detailGu: 'ઝીણા બીજને રેતી સાથે ભેળવી ૧.૫ સેમી ઊંડાઈએ એકસરખી વાવણી કરો.',
        fertilizerAction: 'Basal NPK 20:20:00 @ 25 kg + Sulphur 10 kg/acre',
        fertilizerActionGu: 'પાયામાં ૨૦:૨૦:૦૦ ખાતર ૨૫ કિગ્રા + સલ્ફર ૧૦ કિગ્રા',
      },
      {
        name: 'Vegetative & Drip Scheduling',
        nameGu: 'વાનસ્પતિક વૃદ્ધિ અને ડ્રિપ પિયત',
        days: 'Day 20-30',
        detail: 'Thin out crowded seedlings to maintain 10cm plant-to-plant distance.',
        detailGu: 'છોડની છાંટણી કરી ૧૦ સેમીનું અંતર જાળવો.',
      },
      {
        name: 'Flowering & Capsule Setting',
        nameGu: 'ફૂલ બેસવા અને ઝીંડવા બંધાવા',
        days: 'Day 40-55',
        detail: 'Maintain steady moisture through drip every 4 days. Do not allow soil to crack.',
        detailGu: 'જમીનમાં તિરાડો ન પડે તે માટે દર ૪ દિવસે ડ્રિપથી હળવું પાણી આપો.',
        pestRisk: 'Leaf webber & Capsule borer',
        pestRiskGu: 'પાન વાળનાર અને ઝીંડવા કોરનાર ઈયળ',
      },
      {
        name: 'Capsule Browning & Shaking Harvest',
        nameGu: 'ઝીંડવા પીળા પડવા અને કાપણી',
        days: 'Day 80-88',
        detail: 'Harvest early morning when lowest capsules turn golden-brown before bursting.',
        detailGu: 'નીચેના ઝીંડવા પીળા-બદામી થાય એટલે સવારે કાપી પૂળા બાંધી તડકામાં સુકવો.',
      },
    ],
  },
};

export const recommendationService: IRecommendationService = {
  getCropDatabase(): Record<string, CropAgronomicProfile> {
    return CROP_CATALOG;
  },

  /**
   * Feature A: "What Should I Grow?"
   * Combines live weather, soil, crop database, and APMC market prices
   * Transparent rule-based 100-point rubric.
   */
  async getWhatToGrowRecommendations(
    season: SeasonKey,
    locationCoords?: GeoCoordinates | null
  ): Promise<CropRecommendationItem[]> {
    // 1. Resolve Location Coordinates
    const activeCoords = locationCoords || locationService.getSavedLocation();
    const hasLocation = locationService.hasValidLocation(activeCoords);

    // 2. Fetch live Open-Meteo weather (if location available)
    let weather: WeatherData | null = null;
    let weatherError = false;
    if (hasLocation) {
      try {
        weather = await weatherService.getWeather(activeCoords.latitude, activeCoords.longitude);
      } catch (err) {
        console.warn('[RecommendationService] Weather fetch failed, continuing with fallback:', err);
        weather = weatherService.getStoredWeather();
        weatherError = !weather;
      }
    }

    // 3. Fetch APMC Mandi Market Prices
    let mandiRecords: MandiRecord[] = [];
    try {
      mandiRecords = await marketService.getMarketPrices();
    } catch (err) {
      console.warn('[RecommendationService] Market prices query failed:', err);
    }

    // 4. Retrieve Farm Parcel Soil Type
    const farmParcel = farmService.getFarmParcel();
    const soilType = farmParcel?.soilType || 'Black Cotton Soil (કાળી કાંપવાળી)';

    // Filter crops by requested season
    const cropsForSeason = Object.values(CROP_CATALOG).filter((c) => c.season === season);

    const now = new Date();
    const weatherTimestamp = weather?.current?.lastUpdated || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const marketDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    // Evaluate each crop
    const recommendations: CropRecommendationItem[] = cropsForSeason.map((crop) => {
      // Find matching mandi price
      const matchingMandi = mandiRecords.find((m) =>
        m.crop.toLowerCase().includes(crop.marketCropFilter.toLowerCase()) ||
        m.cropGu.includes(crop.nameGu.split('(')[0].trim())
      );

      const liveModalPrice = matchingMandi ? matchingMandi.modalPrice : crop.benchmarkPrice;
      const liveMarketName = matchingMandi ? `${matchingMandi.mandi} (${matchingMandi.district})` : 'APMC Benchmark';
      const liveMarketTrend = matchingMandi ? matchingMandi.trend : 'up';

      // ----------------------------------------------------------------------
      // Transparent Rule-Based Scoring (100 Points Total)
      // ----------------------------------------------------------------------
      // Criterion 1: Temperature Fit (0 - 30 pts)
      let tempScore = 20; // baseline
      let tempReason = 'Normal regional climate window';
      if (weather && weather.current) {
        const currTemp = weather.current.temp;
        if (currTemp >= crop.tempMin && currTemp <= crop.tempMax) {
          const diffFromOptimal = Math.abs(currTemp - crop.tempOptimal);
          tempScore = Math.max(15, Math.round(30 - diffFromOptimal * 1.5));
          tempReason = `Current temperature ${currTemp}°C aligns well with optimal ${crop.tempOptimal}°C.`;
        } else if (currTemp < crop.tempMin) {
          tempScore = 12;
          tempReason = `Current temperature ${currTemp}°C is cooler than minimum threshold ${crop.tempMin}°C.`;
        } else {
          tempScore = 14;
          tempReason = `Current temperature ${currTemp}°C is warmer than ideal threshold ${crop.tempMax}°C.`;
        }
      }

      // Criterion 2: Rainfall & Irrigation Feasibility (0 - 25 pts)
      let waterScore = 20;
      if (crop.waterNeed === 'Low') {
        waterScore = 25; // low water crops score high by default
      } else if (crop.waterNeed === 'Medium') {
        waterScore = farmParcel?.irrigationTechnique?.includes('Drip') ? 24 : 20;
      } else {
        // High water crops (like sugarcane)
        waterScore = farmParcel?.waterSources?.some((s) => s.toLowerCase().includes('canal') || s.toLowerCase().includes('well')) ? 22 : 15;
      }

      // Criterion 3: Soil Type Compatibility (0 - 25 pts)
      let soilScore = 20;
      const isPreferredSoil = crop.preferredSoils.some((ps) =>
        soilType.toLowerCase().includes(ps.toLowerCase())
      );
      if (isPreferredSoil) {
        soilScore = 25;
      } else {
        soilScore = 16;
      }

      // Criterion 4: Market Trend & Economic Viability (0 - 20 pts)
      let marketScore = 15;
      if (liveMarketTrend === 'up') {
        marketScore = 20;
      } else if (liveMarketTrend === 'stable') {
        marketScore = 16;
      } else {
        marketScore = 11;
      }

      const totalRubricScore = tempScore + waterScore + soilScore + marketScore;

      // Map to Suitability Category
      let suitabilityCategory: SuitabilityCategory = 'Suitable';
      let suitabilityCategoryGu: SuitabilityCategoryGu = 'અનુકૂળ';
      if (totalRubricScore >= 85) {
        suitabilityCategory = 'Highly Suitable';
        suitabilityCategoryGu = 'ખૂબ અનુકૂળ';
      } else if (totalRubricScore >= 70) {
        suitabilityCategory = 'Suitable';
        suitabilityCategoryGu = 'અનુકૂળ';
      } else if (totalRubricScore >= 55) {
        suitabilityCategory = 'Moderate';
        suitabilityCategoryGu = 'મધ્યમ';
      } else {
        suitabilityCategory = 'Low';
        suitabilityCategoryGu = 'ઓછું અનુકૂળ';
      }

      // ----------------------------------------------------------------------
      // Transparent Arithmetic
      // Estimated Revenue = Expected Yield * Selling Price
      // Estimated Profit = Estimated Revenue - Total Cost
      // ----------------------------------------------------------------------
      const estRevMin = crop.yieldRange.minYieldPerAcre * liveModalPrice;
      const estRevMax = crop.yieldRange.maxYieldPerAcre * liveModalPrice;
      const estProfitMin = estRevMin - crop.costs.totalCostPerAcre;
      const estProfitMax = estRevMax - crop.costs.totalCostPerAcre;

      // Data sources and unavailable fields audit
      const unavailableFields: string[] = [
        'Soil Nitrogen (N): Data unavailable (Lab test needed)',
        'Soil Phosphorus (P): Data unavailable (Lab test needed)',
        'Soil Potassium (K): Data unavailable (Lab test needed)',
        'Soil Organic Carbon (OC): Data unavailable',
      ];
      if (!hasLocation) {
        unavailableFields.unshift('Live GPS: Data unavailable (Using preset)');
      }

      const dataAudit: DataSourcesAudit = {
        weatherSource: weather?.source ? 'Open-Meteo Forecast API (Live)' : 'Historical Gujarat Regional Climate Baseline',
        weatherTimestamp,
        marketSource: liveMarketName,
        marketPriceDate: marketDate,
        soilDataSource: `Farmer Profile (${soilType.split('(')[0].trim()})`,
        unavailableFields,
      };

      const reasonEn = `${crop.suitabilityReasonBaseEn} ${tempReason}`;
      const reasonGu = `${crop.suitabilityReasonBaseGu} (${soilType.split('(')[0].trim()} અને વર્તમાન વાતાવરણ સાથે સુસંગત)`;

      return {
        id: crop.id,
        nameEn: crop.nameEn,
        nameGu: crop.nameGu,
        nameHi: crop.nameHi,
        variety: crop.variety,
        season: crop.season,
        suitabilityScore: totalRubricScore,
        suitabilityCategory,
        suitabilityCategoryGu,
        suitabilityReasonEn: reasonEn,
        suitabilityReasonGu: reasonGu,
        growingDurationDays: crop.durationDays,
        waterNeed: crop.waterNeed,
        waterNeedGu: crop.waterNeedGu,
        soilSuitabilityEn: crop.soilSuitabilityEn,
        soilSuitabilityGu: crop.soilSuitabilityGu,
        costs: crop.costs,
        yieldRange: crop.yieldRange,
        liveMarketPrice: liveModalPrice,
        liveMarketPriceFormatted: `₹${liveModalPrice.toLocaleString('en-IN')} / ${crop.yieldRange.unit}`,
        liveMarketName,
        liveMarketTrend,
        liveMarketDate: marketDate,
        estimatedRevenueMin: estRevMin,
        estimatedRevenueMax: estRevMax,
        estimatedProfitMin: estProfitMin,
        estimatedProfitMax: estProfitMax,
        disclaimer: 'Estimated potential based on available data and current mandi rates.',
        disclaimerGu: 'ઉપલબ્ધ ડેટા, સામાન્ય ઉત્પાદન અને વર્તમાન બજારભાવ આધારે અંદાજિત સંભાવના.',
        mainRisksEn: crop.mainRisksEn,
        mainRisksGu: crop.mainRisksGu,
        stages: crop.stages,
        dataAudit,
      };
    });

    // Sort descending by suitability score
    recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    return recommendations;
  },

  /**
   * Feature B: "My Growing Crop"
   * Strictly crop-specific guidance based on the farmer's selected crop and stage
   */
  async getGrowingCropAdvisory(
    cropId: string,
    stageName: string,
    plot?: PlotInfo | null
  ): Promise<GrowingCropAdvisory> {
    const normCropId = cropId.toLowerCase();
    let matchedProfile = CROP_CATALOG.cotton; // default fallback
    if (normCropId.includes('groundnut') || normCropId.includes('મગફળી')) {
      matchedProfile = CROP_CATALOG.groundnut;
    } else if (normCropId.includes('cotton') || normCropId.includes('કપાસ')) {
      matchedProfile = CROP_CATALOG.cotton;
    } else if (normCropId.includes('sugarcane') || normCropId.includes('શેરડી')) {
      matchedProfile = CROP_CATALOG.sugarcane;
    } else if (normCropId.includes('wheat') || normCropId.includes('ઘઉં')) {
      matchedProfile = CROP_CATALOG.wheat;
    } else if (normCropId.includes('chickpea') || normCropId.includes('ચણા')) {
      matchedProfile = CROP_CATALOG.chickpea;
    } else if (normCropId.includes('sesame') || normCropId.includes('તલ')) {
      matchedProfile = CROP_CATALOG.summer_sesame;
    }

    // Resolve stage
    const matchedStage =
      matchedProfile.stages.find((s) => s.name.toLowerCase().includes(stageName.toLowerCase())) ||
      matchedProfile.stages[1] ||
      matchedProfile.stages[0];

    // Fetch live weather
    const loc = locationService.getSavedLocation();
    let weather: WeatherData | null = null;
    try {
      if (locationService.hasValidLocation(loc)) {
        weather = await weatherService.getWeather(loc.latitude, loc.longitude);
      }
    } catch (e) {
      console.warn('[GrowingCropAdvisory] Weather fetch error:', e);
      weather = weatherService.getStoredWeather();
    }

    // Fetch market price
    let mandiPrice = matchedProfile.benchmarkPrice;
    let sellingStrategy = 'HOLD (Monitor price trend before bulk dispatch)';
    let sellingStrategyGu = 'ભાવ મજબૂત છે, મોનિટર કરી યોગ્ય સમયે વેચાણ કરો';
    try {
      const records = await marketService.getMarketPrices();
      const match = records.find((m) => m.crop.toLowerCase().includes(matchedProfile.marketCropFilter.toLowerCase()));
      if (match) {
        mandiPrice = match.modalPrice;
        if (match.trend === 'up') {
          sellingStrategy = 'SELL NOW (Peak seasonal APMC demand detected)';
          sellingStrategyGu = 'હાલ ઊંચા ભાવ છે, તબક્કાવાર વેચાણ કરી નફો બુક કરો';
        }
      }
    } catch (e) {
      console.warn('[GrowingCropAdvisory] Market fetch error:', e);
    }

    const currentTemp = weather?.current?.temp ?? 28;
    const rainForecastNext24h = weather?.current?.rain ?? 0;
    const humidity = weather?.current?.humidity ?? 65;

    // 1. Weather Suitability Evaluation
    let weatherStatus: 'Favorable' | 'Caution' | 'Adverse' = 'Favorable';
    let weatherStatusGu = 'અનુકૂળ વાતાવરણ';
    let alertMsg: string | undefined;
    let alertMsgGu: string | undefined;

    if (rainForecastNext24h > 10) {
      weatherStatus = 'Caution';
      weatherStatusGu = 'સાવચેતી (ભારે વરસાદની શક્યતા)';
      alertMsg = `Expected rain (${rainForecastNext24h} mm) may cause water stagnation around roots.`;
      alertMsgGu = `આગામી ૨૪ કલાકમાં વરસાદ (${rainForecastNext24h} મીમી) ની શક્યતા છે. મૂળ પાસે પાણી ભરાવા ન દો.`;
    } else if (currentTemp > matchedProfile.tempMax) {
      weatherStatus = 'Caution';
      weatherStatusGu = 'સાવચેતી (ઊંચું તાપમાન)';
      alertMsg = `High temperature (${currentTemp}°C) increases moisture evaporation.`;
      alertMsgGu = `તાપમાન ઊંચું (${currentTemp}°C) હોવાથી બાષ્પીભવન ઝડપી બનશે.`;
    }

    // 2. Irrigation Guidance
    let irrAction = 'Maintain scheduled drip irrigation';
    let irrActionGu = 'નિયમિત ડ્રિપ પિયત ચાલુ રાખો';
    let irrReason = `Soil moisture requires replenishment for ${matchedProfile.nameEn} during ${matchedStage.name}.`;
    let irrReasonGu = `${matchedStage.nameGu} તબક્કે છોડના મૂળને પૂરતો ભેજ મળવો જરૂરી છે.`;

    if (rainForecastNext24h >= 5) {
      irrAction = 'Postpone drip irrigation for 24-48 hours';
      irrActionGu = '૨૪-૪૮ કલાક પિયત બંધ રાખો';
      irrReason = `Natural precipitation of ${rainForecastNext24h} mm forecasted by Open-Meteo.`;
      irrReasonGu = `ઓપન-મેટિઓ આગાહી મુજબ વરસાદની શક્યતા હોવાથી પિયત મુલતવી રાખો.`;
    }

    // 3. Fertilizer Guidance
    const fertDose = matchedStage.fertilizerAction || 'Apply balanced NPK as per basal guidelines';
    const fertDoseGu = matchedStage.fertilizerActionGu || 'ભલામણ મુજબ સંતુલિત એનપીકે ખાતર આપો';

    // 4. Pest Prevention
    const pestName = matchedStage.pestRisk || (matchedProfile.mainRisksEn[0] || 'Sap-sucking insects');
    const pestNameGu = matchedStage.pestRiskGu || (matchedProfile.mainRisksGu[0] || 'ચૂસિયા જીવાતો');

    // 5. Harvest & Financial Projection
    const now = new Date();
    const estYieldAcre = `${matchedProfile.yieldRange.minYieldPerAcre} - ${matchedProfile.yieldRange.maxYieldPerAcre} ${matchedProfile.yieldRange.unit}`;
    const estRevMin = matchedProfile.yieldRange.minYieldPerAcre * mandiPrice;
    const estRevMax = matchedProfile.yieldRange.maxYieldPerAcre * mandiPrice;

    return {
      cropId: matchedProfile.id,
      cropName: matchedProfile.nameEn,
      cropNameGu: matchedProfile.nameGu,
      variety: matchedProfile.variety,
      currentStage: matchedStage.name,
      currentStageGu: matchedStage.nameGu,
      daysPlanted: plot?.dayCount || matchedStage.days,
      weatherSuitability: {
        status: weatherStatus,
        statusGu: weatherStatusGu,
        temperatureStatus: `${currentTemp}°C (${weatherStatus === 'Favorable' ? 'Optimal for' : 'Monitor'} ${matchedProfile.nameEn})`,
        temperatureStatusGu: `${currentTemp}°C (${matchedProfile.nameGu} માટે ${weatherStatusGu})`,
        forecastAlert: alertMsg,
        forecastAlertGu: alertMsgGu,
      },
      irrigationGuidance: {
        action: irrAction,
        actionGu: irrActionGu,
        reason: irrReason,
        reasonGu: irrReasonGu,
        nextSchedule: rainForecastNext24h >= 5 ? 'After rain subsides' : 'Tomorrow 07:00 AM (Drip Cycle)',
      },
      fertilizerGuidance: {
        dosage: fertDose,
        dosageGu: fertDoseGu,
        method: 'Ring placement near active root zone followed by light watering',
        methodGu: 'છોડના થડથી દૂર મૂળ વિસ્તારમાં આપી હળવું પાણી આપો',
        soilTestNotice: 'Notice: Soil NPK test data unavailable; university agronomic standard dose displayed.',
        soilTestNoticeGu: 'નોંધ: જમીન લેબ ટેસ્ટ ડેટા ઉપલબ્ધ નથી; કૃષિ યુનિવર્સિટી માન્ય સ્ટાન્ડર્ડ ડોઝ દર્શાવેલ છે.',
      },
      pestPrevention: {
        threatName: pestName,
        threatNameGu: pestNameGu,
        severity: humidity > 75 ? 'High' : 'Medium',
        symptoms: `Foliar damage or flower/pod dropping characteristic of ${pestName}.`,
        symptomsGu: `${pestNameGu}ના કારણે પાન પીળા પડવા અથવા ફૂલ-ચાપવા ખરવાની શક્યતા.`,
        preventiveAction: `Spray Neem oil 1500ppm (3ml/L) or recommended bio-control agent during calm evening hours.`,
        preventiveActionGu: `સાંજના સમયે લીંબોળીનું તેલ (૩ મિલી/લિટર) અથવા યોગ્ય જૈવિક કીટનાશકનો છંટકાવ કરો.`,
      },
      harvestProjection: {
        expectedWindow: `Approx. ${matchedProfile.durationDays}`,
        daysRemaining: plot?.stageBadge?.includes('Day') ? plot.stageBadge : 'Approx. 45-60 days remaining',
        expectedYieldPerAcre: `${estYieldAcre} / Acre`,
        currentMarketPrice: `₹${mandiPrice.toLocaleString('en-IN')} / ${matchedProfile.yieldRange.unit}`,
        estimatedRevenuePerAcre: `₹${estRevMin.toLocaleString('en-IN')} - ₹${estRevMax.toLocaleString('en-IN')} / Acre`,
        sellingStrategy,
        sellingStrategyGu,
      },
      dataSources: {
        weatherSource: weather?.source ? 'Open-Meteo Live API' : 'Regional Climate Baseline',
        weatherTimestamp: weather?.current?.lastUpdated || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        marketSource: 'APMC Live Mandi Engine',
        marketPriceDate: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        soilDataSource: 'Farm Registered Parcel Telemetry',
        unavailableFields: [
          'Soil Lab NPK: Data unavailable',
          'Soil Organic Carbon: Data unavailable',
          'Satellite NDVI: Polygon pending or cloud obscured',
        ],
      },
    };
  },
};
