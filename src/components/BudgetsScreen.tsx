import { useState } from "react";
import { Check } from "lucide-react";
import type { Category, Budgets } from "../types";
import { CATEGORIES } from "../lib/constants";
import { CategoryIcon } from "./CategoryHelpers";

interface BudgetsScreenProps {
  budgets: Budgets;
  onChange: (budgets: Budgets) => void;
}

export function BudgetsScreen({ budgets, onChange }: BudgetsScreenProps) {
  const [drafts, setDrafts] = useState<Partial<Record<Category, string>>>(() => {
    const init: Partial<Record<Category, string>> = {};
    for (const cat of CATEGORIES) {
      if (budgets[cat.id]) init[cat.id] = String(budgets[cat.id]);
    }
    return init;
  });

  const handleChange = (id: Category, val: string) => {
    setDrafts((prev) => ({ ...prev, [id]: val }));
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      onChange({ ...budgets, [id]: num });
    } else if (val === "" || val === "0") {
      const next = { ...budgets };
      delete next[id];
      onChange(next);
    }
  };

  const activeBudgetsCount = CATEGORIES.filter((c) => budgets[c.id]).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 pt-8 pb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Control</p>
        <h1 className="text-2xl font-bold text-foreground">Presupuestos</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-2xl flex flex-col gap-4">
          <div className="bg-card border border-border rounded-2xl px-6 py-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Define un límite mensual por categoría. La app te alertará cuando te acerques o superes el límite en la pantalla de inicio.
              {activeBudgetsCount > 0 && (
                <span className="text-foreground font-medium"> {activeBudgetsCount} {activeBudgetsCount === 1 ? "presupuesto activo" : "presupuestos activos"}.</span>
              )}
            </p>
          </div>

          {CATEGORIES.map((cat) => {
            const val = drafts[cat.id] ?? "";
            const num = parseFloat(val);
            const isSet = !isNaN(num) && num > 0;
            return (
              <div key={cat.id} className="bg-card border border-border rounded-2xl px-6 py-5 flex items-center gap-4">
                <CategoryIcon id={cat.id} size={18} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Límite mensual</p>
                </div>
                <div className="flex items-center gap-2">
                  {isSet && (
                    <button
                      onClick={() => handleChange(cat.id, "")}
                      className="text-xs text-muted-foreground hover:text-[#ef4444] transition-colors px-2 py-1 rounded-lg hover:bg-[#ef4444]/10"
                    >
                      Quitar
                    </button>
                  )}
                  <div className={`flex items-center gap-1 border rounded-xl px-3 py-2 transition-all ${isSet ? "border-foreground/20 bg-background" : "border-border bg-background"}`}>
                    <span className="text-sm text-muted-foreground font-light">$</span>
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => handleChange(cat.id, e.target.value)}
                      placeholder="Sin límite"
                      className="w-28 text-sm font-semibold text-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground/50 placeholder:font-normal"
                    />
                  </div>
                  {isSet && (
                    <div className="w-5 h-5 rounded-full bg-[#16a34a]/15 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-[#16a34a]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {activeBudgetsCount > 0 && (
            <button
              onClick={() => {
                setDrafts({});
                onChange({});
              }}
              className="text-xs font-medium text-muted-foreground hover:text-[#ef4444] transition-colors text-center py-2"
            >
              Eliminar todos los presupuestos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
