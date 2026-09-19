// Typed Market Intelligence & Mandi Price Contract for AgroMind AI
import type { MandiRecord } from '../types';

export interface IMarketService {
  getMarketPrices(cropFilter?: string, mandiFilter?: string): Promise<MandiRecord[]>;
  getMandiRecords(cropFilter?: string, mandiFilter?: string): Promise<MandiRecord[]>;
  getLatestModalPrice(cropName: string): Promise<number>;
}
