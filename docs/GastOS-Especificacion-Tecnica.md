# GastOS — Especificación Técnica de Implementación

> Documento generado a partir del código fuente en `src/app/App.tsx` y `src/styles/theme.css`.
> **Versión 2.0 — Julio 2026.** Actualizado tras implementación de: persistencia localStorage, edición/eliminación de gastos, pantalla de presupuestos, alertas de presupuesto, filtro de mes en Home, comparativa vs mes anterior, exportación CSV y modo oscuro.

---

## 1. Resumen Ejecutivo

**GastOS** es una PWA de control de gastos personales construida en React 18 + TypeScript. Permite registrar, editar y eliminar gastos manualmente o mediante lectura OCR de tickets, definir presupuestos mensuales por categoría con alertas visuales, y analizar la distribución por categoría mediante gráficas interactivas. Todos los datos persisten en `localStorage`. No hay backend ni autenticación. Todo el procesamiento ocurre en el navegador.

**Problema:** Las herramientas de finanzas personales exigen vincular cuentas bancarias o aprender metodologías complejas. El MVP anterior perdía todos los datos al recargar la página.

**Público objetivo:** Personas de 22–40 años, freelancers y estudiantes que quieren control financiero sin fricción de configuración.

---

## 2. Inventario de Pantallas y Modales

### 2.1 `HomeScreen` — Pantalla principal

**Ruta de estado:** `screen === "home"`

**Elementos contenidos:**

| Zona | Elemento | Detalle |
|---|---|---|
| Header | Eyebrow + `h1` | `"Panel principal"` / `"Mis gastos"`, `text-2xl font-bold` |
| Header | Botón "Exportar CSV" | `text-xs`, border secundario, ícono `Download`. Llama a `exportCSV(expenses)`. |
| Header | Botón "Agregar gasto" | Primario, ícono `Plus`. Abre `AddModal`. |
| Stat cards | Card oscura (1/3) | Total del mes filtrado en `text-3xl font-bold`, `bg-foreground`. Muestra `MONTHS[filterMonth]` en eyebrow. |
| Stat cards | Card neutra (2/3) | Categoría top del mes. Si no hay datos: `"Sin datos"`. |
| Stat cards | Card neutra (3/3) | Promedio por gasto (`total / count`). Si vacío: `"—"`. |
| Presupuestos | Sección condicional | Visible solo cuando `activeBudgets.length > 0`. Grid 3 columnas con barra de progreso por categoría. |
| Presupuestos | Barra de progreso | Verde normal, ámbar (`#f59e0b`) al ≥80%, rojo (`#ef4444`) al superar. `AlertTriangle` en el label. |
| Controles tabla | Selector de mes | `[ChevronLeft] [MES YYYY] [ChevronRight]`. Solo visible cuando `!showAllMonths`. |
| Controles tabla | Toggle "Ver todos" | Activo: `bg-foreground text-primary-foreground`. Inactivo: borde secundario. |
| Tabla | Header 5 columnas | `grid-cols-[2fr_1fr_1fr_1fr_40px]`: Descripción / Categoría / Fecha / Monto / Acciones |
| Tabla | Filas de gastos | `CategoryIcon` + nota, `CategoryBadge`, fecha, monto `-$` en `#ef4444`. En hover: íconos `Pencil` y `Trash2`. |
| Tabla | Empty state | `Calendar` ícono en `bg-muted` + texto + link "Agregar el primero". Aparece cuando `displayExpenses.length === 0`. |
| Modal borrado | Confirmación | Mini-modal centrado con `Trash2` rojo, texto de aviso, botones Cancelar y Eliminar (rojo). |

**Estado local:**
```ts
const [filterMonth, setFilterMonth] = useState(today.getMonth());
const [filterYear, setFilterYear] = useState(today.getFullYear());
const [showAllMonths, setShowAllMonths] = useState(false);
const [hoveredRow, setHoveredRow] = useState<number | null>(null);
const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
```

**Cálculos en render:**
- `monthExpenses`: filtrado por `filterMonth` / `filterYear`.
- `displayExpenses`: si `showAllMonths`, todos los gastos ordenados por fecha desc. Si no, `monthExpenses` ordenados.
- `total`: suma de `amount` de `monthExpenses`.
- `catTotals`: suma por categoría en `monthExpenses`, ordenado desc.
- `activeBudgets`: categorías donde `budgets[id]` es un número definido.

