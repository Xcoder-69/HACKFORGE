/**
 * AgroMind Centralized Crop Database Service
 * Provides crop-specific botanical, agronomic, and cultivation intelligence.
 * Completely independent of any farmer's farm profile or plot size.
 */

export interface CropInformation {
  cropName: string;
  cropNameGu: string;
  cropType: string;
  cropTypeGu: string;
  scientificName: string;
  typicalSeason: string;
  typicalSeasonGu: string;
  typicalGrowthDuration: string;
  waterRequirement: 'Low' | 'Medium' | 'High';
  waterRequirementGu: string;
  commonPests: string[];
  commonDiseases: string[];
  generalCultivationInfo: string;
  generalCultivationInfoGu: string;
}

const CROP_DATABASE: Record<string, CropInformation> = {
  maize: {
    cropName: 'Maize (Corn)',
    cropNameGu: 'મકાઈ (Maize)',
    cropType: 'Cereal Grain Crop',
    cropTypeGu: 'ધાન્ય પાક',
    scientificName: 'Zea mays',
    typicalSeason: 'Kharif & Rabi',
    typicalSeasonGu: 'ખરીફ અને રવિ',
    typicalGrowthDuration: '90 - 115 Days',
    waterRequirement: 'Medium',
    waterRequirementGu: 'મધ્યમ પાણી (૫૦૦-૮૦૦ મીમી)',
    commonPests: ['Fall Armyworm (Spodoptera frugiperda)', 'Stem Borer', 'Shoot Fly'],
    commonDiseases: ['Northern Corn Leaf Blight', 'Common Rust', 'Banded Leaf and Sheath Blight'],
    generalCultivationInfo: 'Thrives in well-drained loamy soil with pH 6.0–7.5. Requires adequate nitrogen top-dressing at knee-high and tasseling stages.',
    generalCultivationInfoGu: 'સારી નિતારવાળી ગોરાડુ જમીન અનુકૂળ. ઘૂંટણ ઊંચાઈ અને ફૂલ અવસ્થાએ પૂરક નાઇટ્રોજન ખાતર આપવું.',
  },
  cotton: {
    cropName: 'Cotton',
    cropNameGu: 'કપાસ (Cotton)',
    cropType: 'Fibre Cash Crop',
    cropTypeGu: 'રેસાયુક્ત રોકડિયો પાક',
    scientificName: 'Gossypium hirsutum',
    typicalSeason: 'Kharif',
    typicalSeasonGu: 'ખરીફ (ચોમાસુ)',
    typicalGrowthDuration: '150 - 180 Days',
    waterRequirement: 'Medium',
    waterRequirementGu: 'મધ્યમ પાણી (નિયમિત ડ્રિપ)',
    commonPests: ['Pink Bollworm', 'Whitefly', 'Jassids / Leafhoppers', 'Thrips'],
    commonDiseases: ['Bacterial Blight (Angular Leaf Spot)', 'Cotton Leaf Curl Virus', 'Alternaria Leaf Spot'],
    generalCultivationInfo: 'Ideal for deep black cotton soils of Gujarat. Maintain pheromone traps for early bollworm monitoring; avoid waterlogging.',
    generalCultivationInfoGu: 'ગુજરાતની કાળી જમીન માટે આદર્શ. ગુલાબી ઇયળ માટે ફેરોમોન ટ્રેપ લગાવો અને પાણી ભરાવા ન દેવું.',
  },
  groundnut: {
    cropName: 'Groundnut (Peanut)',
    cropNameGu: 'મગફળી (Groundnut)',
    cropType: 'Oilseed Legume',
    cropTypeGu: 'તેલીબિયાં કઠોળ પાક',
    scientificName: 'Arachis hypogaea',
    typicalSeason: 'Kharif & Summer',
    typicalSeasonGu: 'ખરીફ અને ઉનાળુ',
    typicalGrowthDuration: '105 - 125 Days',
    waterRequirement: 'Low',
    waterRequirementGu: 'ઓછુંથી મધ્યમ પાણી (૪૫૦-૬૫૦ મીમી)',
    commonPests: ['Aphids (vectors for rosette)', 'White Grub', 'Leaf Miner'],
    commonDiseases: ['Tikka Disease (Cercospora Leaf Spot)', 'Collar Rot', 'Rust'],
    generalCultivationInfo: 'Sandy loam and well-aerated light soils preferred for optimal pod penetration. Gypsum application at pegging improves pod filling.',
    generalCultivationInfoGu: 'રેતાળ ગોરાડુ જમીન ઉત્તમ. સુયા બેસવાની અવસ્થાએ જીપ્સમ આપવાથી દાણા ભરાવદાર બને છે.',
  },
  wheat: {
    cropName: 'Wheat',
    cropNameGu: 'ઘઉં (Wheat)',
    cropType: 'Staple Cereal Crop',
    cropTypeGu: 'મુખ્ય ધાન્ય પાક',
    scientificName: 'Triticum aestivum',
    typicalSeason: 'Rabi (Winter)',
    typicalSeasonGu: 'રવિ (શિયાળુ)',
    typicalGrowthDuration: '110 - 130 Days',
    waterRequirement: 'Medium',
    waterRequirementGu: 'મધ્યમ પાણી (૪-૬ પિયત)',
    commonPests: ['Aphids', 'Termites', 'Armyworm'],
    commonDiseases: ['Yellow / Stripe Rust', 'Brown / Leaf Rust', 'Powdery Mildew', 'Karnal Bunt'],
    generalCultivationInfo: 'Requires cool winter conditions during vegetative stage. Critical irrigation stages: Crown Root Initiation (21 days) and Flowering.',
    generalCultivationInfoGu: 'શિયાળાની ઠંડી અનુકૂળ. મુગટ મૂળ ફૂટવાની અવસ્થા (૨૧ દિવસે) અને ફૂલ અવસ્થાએ પિયત અતિ મહત્વનું.',
  },
  soybean: {
    cropName: 'Soybean',
    cropNameGu: 'સોયાબીન (Soybean)',
    cropType: 'Oilseed & Protein Legume',
    cropTypeGu: 'તેલીબિયાં પ્રોટીન પાક',
    scientificName: 'Glycine max',
    typicalSeason: 'Kharif',
    typicalSeasonGu: 'ખરીફ',
    typicalGrowthDuration: '90 - 105 Days',
    waterRequirement: 'Medium',
    waterRequirementGu: 'મધ્યમ પાણી (૪૫૦-૬૦૦ મીમી)',
    commonPests: ['Girdle Beetle', 'Stem Fly', 'Tobacco Caterpillar'],
    commonDiseases: ['Yellow Mosaic Virus', 'Anthracnose / Pod Blight', 'Bacterial Pustule'],
    generalCultivationInfo: 'Fixes atmospheric nitrogen. Requires seed inoculation with Rhizobium culture and strict monitoring for girdle beetle.',
    generalCultivationInfoGu: 'જમીનમાં નાઇટ્રોજન વધારે છે. રાઇઝોબિયમ કલ્ચરની માવજત કરવી અને રિંગ કટર સામે સાવચેત રહેવું.',
  },
  rice: {
    cropName: 'Paddy (Rice)',
    cropNameGu: 'ડાંગર / ચોખા (Paddy)',
    cropType: 'Staple Cereal Grain',
    cropTypeGu: 'મુખ્ય ધાન્ય પાક',
    scientificName: 'Oryza sativa',
    typicalSeason: 'Kharif & Summer',
    typicalSeasonGu: 'ખરીફ અને ઉનાળુ',
    typicalGrowthDuration: '115 - 145 Days',
    waterRequirement: 'High',
    waterRequirementGu: 'વધુ પાણી (૧૦૦૦-૧૨૫૦ મીમી)',
    commonPests: ['Brown Planthopper', 'Stem Borer', 'Leaf Folder'],
    commonDiseases: ['Blast (Pyricularia oryzae)', 'Bacterial Leaf Blight', 'Sheath Rot'],
    generalCultivationInfo: 'Grows best in clayey loam soils with good water retention. Maintain 2–5cm shallow standing water during tillering.',
    generalCultivationInfoGu: 'ચીકણી ગોરાડુ જમીન અનુકૂળ. ફૂટવાની અવસ્થાએ ૨ થી ૫ સેમી પાણી જાળવી રાખવું.',
  },
  tomato: {
    cropName: 'Tomato',
    cropNameGu: 'ટામેટા (Tomato)',
    cropType: 'Vegetable Cash Crop',
    cropTypeGu: 'શાકભાજી રોકડિયો પાક',
    scientificName: 'Solanum lycopersicum',
    typicalSeason: 'Year-round (Kharif, Rabi, Summer)',
    typicalSeasonGu: 'વર્ષભર (ખરીફ, રવિ, ઉનાળુ)',
    typicalGrowthDuration: '120 - 150 Days',
    waterRequirement: 'Medium',
    waterRequirementGu: 'મધ્યમ પાણી (નિયમિત ડ્રિપ પિયત)',
    commonPests: ['Fruit Borer (Helicoverpa)', 'Whitefly', 'Leaf Miner'],
    commonDiseases: ['Early Blight', 'Late Blight', 'Tomato Leaf Curl Virus (ToLCV)', 'Bacterial Wilt'],
    generalCultivationInfo: 'Staking supports fruit quality and reduces soil contact diseases. Use yellow sticky traps to manage whitefly vectors.',
    generalCultivationInfoGu: 'મંડપ પદ્ધતિથી ફળની ગુણવત્તા વધે છે. સફેદ માખીના નિયંત્રણ માટે પીળા ચીકણા ટ્રેપ વાપરો.',
  },
  potato: {
    cropName: 'Potato',
    cropNameGu: 'બટાટા (Potato)',
    cropType: 'Tuber Vegetable Crop',
    cropTypeGu: 'કંદમૂળ પાક',
    scientificName: 'Solanum tuberosum',
    typicalSeason: 'Rabi (Winter)',
    typicalSeasonGu: 'રવિ (શિયાળુ)',
    typicalGrowthDuration: '80 - 110 Days',
    waterRequirement: 'Medium',
    waterRequirementGu: 'મધ્યમ પાણી (૫-૭ દિવસના અંતરે)',
    commonPests: ['Potato Tuber Moth', 'Aphids', 'Cutworms'],
    commonDiseases: ['Late Blight (Phytophthora)', 'Early Blight', 'Black Scurf'],
    generalCultivationInfo: 'Well-drained loose sandy loam soil is essential for tuber expansion. Earthing-up is critical at 30–35 days after planting.',
    generalCultivationInfoGu: 'ગોરાડુ અને પોચી જમીન જરૂરી. વાવણી પછી ૩૦-૩૫ દિવસે માટી ચડાવવી અતિ મહત્વની છે.',
  },
  sugarcane: {
    cropName: 'Sugarcane',
    cropNameGu: 'શેરડી (Sugarcane)',
    cropType: 'Commercial Cash Crop',
    cropTypeGu: 'ઔદ્યોગિક રોકડિયો પાક',
    scientificName: 'Saccharum officinarum',
    typicalSeason: 'Perennial (10 - 12 Months)',
    typicalSeasonGu: 'વાર્ષિક પાક (૧૦-૧૨ મહિના)',
    typicalGrowthDuration: '300 - 365 Days',
    waterRequirement: 'High',
    waterRequirementGu: 'વધુ પાણી (૧૫૦૦-૨૦૦૦ મીમી)',
    commonPests: ['Early Shoot Borer', 'Top Borer', 'Pyrilla', 'White Grub'],
    commonDiseases: ['Red Rot', 'Smut', 'Wilt', 'Grassy Shoot'],
    generalCultivationInfo: 'Requires deep rich soil with excellent drainage. Trash mulching in furrows conserves moisture and suppresses weeds.',
    generalCultivationInfoGu: 'દક્ષિણ ગુજરાતની નહેર પિયત માટે ઉત્તમ. પાલાનું આવરણ (મલ્ચિંગ) કરવાથી ભેજ સચવાય છે.',
  },
  greenchilli: {
    cropName: 'Green Chilli',
    cropNameGu: 'લીલાં મરચાં (Chilli)',
    cropType: 'Spice & Vegetable Crop',
    cropTypeGu: 'મસાલા અને શાકભાજી પાક',
    scientificName: 'Capsicum annuum',
    typicalSeason: 'Kharif & Summer',
    typicalSeasonGu: 'ખરીફ અને ઉનાળુ',
    typicalGrowthDuration: '140 - 160 Days',
    waterRequirement: 'Medium',
    waterRequirementGu: 'મધ્યમ પાણી (હળવું નિયમિત પિયત)',
    commonPests: ['Thrips (Chilli leaf curl)', 'Mites', 'Fruit Borer'],
    commonDiseases: ['Anthracnose (Dieback/Fruit Rot)', 'Powdery Mildew', 'Damping Off'],
    generalCultivationInfo: 'Sensitive to excessive moisture and water stagnation. Foliar spray of neem oil or blue sticky traps manages thrips vectors.',
    generalCultivationInfoGu: 'પાણી ભરાવાથી મુક્ત જમીન જરૂરી. પાન કોકડાઈ ન જાય તે માટે વાદળી ચીકણા ટ્રેપ અને લીંબોળીનું તેલ છાંટવું.',
  },
};

