import type { Category } from "../types";
import { CATEGORIES, CHART_COLORS } from "../lib/constants";

export function getCatInfo(id: Category) {
  return CATEGORIES.find((c) => c.id === id)!;
}

export function CategoryIcon({ id, size = 16 }: { id: Category; size?: number }) {
  const { Icon } = getCatInfo(id);
  return (
    <div
      className="rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ width: size + 18, height: size + 18, background: CHART_COLORS[id] + "18", color: CHART_COLORS[id] }}
    >
      <Icon size={size} />
    </div>
  );
}

export function CategoryBadge({ id }: { id: Category }) {
  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full inline-block whitespace-nowrap"
      style={{ background: CHART_COLORS[id] + "18", color: CHART_COLORS[id] }}
    >
      {getCatInfo(id).label}
    </span>
  );
}
