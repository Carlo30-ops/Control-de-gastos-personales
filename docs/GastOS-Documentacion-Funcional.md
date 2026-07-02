# GastOS — Documentación Funcional del Producto

> Versión 2.0 — Julio 2026. Actualizado tras implementación de persistencia, edición, presupuestos, modo oscuro y exportación CSV.

---

## 1. Resumen Ejecutivo

**GastOS** es una aplicación web de control de gastos personales diseñada para que cualquier persona pueda registrar, visualizar y entender en qué gasta su dinero cada mes. Sin configuraciones complejas, sin cuentas bancarias vinculadas, sin fricción. El usuario abre la app, registra un gasto en segundos —o sube una foto de su ticket para que la app lo lea automáticamente— y obtiene una visión clara de su situación financiera en tiempo real. Los datos persisten localmente entre sesiones sin necesidad de crear una cuenta.

---

## 2. Problema que Resuelve

La mayoría de las personas sabe que debería llevar un registro de sus gastos, pero no lo hace. Las razones son siempre las mismas:

- Las hojas de cálculo requieren disciplina y tiempo que nadie tiene.
- Las apps bancarias muestran movimientos pero no los explican ni los categorizan bien.
- Las apps de finanzas personales existentes (Mint, YNAB, Fintonic) son poderosas pero abrumadoras: requieren conectar cuentas, configurar presupuestos, aprender metodologías.
- El resultado: la persona abandona el intento en la primera semana.

**GastOS resuelve la fricción del primer paso.** No pide vincular ninguna cuenta. No obliga a configurar nada. Basta con registrar el gasto que acaba de ocurrir —en menos de 10 segundos— para que la app empiece a construir una imagen financiera útil.

---

## 3. Público Objetivo

| Segmento | Descripción |
|---|---|
| **Primario** | Personas de 22–40 años que quieren empezar a ordenar sus finanzas personales sin complicarse con herramientas sofisticadas. |
| **Secundario** | Freelancers y trabajadores independientes que necesitan separar gastos personales de profesionales y llevar un control mensual básico. |
| **Terciario** | Estudiantes universitarios con ingresos limitados que quieren entender en qué se va su dinero cada mes. |

**Perfil del usuario típico:** Alguien que sabe que gasta "más de la cuenta" en comida o entretenimiento, pero no sabe exactamente cuánto. No es experto en finanzas. Quiere respuestas rápidas, no metodologías.

---

## 4. Propuesta de Valor

> *"Registra un gasto en 5 segundos. Entiende tu mes en un vistazo. Sin perder nada entre sesiones."*

Lo que diferencia a GastOS de otras soluciones:

- **Cero configuración inicial.** La app funciona desde el primer segundo. Sin cuentas bancarias, sin categorías obligatorias, sin tutorial.
- **Lectura automática de facturas.** El usuario puede fotografiar cualquier ticket o factura y la app extrae el monto y la categoría automáticamente mediante OCR en el navegador — sin enviar datos a ningún servidor externo.
- **Privacidad por diseño.** Todos los datos viven en el dispositivo del usuario vía `localStorage`. Ningún dato financiero sale del navegador.
- **Presupuestos con alertas visuales.** El usuario puede definir límites mensuales por categoría y ver barras de progreso en tiempo real con alertas en ámbar (80%) y rojo (100%+).
- **CRUD completo.** Los gastos se pueden editar y eliminar (con confirmación). No hay datos atrapados.
- **Modo oscuro.** Toggle en el sidebar, persiste entre sesiones.
- **Exportación CSV.** Un click descarga el historial completo en formato compatible con Excel y Google Sheets.
- **Progressive Web App.** Funciona en cualquier dispositivo con navegador, sin necesidad de instalar nada desde una tienda de aplicaciones.

---

## 5. Funcionalidades por Fase

### Fase 1 — MVP (Implementado y en producción)

