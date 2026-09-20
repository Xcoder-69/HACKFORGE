// Comprehensive Hinglish (Conversational Hindi in Roman Script) Utility for AgroMind AI
// Converts Devanagari Hindi or English agricultural terms to accessible, farmer-friendly Hinglish.

export const HINDI_DEVANAGARI_TO_HINGLISH: Record<string, string> = {
  // Navigation & Core Sections
  'होम': 'Home / Mera Khet',
  'मेरा खेत': 'Mera Khet',
  'फसलें': 'Fasal Salah',
  'फसल': 'Fasal',
  'फसल सलाह': 'Fasal Salah',
  'फसल सिफारिशें': 'Fasal Recommendations',
  'मौसम': 'Mausam',
  'मौसम व मृदा': 'Mausam aur Mitti',
  'मौसम और मृदा': 'Mausam aur Mitti',
  'मौसम और मृदा विश्लेषण': 'Mausam aur Mitti Analysis',
  'मृदा': 'Mitti',
  'AI कैमरा': 'AI Fasal Doctor',
  'AI फसल डॉक्टर': 'AI Fasal Doctor',
  'मंडी': 'Mandi',
  'मंडी भाव': 'Mandi Bhav',
  'लाइव मंडी बाजार भाव': 'Live Mandi Bazaar Bhav',
  'खर्च': 'Kharach Tracker',
  'खेत खर्च': 'Kharach Tracker',
  'लागत खर्च': 'Input Kharach',
  'आय व लाभ': 'Aavak aur Labh',
  'अलर्ट': 'Kisan Alerts',
  'किसान अलर्ट': 'Kisan Alerts',
  'AI सलाह': 'AI Salahkar',
  'AI सलाहकार': 'AI Salahkar',
  'प्रोफाइल': 'Kisan Profile',
  'किसान पोर्टल': 'Kisan Portal',
  'KVK एडमिन': 'KVK Admin',
  'अधिक': 'Aur',
  'मेनू': 'Menu',

  // Actions, Buttons & Dialogs
  'लॉगिन': 'Login',
  'लॉगिन करें': 'Login Karein',
  'पंजीकरण': 'Registration',
  'शुरू करें': 'Shuru Karein',
  'वापस जाएं': 'Wapas Jayein',
  'बंद करें': 'Band Karein',
  'पुनः भेजें': 'Dobara Bhejein',
  'संपादित करें': 'Edit Karein',
  'सहेजें': 'Save Karein',
  'हटाएं': 'Delete Karein',
  'रद्द करें': 'Cancel Karein',
  'पुष्टि करें': 'Confirm Karein',
  'बुकिंग पक्की करें': 'Booking Confirm Karein',
  'स्वीकार करें': 'Sweekar Karein',
  'खोजें': 'Khojein',
  'खोज साफ़ करें': 'Clear Search (Khoj Saaf Karein)',
  'चुनें': 'Chunein',
  'बदलें': 'Badlein',
  'जोड़ें': 'Jodein',
  'बेचें': 'Abhi Becho',
  'रोकें': 'Roko',
  'सामान्य': 'Hold Karein',
  'सलाह': 'Salah',
  'सलाह:': 'Salah:',
  'दवा': 'Dawa',
  'खाद': 'Khad',
  'सिंचाई': 'Sinchai / Piyat',

  // Weather & Geo Dialogs
  'स्वागत है': 'Swagat Hai',
  'कृषि जिला चुनें': 'Krishi Jila Chunein',
  'जिला बदलें': 'Jila Badlein',
  'GPS स्थान': 'GPS Location',
  'खोज रहे हैं...': 'GPS Khoj Rahe Hain...',
  'खेत का नक्शा': 'Khet Naksha',
  'प्लाट बदलने हेतु टैप करें': 'Plot badalne ke liye tap karein',
  'खेत विवरण सहेजें': 'Khet Details Save Karein',
  'कृषि उत्पाद': 'Krishi Fasal',
  'अनुमानित मात्रा': 'Andajee Quantity',
  'अनुमानित मात्रा (क्विंटल)': 'Andajee Quantity (Quintal)',
  'वाहन प्रकार': 'Vahan Type',
  'मॉडल भाव': 'Modal Rate (Bazaar Bhav)',
  'आज का भाव': 'Aaj ka Bhav',
  'भाव दायरा': 'Bhav Range (Min - Max)',
  'दैनिक आवक': 'Dainik Aavak',
  'एपीएमसी मंडी गेट पास': 'APMC Mandi Gate Pass',
  'स्लॉट सफलतापूर्वक बुक हुआ!': 'Slot Safaltapoorvak Book Hua!',
  'पंजीकृत मोबाइल पर एसएमएस भेजा गया है।': 'Mobile par SMS confirmation bhej diya gaya hai.',
  'ट्रैक्टर ट्रॉली': 'Tractor Trolley',
  'पिकअप टेम्पो': 'Pickup Tempo (Chhota Hathi)',
  'बैलगाड़ी': 'Bail Gadi',
  'स्थानीय मौसम पूर्वानुमान के लिए अपना जिला चुनें': 'Apne jile ka mausam aur dawa chhidkaw timings dekhein',

  // Crops & Varieties
  'कपास': 'Kapas',
  'गेहूं': 'Gehun',
  'गेंहू': 'Gehun',
  'मूंगफली': 'Mungfali',
  'मूँगफली': 'Mungfali',
  'गन्ना': 'Ganna / Sherdi',
  'जीरा': 'Jeera',
  'चना': 'Chana',
  'तिल': 'Til',
  'बाजरा': 'Bajra',
  'अरंडी': 'Arandi',
  'धान': 'Dhan',
  'चावल': 'Chawal',
  'प्याज': 'Pyaz',
  'आलू': 'Aloo',
  'टमाटर': 'Tamatar',
  'लहसुन': 'Lahsun',
  'धनिया': 'Dhaniya',
  'सरसों': 'Sarson',
  'सोयाबीन': 'Soyabean',
  'मक्का': 'Makka',
  'केला': 'Kela',
  'आम': 'Aam',
  'केसर आम': 'Kesar Aam',

  // Seasons
  'खरीफ': 'Kharif Season (Chomasu)',
  'रबी': 'Rabi Season (Siyalu)',
  'जायद': 'Zaid Season (Unaalu)',
};

