// Automatic Location Detection & Geographic Intelligence Service for AgroMind AI
// Manages native browser Geolocation, fallback hierarchy, district mapping, and offline storage

import { storageService, STORAGE_KEYS } from './storageService';
import { farmService } from './farmService';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number; // In meters as provided by browser Geolocation API
  source: 'gps' | 'saved_farm' | 'manual' | 'fallback';
  sourceLabel: string;
  sourceLabelGu: string;
  locationName: string;
  locationNameGu: string;
  district: string;
  timestamp: number;
}

export interface LocationDetectionResult {
  success: boolean;
  latitude: number;
  longitude: number;
  coords: GeoCoordinates;
  error?: string;
  errorGu?: string;
  errorType?: 'denied' | 'unavailable' | 'timeout' | 'unsupported';
}

export interface GujaratDistrictPreset {
  district: string;
  districtGu: string;
  name: string;
  nameGu: string;
  lat: number;
  lng: number;
}

// Major Gujarat agricultural district centers with geographic coordinates
export const GUJARAT_DISTRICT_PRESETS: GujaratDistrictPreset[] = [
  { district: 'Surat', districtGu: 'સુરત', name: 'Surat (Kamrej Cluster)', nameGu: 'સુરત (કામરેજ વિસ્તાર)', lat: 21.2721, lng: 72.9546 },
  { district: 'Rajkot', districtGu: 'રાજકોટ', name: 'Rajkot (APMC Mandi Hub)', nameGu: 'રાજકોટ (માર્કેટ યાર્ડ હબ)', lat: 22.3039, lng: 70.8022 },
  { district: 'Junagadh', districtGu: 'જૂનાગઢ', name: 'Junagadh (Gir Foothills)', nameGu: 'જૂનાગઢ (ગીર તળેટી)', lat: 21.5222, lng: 70.4579 },
  { district: 'Bhavnagar', districtGu: 'ભાવનગર', name: 'Bhavnagar (Coastal Plains)', nameGu: 'ભાવનગર (દરિયાકાંઠા વિસ્તાર)', lat: 21.7645, lng: 72.1519 },
  { district: 'Vadodara', districtGu: 'વડોદરા', name: 'Vadodara (Central Gujarat)', nameGu: 'વડોદરા (મધ્ય ગુજરાત)', lat: 22.3072, lng: 73.1812 },
  { district: 'Mehsana', districtGu: 'મહેસાણા', name: 'Mehsana (North Gujarat)', nameGu: 'મહેસાણા (ઉત્તર ગુજરાત)', lat: 23.5880, lng: 72.3693 },
  { district: 'Amreli', districtGu: 'અમરેલી', name: 'Amreli (Cotton Zone)', nameGu: 'અમરેલી (કપાસ પટ્ટો)', lat: 21.6032, lng: 71.2221 },
  { district: 'Bharuch', districtGu: 'ભરૂચ', name: 'Bharuch (Narmada Basin)', nameGu: 'ભરૂચ (નર્મદા કાંઠો)', lat: 21.7051, lng: 72.9959 },
  { district: 'Navsari', districtGu: 'નવસારી', name: 'Navsari (South Orchards)', nameGu: 'નવસારી (દક્ષિણ બાગાયત)', lat: 20.9467, lng: 72.9520 },
  { district: 'Anand', districtGu: 'આણંદ', name: 'Anand (Charotar Belt)', nameGu: 'આણંદ (ચરોતર વિસ્તાર)', lat: 22.5645, lng: 72.9289 },
  { district: 'Kutch', districtGu: 'કચ્છ', name: 'Kutch (Bhuj Arid Zone)', nameGu: 'કચ્છ (ભુજ શુષ્ક પટ્ટો)', lat: 23.2420, lng: 69.6669 },
  { district: 'Jamnagar', districtGu: 'જામનગર', name: 'Jamnagar (Saurashtra West)', nameGu: 'જામનગર (પશ્ચિમ સૌરાષ્ટ્ર)', lat: 22.4707, lng: 70.0577 },
  { district: 'Surendranagar', districtGu: 'સુરેન્દ્રનગર', name: 'Surendranagar (Zalawad)', nameGu: 'સુરેન્દ્રનગર (ઝાલાવાડ)', lat: 22.7274, lng: 71.6370 },
  { district: 'Banaskantha', districtGu: 'બનાસકાંઠા', name: 'Banaskantha (Palanpur)', nameGu: 'બનાસકાંઠા (પાલનપુર)', lat: 24.1724, lng: 72.4346 },
  { district: 'Sabarkantha', districtGu: 'સાબરકાંઠા', name: 'Sabarkantha (Himmatnagar)', nameGu: 'સાબરકાંઠા (હિંમતનગર)', lat: 23.5977, lng: 72.9698 },
];