| Función | Qué hace | Problema que resuelve |
|---|---|---|
| **Registro de gastos** | Formulario rápido con monto, categoría, fecha y nota opcional. | Elimina la fricción de anotar un gasto en el momento. |
| **Edición de gastos** | Click en el ícono de lápiz sobre cualquier fila abre el modal pre-cargado con los datos existentes. | Corregir errores de captura sin borrar y rehacer. |
| **Eliminación con confirmación** | Ícono de basura en hover de fila, seguido de modal de confirmación antes de borrar. | Previene eliminaciones accidentales. |
| **Persistencia en localStorage** | Los datos de gastos, presupuestos y preferencias (modo oscuro) se guardan automáticamente y sobreviven recargas. | El problema más crítico del MVP anterior: pérdida de datos al cerrar la pestaña. |
| **Categorías predefinidas** | Comida, Transporte, Servicios, Ocio, Salud, Otros. | El usuario no tiene que pensar cómo clasificar — la app propone las categorías más comunes. |
| **Total mensual en tiempo real** | Card prominente con el total gastado en el mes actualmente filtrado. | Responde la pregunta más frecuente: "¿cuánto llevo gastado este mes?" |
| **Filtro de mes en Home** | Selector compacto de mes con flechas. Toggle "Ver todos" muestra el historial completo sin filtro. | Permite consultar cualquier mes pasado sin salir de la pantalla principal. |
| **Empty state en tabla** | Cuando el mes seleccionado no tiene gastos, aparece un estado vacío con CTA para agregar el primero. | Evita pantallas en blanco confusas. |
| **Presupuestos por categoría** | Pantalla dedicada para fijar límites mensuales por categoría. Se guardan en localStorage. | Convierte el registro en una herramienta de control activo. |
| **Alertas de presupuesto** | En Home, barras de progreso por categoría. Ámbar al 80%, rojo al superar el límite. Ícono de alerta en el nombre. | Avisa antes de que el gasto sea un problema. |
| **Gráfica de dona por categoría** | Visualización del gasto mensual distribuido por categoría con tooltip interactivo. | Revela patrones de gasto que los números solos no muestran. |
| **Comparativa vs mes anterior** | En Resumen: delta porcentual respecto al mes previo (▲ rojo si subió, ▼ verde si bajó). | Permite evaluar si el comportamiento mejora sin buscar manualmente. |
| **Lectura de facturas por OCR** | El usuario sube una imagen de su ticket; la app extrae monto, comercio y categoría usando Tesseract.js en el navegador. | Elimina el paso manual de transcribir datos de un ticket físico. |
| **Exportación CSV** | Botón en el header de Home. Descarga el historial completo ordenado por fecha. | Compatibilidad con Excel, Google Sheets y otras herramientas. |
| **Modo oscuro** | Toggle Sol/Luna en el footer del sidebar. Estado persiste en localStorage. | Usabilidad nocturna y preferencia personal. |
| **Selector de mes en Resumen** | Navega entre meses para analizar cualquier período histórico. | El usuario puede comparar su situación actual con meses pasados. |

---

### Fase 2 — Producto Completo (Planificado)

| Función | Qué hace | Problema que resuelve |
|---|---|---|
| **Gastos recurrentes** | Marcado de gastos que se repiten cada mes (renta, suscripciones). Los sugiere automáticamente al llegar la fecha. | Elimina el olvido de registrar gastos fijos. |
| **Comparativa multi-mes en gráfica** | Gráfica de barras con el total gastado por mes en los últimos 6 meses. | Permite ver tendencias a lo largo del tiempo. |
| **Estadísticas por categoría** | Promedio mensual, gasto máximo y mínimo por categoría en el período seleccionado. | Da contexto histórico para saber si un mes fue "normal" o atípico. |
| **Exportación PDF** | Reporte formateado del mes seleccionado con gráficas. | Para compartir o archivar formalmente. |
| **Categorías personalizadas** | El usuario puede crear, editar y colorear sus propias categorías. | Adaptación a patrones de gasto específicos. |

---

### Fase 3 — Plataforma Financiera Personal (Futuro)

| Función | Qué hace | Problema que resuelve |
|---|---|---|
| **Registro de ingresos** | El usuario puede anotar ingresos (salario, freelance, ventas) con fuente y fecha. | Permite calcular el balance real: ingresos menos gastos. |
| **Metas de ahorro** | El usuario define una meta y la app le muestra cuánto debe apartar por mes. | Conecta el control de gastos con un objetivo concreto. |
| **Seguimiento de deudas** | Registro de deudas con monto total, pagos realizados y fecha estimada de liquidación. | Da visibilidad a compromisos financieros que afectan el flujo mensual. |
| **Sincronización en la nube** | Los datos se sincronizan en una base de datos segura y se acceden desde cualquier dispositivo. | Elimina el riesgo de perder la información y habilita el uso multi-dispositivo. |
| **Cuenta de usuario** | Registro e inicio de sesión con email o proveedor OAuth (Google). | Habilita la sincronización y la personalización persistente entre dispositivos. |

