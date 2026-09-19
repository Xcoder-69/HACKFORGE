// Typed Farm & Plot Management Contract for AgroMind AI
import type { FarmParcel, PlotInfo, PlotKey, CropRec } from '../types';

export interface CreatePlotPayload {
  title: string;
  crop: string;
  area: string;
  variety?: string;
  soilType?: string;
  irrigation?: string;
}

export interface IFarmService {
  getFarmParcel(): Promise<FarmParcel | null>;
  saveFarmParcel(parcel: FarmParcel): Promise<FarmParcel>;
  getPlots(): Promise<Record<string, PlotInfo>>;
  savePlot(plot: PlotInfo): Promise<PlotInfo>;
  addPlot(payload: CreatePlotPayload): Promise<PlotInfo>;
  applyCropToFarm(crop: CropRec, targetKey?: PlotKey): Promise<PlotInfo | null>;
  subscribePlots(callback: (plots: Record<string, PlotInfo>) => void): () => void;
  subscribeFarm(callback: (farm: FarmParcel | null) => void): () => void;
}
