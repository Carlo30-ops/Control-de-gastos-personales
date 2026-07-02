import type { ComponentType } from "react";
import { Home, BarChart2, Target, Moon, Sun, TrendingDown } from "lucide-react";
import { MONTHS, today } from "../lib/constants";

type Screen = "home" | "summary" | "budgets";

interface SidebarProps {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

export function Sidebar({ screen, setScreen, isDark, toggleDarkMode }: SidebarProps) {
  const nav: { id: Screen; label: string; Icon: ComponentType<{ size?: number; className?: string }> }[] = [
    { id: "home", label: "Inicio", Icon: Home },
    { id: "summary", label: "Resumen", Icon: BarChart2 },
    { id: "budgets", label: "Presupuestos", Icon: Target },
  ];

  return (
    <aside className="w-56 flex-shrink-0 bg-card border-r border-border flex flex-col h-full">
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
            <TrendingDown size={14} className="text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight">GastOS</span>
        </div>
      </div>
      <nav className="flex-1 px-3">
        {nav.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setScreen(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
              screen === id ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{MONTHS[today.getMonth()]} {today.getFullYear()}</p>
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          title={isDark ? "Modo claro" : "Modo oscuro"}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </aside>
  );
}
