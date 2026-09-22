// Data Initializer for AgroMind AI
// Pre-populates clean static references for Gujarat agricultural context
// STRICT ISOLATION: User-specific data (farms, plots, expenses, crops) is NEVER initialized globally.

import { storageService, STORAGE_KEYS } from './storageService';
import {
  DEMO_PROFILE,
  DEMO_FARM,
  DEMO_PLOTS,
  DEMO_EXPENSES,
  DEMO_REVENUE,
  DEMO_SOIL_REPORT,
} from '../data/demoFarmerData';
import type { FarmerRecord } from '../types';

/**
 * Initializes global application references (admin lists, reference datasets).
 * Does NOT set user, farm, plots, or financial records for real users.
 */
export const initializeDefaultData = (): void => {
  const isInitialized = storageService.get<boolean>(STORAGE_KEYS.INITIALIZED, false);
  if (isInitialized) return;

  // Static Admin Extension Farmers (for KVK Enterprise Admin Overview)
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

/**
 * Explicitly populates Demo Account data when the user logs in as Demo Farmer.
 * Called ONLY from authService when demo credentials (9876543210 / 8249) are used.
 */
export const seedDemoUserData = (): void => {
  storageService.set(STORAGE_KEYS.USER, DEMO_PROFILE);
  storageService.set(STORAGE_KEYS.TOKEN, 'agromind_demo_authenticated_token');
  storageService.set(STORAGE_KEYS.FARM, DEMO_FARM);
  storageService.set(STORAGE_KEYS.PLOTS, DEMO_PLOTS);
  storageService.set(STORAGE_KEYS.EXPENSES, DEMO_EXPENSES);
  storageService.set(STORAGE_KEYS.REVENUE, DEMO_REVENUE);
  storageService.set(STORAGE_KEYS.SOIL_REPORT, DEMO_SOIL_REPORT);
  storageService.set(STORAGE_KEYS.ALERTS, []);
  storageService.set(STORAGE_KEYS.SCANS, []);
};

/**
 * Clears user data from local storage when logging out.
 */
export const clearUserDataOnLogout = (): void => {
  storageService.remove(STORAGE_KEYS.USER);
  storageService.remove(STORAGE_KEYS.TOKEN);
  storageService.remove(STORAGE_KEYS.FARM);
  storageService.remove(STORAGE_KEYS.PLOTS);
  storageService.remove(STORAGE_KEYS.EXPENSES);
  storageService.remove(STORAGE_KEYS.REVENUE);
  storageService.remove(STORAGE_KEYS.SOIL_REPORT);
  storageService.remove(STORAGE_KEYS.ALERTS);
  storageService.remove(STORAGE_KEYS.SCANS);
};