export const FALLBACK_DEMO_COORDINATES: GeoCoordinates = {
  latitude: 21.2721,
  longitude: 72.9546,
  accuracy: undefined,
  source: 'fallback',
  sourceLabel: 'Default Demo Fallback (Surat)',
  sourceLabelGu: 'ડિફોલ્ટ ડેમો સ્થળ (સુરત)',
  locationName: 'Kamrej, Surat District (Demo Fallback)',
  locationNameGu: 'કામરેજ, સુરત જિલ્લો (ડેમો સ્થળ)',
  district: 'Surat',
  timestamp: Date.now(),
};

export const locationService = {
  /**
   * Calculates the nearest Gujarat agricultural hub using Euclidean approximation
   */
  getNearestDistrict(lat: number, lng: number): GujaratDistrictPreset {
    let nearest = GUJARAT_DISTRICT_PRESETS[0];
    let minDistanceSq = Number.MAX_VALUE;

    for (const preset of GUJARAT_DISTRICT_PRESETS) {
      const dLat = lat - preset.lat;
      const dLng = lng - preset.lng;
      const distSq = dLat * dLat + dLng * dLng;
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        nearest = preset;
      }
    }

    return nearest;
  },

  /**
   * Retrieves the current saved location from offline storage or fallback hierarchy
   */
  getSavedLocation(): GeoCoordinates {
    // 1. Check explicitly saved location in storageService
    const stored = storageService.get<GeoCoordinates | null>(STORAGE_KEYS.LOCATION, null);
    if (stored && stored.latitude && stored.longitude) {
      return stored;
    }

    // 2. Check registered farm parcel coordinates
    const farm = farmService.getFarmParcel();
    if (farm && farm.coordinates?.lat && farm.coordinates?.lng) {
      const nearest = this.getNearestDistrict(farm.coordinates.lat, farm.coordinates.lng);
      return {
        latitude: farm.coordinates.lat,
        longitude: farm.coordinates.lng,
        accuracy: farm.coordinates.accuracy ? parseFloat(farm.coordinates.accuracy) : undefined,
        source: 'saved_farm',
        sourceLabel: 'Registered Farm Parcel',
        sourceLabelGu: 'નોંધાયેલ ખેતરનું સ્થાન',
        locationName: farm.landmark ? `${farm.landmark}, ${farm.village || nearest.district}` : `${nearest.district} Farm`,
        locationNameGu: `${nearest.districtGu} ખેતર`,
        district: farm.village || nearest.district,
        timestamp: Date.now(),
      };
    }

    // 3. Transparent demo fallback (clearly labeled)
    return FALLBACK_DEMO_COORDINATES;
  },

  /**
   * Saves location coordinates to persistent storage
   */
  saveLocation(coordsOrLatLng: GeoCoordinates | { latitude: number; longitude: number }): void {
    if ('source' in coordsOrLatLng && 'sourceLabel' in coordsOrLatLng) {
      storageService.set(STORAGE_KEYS.LOCATION, coordsOrLatLng as GeoCoordinates);
    } else {
      const lat = coordsOrLatLng.latitude;
      const lng = coordsOrLatLng.longitude;
      const nearest = this.getNearestDistrict(lat, lng);
      const fullCoords: GeoCoordinates = {
        latitude: lat,
        longitude: lng,
        source: 'manual',
        sourceLabel: `Location: ${nearest.district}`,
        sourceLabelGu: `સ્થળ: ${nearest.districtGu}`,
        locationName: `${nearest.district} (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`,
        locationNameGu: `${nearest.districtGu} (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`,
        district: nearest.district,
        timestamp: Date.now(),
      };
      storageService.set(STORAGE_KEYS.LOCATION, fullCoords);
    }
  },

  /**
   * Requests browser GPS coordinates with full error handling and fallback resolution
   */
  async getCurrentLocation(): Promise<LocationDetectionResult> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const fallback = this.getSavedLocation();
      return {
        success: false,
        latitude: fallback.latitude,
        longitude: fallback.longitude,
        coords: fallback,
        error: 'Geolocation is not supported by your browser.',
        errorGu: 'તમારા બ્રાઉઝરમાં જીપીએસ સુવિધા ઉપલબ્ધ નથી.',
        errorType: 'unsupported',
      };
    }

    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 second timeout
        maximumAge: 30000, // Accept cached position within 30s
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy); // Browser provided accuracy in meters
          const nearest = this.getNearestDistrict(lat, lng);

          const gpsCoords: GeoCoordinates = {
            latitude: lat,
            longitude: lng,
            accuracy,
            source: 'gps',
            sourceLabel: `Live GPS (±${accuracy}m)`,
            sourceLabelGu: `જીવંત જીપીએસ (±${accuracy}મી)`,
            locationName: `${nearest.district} (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`,
            locationNameGu: `${nearest.districtGu} (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`,
            district: nearest.district,
            timestamp: Date.now(),
          };

          this.saveLocation(gpsCoords);

          resolve({
            success: true,
            latitude: lat,
            longitude: lng,
            coords: gpsCoords,
          });
        },
        (err) => {
          let errorType: LocationDetectionResult['errorType'] = 'unavailable';
          let error = 'Unable to retrieve location.';
          let errorGu = 'સ્થાન મેળવવામાં અસમર્થ.';

          if (err.code === err.PERMISSION_DENIED) {
            errorType = 'denied';
            error = 'Location permission denied. Select your district manually or use saved farm location.';
            errorGu = 'સ્થાનની પરવાનગી નકારી છે. કૃપા કરીને જિલ્લો પસંદ કરો.';
          } else if (err.code === err.TIMEOUT) {
            errorType = 'timeout';
            error = 'Location request timed out. Using saved farm location.';
            errorGu = 'સમયસીમા સમાપ્ત થઈ. સાચવેલ સ્થાનનો ઉપયોગ થઈ રહ્યો છે.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errorType = 'unavailable';
            error = 'GPS signal is currently unavailable.';
            errorGu = 'જીપીએસ સિગ્નલ હાલ ઉપલબ્ધ નથી.';
          }

          const fallback = this.getSavedLocation();
          resolve({
            success: false,
            latitude: fallback.latitude,
            longitude: fallback.longitude,
            coords: fallback,
            error,
            errorGu,
            errorType,
          });
        },
        options
      );
    });
  },

  /**
   * Manually sets location from a Gujarat district preset
   */
  setManualLocation(preset: GujaratDistrictPreset): GeoCoordinates {
    const coords: GeoCoordinates = {
      latitude: preset.lat,
      longitude: preset.lng,
      source: 'manual',
      sourceLabel: `Manual: ${preset.district}`,
      sourceLabelGu: `પસંદ કરેલ: ${preset.districtGu}`,
      locationName: preset.name,
      locationNameGu: preset.nameGu,
      district: preset.district,
      timestamp: Date.now(),
    };

    this.saveLocation(coords);
    return coords;
  },

  /**
   * Request location permission alias
   */
  async requestLocationPermission(): Promise<LocationDetectionResult> {
    return this.getCurrentLocation();
  },

  /**
   * Subscribes to location updates
   */
  subscribeToLocation(callback: (coords: GeoCoordinates) => void): () => void {
    return storageService.subscribe<GeoCoordinates>(STORAGE_KEYS.LOCATION, callback);
  },
};
