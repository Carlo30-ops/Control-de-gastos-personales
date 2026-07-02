import { UtensilsCrossed, Bus, Zap, Music2, Heart, MoreHorizontal } from "lucide-react";
import type { Category, CategoryMeta, Expense } from "../types";

export const CATEGORIES: CategoryMeta[] = [
  { id: "comida", label: "Comida", Icon: UtensilsCrossed },
  { id: "transporte", label: "Transporte", Icon: Bus },
  { id: "servicios", label: "Servicios", Icon: Zap },
  { id: "ocio", label: "Ocio", Icon: Music2 },
  { id: "salud", label: "Salud", Icon: Heart },
  { id: "otros", label: "Otros", Icon: MoreHorizontal },
];

export const CHART_COLORS: Record<Category, string> = {
  comida: "#16a34a",
  transporte: "#3b82f6",
  servicios: "#f59e0b",
  ocio: "#8b5cf6",
  salud: "#ec4899",
  otros: "#6b7280",
};

export const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

export const today = new Date();
export const todayStr = today.toISOString().split("T")[0];

export const SEED_EXPENSES: Expense[] = [
  { id: 1, amount: 320, category: "comida", date: "2026-07-01", note: "Supermercado" },
  { id: 2, amount: 85, category: "transporte", date: "2026-07-01", note: "Metro semanal" },
  { id: 3, amount: 1200, category: "servicios", date: "2026-06-30", note: "Renta" },
  { id: 4, amount: 199, category: "ocio", date: "2026-06-29", note: "Netflix + Spotify" },
  { id: 5, amount: 450, category: "salud", date: "2026-06-28", note: "Consulta médica" },
  { id: 6, amount: 95, category: "comida", date: "2026-06-27", note: "Restaurante" },
  { id: 7, amount: 60, category: "transporte", date: "2026-06-26", note: "Gasolina" },
  { id: 8, amount: 140, category: "otros", date: "2026-06-25", note: "Papelería" },
  { id: 9, amount: 230, category: "comida", date: "2026-06-24", note: "Despensa semanal" },
  { id: 10, amount: 780, category: "salud", date: "2026-06-22", note: "Medicamentos" },
  { id: 11, amount: 350, category: "ocio", date: "2026-06-20", note: "Concierto" },
  { id: 12, amount: 45, category: "transporte", date: "2026-06-18", note: "Taxi" },
];