---

### 2.2 `SummaryScreen` — Resumen mensual

**Ruta de estado:** `screen === "summary"`

**Elementos contenidos:**

| Zona | Elemento | Detalle |
|---|---|---|
| Header | Month selector | `[ChevronLeft] [MES YYYY] [ChevronRight]` en `bg-card border rounded-xl`. Label `min-w-[140px]`. |
| Panel izquierdo | Total + delta | `text-4xl font-bold` + línea de comparativa vs mes anterior: `▲ X%` en `#ef4444` o `▼ X%` en `#16a34a`. Solo visible si `prevTotal > 0`. |
| Panel izquierdo | Gráfica de dona | `PieChart` recharts, `innerRadius=80`, `outerRadius=120`, `paddingAngle=3`, `strokeWidth=0`. `ResponsiveContainer height={280}`. |
| Panel derecho | Leyenda por categoría | Dot de color + `CategoryIcon` + nombre + barra de progreso + monto + %. Ordenado por monto desc. |
| Empty state | Estado vacío | `BarChart2 size=28` en `bg-muted rounded-2xl` + texto. |

**Layout:** `grid grid-cols-[1fr_380px] gap-6`. Panel derecho fijo en 380px.

**Cálculos en render:**
```ts
// Mes actual
const filtered = makeFiltered(viewMonth, viewYear);
// Mes anterior (para delta)
const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
const prevFiltered = makeFiltered(prevM, prevY);
// Delta porcentual
const delta = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : null;
```

**Estado local:**
```ts
const [viewMonth, setViewMonth] = useState(today.getMonth());
const [viewYear, setViewYear] = useState(today.getFullYear());
```

---

### 2.3 `BudgetsScreen` — Presupuestos

**Ruta de estado:** `screen === "budgets"`  
**Propósito:** Configurar límites mensuales por categoría. Los cambios se guardan en tiempo real vía `onChange(budgets)`.

**Elementos contenidos:**

| Elemento | Detalle |
|---|---|
| Card informativo | Descripción del funcionamiento + contador de presupuestos activos (`text-foreground font-medium`). |
| Fila por categoría (×6) | `CategoryIcon size=18` + nombre + sublabel "Límite mensual" + botón "Quitar" (visible si hay valor) + input `$` + checkmark verde. |
| Input de presupuesto | `type="number"`, `w-28`, sin borde propio, contenedor `border rounded-xl`. Placeholder `"Sin límite"`. |
| Checkmark | `w-5 h-5 rounded-full bg-[#16a34a]/15` + `Check size=11 text-[#16a34a]`. Solo visible cuando `isSet`. |
| Link "Eliminar todos" | Solo visible cuando `activeBudgetsCount > 0`. Limpia `budgets` y `drafts`. |

**Estado local:**
```ts
// Inicializado desde budgets prop para que los inputs sean controlados
const [drafts, setDrafts] = useState<Partial<Record<Category, string>>>(() => { ... });
```

**Lógica:** `handleChange(id, val)` actualiza `drafts` y llama a `onChange` con el nuevo mapa de presupuestos. Si `val` es vacío o `"0"`, elimina la clave del mapa.

---

### 2.4 `AddModal` — Agregar / Editar gasto

**Disparador:** Botón "Agregar gasto" (nuevo) o ícono lápiz en fila (editar).  
**Tipo:** Modal fullscreen con overlay `bg-foreground/20 backdrop-blur-sm`.  
**Ancho:** `max-w-lg`.

**Diferencias modo editar vs. nuevo:**

| Aspecto | Modo nuevo | Modo editar |
|---|---|---|
| Título | `"Nuevo gasto"` | `"Editar gasto"` |
| Botón "Leer factura" | Visible | Oculto |
| Banner OCR | Visible si `prefill?.amount` | Nunca visible |
| Botón CTA | `"Guardar"` | `"Guardar cambios"` |
| `amount` inicial | `prefill?.amount \|\| ""` | `String(editExpense.amount)` |
| `onSave` llama con | `editId = undefined` | `editId = editExpense.id` |

