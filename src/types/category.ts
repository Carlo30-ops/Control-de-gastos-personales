import type { ComponentType } from "react";

export type BuiltinCategory = "comida" | "transporte" | "servicios" | "ocio" | "salud" | "otros";
export type CustomCategory = `custom:${string}`;
export type Category = BuiltinCategory | CustomCategory;

export interface CategoryMeta {
  id: Category;
  label: string;
  color: string;
  Icon?: ComponentType<{ size?: number; className?: string }>;
  custom?: boolean;
}