---

## 6. Flujo de Uso Típico (User Journey)

### Escenario A: registrar desde factura fotografiada

```
1. Abre GastOS en el navegador — los datos del mes anterior siguen ahí (localStorage).
2. Ve su total del mes actual: $3,420.
3. Hace clic en "Agregar gasto" → modal.
4. Click en "Leer factura" → modal OCR.
5. Arrastra la foto del ticket de $847 de Walmart.
6. OCR procesa en ~3s: detecta $847, categoría Comida, comercio "Walmart Supercenter".
7. Click "Usar datos" → AddModal pre-rellena con banner verde de confirmación.
8. Revisa, ajusta si es necesario, click "Guardar".
9. Total actualizado a $4,267. Dato guardado en localStorage automáticamente.
```

### Escenario B: corregir un gasto registrado mal

```
1. El usuario ve en la tabla que anotó $450 en "Salud" pero era "Ocio".
2. Hover sobre la fila → aparecen íconos de lápiz y papelera.
3. Click en lápiz → modal en modo edición con datos pre-cargados.
4. Cambia la categoría a Ocio, click "Guardar cambios".
5. La tabla y las gráficas se actualizan inmediatamente.
```

### Escenario C: revisar presupuesto de comida

```
1. Navega a "Presupuestos" en el sidebar.
2. Ingresa $2,500 en el campo de Comida → checkmark verde aparece.
3. Vuelve a Inicio.
4. Ve la sección de presupuestos: barra de Comida al 65% (verde).
5. A fin de mes la barra está al 87% → color ámbar + ícono de advertencia.
```

---

## 7. Pantallas Principales

### 7.1 Home — Inicio

Pantalla central. Contiene:
- **Controles de header:** label de sección, botón "Exportar CSV" y botón "Agregar gasto".
- **3 stat cards:** Total del mes (card oscura), Categoría top, Promedio por gasto.
- **Sección de presupuestos** *(condicional)*: visible solo cuando hay al menos un presupuesto activo. Muestra barra de progreso por categoría con colores de alerta.
- **Controles de tabla:** Selector de mes compacto + toggle "Ver todos" / "Ver mes".
- **Tabla de gastos:** 5 columnas — Descripción (con `CategoryIcon`), Categoría (badge coloreado), Fecha, Monto (rojo), Acciones (lápiz + papelera en hover).
- **Empty state:** Aparece cuando el mes filtrado no tiene gastos, con CTA de agregar.
- **Modal de confirmación de borrado:** Mini-modal centrado antes de eliminar.

### 7.2 Resumen — Gráficas

Pantalla de análisis mensual. Contiene:
- **Selector de mes** con flechas, en el header derecho.
- **Panel izquierdo:** Total del mes en `text-4xl` + delta vs mes anterior (▲/▼ con color) + gráfica de dona recharts + contador de transacciones.
- **Panel derecho:** Leyenda por categoría con dot de color, `CategoryIcon`, nombre, barra de progreso proporcional, monto y porcentaje.
- **Empty state:** Ícono `BarChart2` + texto cuando el mes no tiene datos.

### 7.3 Presupuestos

Pantalla de configuración de límites. Contiene:
- **Card descriptivo:** Explicación del funcionamiento + contador de presupuestos activos.
- **Fila por categoría:** `CategoryIcon`, nombre, botón "Quitar" (visible cuando hay valor), input con prefijo `$`, checkmark verde cuando está activo.
- **Link "Eliminar todos":** Visible cuando hay al menos un presupuesto activo. Limpia todos los límites.

### 7.4 Agregar / Editar Gasto — Modal

Modal centrado con overlay blur. Contiene:
- **Header:** Título dinámico ("Nuevo gasto" / "Editar gasto") + botón "Leer factura" (solo en modo nuevo) + botón X.
- **Banner OCR** *(condicional)*: Solo visible cuando el formulario viene pre-rellenado por el escáner.
- **Input Monto:** `text-3xl font-bold` con prefijo `$`, `autoFocus`.
- **Grid de categorías:** 3×2 chips con ícono + label. Seleccionado: fondo negro. Sin seleccionar: borde gris.
- **Fecha y Nota:** 2 columnas. Fecha default = hoy.
- **Acciones:** Cancelar (borde) + Guardar / Guardar cambios (primario, disabled si monto ≤ 0).