**Props:**
```ts
{
  onSave: (e: Omit<Expense, "id">, editId?: number) => void;
  onClose: () => void;
  prefill?: Partial<{ amount: string; category: Category; note: string }>;
  editExpense?: Expense;
}
```

**Si `showScanner === true`:** Renderiza `<ScanModal>` en lugar del formulario (swap completo, no superposición).

---

### 2.5 `ScanModal` — Lector OCR

Igual que v1.0. Ver máquina de estados `idle → scanning → done/error`.  
**Cambio v2.0:** Acepta solo `image/*` (removido soporte PDF por limitación de Tesseract). El `accept` del input es `"image/*"`.

---

## 3. Componentes de UI Identificados

### 3.1 `Sidebar`

**Props:**
```ts
{ screen: Screen; setScreen: (s: Screen) => void; isDark: boolean; setIsDark: (v: boolean) => void }
```

**Estructura:**
```
[Logo: ícono TrendingDown 28×28 + label "GastOS"]
[Nav: Inicio (Home), Resumen (BarChart2), Presupuestos (Target)]
[Footer: fecha actual + toggle Moon/Sun]
```

**Nav item variantes:** igual que v1.0 (activo: `bg-foreground text-primary-foreground`).

**Toggle dark mode:** `p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted`. Ícono `Moon` en light, `Sun` en dark.

---

### 3.2 `CategoryIcon`

Sin cambios respecto a v1.0.
```ts
function CategoryIcon({ id: Category, size?: number = 16 })
// width = height = size + 18
// background: CHART_COLORS[id] + "18"
// color: CHART_COLORS[id]
```

---

### 3.3 `CategoryBadge` *(nuevo componente)*

Extraído de inline en v1.0 a componente reutilizable:
```tsx
function CategoryBadge({ id }: { id: Category }) // → <span rounded-full>
```
Mismos estilos que el badge anterior: `text-xs font-medium px-2.5 py-1 rounded-full`.

---

### 3.4 `useLocalStorage<T>` *(nuevo hook)*

```ts
function useLocalStorage<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>]
```

- Inicializa con `JSON.parse(localStorage.getItem(key))` o `initial` si no existe o falla.
- Sincroniza con `localStorage` en cada cambio vía `useEffect`.
- Manejo de errores con `try/catch` en lectura y escritura.

---

### 3.5 `exportCSV(expenses: Expense[])` *(nueva función)*

```ts
// Header: "Fecha,Categoría,Nota,Monto"
// Rows: ordenadas por date desc
// Descarga via URL.createObjectURL + anchor click
// Nombre de archivo: "gastos-YYYY-MM-DD.csv"
```

---

### 3.6 Botones

| Variante | Clases clave | Usos v2.0 |
|---|---|---|
| Primario | `bg-foreground text-primary-foreground rounded-xl hover:opacity-90 active:scale-[0.98]` | "Agregar gasto", "Guardar", "Guardar cambios", "Usar datos" |
| Destructivo | `bg-[#ef4444] text-white rounded-xl hover:opacity-90 active:scale-[0.98]` | "Eliminar" en confirmación de borrado |
| Secundario borde | `border border-border text-muted-foreground rounded-xl hover:text-foreground` | "Cancelar", "Escanear otra", "Exportar CSV" |
| Pequeño acción | `bg-muted border border-border rounded-lg text-xs px-3 py-1.5` | "Leer factura" |
| Ícono ghost | Sin fondo, `text-muted-foreground hover:text-foreground` | X, flechas de mes |
| Ícono destructivo | `hover:text-[#ef4444] hover:bg-[#ef4444]/10` | `Trash2` en fila de gasto |
| Toggle activo | `bg-foreground text-primary-foreground border-foreground` | "Ver todos" activo |

---

### 3.7 Sección de alertas de presupuesto

```tsx
// Aparece en HomeScreen cuando activeBudgets.length > 0
// bg-card border rounded-2xl px-5 py-4
// grid grid-cols-3 gap-3 (una celda por categoría activa)
// Por celda:
//   - header: CategoryIcon size=12 + label + AlertTriangle (warn/over)
//   - monto: "gastado / límite" coloreado
//   - barra: h-1.5 bg-muted rounded-full → fill dinámico
```

