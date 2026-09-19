// Farm, Plot, and Crop Service for AgroMind AI
// Centralizes farm parcel management, plot tracking, and crop recommendations integration
// Backed by reactive storageService (L1 cache) and Supabase syncEngine (L2 cloud persistence)

import { storageService, STORAGE_KEYS } from './storageService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { syncEngine } from '../lib/syncEngine';
import type { FarmParcel, PlotInfo, PlotKey, CropRec } from '../types';
import type { CreatePlotPayload } from '../contracts/farm.contract';

export const farmService = {
  /**
   * Returns current farm parcel synchronously from L1 cache and syncs with Supabase if online
   */
  getFarmParcel(): FarmParcel | null {
    const cached = storageService.get<FarmParcel | null>(STORAGE_KEYS.FARM, null);

    // Asynchronous cloud sync in background if online
    if (isSupabaseConfigured() && supabase && syncEngine.isOnline()) {
      supabase
        .from('farms')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!error && data) {
            const remoteFarm: FarmParcel = {
              id: data.id,
              farmerId: data.farmer_id,
              totalArea: Number(data.total_area),
              cultivableArea: Number(data.cultivable_area),
              fallowArea: Number(data.fallow_area || 0),
              unit: data.unit,
              ownership: data.ownership,
              soilType: data.soil_type,
              waterSources: data.water_sources || [],
              irrigationTechnique: data.irrigation_technique,
              waterAvailability: data.water_availability,
              coordinates: {
                lat: Number(data.lat || 21.2721),
                lng: Number(data.lng || 72.9546),
                accuracy: data.accuracy,
              },
              season: data.season,
              surveyNo: data.survey_no,
              landmark: data.landmark,
              selectedCrops: data.selected_crops || [],
            };
            storageService.set(STORAGE_KEYS.FARM, remoteFarm);
          }
        })
        .catch((err) => console.warn('[FarmService] Supabase fetchFarm error:', err));
    }

    return cached;
  },

  /**
   * Saves farm parcel to L1 cache and enqueues to Supabase sync
   */
  saveFarmParcel(parcel: FarmParcel): void {
    storageService.set(STORAGE_KEYS.FARM, parcel);

    syncEngine.enqueue({
      tableName: 'farms',
      operation: 'INSERT',
      recordId: parcel.id,
      payload: {
        id: parcel.id,
        farmer_id: parcel.farmerId,
        total_area: parcel.totalArea,
        cultivable_area: parcel.cultivableArea,
        fallow_area: parcel.fallowArea,
        unit: parcel.unit,
        ownership: parcel.ownership,
        soil_type: parcel.soilType,
        water_sources: parcel.waterSources,
        irrigation_technique: parcel.irrigationTechnique,
        water_availability: parcel.waterAvailability,
        lat: parcel.coordinates?.lat,
        lng: parcel.coordinates?.lng,
        accuracy: parcel.coordinates?.accuracy,
        season: parcel.season,
        survey_no: parcel.surveyNo,
        landmark: parcel.landmark,
        selected_crops: parcel.selectedCrops,
      },
    });
  },

  /**
   * Returns plots from L1 cache and syncs with Supabase if online
   */
  getPlots(): Record<string, PlotInfo> {
    const cached = storageService.get<Record<string, PlotInfo>>(STORAGE_KEYS.PLOTS, {});

    if (isSupabaseConfigured() && supabase && syncEngine.isOnline()) {
      supabase
        .from('plots')
        .select('*')
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const remotePlots: Record<string, PlotInfo> = {};
            data.forEach((row: any) => {
              remotePlots[row.plot_key] = {
                id: row.id,
                key: row.plot_key as PlotKey,
                title: row.title,
                crop: row.crop,
                subCrop: row.sub_crop,
                variety: row.variety,
                area: row.area,
                stageBadge: row.stage_badge,
                stageName: row.stage_name,
                dayCount: row.day_count,
                progressBar: row.progress_bar,
                health: row.health,
                moisture: row.moisture,
                soilType: row.soil_type,
                irrigation: row.irrigation,
                syncTime: row.sync_time || 'Cloud Synced',
                provenance: row.provenance,
              };
            });
            storageService.set(STORAGE_KEYS.PLOTS, remotePlots);
          }
        })
        .catch((err) => console.warn('[FarmService] Supabase fetchPlots error:', err));
    }

    return cached;
  },

  /**
   * Saves individual plot and enqueues to Supabase sync
   */
  savePlot(plot: PlotInfo): void {
    const plots = this.getPlots();
    plots[plot.key] = plot;
    storageService.set(STORAGE_KEYS.PLOTS, plots);

    syncEngine.enqueue({
      tableName: 'plots',
      operation: 'UPDATE',
      recordId: plot.id,
      payload: {
        title: plot.title,
        crop: plot.crop,
        sub_crop: plot.subCrop,
        variety: plot.variety,
        area: plot.area,
        stage_badge: plot.stageBadge,
        stage_name: plot.stageName,
        day_count: plot.dayCount,
        progress_bar: plot.progressBar,
        health: plot.health,
        moisture: plot.moisture,
        soil_type: plot.soilType,
        irrigation: plot.irrigation,
        provenance: plot.provenance,
      },
    });
  },

  /**
   * Adds a new plot to farm
   */
  addPlot(newPlot: CreatePlotPayload): PlotInfo {
    const plots = this.getPlots();
    const existingKeys = Object.keys(plots);
    const nextKey = (
      existingKeys.includes('A')
        ? existingKeys.includes('B')
          ? existingKeys.includes('C')
            ? 'D'
            : 'C'
          : 'B'
        : 'A'
    ) as PlotKey;

    const plot: PlotInfo = {
      id: `plot_${nextKey}_${Date.now()}`,
      key: nextKey,
      title: newPlot.title,
      crop: newPlot.crop,
      subCrop: `${newPlot.crop} (Day 1)`,
      variety: newPlot.variety || 'Certified Hybrid Seed',
      area: newPlot.area.includes('Acre') ? newPlot.area : `${newPlot.area} Acres`,
      stageBadge: 'Sowing (Day 1/120)',
      stageName: 'Sowing / Germination Stage',
      dayCount: 'Day 1',
      progressBar: '5%',
      health: 'Optimal (તંદુરસ્ત)',
      moisture: '70% (Optimal)',
      soilType: newPlot.soilType || 'Black Cotton Soil',
      irrigation: newPlot.irrigation || 'Drip Irrigation',
      syncTime: 'Just now',
      provenance: 'Registered Farm Parcel',
    };

    plots[nextKey] = plot;
    storageService.set(STORAGE_KEYS.PLOTS, plots);

    syncEngine.enqueue({
      tableName: 'plots',
      operation: 'INSERT',
      recordId: plot.id,
      payload: {
        id: plot.id,
        plot_key: plot.key,
        title: plot.title,
        crop: plot.crop,
        sub_crop: plot.subCrop,
        variety: plot.variety,
        area: plot.area,
        stage_badge: plot.stageBadge,
        stage_name: plot.stageName,
        day_count: plot.dayCount,
        progress_bar: plot.progressBar,
        health: plot.health,
        moisture: plot.moisture,
        soil_type: plot.soilType,
        irrigation: plot.irrigation,
        provenance: plot.provenance,
      },
    });

    return plot;
  },

  /**
   * Applies recommended crop to a plot
   */
  applyCropToFarm(crop: CropRec, targetKey: PlotKey = 'A'): PlotInfo | null {
    const plots = this.getPlots();
    const existing = plots[targetKey];
    if (!existing) return null;

    const updated: PlotInfo = {
      ...existing,
      crop: `${crop.nameEn} (${crop.variety})`,
      subCrop: `${crop.nameGu} (Day 1)`,
      variety: crop.variety,
      stageBadge: 'Planned Cultivation',
      stageName: crop.stages[0]?.name || 'Seedling Stage',
      dayCount: 'Day 1',
      progressBar: '10%',
      health: 'High Match (ઉત્કૃષ્ટ)',
      soilType: crop.soilSuitability.includes('Black') ? 'Black Cotton Soil' : existing.soilType,
      syncTime: 'Today, Just now',
      provenance: `AgroMind AI Recommendation (${crop.matchScore}% Match)`,
    };

    plots[targetKey] = updated;
    storageService.set(STORAGE_KEYS.PLOTS, plots);

    syncEngine.enqueue({
      tableName: 'plots',
      operation: 'UPDATE',
      recordId: updated.id,
      payload: {
        crop: updated.crop,
        sub_crop: updated.subCrop,
        variety: updated.variety,
        stage_badge: updated.stageBadge,
        stage_name: updated.stageName,
        day_count: updated.dayCount,
        progress_bar: updated.progressBar,
        health: updated.health,
        soil_type: updated.soilType,
        provenance: updated.provenance,
      },
    });

    return updated;
  },

  subscribePlots(callback: (plots: Record<string, PlotInfo>) => void): () => void {
    return storageService.subscribe(STORAGE_KEYS.PLOTS, callback);
  },

  subscribeFarm(callback: (farm: FarmParcel | null) => void): () => void {
    return storageService.subscribe(STORAGE_KEYS.FARM, callback);
  },
};
