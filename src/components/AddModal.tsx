import { useState } from "react";
import { ScanLine, X, Check, Sparkles } from "lucide-react";
import type { Expense, ScanResult, Category } from "../types";
import { CATEGORIES, todayStr } from "../lib/constants";
import { ScanModal } from "./ScanModal";

interface AddModalProps {
  onSave: (data: Omit<Expense, "id">, editId?: number) => void;
  onClose: () => void;
  prefill?: Partial<{ amount: string; category: Category; note: string }>;
  editExpense?: Expense;
}

export function AddExpenseModal({ onSave, onClose, prefill, editExpense }: AddModalProps) {
  const initial = editExpense ?? null;
  const [amount, setAmount] = useState(initial ? String(initial.amount) : prefill?.amount ?? "");
  const [category, setCategory] = useState<Category>(initial?.category ?? prefill?.category ?? "comida");
  const [date, setDate] = useState(initial?.date ?? todayStr);
  const [note, setNote] = useState(initial?.note ?? prefill?.note ?? "");
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = (r: ScanResult) => {
    setAmount(String(r.amount));
    setCategory(r.category);
    setNote(r.note);
    setShowScanner(false);
  };

  const handleSave = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    onSave({ amount: val, category, date, note }, initial?.id);
  };

  if (showScanner) return <ScanModal onResult={handleScan} onClose={() => setShowScanner(false)} />;

  const isEdit = !!initial;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">{isEdit ? "Editar gasto" : "Nuevo gasto"}</h2>
          <div className="flex items-center gap-2">
            {!isEdit && (
              <button onClick={() => setShowScanner(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-foreground/10 text-xs font-medium transition-all border border-border">
                <ScanLine size={13} />Leer factura
              </button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors ml-1"><X size={18} /></button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {prefill?.amount && !isEdit && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#16a34a]/10 rounded-xl border border-[#16a34a]/20">
              <Sparkles size={13} className="text-[#16a34a]" />
              <p className="text-xs font-medium text-[#16a34a]">Datos completados desde tu factura — revisa y ajusta si es necesario</p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">Monto</label>
            <div className="bg-background border border-border rounded-xl flex items-center px-4 py-3 gap-2">
              <span className="text-xl font-light text-muted-foreground">$</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" autoFocus
                className="flex-1 text-3xl font-bold text-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground/40" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">Categoría</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    category === cat.id ? "bg-foreground text-primary-foreground border-foreground" : "bg-background text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground"
                  }`}>
                  <cat.Icon size={15} />{cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">Fecha</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">Nota</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opcional"
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10" />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all">Cancelar</button>
            <button onClick={handleSave} disabled={!amount || parseFloat(amount) <= 0}
              className="flex-1 h-11 rounded-xl bg-foreground text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-30 hover:opacity-90 active:scale-[0.98] transition-all">
              <Check size={15} />{isEdit ? "Guardar cambios" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
