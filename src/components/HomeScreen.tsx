import { useState } from "react";
import { Download, Plus, Filter, ChevronLeft, ChevronRight, Calendar, AlertTriangle, Trash2, Pencil } from "lucide-react";
import type { Category, Expense, Budgets } from "../types";
import { CATEGORIES, CHART_COLORS, MONTHS, today } from "../lib/constants";
import { formatMXN, formatDate } from "../lib/formatters";
import { filterByMonthYear, sumExpenses, categoryTotalsForMonth, getTopCategoryFromBreakdown } from "../lib/calculations";
import { exportCSV } from "../lib/csv";
import { CategoryIcon, CategoryBadge, getCatInfo } from "./CategoryHelpers";

interface HomeScreenProps {
  expenses: Expense[];
  budgets: Budgets;
  onAdd: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

export function HomeScreen({ expenses, budgets, onAdd, onEdit, onDelete }: HomeScreenProps) {
  const [filterMonth, setFilterMonth] = useState(today.getMonth());
  const [filterYear, setFilterYear] = useState(today.getFullYear());
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const monthExpenses = filterByMonthYear(expenses, filterMonth, filterYear);

  const displayExpenses = showAllMonths
    ? [...expenses].sort((a, b) => b.date.localeCompare(a.date))
    : [...monthExpenses].sort((a, b) => b.date.localeCompare(a.date));

  const total = sumExpenses(monthExpenses);
  const catTotals = categoryTotalsForMonth(monthExpenses, CATEGORIES);
  const topCat = getTopCategoryFromBreakdown(catTotals, budgets);

  const activeBudgets = CATEGORIES.filter((c) => budgets[c.id]);

  const prevMonth = () => {
    if (filterMonth === 0) {
      setFilterMonth(11);
      setFilterYear((y) => y - 1);
    } else {
      setFilterMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (filterMonth === 11) {
      setFilterMonth(0);
      setFilterYear((y) => y + 1);
    } else {
      setFilterMonth((m) => m + 1);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-8 pt-8 pb-5">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Panel principal</p>
          <h1 className="text-2xl font-bold text-foreground">Mis gastos</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV(expenses)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Download size={13} />Exportar CSV
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Plus size={16} />Agregar gasto
          </button>
        </div>
      </div>

      <div className="px-8 grid grid-cols-3 gap-4 mb-4">
        <div className="bg-foreground text-primary-foreground rounded-2xl px-6 py-5">
          <p className="text-xs font-medium opacity-60 mb-1">Total · {MONTHS[filterMonth]}</p>
          <p className="text-3xl font-bold tracking-tight">{formatMXN(total)}</p>
          <p className="text-xs opacity-40 mt-2">{monthExpenses.length} transacciones</p>
        </div>
        <div className="bg-card border border-border rounded-2xl px-6 py-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Categoría top</p>
          {topCat?.sum > 0 ? (
            <>
              <p className="text-xl font-bold text-foreground mt-1">{topCat.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{formatMXN(topCat.sum)}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground mt-3">Sin datos</p>
          )}
        </div>
        <div className="bg-card border border-border rounded-2xl px-6 py-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Promedio por gasto</p>
          <p className="text-xl font-bold text-foreground mt-1">
            {monthExpenses.length > 0 ? formatMXN(total / monthExpenses.length) : "—"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">este mes</p>
        </div>
      </div>

      {activeBudgets.length > 0 && (
        <div className="px-8 mb-4">
          <div className="bg-card border border-border rounded-2xl px-5 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Presupuestos · {MONTHS[filterMonth]}</p>
            <div className="grid grid-cols-3 gap-3">
              {activeBudgets.map((cat) => {
                const spent = monthExpenses.filter((e) => e.category === cat.id).reduce((sum, expense) => sum + expense.amount, 0);
                const budget = budgets[cat.id]!;
                const pct = Math.min((spent / budget) * 100, 100);
                const over = spent > budget;
                const warn = pct >= 80;
                return (
                  <div key={cat.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CategoryIcon id={cat.id} size={12} />
                        <span className="text-xs font-medium text-foreground">{cat.label}</span>
                        {over && <AlertTriangle size={11} className="text-[#ef4444]" />}
                        {warn && !over && <AlertTriangle size={11} className="text-[#f59e0b]" />}
                      </div>
                      <span className={`text-xs font-semibold ${over ? "text-[#ef4444]" : warn ? "text-[#f59e0b]" : "text-muted-foreground"}`}>
                        {formatMXN(spent)} / {formatMXN(budget)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: over ? "#ef4444" : warn ? "#f59e0b" : CHART_COLORS[cat.id] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="px-8 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-muted-foreground" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {showAllMonths ? "Todos los gastos" : `${MONTHS[filterMonth]} ${filterYear}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!showAllMonths && (
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg px-1 py-0.5">
              <button onClick={prevMonth} aria-label="Mes anterior" className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft size={13} /></button>
              <span className="text-xs font-medium text-foreground px-1">{MONTHS[filterMonth].slice(0, 3)} {filterYear}</span>
              <button onClick={nextMonth} aria-label="Mes siguiente" className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"><ChevronRight size={13} /></button>
            </div>
          )}
          <button
            onClick={() => setShowAllMonths(!showAllMonths)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${showAllMonths ? "bg-foreground text-primary-foreground border-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"}`}
          >
            {showAllMonths ? "Ver mes" : "Ver todos"}
          </button>
        </div>
      </div>

      <div className="px-8 flex-1 overflow-y-auto pb-8">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-6 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Descripción</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Categoría</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Calendar size={11} />Fecha</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-right">Monto</p>
            <div />
          </div>

          {displayExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <Calendar size={22} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Sin gastos en {MONTHS[filterMonth]} {filterYear}</p>
              <button onClick={onAdd} className="text-xs font-medium text-foreground underline underline-offset-2">Agregar el primero</button>
            </div>
          ) : (
            displayExpenses.map((exp, i) => (
              <div
                key={exp.id}
                className={`grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-6 py-3.5 items-center transition-colors hover:bg-muted/50 ${i < displayExpenses.length - 1 ? "border-b border-border" : ""}`}
                onMouseEnter={() => setHoveredRow(exp.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon id={exp.category} size={15} />
                  <span className="text-sm font-medium text-foreground truncate">{exp.note || getCatInfo(exp.category).label}</span>
                </div>
                <CategoryBadge id={exp.category} />
                <p className="text-sm text-muted-foreground">{formatDate(exp.date)}</p>
                <p className="text-sm font-semibold text-[#ef4444] text-right">-{formatMXN(exp.amount)}</p>
                <div className="flex items-center justify-end gap-1">
                  {hoveredRow === exp.id && (
                    <>
                      <button
                        onClick={() => onEdit(exp)}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                        title="Editar"
                        aria-label="Editar gasto"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(exp.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all"
                        title="Eliminar"
                        aria-label="Eliminar gasto"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-11 h-11 rounded-2xl bg-[#ef4444]/10 flex items-center justify-center">
                <Trash2 size={20} className="text-[#ef4444]" />
              </div>
              <p className="text-sm font-semibold text-foreground">¿Eliminar este gasto?</p>
              <p className="text-xs text-muted-foreground">Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDelete(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="flex-1 h-10 rounded-xl bg-[#ef4444] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
