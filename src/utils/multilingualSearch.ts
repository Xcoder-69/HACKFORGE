// Multilingual Search & Language-Priority Engine for AgroMind AI
// Supports cross-lingual query matching (e.g., searching "cotton" or "kapas" matches "કપાસ" and "कपास")
// and sorts/ranks results giving first priority to the active selected language (Gujarati, Hindi, or English).

import type { Language } from '../i18n/translations';

// Synonyms and transliterations dictionary for Indian agricultural terminology
export interface TermCluster {
  en: string[];
  gu: string[];
  hi: string[];
}

export const CROP_AND_MANDI_SYNONYMS: Record<string, TermCluster> = {
  cotton: {
    en: ['cotton', 'kapas', 'kapaas', 'gcot', 'shankar', 'fibre', 'boll', 'bt cotton', 'ru', 'rui'],
    gu: ['કપાસ', 'કાપસ', 'રૂ', 'શંકર', 'જીકોટ', 'બીટી કપાસ'],
    hi: ['कपास', 'रुई', 'शंकर', 'कपास संकर'],
  },
  groundnut: {
    en: ['groundnut', 'peanut', 'magfali', 'mungfali', 'mandvi', 'sing', 'dana', 'gg20', 'bold', 'oilseed'],
    gu: ['મગફળી', 'માંડવી', 'સીંગ', 'દાણા', 'જીજી', 'તેલીબિયાં', 'જીજી-૨૦'],
    hi: ['मूंगफली', 'मूँगफली', 'दाना', 'पीनट', 'तिलहन'],
  },
  wheat: {
    en: ['wheat', 'ghau', 'gehu', 'lokwan', 'tukdi', 'bhalia', 'grain', 'durum', 'gw496'],
    gu: ['ઘઉં', 'ટુકડી', 'લોકવન', 'ભાલિયા', 'અનાજ', 'ટુકડી ઘઉં'],
    hi: ['गेहूं', 'गेंहू', 'कनक', 'लोकवन', 'अनाज'],
  },
  sugarcane: {
    en: ['sugarcane', 'sherdi', 'ganna', 'cane', 'sugar', 'kamrej sugar', 'co86032'],
    gu: ['શેરડી', 'સાંઠા', 'સુગર', 'ખાંડ'],
    hi: ['गन्ना', 'ईख', 'शर्करा'],
  },
  cumin: {
    en: ['cumin', 'jeera', 'jeeru', 'jira', 'spice', 'gc4'],
    gu: ['જીરું', 'જીરૂ', 'મસાલા'],
    hi: ['जीरा', 'ज़ीरा', 'मसाला'],
  },
  sesame: {
    en: ['sesame', 'til', 'tal', 'oilseed'],
    gu: ['તલ', 'તેલીબિયાં'],
    hi: ['तिल', 'तिलहन'],
  },
  chickpea: {
    en: ['chickpea', 'gram', 'chana', 'chane', 'pulse', 'gg5'],
    gu: ['ચણા', 'ચણા', 'ગુજરાત ચણા', 'દાળ'],
    hi: ['चना', 'छोला', 'दाल'],
  },
  bajra: {
    en: ['bajra', 'bajri', 'pearl millet', 'millet', 'grain'],
    gu: ['બાજરી', 'બાજરો', 'મિલેટ'],
    hi: ['बाजरा', 'बाजरे', 'मोटे अनाज'],
  },
  castor: {
    en: ['castor', 'divela', 'eranda', 'arandi', 'oilseed'],
    gu: ['દિવેલા', 'એરંડા'],
    hi: ['अरंडी', 'अरंड'],
  },
  paddy: {
    en: ['paddy', 'rice', 'dangar', 'chawal', 'choka', 'gurjari', 'jirasar'],
    gu: ['ડાંગર', 'ચોખા', 'જીરાસાર'],
    hi: ['धान', 'चावल', 'धान्य'],
  },
  onion: {
    en: ['onion', 'dungri', 'pyaz', 'kanda'],
    gu: ['ડુંગળી', 'કાંદા'],
    hi: ['प्याज', 'कांदा'],
  },
  potato: {
    en: ['potato', 'bataka', 'batata', 'aloo', 'alu'],
    gu: ['બટાકા', 'બટાટા'],
    hi: ['आलू'],
  },
  tomato: {
    en: ['tomato', 'tameta', 'tamatar'],
    gu: ['ટામેટાં', 'ટામેટા'],
    hi: ['टमाटर'],
  },
  garlic: {
    en: ['garlic', 'lasan', 'lahsun'],
    gu: ['લસણ'],
    hi: ['लहसुन'],
  },
  coriander: {
    en: ['coriander', 'dhana', 'kothmir', 'dhaniya'],
    gu: ['ધાણા', 'કોથમીર'],
    hi: ['धनिया', 'धनिया पत्ती'],
  },
  mustard: {
    en: ['mustard', 'rai', 'sarson', 'raydo'],
    gu: ['રાઈ', 'રાયડો'],
    hi: ['सरसों', 'राई'],
  },
  soybean: {
    en: ['soybean', 'soya', 'soy'],
    gu: ['સોયાબીન'],
    hi: ['सोयाबीन'],
  },
  maize: {
    en: ['maize', 'makai', 'corn', 'bhutta'],
    gu: ['મકાઈ'],
    hi: ['मक्का', 'भुट्टा'],
  },
  banana: {
    en: ['banana', 'kela', 'kelan', 'g9'],
    gu: ['કેળાં', 'કેળા'],
    hi: ['推广', 'केला'],
  },
  mango: {
    en: ['mango', 'keri', 'kesar', 'alphonso', 'hafuz', 'aam'],
    gu: ['કેરી', 'કેસર કેરી', 'હાફુસ'],
    hi: ['आम', 'केसर आम'],
  },
  surat: {
    en: ['surat', 'kamrej', 'bardoli', 'choryasi', 'mandvi'],
    gu: ['સુરત', 'કામરેજ', 'બારડોલી', 'માંડવી'],
    hi: ['सूरत', 'कामरेज', 'बारडोली'],
  },
  rajkot: {
    en: ['rajkot', 'gondal', 'jetpur', 'jasdan', 'dhoraji'],
    gu: ['રાજકોટ', 'ગોંડલ', 'જેતપુર', 'જસદણ', 'ધોરાજી'],
    hi: ['राजकोट', 'गोंडल', 'जेतपुर'],
  },
  junagadh: {
    en: ['junagadh', 'keshod', 'visavadar', 'mangrol', 'gir'],
    gu: ['જૂનાગઢ', 'કેશોદ', 'વિસાવદર', 'માંગરોળ', 'ગીર'],
    hi: ['जूनागढ़', 'केशोद', 'गिर'],
  },
  bhavnagar: {
    en: ['bhavnagar', 'mahuva', 'palitana', 'talaja', 'sihor'],
    gu: ['ભાવનગર', 'મહુવા', 'પાલીતાણા', 'તળાજા', 'સિહોર'],
    hi: ['भावनगर', 'महुआ', 'पालीताना'],
  },
  vadodara: {
    en: ['vadodara', 'baroda', 'karjan', 'padra', 'dabhoi'],
    gu: ['વડોદરા', 'બરોડા', 'કરજણ', 'પાદરા', 'ડભોઈ'],
    hi: ['वडोदरा', 'बड़ौदा'],
  },
  mehsana: {
    en: ['mehsana', 'visnagar', 'kadi', 'unjha'],
    gu: ['મહેસાણા', 'વિસનગર', 'કડી', 'ઊંઝા'],
    hi: ['मेहसाणा', 'विसनगर', 'ऊंझा'],
  },
  amreli: {
    en: ['amreli', 'dhari', 'bagasara', 'savarkundla'],
    gu: ['અમરેલી', 'ધારી', 'બગસરા', 'સાવરકુંડલા'],
    hi: ['अमरेली', 'धारी'],
  },
  bharuch: {
    en: ['bharuch', 'ankleshwar', 'jambusar', 'zaghadia'],
    gu: ['ભરૂચ', 'અંકલેશ્વર', 'જંબુસર', 'ઝઘડિયા'],
    hi: ['भरूच', 'अंकलेश्वर'],
  },
  navsari: {
    en: ['navsari', 'chikhli', 'jalalpore', 'gandevi', 'bilimora'],
    gu: ['નવસારી', 'ચીખલી', 'જલાલપોર', 'ગણદેવી', 'બીલીમોરા'],
    hi: ['नवसारी', 'चीखली'],
  },
  anand: {
    en: ['anand', 'petlad', 'khambhat', 'borsad', 'charotar'],
    gu: ['આણંદ', 'પેટલાદ', 'ખંભાત', 'બોરસદ', 'ચરોતર'],
    hi: ['आणंद', 'खंभात'],
  },
  kutch: {
    en: ['kutch', 'bhuj', 'anjar', 'mandvi', 'gandhidham', 'kachchh'],
    gu: ['કચ્છ', 'ભુજ', 'અંજાર', 'માંડવી', 'ગાંધીધામ'],
    hi: ['कच्छ', 'भुज', 'अंजार'],
  },
  jamnagar: {
    en: ['jamnagar', 'dhrol', 'kalavad', 'lalpur'],
    gu: ['જામનગર', 'ધ્રોલ', 'કાલાવાડ', 'લાલપુર'],
    hi: ['जामनगर', 'ध्रोल'],
  },
  surendranagar: {
    en: ['surendranagar', 'wadhwan', 'dhrangadhra', 'chotila', 'limbdi', 'zalawad'],
    gu: ['સુરેન્દ્રનગર', 'વઢવાણ', 'ધ્રાંગધ્રા', 'ચોટીલા', 'લીંબડી', 'ઝાલાવાડ'],
    hi: ['सुरेन्द्रनगर', 'वढवाण'],
  },
  banaskantha: {
    en: ['banaskantha', 'palanpur', 'deesa', 'dhanera'],
    gu: ['બનાસકાંઠા', 'પાલનપુર', 'ડીસા', 'ધાનેરા'],
    hi: ['बनासकांठा', 'पालनपुर', 'डीसा'],
  },
  sabarkantha: {
    en: ['sabarkantha', 'himmatnagar', 'idar', 'prantij'],
    gu: ['સાબરકાંઠા', 'હિંમતનગર', 'ઇડર', 'પ્રાંતિજ'],
    hi: ['साबरकांठा', 'हिम्मतनगर'],
  },
  ahmedabad: {
    en: ['ahmedabad', 'dholka', 'dhandhuka', 'bavla', 'sanand', 'viramgam'],
    gu: ['અમદાવાદ', 'ધોળકા', 'ધંધૂકા', 'બાવળા', 'સાણંદ', 'વિરમગામ'],
    hi: ['अहमदाबाद', 'धोलका'],
  },
};

