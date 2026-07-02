import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Expense } from "../types";
import { CATEGORIES, CHART_COLORS, MONTHS, today } from "../lib/constants";
import { formatMXN } from "../lib/formatters";
import { filterByMonthYear, sumExpenses, computeDelta, categoryBreakdown, prevMonthYear, getCategoryAverage, getCategoryMax, getCategoryMin } from "../lib/calculations";
import { CategoryIcon } from "./CategoryHelpers";

interface SummaryScreenProps {
  expenses: Expense[];
}

export function SummaryScreen({ expenses }: SummaryScreenProps) {
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const filtered = filterByMonthYear(expenses, viewMonth, viewYear);
  const { month: prevM, year: prevY } = prevMonthYear(viewMonth, viewYear);
  const prevFiltered = filterByMonthYear(expenses, prevM, prevY);

  const total = sumExpenses(filtered);
  const prevTotal = sumExpenses(prevFiltered);
  const delta = computeDelta(total, prevTotal);

  const byCategory = categoryBreakdown(filtered, CATEGORIES as any);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-sm">
        <p className="font-semibold text-foreground">{payload[0].name}</p>
        <p className="text-muted-foreground">{formatMXN(payload[0].value)}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-8 pt-8 pb-6">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Análisis</p>
          <h1 className="text-2xl font-bold text-foreground">Resumen mensual</h1>
        </div>
        <div className="bg-card border border-border rounded-xl flex items-center gap-1 px-1 py-1">
          <button onClick={prevMonth} aria-label="Mes anterior" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"><ChevronLeft size={16} /></button>
          <span className="text-sm font-semibold text-foreground px-3 min-w-[140px] text-center">{MONTHS[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth} aria-label="Mes siguiente" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"><ChevronRight size={16} /></button>
        </div>
      </div>

      {byCategory.length > 0 ? (
        <div className="flex-1 overflow-hidden px-8 pb-8 grid grid-cols-[1fr_380px] gap-6">
          <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center p-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Total gastado</p>
            <p className="text-4xl font-bold text-foreground mb-1">{formatMXN(total)}</p>
            {delta !== null && (
              <p className={`text-xs font-medium mb-4 ${delta > 0 ? "text-[#ef4444]" : "text-[#16a34a]"}`}>
                {delta > 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% vs {MONTHS[prevM]}
              </p>
            )}
            <div className="grid w-full grid-cols-1 gap-3 mb-4 sm:grid-cols-3">
              {CATEGORIES.map((cat) => {
                const avg = getCategoryAverage(expenses, cat.id);
                const max = getCategoryMax(expenses, cat.id);
                const min = getCategoryMin(expenses, cat.id);
                return (
                  <div key={cat.id} className="rounded-2xl bg-muted px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-2">{cat.label}</p>
                    <p className="text-sm font-semibold text-foreground">{formatMXN(avg)}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Promedio</p>
                    <div className="mt-3 text-[10px] text-muted-foreground grid grid-cols-2 gap-2">
                      <span>Máx. {formatMXN(max)}</span>
                      <span className="text-right">Min. {formatMXN(min)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={byCategory} dataKey="amount" nameKey="label" cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={3} strokeWidth={0}>
                  {byCategory.map((entry) => <Cell key={entry.id} fill={CHART_COLORS[entry.id]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-4">{filtered.length} transacciones este mes</p>
          </div>
          <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Por categoría</p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {byCategory.map((cat) => (
                <div key={cat.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[cat.id] }} />
                  <CategoryIcon id={cat.id} size={14} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{cat.label}</p>
                    <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${cat.pct}%`, background: CHART_COLORS[cat.id] }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-foreground">{formatMXN(cat.amount)}</p>
                    <p className="text-xs text-muted-foreground">{cat.pct.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <BarChart2 size={28} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Sin gastos en {MONTHS[viewMonth]} {viewYear}</p>
        </div>
      )}
    </div>
  );
}
