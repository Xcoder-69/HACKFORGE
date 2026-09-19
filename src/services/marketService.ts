// Market & APMC Mandi Price Intelligence Service for AgroMind AI
// Provides provider-abstracted market rates, price trends, and algorithmic SELL/HOLD recommendations
// Backed by Supabase mandi_prices table with offline APMC benchmark fallback

import type { MandiRecord } from '../types';
import type { IMarketService } from '../contracts/market.contract';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { syncEngine } from '../lib/syncEngine';

const INITIAL_MANDI_DATA: MandiRecord[] = [
  {
    id: 'm-1',
    mandi: 'Surat APMC',
    district: 'Surat',
    distance: '14 km (Nearest)',
    crop: 'Cotton (Shankar-6)',
    cropGu: 'કપાસ (શંકર-૬)',
    minPrice: 6900,
    maxPrice: 7450,
    modalPrice: 7250,
    trend: 'up',
    change: '+₹180',
    arrivals: '2,400 Qtl',
    recommendation: 'HOLD',
    recGu: '૧૦ દિવસ રોકો (ભાવ વધવાની શક્યતા)',
  },
  {
    id: 'm-2',
    mandi: 'Surat APMC',
    district: 'Surat',
    distance: '14 km (Nearest)',
    crop: 'Groundnut (GG-20)',
    cropGu: 'મગફળી (જીજી-૨૦)',
    minPrice: 6400,
    maxPrice: 6980,
    modalPrice: 6880,
    trend: 'up',
    change: '+₹110',
    arrivals: '1,650 Qtl',
    recommendation: 'SELL NOW',
    recGu: 'વેચાણ કરો (ઊંચા ભાવ)',
  },
  {
    id: 'm-3',
    mandi: 'Rajkot APMC',
    district: 'Rajkot',
    distance: '320 km (Export Benchmark)',
    crop: 'Cotton (Shankar-6)',
    cropGu: 'કપાસ (શંકર-૬)',
    minPrice: 7100,
    maxPrice: 7600,
    modalPrice: 7420,
    trend: 'up',
    change: '+₹220',
    arrivals: '14,200 Qtl',
    recommendation: 'HOLD',
    recGu: 'ભાવ મજબૂત',
  },
  {
    id: 'm-4',
    mandi: 'Rajkot APMC',
    district: 'Rajkot',
    distance: '320 km',
    crop: 'Groundnut (GG-20 Bold)',
    cropGu: 'મગફળી (બોલ્ડ દાણા)',
    minPrice: 6600,
    maxPrice: 7250,
    modalPrice: 7120,
    trend: 'up',
    change: '+₹160',
    arrivals: '8,900 Qtl',
    recommendation: 'SELL NOW',
    recGu: 'મહત્તમ નફો',
  },
  {
    id: 'm-5',
    mandi: 'Navsari APMC',
    district: 'Navsari',
    distance: '38 km',
    crop: 'Sugarcane (Factory Gate)',
    cropGu: 'શેરડી (સુગર ફેક્ટરી)',
    minPrice: 3300,
    maxPrice: 3500,
    modalPrice: 3420,
    trend: 'stable',
    change: '₹0',
    arrivals: '6,200 Ton',
    recommendation: 'SELL NOW',
    recGu: 'મિલ સપ્લાય ઉપલબ્ધ',
  },
  {
    id: 'm-6',
    mandi: 'Bharuch APMC',
    district: 'Bharuch',
    distance: '55 km',
    crop: 'Cotton (Shankar-6)',
    cropGu: 'કપાસ (શંકર-૬)',
    minPrice: 7000,
    maxPrice: 7380,
    modalPrice: 7200,
    trend: 'stable',
    change: '+₹40',
    arrivals: '3,100 Qtl',
    recommendation: 'HOLD',
    recGu: 'સ્થિર વલણ',
  },
  {
    id: 'm-7',
    mandi: 'Gondal APMC',
    district: 'Rajkot',
    distance: '345 km (Mandi Hub)',
    crop: 'Groundnut (GG-20)',
    cropGu: 'મગફળી (ગોંડલ યાર્ડ)',
    minPrice: 6550,
    maxPrice: 7180,
    modalPrice: 7050,
    trend: 'up',
    change: '+₹130',
    arrivals: '18,500 Qtl',
    recommendation: 'SELL NOW',
    recGu: 'સર્વોચ્ચ ભાવ',
  },
];

export const marketService: IMarketService = {
  async getMarketPrices(cropFilter: string = 'All', mandiFilter: string = 'All'): Promise<MandiRecord[]> {
    if (isSupabaseConfigured() && supabase && syncEngine.isOnline()) {
      try {
        let query = supabase.from('mandi_prices').select('*').order('modal_price', { ascending: false });

        if (cropFilter !== 'All') {
          query = query.ilike('crop', `%${cropFilter}%`);
        }
        if (mandiFilter !== 'All') {
          query = query.ilike('mandi', `%${mandiFilter}%`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((r: any) => ({
            id: r.id,
            mandi: r.mandi,
            district: r.district,
            distance: r.distance,
            crop: r.crop,
            cropGu: r.crop_gu,
            minPrice: Number(r.min_price),
            maxPrice: Number(r.max_price),
            modalPrice: Number(r.modal_price),
            trend: r.trend,
            change: r.change,
            arrivals: r.arrivals,
            recommendation: r.recommendation,
            recGu: r.rec_gu,
          }));
        }
      } catch (err) {
        console.warn('[MarketService] Supabase mandi query failed, using benchmark data:', err);
      }
    }

    // Default offline benchmark fallback
    await new Promise((res) => setTimeout(res, 100));
    return INITIAL_MANDI_DATA.filter((item) => {
      const matchCrop = cropFilter === 'All' || item.crop.toLowerCase().includes(cropFilter.toLowerCase());
      const matchMandi = mandiFilter === 'All' || item.mandi.toLowerCase().includes(mandiFilter.toLowerCase());
      return matchCrop && matchMandi;
    });
  },

  async getMandiRecords(cropFilter: string = 'All', mandiFilter: string = 'All'): Promise<MandiRecord[]> {
    return this.getMarketPrices(cropFilter, mandiFilter);
  },

  async getLatestModalPrice(cropName: string): Promise<number> {
    const records = await this.getMarketPrices();
    const match = records.find((r) => r.crop.toLowerCase().includes(cropName.toLowerCase()));
    return match ? match.modalPrice : 7000;
  },
};