/**
 * Expand a user search term or phrase into all multilingual variants (English, Gujarati, Hindi).
 * Supports tokenized sub-words so multi-word inputs like "surat cotton" or "kapas mandi" resolve accurately.
 */
export function expandSearchTerms(query: string): string[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const terms = new Set<string>([clean]);

  // Tokenize by whitespace and special characters
  const tokens = clean.split(/[\s,+/]+/).filter((t) => t.length > 0);
  tokens.forEach((tok) => terms.add(tok));

  for (const token of [clean, ...tokens]) {
    for (const [, cluster] of Object.entries(CROP_AND_MANDI_SYNONYMS)) {
      const allClusterTerms = [...cluster.en, ...cluster.gu, ...cluster.hi];
      const matchesCluster = allClusterTerms.some((t) => {
        const lower = t.toLowerCase();
        return lower === token || lower.includes(token) || token.includes(lower);
      });

      if (matchesCluster) {
        allClusterTerms.forEach((t) => terms.add(t.toLowerCase()));
      }
    }
  }

  return Array.from(terms);
}

/**
 * Checks whether an item matches the query in ANY language, and calculates a match relevance score
 * with PRIORITY strictly given to the user's active selected language.
 *
 * Even if the user writes in English, when Gujarati is selected:
 * - Gujarati representations matching the query or its cross-lingual cluster receive the HIGHEST priority boost.
 * - Same for Hindi when Hindi is selected.
 * - Result ordering guarantees active language relevant items appear at the top.
 */
