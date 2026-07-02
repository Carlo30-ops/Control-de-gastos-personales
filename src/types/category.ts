import type { ComponentType } from "react";

export type Category = "comida" | "transporte" | "servicios" | "ocio" | "salud" | "otros";

export interface CategoryMeta {
  id: Category;
  label: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
}
