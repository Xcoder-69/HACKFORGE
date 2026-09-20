// Agronomic Recommendation Service Contracts for AgroMind AI
// Typed definitions for "What Should I Grow?" and "My Growing Crop" advisory

import type { PlotInfo, FarmParcel } from '../types';
import type { WeatherData } from '../services/weatherService';
import type { MandiRecord } from '../types';
import type { GeoCoordinates } from '../services/locationService';

export type SuitabilityCategory = 'Highly Suitable' | 'Suitable' | 'Moderate' | 'Low';
export type SuitabilityCategoryGu = 'ખૂબ અનુકૂળ' | 'અનુકૂળ' | 'મધ્યમ' | 'ઓછું અનુકૂળ';
export type SeasonKey = 'kharif' | 'rabi' | 'zaid';

export interface CropCostBreakdown {
  seedCostPerAcre: number;
  fertilizerCostPerAcre: number;
  pesticideCostPerAcre: number;
  laborAndMachineryPerAcre: number;
  irrigationCostPerAcre: number;
  totalCostPerAcre: number;
}

export interface CropYieldRange {
  minYieldPerAcre: number; // in Quintals (or Tons for sugarcane)
  maxYieldPerAcre: number;
  unit: string; // 'Qtl' | 'Ton'
}

export interface CropCultivationStage {
  name: string;
  nameGu: string;
  nameHi?: string;
  days: string;
  detail: string;
  detailGu: string;
  fertilizerAction?: string;
  fertilizerActionGu?: string;
  irrigationAction?: string;
  irrigationActionGu?: string;
  pestRisk?: string;
  pestRiskGu?: string;
}

export interface DataSourcesAudit {
  weatherSource: string;
  weatherTimestamp: string;
  marketSource: string;
  marketPriceDate: string;
  soilDataSource: string;
  unavailableFields: string[];
}

export interface CropRecommendationItem {
  id: string;
  nameEn: string;
  nameGu: string;
  nameHi: string;
  variety: string;
  season: SeasonKey;
  suitabilityScore: number; // 0-100 rubric score
  suitabilityCategory: SuitabilityCategory;
  suitabilityCategoryGu: SuitabilityCategoryGu;
  suitabilityReasonEn: string;
  suitabilityReasonGu: string;
  growingDurationDays: string;
  waterNeed: 'Low' | 'Medium' | 'High';
  waterNeedGu: string;
  soilSuitabilityEn: string;
  soilSuitabilityGu: string;
  costs: CropCostBreakdown;
  yieldRange: CropYieldRange;
  liveMarketPrice: number; // modal price per Qtl / Ton
  liveMarketPriceFormatted: string;
  liveMarketName: string;
  liveMarketTrend: 'up' | 'stable' | 'down';
  liveMarketDate: string;
  estimatedRevenueMin: number;
  estimatedRevenueMax: number;
  estimatedProfitMin: number;
  estimatedProfitMax: number;
  disclaimer: string;
  disclaimerGu: string;
  mainRisksEn: string[];
  mainRisksGu: string[];
  stages: CropCultivationStage[];
  dataAudit: DataSourcesAudit;
}

export interface GrowingCropAdvisory {
  cropId: string;
  cropName: string;
  cropNameGu: string;
  variety: string;
  currentStage: string;
  currentStageGu: string;
  daysPlanted: string;
  weatherSuitability: {
    status: 'Favorable' | 'Caution' | 'Adverse';
    statusGu: string;
    temperatureStatus: string;
    temperatureStatusGu: string;
    forecastAlert?: string;
    forecastAlertGu?: string;
  };
  irrigationGuidance: {
    action: string;
    actionGu: string;
    reason: string;
    reasonGu: string;
    nextSchedule: string;
  };
  fertilizerGuidance: {
    dosage: string;
    dosageGu: string;
    method: string;
    methodGu: string;
    soilTestNotice: string;
    soilTestNoticeGu: string;
  };
  pestPrevention: {
    threatName: string;
    threatNameGu: string;
    severity: 'High' | 'Medium' | 'Low';
    symptoms: string;
    symptomsGu: string;
    preventiveAction: string;
    preventiveActionGu: string;
  };
  harvestProjection: {
    expectedWindow: string;
    daysRemaining: string;
    expectedYieldPerAcre: string;
    currentMarketPrice: string;
    estimatedRevenuePerAcre: string;
    sellingStrategy: string;
    sellingStrategyGu: string;
  };
  dataSources: DataSourcesAudit;
}

export interface IRecommendationService {
  getWhatToGrowRecommendations(
    season: SeasonKey,
    locationCoords?: GeoCoordinates | null
  ): Promise<CropRecommendationItem[]>;

  getGrowingCropAdvisory(
    cropId: string,
    stageName: string,
    plot?: PlotInfo | null
  ): Promise<GrowingCropAdvisory>;

  getCropDatabase(): Record<string, any>;
}