export function calculateMatchScore(
  query: string,
  fields: {
    primaryGu?: string;
    primaryHi?: string;
    primaryEn?: string;
    secondaryGu?: string[];
    secondaryHi?: string[];
    secondaryEn?: string[];
  },
  activeLanguage: Language
): number {
  const rawQuery = query.trim().toLowerCase();
  if (!rawQuery) return 1;

  const tokens = rawQuery.split(/[\s,+/]+/).filter((t) => t.length > 0);
  if (tokens.length === 0) return 1;

  const guPrimary = (fields.primaryGu || '').toLowerCase();
  const hiPrimary = (fields.primaryHi || '').toLowerCase();
  const enPrimary = (fields.primaryEn || '').toLowerCase();

  const guSecondary = (fields.secondaryGu || []).filter(Boolean).map((s) => s.toLowerCase());
  const hiSecondary = (fields.secondaryHi || []).filter(Boolean).map((s) => s.toLowerCase());
  const enSecondary = (fields.secondaryEn || []).filter(Boolean).map((s) => s.toLowerCase());

  let totalScore = 0;
  let tokensMatched = 0;

  for (const token of tokens) {
    const tokenExpansions = expandSearchTerms(token);
    let tokenScore = 0;

    const guMatchDirect = guPrimary.includes(token) || guSecondary.some((s) => s.includes(token));
    const hiMatchDirect = hiPrimary.includes(token) || hiSecondary.some((s) => s.includes(token));
    const enMatchDirect = enPrimary.includes(token) || enSecondary.some((s) => s.includes(token));

    const guMatchCluster = tokenExpansions.some((exp) => guPrimary.includes(exp) || guSecondary.some((s) => s.includes(exp)));
    const hiMatchCluster = tokenExpansions.some((exp) => hiPrimary.includes(exp) || hiSecondary.some((s) => s.includes(exp)));
    const enMatchCluster = tokenExpansions.some((exp) => enPrimary.includes(exp) || enSecondary.some((s) => s.includes(exp)));

    if (activeLanguage === 'gu') {
      // 1. GUJARATI ACTIVE PRIORITY:
      // Even if user typed in English, matching the Gujarati crop representation gets TOP priority!
      if (guPrimary.includes(token)) {
        tokenScore += 180; // Exact Gujarati script match
      } else if (guMatchCluster && guPrimary && tokenExpansions.some((exp) => guPrimary.includes(exp))) {
        tokenScore += 150; // User typed English 'kapas'/'cotton', matches Gujarati primary 'કપાસ'
      } else if (guMatchCluster) {
        tokenScore += 100; // Secondary Gujarati match
      }

      // English query match baseline
      if (enPrimary.includes(token)) {
        tokenScore += 70;
      } else if (enMatchDirect) {
        tokenScore += 50;
      } else if (enMatchCluster) {
        tokenScore += 40;
      }

      // Active Language Synergy Bonus: if it satisfies both the English input and Gujarati identity
      if ((enMatchDirect || enMatchCluster) && (guMatchDirect || guMatchCluster)) {
        tokenScore += 60;
      }

      if (hiMatchDirect || hiMatchCluster) {
        tokenScore += 20;
      }
    } else if (activeLanguage === 'hi') {
      // 2. HINDI ACTIVE PRIORITY:
      if (hiPrimary.includes(token)) {
        tokenScore += 180;
      } else if (hiMatchCluster && hiPrimary && tokenExpansions.some((exp) => hiPrimary.includes(exp))) {
        tokenScore += 150;
      } else if (hiMatchCluster) {
        tokenScore += 100;
      }

      if (enPrimary.includes(token)) {
        tokenScore += 70;
      } else if (enMatchDirect) {
        tokenScore += 50;
      } else if (enMatchCluster) {
        tokenScore += 40;
      }

      if ((enMatchDirect || enMatchCluster) && (hiMatchDirect || hiMatchCluster)) {
        tokenScore += 60;
      }

      if (guMatchDirect || guMatchCluster) {
        tokenScore += 20;
      }
    } else {
      // 3. ENGLISH ACTIVE PRIORITY:
      if (enPrimary.includes(token)) {
        tokenScore += 160;
      } else if (enMatchDirect) {
        tokenScore += 100;
      } else if (enMatchCluster) {
        tokenScore += 70;
      }

      if (guMatchDirect || guMatchCluster) {
        tokenScore += 40;
      }
      if (hiMatchDirect || hiMatchCluster) {
        tokenScore += 30;
      }
    }

    if (tokenScore > 0) {
      tokensMatched++;
      totalScore += tokenScore;
    }
  }

  // Bonus when ALL query tokens match the record (e.g. "surat cotton" or "kapas mandi")
  if (tokensMatched === tokens.length && tokens.length > 1) {
    totalScore += 120;
  }

  // If none of the tokens matched, score is 0
  if (tokensMatched === 0) return 0;

  return totalScore;
}

/**
 * Filter and sort items with cross-lingual matching and language priority ranking.
 */
export function filterAndSortMultilingual<T>(
  items: T[],
  query: string,
  getFieldExtractor: (item: T) => {
    primaryGu?: string;
    primaryHi?: string;
    primaryEn?: string;
    secondaryGu?: string[];
    secondaryHi?: string[];
    secondaryEn?: string[];
  },
  activeLanguage: Language
): T[] {
  if (!query || !query.trim()) return items;

  const scored = items
    .map((item) => {
      const fields = getFieldExtractor(item);
      const score = calculateMatchScore(query, fields, activeLanguage);
      return { item, score };
    })
    .filter(({ score }) => score > 0);

  // Sort by score descending (highest priority match first)
  scored.sort((a, b) => b.score - a.score);

  return scored.map(({ item }) => item);
}
