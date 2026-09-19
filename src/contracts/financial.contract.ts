// Typed Financial Ledger & Revenue Contract for AgroMind AI
import type { ExpenseItem, RevenueItem, FinancialOverview } from '../types';

export interface CreateExpensePayload {
  date: string;
  category: ExpenseItem['category'];
  categoryGu: string;
  title: string;
  plot: string;
  amount: number;
  paymentMethod: ExpenseItem['paymentMethod'];
}

export interface IFinancialService {
  getExpenses(): Promise<ExpenseItem[]>;
  addExpense(item: CreateExpensePayload): Promise<ExpenseItem>;
  deleteExpense(id: string): Promise<boolean>;
  getRevenues(): Promise<RevenueItem[]>;
  addRevenue(item: Omit<RevenueItem, 'id'>): Promise<RevenueItem>;
  getFinancialOverview(): Promise<FinancialOverview>;
  subscribe(callback: () => void): () => void;
}