export const cropDatabaseService = {
  /**
   * Retrieves crop information by crop name (case-insensitive fuzzy match)
   */
  getCropInformation(cropName: string): CropInformation {
    if (!cropName) {
      return this.getDefaultCropInfo('Unknown Crop');
    }

    const normalized = cropName.toLowerCase().replace(/[^a-z]/g, '');

    for (const [key, crop] of Object.entries(CROP_DATABASE)) {
      if (
        normalized.includes(key) ||
        key.includes(normalized) ||
        crop.cropName.toLowerCase().includes(cropName.toLowerCase()) ||
        cropName.toLowerCase().includes(key)
      ) {
        return crop;
      }
    }

    return this.getDefaultCropInfo(cropName);
  },

  /**
   * Default fallback for uncataloged crops
   */
  getDefaultCropInfo(cropName: string): CropInformation {
    return {
      cropName: cropName || 'Agricultural Crop',
      cropNameGu: `${cropName} (ખેતી પાક)`,
      cropType: 'Field Crop',
      cropTypeGu: 'ખેતી પાક',
      scientificName: 'Plantae species',
      typicalSeason: 'Kharif / Rabi',
      typicalSeasonGu: 'ખરીફ / રવિ',
      typicalGrowthDuration: '90 - 120 Days',
      waterRequirement: 'Medium',
      waterRequirementGu: 'મધ્યમ પિયત',
      commonPests: ['Aphids', 'Caterpillars', 'Stem Borers'],
      commonDiseases: ['Leaf Spot', 'Fungal Blight', 'Powdery Mildew'],
      generalCultivationInfo: 'Ensure balanced NPK fertilization, adequate weed control, and scout leaves weekly for early pest detection.',
      generalCultivationInfoGu: 'જરૂરિયાત મુજબ ખાતર અને નીંદણ નિયંત્રણ કરવું અને અઠવાડિયે એકવાર પાકની ચકાસણી કરવી.',
    };
  },
};