**Lógica de colores de barra:**
```ts
const barColor = over ? "#ef4444" : warn ? "#f59e0b" : CHART_COLORS[cat.id];
// over = spent > budget
// warn = pct >= 80
```

---

### 3.8 Modal de confirmación de borrado

```tsx
// fixed inset-0 z-50, mismo overlay que otros modales
// max-w-sm, p-6, centrado
// Ícono: w-11 h-11 rounded-2xl bg-[#ef4444]/10 + Trash2 size=20
// Botones: flex gap-2 → Cancelar (borde) + Eliminar (bg-[#ef4444])
```

---

## 4. Sistema de Diseño

### 4.1 Paleta de colores

Sin cambios respecto a v1.0. Tokens en `theme.css`:

| Token | Valor (light) | Uso |
|---|---|---|
| `--background` | `#f7f7f6` | Fondo de página |
| `--foreground` | `#18181b` | Texto principal, botón primario, card oscura |
| `--card` | `#ffffff` | Cards, sidebar, modales |
| `--muted` | `#f0f0ef` | Superficies subdued, hover |
| `--muted-foreground` | `#8a8a8e` | Labels, placeholders |
| `--border` | `rgba(0,0,0,0.07)` | Bordes |
| `--destructive` | `#ef4444` | Botón eliminar, montos negativos |

**Colores de categoría:** sin cambios.

**Nuevos colores funcionales v2.0:**

| Uso | Valor |
|---|---|
| Barra presupuesto — advertencia | `#f59e0b` (ámbar, ≥80%) |
| Barra presupuesto — excedido | `#ef4444` (rojo, >100%) |
| Botón eliminar | `#ef4444` (background sólido) |
| Delta positivo en Resumen (gasto subió) | `#ef4444` |
| Delta negativo en Resumen (gasto bajó) | `#16a34a` |

---

### 4.2 Tipografía

Sin cambios respecto a v1.0. Fuente `Inter` vía Google Fonts.

---

### 4.3 Modo oscuro

**Activación:** clase `.dark` en el div raíz de `App`.
```tsx
<div className={isDark ? "dark" : ""} style={{ height: "100dvh" }}>
```
**Tokens `.dark`:** definidos en `theme.css` (fondo `oklch(0.145 0 0)`, foreground `oklch(0.985 0 0)`, etc.). No se modificaron.

**Persistencia:** `useLocalStorage<boolean>("gastos-dark", false)`.

---

## 5. Flujo de Navegación

```
App (root)
├── Sidebar [siempre visible]
│   ├── "Inicio"         → screen = "home"     [HomeScreen]
│   ├── "Resumen"        → screen = "summary"  [SummaryScreen]
│   ├── "Presupuestos"   → screen = "budgets"  [BudgetsScreen]
│   └── Toggle Moon/Sun  → isDark toggle
│
├── HomeScreen
│   ├── "Agregar gasto"   → showAdd=true, editExpense=undefined → AddModal (nuevo)
│   ├── Ícono Pencil fila → showAdd=true, editExpense=Expense   → AddModal (editar)
│   ├── Ícono Trash2 fila → confirmDelete=id → Modal confirmación
│   │   ├── "Cancelar"   → confirmDelete=null
│   │   └── "Eliminar"   → deleteExpense(id), confirmDelete=null
│   ├── ChevronLeft/Right → filterMonth/filterYear (local state)
│   └── Toggle "Ver todos" → showAllMonths toggle
│
├── AddModal
│   ├── "Leer factura" (solo modo nuevo) → ScanModal [swap de render]
│   │   └── "Usar datos" → handleScan(result) → AddModal con prefill
│   ├── "Guardar" (nuevo)  → saveExpense(data, undefined) → expenses prepend
│   ├── "Guardar cambios" (editar) → saveExpense(data, id) → expenses.map replace
│   └── "Cancelar" / X / overlay → showAdd=false
│
├── SummaryScreen
│   └── ChevronLeft/Right → viewMonth/viewYear (local state)
│
└── BudgetsScreen
    └── Input por categoría → onChange(budgets) en tiempo real → localStorage sync
```

---

## 6. Estados de UI Implementados