export const ENGLISH_TO_HINGLISH_MAP: Record<string, string> = {
  'Home': 'Home / Mera Khet',
  'Crops': 'Fasal',
  'Crop Advice': 'Fasal Salah',
  'Crop Recommendations': 'Fasal Recommendations',
  'Weather & Soil': 'Mausam aur Mitti',
  'Weather': 'Mausam',
  'Soil': 'Mitti',
  'AI Camera': 'AI Fasal Doctor',
  'Mandi': 'Mandi',
  'Mandi Prices': 'Mandi Bhav',
  'Mandi Rates': 'Mandi Bhav',
  'Expenses': 'Kharach Tracker',
  'Expense Ledger': 'Kharach Tracker',
  'Alerts': 'Kisan Alerts',
  'Farmer Alerts': 'Kisan Alerts',
  'AI Advisory': 'AI Salahkar',
  'Profile': 'Kisan Profile',
  'Save Farm Details': 'Khet Details Save Karein',
  'Edit Farm': 'Khet Edit Karein',
  'Delete Plot': 'Plot Delete Karein',
  'Cancel': 'Cancel Karein',
  'Confirm Booking': 'Booking Confirm Karein',
  'Apply to Farm': 'Fasal Sweekar Karein (Apply to Farm)',
  'Clear Search': 'Clear Search (Khoj Saaf Karein)',
  'Today': 'Aaj ka Bhav',
  'Min - Max Range': 'Bhav Range (Min - Max)',
  'Daily Arrival': 'Dainik Aavak',
  'Vehicle Type': 'Vahan Type',
  'Est. Quantity': 'Andajee Quantity',
  'Est. Quantity (Qtl)': 'Andajee Quantity (Qtl)',
  'Commodity': 'Krishi Fasal (Commodity)',
  'Select Agricultural District': 'Krishi Jila Chunein',
  'Change District': 'Jila Badlein',
  'Detect GPS': 'GPS Location Pata Karein',
  'Detecting GPS...': 'GPS Khoj Rahe Hain...',
  'Cotton': 'Kapas',
  'Groundnut': 'Mungfali',
  'Wheat': 'Gehun',
  'Sugarcane': 'Ganna / Sherdi',
  'Cumin': 'Jeera',
  'Chickpea': 'Chana',
  'Sesame': 'Til',
  'Kharif': 'Kharif Season (Chomasu)',
  'Rabi': 'Rabi Season (Siyalu)',
  'Zaid': 'Zaid Season (Unaalu)',
  'Ranked by AI Profit & Soil Fit': 'Ranked by AI Profit & Mitti Fit',
  'Live Modal Prices, Arrival Volumes & Advisories': 'Live Modal Prices, Aavak aur Mandi Salah',
  'Revenue & Profit Overview': 'Aavak aur Labh Overview',
  'Input Costs': 'Khet Input Kharach',
};

const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

/**
 * Checks whether a string contains Devanagari Hindi characters
 */
export function hasDevanagari(str: string): boolean {
  return DEVANAGARI_REGEX.test(str);
}

/**
 * Transliterates Devanagari characters to phonetic Hinglish Latin text
 */
export function transliterateDevanagari(text: string): string {
  const charMap: Record<string, string> = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
    'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ं': 'n', 'ः': 'h', 'ँ': 'n',
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
    'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', '्': '',
    '०': '0', '૧': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  };

  let res = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    res += charMap[char] !== undefined ? charMap[char] : char;
  }
  return res.trim();
}

/**
 * Converts any text into clean, high-priority Hinglish.
 * Prioritizes the agricultural dictionary, then English mapping, then phonetic transliteration.
 */
export function toHinglish(hindiText?: string, englishText?: string): string {
  // 1. Direct dictionary match for full Hindi string
  if (hindiText) {
    const trimmedHi = hindiText.trim();
    if (HINDI_DEVANAGARI_TO_HINGLISH[trimmedHi]) {
      return HINDI_DEVANAGARI_TO_HINGLISH[trimmedHi];
    }

    // Check if it's already written in Latin/English characters (already Hinglish)
    if (!hasDevanagari(trimmedHi)) {
      return trimmedHi;
    }

    // Try token replacements
    let converted = trimmedHi;
    for (const [hiWord, hinglishWord] of Object.entries(HINDI_DEVANAGARI_TO_HINGLISH)) {
      if (converted.includes(hiWord)) {
        converted = converted.replace(new RegExp(hiWord, 'g'), hinglishWord);
      }
    }

    // If all Devanagari was replaced, return
    if (!hasDevanagari(converted)) {
      return converted;
    }

    // Phonetic fallback
    return transliterateDevanagari(converted);
  }

  // 2. Derive from English string
  if (englishText) {
    const trimmedEn = englishText.trim();
    if (ENGLISH_TO_HINGLISH_MAP[trimmedEn]) {
      return ENGLISH_TO_HINGLISH_MAP[trimmedEn];
    }
    return trimmedEn;
  }

  return '';
}
