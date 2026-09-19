// Unified Financial Ledger & Profit Engine for AgroMind AI
// Synchronizes /expenses and /profit from a single source of truth
// Backed by reactive storageService (L1 cache) and Supabase syncEngine (L2 cloud persistence)

import { storageService, STORAGE_KEYS } from './storageService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { syncEngine } from '../lib/syncEngine';
import type { ExpenseItem, RevenueItem, FinancialOverview, ExpenseCategory } from '../types';

export const financialService = {
  getExpenses(): ExpenseItem[] {
    const cached = storageService.get<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, []);

    // Background fetch from Supabase if online
    if (isSupabaseConfigured() && supabase && syncEngine.isOnline()) {
      supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const remoteExpenses: ExpenseItem[] = data.map((row: any) => ({
              id: row.id,
              date: row.date,
              category: row.category as ExpenseCategory,
              categoryGu: row.category_gu,
              title: row.title,
              plot: row.plot,
              amount: Number(row.amount),
              paymentMethod: row.payment_method,
            }));
            storageService.set(STORAGE_KEYS.EXPENSES, remoteExpenses);
          }
        })
        .catch((err) => console.warn('[FinancialService] Supabase fetchExpenses error:', err));
    }

    return cached;
  },

  addExpense(item: Omit<ExpenseItem, 'id'>): ExpenseItem {
    const expenses = this.getExpenses();
    const newExpense: ExpenseItem = {
      ...item,
      id: `exp-${Date.now()}`,
    };

    const updated = [newExpense, ...expenses];
    storageService.set(STORAGE_KEYS.EXPENSES, updated);

    const currentUser = storageService.get<{ id: string } | null>(STORAGE_KEYS.USER, null);

    // Enqueue to offline sync
    syncEngine.enqueue({
      tableName: 'expenses',
      operation: 'INSERT',
      recordId: newExpense.id,
      userId: currentUser?.id,
      payload: {
        id: newExpense.id,
        farmer_id: currentUser?.id || 'usr_demo',
        date: newExpense.date,
        category: newExpense.category,
        category_gu: newExpense.categoryGu,
        title: newExpense.title,
        plot: newExpense.plot,
        amount: newExpense.amount,
        payment_method: newExpense.paymentMethod,
      },
    });

    return newExpense;
  },

  deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter((e) => e.id !== id);
    storageService.set(STORAGE_KEYS.EXPENSES, expenses);

    // Enqueue delete operation to syncEngine
    syncEngine.enqueue({
      tableName: 'expenses',
      operation: 'DELETE',
      recordId: id,
      payload: { id },
    });
  },

  getRevenues(): RevenueItem[] {
    const cached = storageService.get<RevenueItem[]>(STORAGE_KEYS.REVENUE, []);

    if (isSupabaseConfigured() && supabase && syncEngine.isOnline()) {
      supabase
        .from('revenues')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const remoteRevenues: RevenueItem[] = data.map((row: any) => ({
              id: row.id,
              season: row.season,
              crop: row.crop,
              plot: row.plot,
              yieldQuintals: Number(row.yield_quintals),
              pricePerQuintal: Number(row.price_per_quintal),
              totalRevenue: Number(row.total_revenue),
              date: row.date,
            }));
            storageService.set(STORAGE_KEYS.REVENUE, remoteRevenues);
          }
        })
        .catch((err) => console.warn('[FinancialService] Supabase fetchRevenues error:', err));
    }

    return cached;
  },

  addRevenue(item: Omit<RevenueItem, 'id'>): RevenueItem {
    const revenues = this.getRevenues();
    const newRev: RevenueItem = {
      ...item,
      id: `rev-${Date.now()}`,
    };

    const updated = [newRev, ...revenues];
    storageService.set(STORAGE_KEYS.REVENUE, updated);

    const currentUser = storageService.get<{ id: string } | null>(STORAGE_KEYS.USER, null);

    syncEngine.enqueue({
      tableName: 'revenues',
      operation: 'INSERT',
      recordId: newRev.id,
      userId: currentUser?.id,
      payload: {
        id: newRev.id,
        farmer_id: currentUser?.id || 'usr_demo',
        season: newRev.season,
        crop: newRev.crop,
        plot: newRev.plot,
        yield_quintals: newRev.yieldQuintals,
        price_per_quintal: newRev.pricePerQuintal,
        total_revenue: newRev.totalRevenue,
        date: newRev.date,
      },
    });

    return newRev;
  },

  getFinancialOverview(): FinancialOverview {
    const expenses = this.getExpenses();
    const revenues = this.getRevenues();

    const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const expectedRevenue = revenues.reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0) || 168000;
    const projectedNetProfit = expectedRevenue - totalExpenses;
    const budget = 65000;
    const budgetPercent = Math.min(100, Math.round((totalExpenses / budget) * 100));
    const roiPercent = totalExpenses > 0 ? Math.round((expectedRevenue / totalExpenses) * 100) : 0;

    const categoryBreakdown: Record<ExpenseCategory, number> = {
      Seeds: 0,
      Fertilizers: 0,
      Pesticides: 0,
      Labor: 0,
      Machinery: 0,
      Irrigation: 0,
    };

    expenses.forEach((e) => {
      if (e.category in categoryBreakdown) {
        categoryBreakdown[e.category] += e.amount;
      }
    });

    return {
      totalExpenses,
      budget,
      budgetPercent,
      expectedRevenue,
      projectedNetProfit,
      roiPercent,
      categoryBreakdown,
    };
  },

  subscribe(callback: () => void): () => void {
    const unsubExp = storageService.subscribe(STORAGE_KEYS.EXPENSES, callback);
    const unsubRev = storageService.subscribe(STORAGE_KEYS.REVENUE, callback);
    return () => {
      unsubExp();
      unsubRev();
    };
  },
};