### 6.1 `HomeScreen`

| Estado | Condición | Renderizado |
|---|---|---|
| Con gastos en mes | `displayExpenses.length > 0` | Tabla completa |
| Sin gastos en mes | `displayExpenses.length === 0` | Empty state con CTA |
| Con presupuestos | `activeBudgets.length > 0` | Sección de alertas visible |
| Sin presupuestos | `activeBudgets.length === 0` | Sección de alertas oculta |
| Hover en fila | `hoveredRow === exp.id` | Íconos Pencil + Trash2 visibles |
| Confirmando borrado | `confirmDelete !== null` | Modal de confirmación |
| Viendo todos los meses | `showAllMonths === true` | Selector de mes oculto, toggle activo |

### 6.2 `SummaryScreen`

| Estado | Condición | Renderizado |
|---|---|---|
| Con datos + prevTotal > 0 | — | Gráfica + delta ▲/▼ |
| Con datos + prevTotal = 0 | Primer mes con gastos | Gráfica sin delta |
| Sin datos | `byCategory.length === 0` | Empty state |

### 6.3 `BudgetsScreen`

| Estado | Condición | Renderizado |
|---|---|---|
| Categoría sin presupuesto | `!isSet` | Input vacío, sin checkmark, sin botón "Quitar" |
| Categoría con presupuesto | `isSet` | Checkmark verde, botón "Quitar" visible |
| Ningún presupuesto activo | `activeBudgetsCount === 0` | Sin link "Eliminar todos" |
| Al menos uno activo | `activeBudgetsCount > 0` | Link "Eliminar todos" visible, contador en descripción |

### 6.4 `AddModal`

| Estado | Condición | Renderizado |
|---|---|---|
| Modo nuevo | `editExpense === undefined` | Título "Nuevo gasto", botón "Leer factura" visible |
| Modo editar | `editExpense !== undefined` | Título "Editar gasto", sin botón OCR, campos pre-cargados |
| Con prefill OCR | `prefill?.amount` definido | Banner verde con `Sparkles` |
| Guardar disabled | `!amount \|\| parseFloat(amount) <= 0` | Opacity 30% |

### 6.5 `ScanModal`

Sin cambios respecto a v1.0. Estados: `idle / scanning / done / error`.

---

## 7. Modelo de Datos

### `Expense`

```ts
interface Expense {
  id: number;       // Date.now() en creación, integer en seed data
  amount: number;   // MXN, positivo, decimal permitido
  category: Category;
  date: string;     // "YYYY-MM-DD"
  note: string;     // Texto libre, puede ser ""
}
```

### `Category`

```ts
type Category = "comida" | "transporte" | "servicios" | "ocio" | "salud" | "otros";
```

### `Budgets` *(nuevo en v2.0)*

```ts
type Budgets = Partial<Record<Category, number>>;
// Las categorías sin límite no tienen key en el objeto.
// Ejemplo: { comida: 2500, transporte: 800 }
```

### `ScanResult` (efímero)

Sin cambios respecto a v1.0.

### Estado global de App

```ts
const [screen, setScreen] = useState<Screen>("home");
const [expenses, setExpenses] = useLocalStorage<Expense[]>("gastos-expenses", SEED_EXPENSES);
const [budgets, setBudgets]   = useLocalStorage<Budgets>("gastos-budgets", {});
const [isDark, setIsDark]     = useLocalStorage<boolean>("gastos-dark", false);
const [showAdd, setShowAdd]   = useState(false);
const [editExpense, setEditExpense] = useState<Expense | undefined>();
const [prefill, setPrefill]   = useState<Partial<{amount:string; category:Category; note:string}> | undefined>();
```

**Persistencia:** `expenses`, `budgets` e `isDark` se sincronizan con `localStorage` automáticamente vía `useLocalStorage`.

---

## 8. Funcionalidades por Fase

### 8.1 MVP v2.0 — Implementado y funcional

