import type { Category } from "./category";

export interface Expense {
  id: number;
  amount: number;
  category: Category;
  date: string;
  note: string;
}

export interface ScanResult {
  amount: number;
  category: Category;
  note: string;
  confidence: number;
  rawText: string;
}
