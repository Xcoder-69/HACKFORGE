// Farm, Plot, and Crop Service for AgroMind AI
// Centralizes farm parcel management, plot tracking, and crop recommendations integration
// Backed by reactive storageService (L1 cache) and Supabase syncEngine (L2 cloud persistence)
// STRICT DEMO ISOLATION: Real users only access their own database records; never demo plots.

import { storageService, STORAGE_KEYS } from './storageService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { syncEngine } from '../lib/syncEngine';
import { DEMO_FARM, DEMO_PLOTS, isDemoUser } from '../data/demoFarmerData';
import type { FarmParcel, PlotInfo, PlotKey, CropRec } from '../types';
import type { CreatePlotPayload } from '../contracts/farm.contract';

export const farmService = {
  /**
   * Returns current farm parcel.
   * If Demo user: returns the seeded 4.5 Acre Surat farm.
   * If Real user: returns their registered farm parcel or null if not registered.
   */
  getFarmParcel(): FarmParcel | null {
    const currentUser = storageService.get<{ id?: string; phone?: string } | null>(STORAGE_KEYS.USER, null);
    if (isDemoUser(currentUser)) {
      return DEMO_FARM;
    }

    const cached = storageService.get<FarmParcel | null>(STORAGE_KEYS.FARM, null);

    // Asynchronous cloud sync in background if online
    if (isSupabaseConfigured() && supabase && syncEngine.isOnline() && currentUser?.id) {
      supabase
        .from('farms')
        .select('*')
        .eq('farmer_id', currentUser.id)
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
    const currentUser = storageService.get<{ id?: string } | null>(STORAGE_KEYS.USER, null);
    const farmerId = parcel.farmerId || currentUser?.id || 'usr_farmer';

    const cleanParcel = { ...parcel, farmerId };
    storageService.set(STORAGE_KEYS.FARM, cleanParcel);

    if (!isDemoUser(currentUser)) {
      syncEngine.enqueue({
        tableName: 'farms',
        operation: 'INSERT',
        recordId: cleanParcel.id,
        userId: farmerId,
        payload: {
          id: cleanParcel.id,
          farmer_id: farmerId,
          total_area: cleanParcel.totalArea,
          cultivable_area: cleanParcel.cultivableArea,
          fallow_area: cleanParcel.fallowArea,
          unit: cleanParcel.unit,
          ownership: cleanParcel.ownership,
          soil_type: cleanParcel.soilType,
          water_sources: cleanParcel.waterSources,
          irrigation_technique: cleanParcel.irrigationTechnique,
          water_availability: cleanParcel.waterAvailability,
          lat: cleanParcel.coordinates?.lat,
          lng: cleanParcel.coordinates?.lng,
          accuracy: cleanParcel.coordinates?.accuracy,
          season: cleanParcel.season,
          survey_no: cleanParcel.surveyNo,
          landmark: cleanParcel.landmark,
          selected_crops: cleanParcel.selectedCrops,
        },
      });
    }
  },

  /**
   * Returns plots for the current user.
   * If Demo user: returns Demo Plots (A: Shankar-6 Cotton, B: GG-20 Groundnut).
   * If Real user: returns their stored plots or empty object {} (NEVER falls back to demo).
   */
  getPlots(): Record<string, PlotInfo> {
    const currentUser = storageService.get<{ id?: string; phone?: string } | null>(STORAGE_KEYS.USER, null);
    if (isDemoUser(currentUser)) {
      return DEMO_PLOTS;
    }

    const cached = storageService.get<Record<string, PlotInfo>>(STORAGE_KEYS.PLOTS, {});

    // For real users, update dynamically computed days from actual planting dates
    if (cached && Object.keys(cached).length > 0) {
      let modified = false;
      Object.keys(cached).forEach((pk) => {
        const p = cached[pk];
        if (p.plantingDate) {
          const age = Math.max(0, Math.floor((Date.now() - new Date(p.plantingDate).getTime()) / 86400000));
          if (p.dayCount !== `Day ${age}`) {
            p.dayCount = `Day ${age}`;
            modified = true;
          }
        }
      });
      if (modified) {
        storageService.set(STORAGE_KEYS.PLOTS, cached);
      }
    }

    // Cloud sync from Supabase in background
    if (isSupabaseConfigured() && supabase && syncEngine.isOnline() && currentUser?.id) {
      supabase
        .from('plots')
        .select('*')
        .eq('farmer_id', currentUser.id)
        .then(({ data, error }) => {
          if (!error && data) {
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

    return cached || {};
  },

  /**
   * Saves individual plot and enqueues to Supabase sync
   */
  savePlot(plot: PlotInfo): void {
    const plots = this.getPlots();
    plots[plot.key] = plot;
    storageService.set(STORAGE_KEYS.PLOTS, plots);

    const currentUser = storageService.get<{ id: string } | null>(STORAGE_KEYS.USER, null);
    if (!isDemoUser(currentUser)) {
      syncEngine.enqueue({
        tableName: 'plots',
        operation: 'UPDATE',
        recordId: plot.id,
        userId: currentUser?.id,
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
    }
  },

  /**
   * Adds a new plot to farm
   */
  addPlot(newPlot: CreatePlotPayload): PlotInfo {
    const plots = this.getPlots();
    const existingKeys = Object.keys(plots);
    const candidateKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    let nextKey = 'A';
    for (const k of candidateKeys) {
      if (!existingKeys.includes(k)) {
        nextKey = k;
        break;
      }
    }

    const plot: PlotInfo = {
      id: `plot_${nextKey}_${Date.now()}`,
      key: nextKey as PlotKey,
      title: newPlot.title || `Plot Details: Block ${nextKey}`,
      crop: newPlot.crop,
      subCrop: `${newPlot.crop.split('(')[0].trim()} (Day 1)`,
      variety: newPlot.variety || 'Certified Hybrid Seed',
      area: newPlot.area.includes('Acre') ? newPlot.area : `${newPlot.area} Acres`,
      stageBadge: 'Sowing (Day 1/120)',
      stageName: 'Sowing / Germination Stage',
      dayCount: 'Day 1',
      plantingDate: new Date().toISOString().split('T')[0],
      progressBar: '5%',
      health: 'Optimal (તંદુરસ્ત)',
      moisture: '70% (Optimal)',
      soilType: newPlot.soilType || 'Black Cotton Soil (કાળી કાંપવાળી)',
      irrigation: newPlot.irrigation || 'Drip Irrigation (ટપક પદ્ધતિ)',
      syncTime: 'Just now',
      provenance: 'Registered Farm Parcel',
    };

    plots[nextKey] = plot;
    storageService.set(STORAGE_KEYS.PLOTS, plots);

    const currentUser = storageService.get<{ id: string } | null>(STORAGE_KEYS.USER, null);
    const farm = storageService.get<{ id: string } | null>(STORAGE_KEYS.FARM, null);

    if (!isDemoUser(currentUser)) {
      syncEngine.enqueue({
        tableName: 'plots',
        operation: 'INSERT',
        recordId: plot.id,
        userId: currentUser?.id,
        payload: {
          id: plot.id,
          farmer_id: currentUser?.id,
          farm_id: farm?.id,
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
    }

    return plot;
  },

  /**
   * Deletes a plot by its key
   */
  deletePlot(key: string): void {
    const plots = this.getPlots();
    const plotToDelete = plots[key];
    delete plots[key];
    storageService.set(STORAGE_KEYS.PLOTS, plots);

    const currentUser = storageService.get<{ id: string } | null>(STORAGE_KEYS.USER, null);
    if (plotToDelete && !isDemoUser(currentUser)) {
      syncEngine.enqueue({
        tableName: 'plots',
        operation: 'DELETE',
        recordId: plotToDelete.id,
        userId: currentUser?.id,
        payload: { id: plotToDelete.id },
      });
    }
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
      plantingDate: new Date().toISOString().split('T')[0],
      progressBar: '10%',
      health: 'High Match (ઉત્કૃષ્ટ)',
      soilType: crop.soilSuitability.includes('Black') ? 'Black Cotton Soil' : existing.soilType,
      syncTime: 'Today, Just now',
      provenance: `AgroMind AI Recommendation (${crop.matchScore}% Match)`,
    };

    plots[targetKey] = updated;
    storageService.set(STORAGE_KEYS.PLOTS, plots);

    const currentUser = storageService.get<{ id: string } | null>(STORAGE_KEYS.USER, null);
    if (!isDemoUser(currentUser)) {
      syncEngine.enqueue({
        tableName: 'plots',
        operation: 'UPDATE',
        recordId: updated.id,
        userId: currentUser?.id,
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
    }

    return updated;
  },

  subscribePlots(callback: (plots: Record<string, PlotInfo>) => void): () => void {
    return storageService.subscribe(STORAGE_KEYS.PLOTS, callback);
  },

  subscribeFarm(callback: (farm: FarmParcel | null) => void): () => void {
    return storageService.subscribe(STORAGE_KEYS.FARM, callback);
  },
};