| Funcionalidad | Estado | Clave de implementación |
|---|---|---|
| Registro manual de gastos | ✅ | `AddModal` → `saveExpense()` |
| **Edición de gastos** | ✅ **Nuevo** | `editExpense` prop en `AddModal`, `expenses.map` con replace |
| **Eliminación con confirmación** | ✅ **Nuevo** | `confirmDelete` state → modal → `expenses.filter` |
| **Persistencia localStorage** | ✅ **Nuevo** | Hook `useLocalStorage<T>` en `expenses`, `budgets`, `isDark` |
| **Presupuestos por categoría** | ✅ **Nuevo** | `BudgetsScreen` + `Budgets` type + `useLocalStorage` |
| **Alertas de presupuesto en Home** | ✅ **Nuevo** | Sección condicional con barras y colores de alerta |
| **Filtro de mes en Home** | ✅ **Nuevo** | `filterMonth/Year` state + toggle `showAllMonths` |
| **Empty state en tabla** | ✅ **Nuevo** | Render condicional cuando `displayExpenses.length === 0` |
| **Comparativa vs mes anterior** | ✅ **Nuevo** | `delta` calculado desde `prevFiltered` en `SummaryScreen` |
| **Exportación CSV** | ✅ **Nuevo** | `exportCSV()` con `Blob` + `URL.createObjectURL` |
| **Modo oscuro** | ✅ **Nuevo** | Clase `.dark` en root div + toggle en sidebar |
| 6 categorías predefinidas | ✅ | Enum fijo |
| Total mensual | ✅ | Calculado en render |
| Gráfica de dona | ✅ | Recharts `PieChart` |
| Leyenda por categoría | ✅ | Con barras de progreso proporcionales |
| Selector de mes en Resumen | ✅ | Navegación infinita |
| OCR de facturas (imágenes) | ✅ | Tesseract.js `spa+eng` |
| Pre-relleno de formulario desde OCR | ✅ | `prefill` prop |

### 8.2 No implementado — Pendiente para fases futuras

| Funcionalidad | Complejidad | Notas |
|---|---|---|
| Gastos recurrentes | Media | Requiere campo `isRecurring` + lógica de sugerencia mensual |
| Gráfica multi-mes | Media | Recharts `BarChart` con últimos 6 meses |
| Categorías personalizables | Media | Requiere estado de categorías dinámico |
| Exportación PDF | Media | `jsPDF` + `html2canvas` |
| Eliminación de datos semilla | Baja | Botón "Limpiar datos de ejemplo" en primer uso |
| Paginación de tabla | Baja | La tabla crece sin límite |
| Soporte PDF en OCR | Alta | Requiere `pdf.js` para rasterizar antes de Tesseract |
| Registro de ingresos | Media | Nueva entidad `Income`, nueva pantalla |
| Metas de ahorro | Media | Nueva entidad `SavingGoal` |
| Sincronización en nube | Alta | Supabase Auth + PostgreSQL |
| Multi-moneda | Baja | Parametrizar `formatMXN` |
| Notificaciones push | Alta | Web Push API + service worker |

---

## 9. Stack Técnico Actual

| Capa | Tecnología | Versión / Notas |
|---|---|---|
| Framework | React 18 + TypeScript | Hooks: `useState`, `useEffect`, `useRef`, `useCallback` |
| Build | Vite | `vite.config.ts` |
| Estilos | Tailwind CSS v4 | Tokens en `theme.css` con `@theme inline`. Modo oscuro con `.dark`. |
| Fuente | Inter | Google Fonts, `fonts.css` |
| Gráficas | Recharts | `PieChart`, `Pie`, `Cell`, `Tooltip`, `ResponsiveContainer` |
| Íconos | Lucide React | Tree-shaken. 25+ íconos en uso. |
| OCR | Tesseract.js | `spa+eng`, WASM en browser. Solo imágenes (no PDF). |
| Persistencia | `localStorage` | Hook personalizado `useLocalStorage<T>`. 3 claves: `gastos-expenses`, `gastos-budgets`, `gastos-dark`. |
| Router | Ninguno | Navegación con `useState`: `"home" \| "summary" \| "budgets"` |
| Estado global | React `useState` | Sin Zustand, Redux ni Context |
| Backend | Ninguno | 100% client-side |
| Package manager | pnpm | `pnpm-workspace.yaml` |

---

*Versión 2.0 — Julio 2026. Generado desde análisis estático de `src/app/App.tsx` + `src/styles/theme.css`.*