### 7.5 Lector de Facturas — Modal Secundario

Reemplaza el render de `AddModal` cuando `showScanner === true`. Contiene los estados:
- **`idle`:** Drop zone con drag&drop. Acepta JPG, PNG.
- **`scanning`:** Preview de imagen + overlay de línea animada + 4 pasos de progreso con dots.
- **`done`:** Banner de confianza %, thumbnail, texto crudo OCR en mono, grid con monto detectado y categoría, card de comercio. Acciones: "Escanear otra" y "Usar datos detectados".
- **`error`:** Ícono rojo + texto + link "Intentar de nuevo".

---

## 8. Modelo de Datos

### `Expense`

```ts
interface Expense {
  id: number;        // Date.now() en creación
  amount: number;    // Positivo, decimal permitido, en MXN
  category: Category;
  date: string;      // "YYYY-MM-DD"
  note: string;      // Texto libre, puede ser vacío
}
```

### `Category` (enum)

```ts
type Category = "comida" | "transporte" | "servicios" | "ocio" | "salud" | "otros";
```

### `Budgets`

```ts
type Budgets = Partial<Record<Category, number>>;
// Ejemplo: { comida: 2500, transporte: 800 }
// Categorías sin límite simplemente no tienen key.
```

### Estado de aplicación (localStorage)

| Clave | Tipo | Descripción |
|---|---|---|
| `gastos-expenses` | `Expense[]` | Historial completo de gastos |
| `gastos-budgets` | `Budgets` | Límites mensuales por categoría |
| `gastos-dark` | `boolean` | Preferencia de modo oscuro |

---

## 9. Stack Técnico

### Actual (Fase 1)

| Capa | Tecnología | Notas |
|---|---|---|
| Framework UI | React 18 + TypeScript | Hooks: `useState`, `useEffect`, `useRef`, `useCallback` |
| Estilos | Tailwind CSS v4 | Tokens en `theme.css`. Modo oscuro con clase `.dark`. |
| Fuente | Inter (Google Fonts) | Importada en `fonts.css` |
| Gráficas | Recharts | `PieChart`, `Pie`, `Cell`, `Tooltip`, `ResponsiveContainer` |
| Íconos | Lucide React | Tree-shaken por ícono |
| OCR | Tesseract.js | Idiomas `spa+eng`, WASM en browser, sin backend |
| Persistencia | `localStorage` | Hook `useLocalStorage<T>` personalizado |
| Build | Vite | |
| Gestión de estado | React `useState` | Sin Zustand ni Redux |
| Router | Ninguno | Navegación por `useState` (`"home" \| "summary" \| "budgets"`) |
| Backend | Ninguno | 100% client-side |

### Planificado (Fases 2–3)

| Capa | Tecnología | Justificación |
|---|---|---|
| Backend as a Service | Supabase | Auth + PostgreSQL + Edge Functions |
| Autenticación | Supabase Auth (email + OAuth Google) | — |
| IA para OCR avanzado | Claude API vía Supabase Edge Function | Categorización con mayor precisión |
| Exportación PDF | `jsPDF` + `html2canvas` | Reportes en el cliente |
| Notificaciones | Web Push API | Alertas de presupuesto nativas |

---

## 10. Roadmap Futuro

### Corto plazo
- Gastos recurrentes con sugerencia automática mensual.
- Gráfica de barras multi-mes en pantalla Resumen.
- Categorías personalizables por el usuario.
- Exportación PDF del mes.

### Mediano plazo
- IA para categorización automática al escribir la nota ("Uber Eats" → Comida sin seleccionar).
- Comparativas inteligentes con lenguaje natural ("Gastaste 23% más en Ocio que tu promedio").
- Registro de ingresos y cálculo de balance mensual.
- Metas de ahorro con proyección mensual.
- Multi-moneda (USD, EUR además de MXN).

### Largo plazo
- Sincronización en la nube con Supabase (multi-dispositivo).
- Integración bancaria vía Open Banking (CNBV en México).
- Insights mensuales generados por IA.
- Versión colaborativa para parejas o familias.
- Integración con SAT (importación de CFDIs para deducciones fiscales).

---

*Versión 2.0 — Julio 2026. Refleja el estado actual del código en `src/app/App.tsx`.*
