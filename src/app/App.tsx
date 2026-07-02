import { useState } from "react";
import type { Expense, Budgets } from "../types";
import { CATEGORIES, SEED_EXPENSES } from "../lib/constants";
import { useExpenses } from "../hooks/useExpenses";
import { useBudgets } from "../hooks/useBudgets";
import { useDarkMode } from "../hooks/useDarkMode";
import { Sidebar } from "../components/Sidebar";
import { HomeScreen } from "../components/HomeScreen";
import { SummaryScreen } from "../components/SummaryScreen";
import { BudgetsScreen } from "../components/BudgetsScreen";
import { AddExpenseModal } from "../components/AddModal";

type Screen = "home" | "summary" | "budgets";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const { isDark, toggleDarkMode } = useDarkMode();
  const { budgets, updateBudget, setBudgets } = useBudgets();
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses(CATEGORIES, SEED_EXPENSES);
  const [showAdd, setShowAdd] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | undefined>(undefined);

  const openAdd = () => {
    setEditExpense(undefined);
    setShowAdd(true);
  };

  const openEdit = (expense: Expense) => {
    setEditExpense(expense);
    setShowAdd(true);
  };

  const saveExpense = (data: Omit<Expense, "id">, editId?: number) => {
    if (editId !== undefined) {
      updateExpense(editId, data);
    } else {
      addExpense(data);
    }
    setShowAdd(false);
    setEditExpense(undefined);
  };

  const handleClose = () => {
    setShowAdd(false);
    setEditExpense(undefined);
  };

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex min-h-[100dvh] h-full bg-background overflow-hidden app-root">
        <Sidebar screen={screen} setScreen={setScreen} isDark={isDark} toggleDarkMode={toggleDarkMode} />
        <main className="flex-1 overflow-hidden">
          {screen === "home" && (
            <HomeScreen
              expenses={expenses}
              budgets={budgets}
              onAdd={openAdd}
              onEdit={openEdit}
              onDelete={deleteExpense}
            />
          )}
          {screen === "summary" && <SummaryScreen expenses={expenses} />}
          {screen === "budgets" && <BudgetsScreen budgets={budgets} onChange={setBudgets} />}
        </main>
        {showAdd && (
          <AddExpenseModal onSave={saveExpense} onClose={handleClose} editExpense={editExpense} />
        )}
      </div>
    </div>
  );
}
