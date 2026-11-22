> **Borrador interrumpido** (22-nov): la planificación se detuvo por ADR-012 (maqueta visual primero). Se retoma al interconectar P4.

# Plan 006 · P4 · Ficha de proyecto + simulador 25/75

Estado: borrador · Fecha: 2026-11-22 · Autor: arquitecto
Fuentes: `docs/planes/brief-P4.md` · `docs/01 §3, §4, §6, §8` · `docs/02 §1–§6` · maestro §4–§7, §10, §15, §17 (solo lectura) · `docs/06` · `docs/08` (D1–D7, H1–H4, K1, L1, L5, N1–N7, O1, P3-Q1…Q5) · ADR-004, ADR-010, ADR-011 · `docs/planes/005-P3-marketplace.md` · `src/modules/{projects,participations,finance}/**` · `src/composition/**` · `src/shared/ui/{README.md,layout,brand,app-shell}` · `eslint.config.mjs` · `architecture.modules.mjs` · docs de Next 16 (`03-file-conventions/dynamic-routes.md` §With Cache Components, `03-file-conventions/not-found.md`, `04-functions/not-found.md`, `04-functions/generate-static-params.md`, `02-route-segment-config/dynamicParams.md`).
Rama: `feat/participations-ficha-simulador` (la actual).

## 1. Historia y criterios

**Historia** (del brief). Como visitante o inversionista quiero abrir la ficha de un proyecto y ver qué es, cuánto cuesta, cómo avanza, qué riesgos tiene y simular cuánto podría tocarme en distintos escenarios, para decidir si participo, sabiendo que nada está garantizado.

**Criterios** (del brief; lo marcado [PROPUESTO] los vuelve verificables con las semillas del 22-nov):

- **CA1** · `/proyectos/<slug>` muestra la ficha de cualquier proyecto **publicable** con el mismo criterio que P3 (la ficha se resuelve con `listMarketplace`, D2). M2-007 y slugs inexistentes muestran `ProjectNotFound` de marca dentro del shell (D3). `EXAMPLE_PROJECT_SLUG = "m2-006-chacao"`; `rutas.spec.ts` actualizado. [PROPUESTO] Las 6 fichas abren: `m2-001-palos-grandes`, `m2-002-el-hatillo`, `m2-003-chacao`, `m2-004-el-vinedo`, `m2-005-el-paraiso`, `m2-006-chacao`. `m2-007-palos-grandes`, `m2-001` y `no-existe` → `ficha-no-encontrada`. Un slug con formato inválido (`M2_RARO`) → `notFound()` → `not-found.tsx` con el mismo componente.
- **CA2** · `PageHeader` + `Section`s con tonos alternos (§3.9): resumen, inmueble, presupuesto desglosado, escenarios, simulador (o resultado realizado), cronograma + actualizaciones, riesgos y siguiente paso con el aviso de riesgo cercano. [PROPUESTO] En M2-006: "Participaciones disponibles: 37 de 100", "Colocadas: 63 de 100", precio USD 100, compra USD 50.000, presupuesto integral USD 10.000 = obra USD 5.000 (7 rubros) + honorarios USD 3.000 (3 líneas) + contingencia USD 2.000, costos de venta estimados USD 2.280, precio objetivo USD 76.000.
- **CA3** · Simulador (D3, D4) con cinco controles y siete presets. Todo número sale de `modules/finance` (`simulateProjection` → `calculateDistribution` + `calculateHolderPayout`). Resultado en tres bloques rotulados (capital aportado · ganancia proyectada · cobro proyectado), con el descargo `LEGAL_COPY.simulatorDisclaimer` debajo. Sin excedente: "no hay reparto del fondo" y la política del capital "por definir" (O1/H2), sin bloque de cobro. [PROPUESTO] M2-006, valores iniciales (1 participación, colocación 64): capital USD 100 · ganancia USD 34,30 · cobro USD 134,30. Presets sobre M2-006: venta −20 % → sin reparto · obra +20 % → ganancia USD 31,80 · obra +50 % → USD 28,05 · retraso 6 → "Plazo proyectado: 9 meses" con la ganancia igual · colocación 0 % → colocación "1 de 100" y empresa por retenidas USD 3.395,70.
- **CA4** · Ni el simulador ni la ficha muestran ruedas, "estancado" ni "días sin vender". El retraso solo se ve como plazo proyectado. [PROPUESTO] Ningún tipo ni clave del resultado tiene el patrón /wheel|rueda/ (test). En la página no aparece /rueda|estancad|días sin vender/i (E2E).
- **CA5** · Con "Ejemplo de referencia" (maestro §6, D5) y 1 participación: colocación 100 → C1 (fondo 5.000, por participación 50, externos 5.000, empresa del fondo 0, empresa 75 % 15.000, cobro 150). Colocación 63 → C6 (externos 3.150, empresa del fondo 1.850). Venta −50 % con obra +50 % → sin reparto (pérdida, como C5). Invariante: externos + empresa total = excedente al centavo (propiedad con fast-check).
- **CA6** · M2-001 y M2-003 (`mode "historic"`): sección "Resultado de la liquidación" con capital, ganancia realizada y cobro realizado por participación (`MoneyDisplay kind="capital"` / `"realized"`). Sin simulador ni escenarios (`ficha-simulador-inactivo`). [PROPUESTO] M2-003: capital USD 100 · ganancia realizada USD 34,50 · cobro USD 134,50. M2-001: USD 30,24 · USD 130,24. En las cinco vistas con cifras, el capital tiene un tamaño **≥** que cualquier proyección de la misma vista.
- **CA7** · Semillas v2 (`club-demo:v2`, `DemoSnapshot.version = 2`): presupuesto por líneas en finance, y en projects hitos, actualizaciones fechadas y riesgos. Todo con fechas relativas al Clock, sin ruedas y sin `stalled`. `seed-consistency.test.ts` amplía sus comprobaciones a lo nuevo. Los escenarios **no** se siembran: los deriva el motor (D6).
- **CA8** · Responsive 390/1440. Estados de carga, error y no encontrado. Controles con `<label>`, `aria-valuetext` y resultado en `aria-live="polite"`. Foco visible y los `data-testid` de §5.3. Copy en `finance/ui/copy.ts` y `simulator-copy.ts`, con `check-copy` verde. Sin cintillo, sin "reales", sin verbos de transacción.
- **CA9** · E2E en 390 y 1440 (§5.2). `pnpm verify`, `pnpm build` y `src/architecture-rules.test.ts` en verde. [PROPUESTO] Además, `src/modules/finance/money-in-ui.test.ts` falla si `finance/ui/**` hace aritmética con `.cents` o importa valores de `@/shared/domain/money` (R1).

## 2. Módulos afectados y decisiones

| Módulo / carpeta | Por qué | Nuevo |
|---|---|---|
| `modules/projects` (domain, application, infrastructure, index) | Hitos, actualizaciones, riesgos y validación de slug. Puerto `ProjectDetailsRepository` | se amplía |
| `modules/participations` (index, CLAUDE.md, `ui/copy.ts`) | Exporta los **tipos** de sus puertos y `PHASE_PRESENTATION`. Cambia el texto del siguiente paso de P3 | 3 líneas |
| `modules/finance` (domain, application, infrastructure, **ui**, index) | Presupuesto, simulador, escenarios, ficha. **Primera `ui/` del módulo** (D1) | se amplía (crea `ui/`) |
| `composition/` | Snapshot v2, cableado de `getProjectSheet` y de los repos nuevos | se amplía |
| `shared/config/demo.ts` | `storageKey: "club-demo:v2"` | 1 línea |
| `shared/ui/app-shell/route-map.ts` | Slug de ejemplo real y `participateHref(slug)` | se amplía |
| `shared/ui/primitives/range.tsx` · `shared/lib/format-percentage.ts` | Control deslizante nativo accesible y formato de puntos básicos (D8) | sí |
| `app/(inversionista)/proyectos/[slug]/` | `page.tsx` monta la ficha; `not-found.tsx` nuevo | se cambia / sí |
| `tests/e2e/` | `ficha.spec.ts` nuevo; `rutas.spec.ts` y `reiniciar-datos.spec.ts` | sí / se cambian |

No se toca: `eslint.config.mjs`, `architecture.modules.mjs`, `docs/referencia/**`, `backoffice.ts`, el motor (`distribution.ts`, `holder-payout.ts`, `settlement.ts`, `validate-distribution-input.ts`) ni sus tests C1–C6/I1–I9.

**D1 · La ficha vive en `finance/ui` (docs/01 §4 regla 2b). Sin módulo nuevo y sin ADR.**
- La ficha combina `projects` (proyecto, inmueble, hitos, actualizaciones, riesgos), `participations` (fase, disponibles, clase) y `finance` (presupuesto, motor, liquidación). `finance` es el primer módulo del orden que puede importar a los tres. Además el dato propio de la ficha, el simulador, es dinero, y dinero es de finance (regla 5).
- Imports, todos permitidos por el lint tal como está:
  - `finance/domain → @/modules/projects` (tipos) y `@/modules/participations` (**solo `import type`**).
  - `finance/application → module-api` (tipos de puertos).
  - `finance/ui → @/modules/participations` (valor `PHASE_PRESENTATION`), `@/modules/projects`, `@/composition/providers`, `shared-ui`.
  - `composition → finance/application|infrastructure` por ruta interna.
  - `app → @/modules/finance`.
- **Descartadas.**
  - (a) Un módulo `catalog` o `project-sheet` a la derecha de finance: pide ADR, una línea en `architecture.modules.mjs` y cambiar el orden de §4, y no trae ninguna regla propia.
  - (b) `participations/ui`: no puede importar finance (sería un ciclo).
  - (c) Unir los datos en `composition` o en un hook: la regla de negocio (modo de la ficha, límites del simulador, escenarios) quedaría fuera de un `domain` testeable.
- **Trampa de ciclo (R4 de P3), ahora también en finance.** `finance/index.ts` pasa a exportar UI, que llega a `composition/providers`. Esto lleva a cuatro reglas:
  1. `finance/domain` y `finance/application` importan de participations **solo con `import type`**.
  2. `HOLDING_LIMITS` (un valor) llega por inyección desde `composition/modules/finance.ts`, que lo importa por la ruta interna `@/modules/participations/domain/participation`.
  3. `composition/**` y cualquier `infrastructure/` importan de finance solo por ruta interna. El paquete DATA cambia `seed-consistency.test.ts` para que importe el motor de `@/modules/finance/domain/*`.
  4. Las cuatro quedan en `finance/CLAUDE.md`.

**D2 · La fuente de verdad de "publicable" es `listMarketplace`.** `getProjectSheet(slug)` busca primero la tarjeta (`ProjectListing`) por `slug`. Si no está, la respuesta es `not_found`. Así P3 y P4 nunca discrepan, también cuando B2/B3 publiquen proyectos en `localStorage`. Si la tarjeta existe pero faltan inmueble, economía, presupuesto o, en un liquidado, la liquidación, son datos incoherentes: la promesa se rechaza y la ficha muestra `ErrorState`.

**D3 · `not-found` en el cliente, con `notFound()` solo para formatos inválidos.** Con `cacheComponents` no existe `dynamicParams`. `generateStaticParams` exigiría al menos un slug, y aun así no conocería los proyectos que se crean en `localStorage`. Los datos viven en el cliente, así que el servidor no puede decidir si un slug existe sin sembrar en el servidor, y eso daría un 404 falso a los proyectos que cree B2 en el futuro. Por eso:
- `page.tsx` pasa la promesa `params` a `ProjectSheet` (Server Component). Este la espera **dentro de `<Suspense>`**: el patrón "Without generateStaticParams" de `dynamic-routes.md`, sin `generateStaticParams`.
- Si `isProjectSlug(slug)` es falso, el servidor llama a `notFound()` y se pinta `not-found.tsx` con `ProjectNotFound`.
- Si no, `ProjectSheetView` (cliente) consulta `getProjectSheet`. Ante `not_found` pinta el mismo `ProjectNotFound`, que es un Server Component sin hooks y se puede usar en los dos sitios.
- Los dos casos responden **200** (R5) y el shell sigue intacto.

**D4 · Modos de la ficha** (`SheetMode`, se deriva de la `ListingPhase` de P3):

| Fase P3 | Modo | Simulador | Escenarios | Resultado realizado |
|---|---|---|---|---|
| `open` | `open` | activo; participaciones 1…min(20, disponibles) | sí | — |
| `placement_complete`, `renovation`, `on_sale` | `illustrative` [SUPUESTO P4-3] | activo con aviso "ilustrativo"; 1…min(20, total) | sí | — |
| `sold` | `settling` [SUPUESTO P4-9] | no ("liquidación en curso") | no | — |
| `finished` | `historic` | no (`ficha-simulador-inactivo`) | no | sí (liquidación sembrada) |

**D5 · Dos bases de simulación: "Este proyecto" y "Ejemplo de referencia".** La de referencia es la del maestro §6, que es la de C1 (compra 10.000, presupuesto 10.000 con obra 5.000, venta 40.000, costos de venta 0, 100 × USD 100). Permite comprobar C1 y C6 en pantalla (CA5, CA9), y sirve como explicación. Es una constante del dominio con test. [SUPUESTO P4-10]

**D6 · Los escenarios se derivan, no se siembran.** `buildScenarios` aplica deltas fijos sobre la base del proyecto con el mismo `simulateProjection`. Así un escenario nunca puede descuadrar con el motor. [SUPUESTO P4-1] Deltas propuestos, pendientes de confirmación (P4-Q1):

| Escenario | Precio de venta | Sobrecosto de obra |
|---|---:|---:|
| Conservador | −10 % (−1000 pb) | +20 % (2000 pb) |
| Base | 0 | 0 |
| Optimista | +5 % (+500 pb) | 0 |

**D7 · Reglas del simulador** (todas marcadas; ninguna está en el maestro con más detalle):
- **Precio de venta**: ajuste en pb sobre el precio objetivo, entre −5000 y +3000 (paso 100). `P' = applyPercentageFloor(P, 10000 + ajuste)`.
- **Sobrecosto de obra** [SUPUESTO P4-4]: entre 0 y 5000 pb (paso 500), aplicado al subtotal de obra (`works`) del presupuesto. El sobrecosto se **suma a F** en la entrada del motor (`F' = F + sobrecosto`). No lo absorbe la contingencia, que es la lectura conservadora. No cambia el número ni el precio de las participaciones.
- **Retraso** [SUPUESTO P4-2]: entre 0 y 12 meses (paso 1). Solo alarga el plazo proyectado (`TARGET_TERM_MONTHS + retraso`). No resta dinero, porque el maestro no fija el costo del mantenimiento (P4-Q2).
- **Costos de venta O**: fijos al valor estimado aunque cambie el precio [SUPUESTO P4-6b] (P4-Q6).
- **Participaciones que simulas** (D4): de 1 a `heldLimits.max`.
- **Colocación total**: incluye las tuyas, en el rango [participaciones simuladas, total]. Valor inicial: `open` → colocadas + 1 (64 en M2-006); `illustrative` → máx(simuladas, colocadas); referencia → 100 (C1).
- **Preset "Colocación 0 %"** [SUPUESTO P4-6]: colocación = tus participaciones, es decir, sin otros participantes. Con un 0 literal no podrías participar. El motor ya cubre C3 en sus tests.
- **Un preset a la vez.** Aplicar un preset devuelve las tres variables de estrés y la colocación a su valor inicial, y luego fija la variable del preset. No cambia ni la base ni las participaciones simuladas.
- Las tenencias previas del inversionista demo no descuentan del máximo de D4 (lo hace P5) [SUPUESTO P4-7].

**D8 · Control deslizante nativo como primitiva compartida.** No hay `slider` en `shared/ui/primitives`. Se crea `range.tsx` (`RangeInput`) sobre `<input type="range">` nativo, que es accesible por teclado, anuncia el valor y Playwright lo maneja con `fill()`. Se descarta el Slider de Radix porque fijar 63 por teclado en un E2E es frágil. Se añade al README (es contrato de §3.7). También `formatBps` en `shared/lib`, para que la UI no divida puntos básicos.

**D9 · Hooks y dominio.** Siguiendo el precedente de P3 (`MarketplaceBrowser` usa `filterListings`), **solo los hooks** (`ui/hooks/*`) importan funciones puras de `finance/domain`. Los componentes reciben datos y callbacks. Nota para el orquestador: aclarar en `docs/01 §4` la celda "ui → domain propio: tipos; funciones puras solo desde hooks" (es una aclaración y no necesita ADR).

## 3. Contratos (TypeScript)

Son el acuerdo entre D, DATA, UI y E2E. Si cambia una firma, se avisa al orquestador antes de entregar.

### 3.1 `projects` (paquete D)

```ts
// src/modules/projects/domain/project-slug.ts
/** Misma forma que valida la semilla: kebab-case en minúsculas. */
export const PROJECT_SLUG_PATTERN: RegExp; // /^[a-z0-9]+(-[a-z0-9]+)*$/
export function isProjectSlug(raw: unknown): raw is string;

// src/modules/projects/domain/milestone.ts
import type { IsoDate } from "@/shared/domain/calendar-date";
import type { Id } from "@/shared/domain/id";
import type { ProjectId } from "./project";
export type MilestoneId = Id<"Milestone">;
export const MILESTONE_KINDS = [
  "purchase", "placement_open", "placement_close", "works_start",
  "works_end", "listing", "sale_signed", "settlement",
] as const;
export type MilestoneKind = (typeof MILESTONE_KINDS)[number];
export type Milestone = {
  readonly id: MilestoneId;
  readonly projectId: ProjectId;
  readonly kind: MilestoneKind;
  /** Fecha de referencia del cronograma (proyección mientras no se cumpla). */
  readonly plannedOn: IsoDate;
  /** null = no cumplido. */
  readonly completedOn: IsoDate | null;
};
export type MilestoneState = "done" | "planned" | "pending";
/** done si completedOn ≠ null · planned si plannedOn ≥ today · pending si ya pasó sin cumplirse (sin fecha visible, D4 de §6). */
export function milestoneState(m: Milestone, today: IsoDate): MilestoneState;
/** Orden de MILESTONE_KINDS; no muta. */
export function sortMilestones(ms: readonly Milestone[]): readonly Milestone[];

// src/modules/projects/domain/project-update.ts
export type ProjectUpdateId = Id<"ProjectUpdate">;
export const UPDATE_SOURCES = ["purchase_record", "placement_report", "works_report", "commercial_report", "settlement_report"] as const;
export type UpdateSource = (typeof UPDATE_SOURCES)[number];
export const RESPONSIBLE_ROLES = ["acquisitions", "works", "commercial", "finance"] as const;
export type ResponsibleRole = (typeof RESPONSIBLE_ROLES)[number];
export const EVIDENCE_KINDS = ["photos", "document"] as const;
export type EvidenceKind = (typeof EVIDENCE_KINDS)[number];
/** Actualización fechada (maestro §10: fecha, fuente, responsable y evidencia). Título y cuerpo son datos de ejemplo. */
export type ProjectUpdate = {
  readonly id: ProjectUpdateId;
  readonly projectId: ProjectId;
  readonly publishedOn: IsoDate;
  readonly source: UpdateSource;
  readonly responsible: ResponsibleRole;
  readonly title: string;
  readonly body: string;
  readonly evidence: EvidenceKind | null;
};
/** publishedOn descendente; empate → id ascendente. No muta. */
export function sortUpdatesNewestFirst(us: readonly ProjectUpdate[]): readonly ProjectUpdate[];

// src/modules/projects/domain/project-risk.ts
/** Riesgos del maestro §15 que ve el inversionista (sin niveles ni puntuaciones). */
export const RISK_KINDS = ["sale_price", "works_overrun", "slow_sale", "liquidity", "conflict_of_interest", "legal_structure"] as const;
export type RiskKind = (typeof RISK_KINDS)[number];
export type ProjectRisk = { readonly projectId: ProjectId; readonly kind: RiskKind };

// src/modules/projects/application/ports.ts: se AÑADE
export interface ProjectDetailsRepository {
  /** Sin orden garantizado (ordena el dominio). */
  milestonesOf(projectId: ProjectId): Promise<readonly Milestone[]>;
  updatesOf(projectId: ProjectId): Promise<readonly ProjectUpdate[]>;
  risksOf(projectId: ProjectId): Promise<readonly ProjectRisk[]>;
}

// src/modules/projects/index.ts: se AÑADE (sin quitar nada)
export type { MilestoneId, MilestoneKind, Milestone, MilestoneState } from "./domain/milestone";
export { MILESTONE_KINDS, milestoneState, sortMilestones } from "./domain/milestone";
export type { ProjectUpdateId, UpdateSource, ResponsibleRole, EvidenceKind, ProjectUpdate } from "./domain/project-update";
export { UPDATE_SOURCES, RESPONSIBLE_ROLES, EVIDENCE_KINDS, sortUpdatesNewestFirst } from "./domain/project-update";
export type { RiskKind, ProjectRisk } from "./domain/project-risk";
export { RISK_KINDS } from "./domain/project-risk";
export { PROJECT_SLUG_PATTERN, isProjectSlug } from "./domain/project-slug";
export type { ProjectRepository, PropertyRepository, ProjectDetailsRepository } from "./application/ports";
```

### 3.2 `finance/domain` (paquete D)

```ts
// src/modules/finance/domain/budget.ts
import type { ProjectId } from "@/modules/projects";
import type { Money } from "@/shared/domain/money";
export const BUDGET_CATEGORIES = ["works", "management_fee", "contingency", "reserve"] as const;   // docs/02 §6
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];
export const BUDGET_ITEMS = [
  "demolition", "masonry", "electrical", "plumbing", "flooring", "carpentry_kitchen", "paint_finishes",   // works
  "project_management", "works_supervision", "administration_reporting",                                  // management_fee (D7)
  "contingency",                                                                                           // contingency
  "reserve",                                                                                               // reserve
] as const;
export type BudgetItem = (typeof BUDGET_ITEMS)[number];
/** Tabla congelada: la categoría nunca se guarda, se deriva. */
export const BUDGET_ITEM_CATEGORY: Readonly<Record<BudgetItem, BudgetCategory>>;
export type BudgetLine = { readonly item: BudgetItem; readonly amount: Money };
/** Presupuesto integral de recuperación (F) por líneas. Lo presupuestado; lo devengado/gastado/remanente es de B3/B5. */
export type ProjectBudget = { readonly projectId: ProjectId; readonly lines: readonly BudgetLine[] };
export type BudgetGroup = { readonly category: BudgetCategory; readonly total: Money; readonly lines: readonly BudgetLine[] };
export type BudgetErrorCode = "NEGATIVE_AMOUNT" | "DUPLICATE_ITEM" | "NO_WORKS_LINES" | "BUDGET_TOTAL_MISMATCH";
/** Σ líneas = recoveryBudget; sin ítems repetidos; amount ≥ 0; al menos una línea works. Nunca lanza. */
export function checkProjectBudget(budget: ProjectBudget, recoveryBudget: Money): Result<ProjectBudget, DomainError<BudgetErrorCode>>;
/** Grupos en el orden de BUDGET_CATEGORIES, líneas en el orden de BUDGET_ITEMS; omite grupos vacíos o de total 0. */
export function groupBudget(budget: ProjectBudget): readonly BudgetGroup[];
/** Total del grupo works (base del sobrecosto). 0 si no hay. */
export function worksTotal(budget: ProjectBudget): Money;

// src/modules/finance/domain/reference-case.ts
/** Maestro §6 / C1: compra 10.000 · F 10.000 (obra 5.000) · venta 40.000 · O 0 · 100 × USD 100. Test: con 100 colocadas da C1 exacto. */
export const REFERENCE_SIMULATION_BASE: SimulationBase;

// src/modules/finance/domain/simulator.ts
export const SIMULATION_SOURCES = ["project", "reference"] as const;
export type SimulationSource = (typeof SIMULATION_SOURCES)[number];
export type SimulationBase = {
  readonly salePrice: Money;          // P objetivo
  readonly acquisitionCost: Money;    // C
  readonly recoveryBudget: Money;     // F
  readonly worksBudget: Money;        // subtotal works (base del sobrecosto, D7)
  readonly saleCosts: Money;          // O estimado
  readonly participations: { readonly total: number; readonly unitPrice: Money };
  /** Colocadas por terceros hoy (proyecto) o 100 (referencia). */
  readonly placedToday: number;
};
export type SimulatorSetup = {
  readonly mode: "open" | "illustrative";
  readonly bases: Readonly<Record<SimulationSource, SimulationBase>>;
  /** open: {1, min(HOLDING_LIMITS.max, disponibles)} · illustrative: {1, min(HOLDING_LIMITS.max, total)}. */
  readonly heldLimits: { readonly min: number; readonly max: number };
  readonly targetTermMonths: number;
};
export type SimulatorInputs = {
  readonly source: SimulationSource;
  readonly held: number;
  readonly placed: number;
  readonly salePriceAdjustmentBps: number;
  readonly worksOverrunBps: number;
  readonly delayMonths: number;
};
export const SIMULATOR_RANGES: {
  readonly salePriceAdjustmentBps: { readonly min: -5000; readonly max: 3000; readonly step: 100 };
  readonly worksOverrunBps: { readonly min: 0; readonly max: 5000; readonly step: 500 };
  readonly delayMonths: { readonly min: 0; readonly max: 12; readonly step: 1 };
};
/** [held, total] de la base activa. */
export function placedRange(setup: SimulatorSetup, inputs: SimulatorInputs): { readonly min: number; readonly max: number };
/** Colocación de partida (D7): reference → total · open → min(total, placedToday + held) · illustrative → max(held, placedToday). */
export function defaultPlaced(setup: SimulatorSetup, source: SimulationSource, held: number): number;
/** { source: "project", held: 1, placed: defaultPlaced(...), 0, 0, 0 }. */
export function initialSimulatorInputs(setup: SimulatorSetup): SimulatorInputs;
/** Recorta a rangos; Math.trunc; NaN/±Infinity → valor inicial del campo. Idempotente. Nunca lanza. */
export function normalizeSimulatorInputs(setup: SimulatorSetup, raw: SimulatorInputs): SimulatorInputs;
export type SimulatorChange =
  | { readonly type: "source"; readonly value: SimulationSource }      // placed ← defaultPlaced(nueva base, held)
  | { readonly type: "held"; readonly value: number }                  // placed ← max(placed, held)
  | { readonly type: "placed"; readonly value: number }
  | { readonly type: "salePrice"; readonly value: number }
  | { readonly type: "overrun"; readonly value: number }
  | { readonly type: "delay"; readonly value: number }
  | { readonly type: "preset"; readonly preset: StressPresetId }       // D7: un preset a la vez
  | { readonly type: "reset" };                                        // initialSimulatorInputs, conserva source
/** Reductor puro: devuelve siempre entradas normalizadas. */
export function applySimulatorChange(setup: SimulatorSetup, current: SimulatorInputs, change: SimulatorChange): SimulatorInputs;

// src/modules/finance/domain/stress-presets.ts  (maestro §7, docs/02 §4)
export const STRESS_PRESET_IDS = ["sale_minus_20", "works_plus_20", "works_plus_50", "delay_3", "delay_6", "delay_9", "placement_zero"] as const;
export type StressPresetId = (typeof STRESS_PRESET_IDS)[number];
/** sale_minus_20 → salePriceAdjustmentBps −2000 · works_plus_20 → 2000 · works_plus_50 → 5000 · delay_n → n · placement_zero → placed = held. */
export function applyStressPreset(setup: SimulatorSetup, current: SimulatorInputs, preset: StressPresetId): SimulatorInputs;
/** El preset cuyo resultado coincide exactamente con `inputs` (con el resto en su valor inicial); si no, null. */
export function activeStressPreset(setup: SimulatorSetup, inputs: SimulatorInputs): StressPresetId | null;

// src/modules/finance/domain/simulate-projection.ts
export type HolderProjection =
  | { readonly kind: "distributed"; readonly contributed: Money; readonly gain: Money; readonly payout: Money }   // de calculateHolderPayout
  | { readonly kind: "no_distribution"; readonly contributed: Money; readonly capitalPolicy: "to_be_defined" };  // O1/H2: sin cobro
export type SimulationResult = {
  readonly basis: "projection";
  readonly inputs: SimulatorInputs;           // ya normalizadas
  readonly salePrice: Money;                  // P'
  readonly worksOverrun: Money;               // floor(worksBudget × overrun)
  readonly recoveryBudget: Money;             // F' = F + worksOverrun
  readonly acquisitionCost: Money;
  readonly saleCosts: Money;
  readonly outcome: DistributionOutcome;      // calculateDistribution tal cual
  readonly holder: HolderProjection;
  readonly term: { readonly targetMonths: number; readonly delayMonths: number; readonly projectedMonths: number };
};
export type SimulationErrorCode = DistributionInputErrorCode | "HELD_OUT_OF_RANGE";
/**
 * Único cálculo del simulador. Normaliza → construye DistributionInput (basis "projection") → calculateDistribution →
 * calculateHolderPayout(outcome, held) si hay reparto; contributed = multiplyMoney(unitPrice, held) siempre.
 * Nunca lanza. Sin Date. No expone ruedas (CA4).
 */
export function simulateProjection(setup: SimulatorSetup, inputs: SimulatorInputs): Result<SimulationResult, DomainError<SimulationErrorCode>>;

// src/modules/finance/domain/scenarios.ts
export const SCENARIO_KINDS = ["conservative", "base", "optimistic"] as const;
export type ScenarioKind = (typeof SCENARIO_KINDS)[number];
/** [SUPUESTO P4-1] (D6). */
export const SCENARIO_ASSUMPTIONS: Readonly<Record<ScenarioKind, { readonly salePriceAdjustmentBps: number; readonly worksOverrunBps: number }>>;
export type ScenarioOutcome = { readonly kind: ScenarioKind; readonly assumptions: (typeof SCENARIO_ASSUMPTIONS)[ScenarioKind]; readonly result: SimulationResult };
/** Base del proyecto, held 1, placed = defaultPlaced(setup, "project", 1), delay 0. Si simulateProjection da err, lo propaga. */
export function buildScenarios(setup: SimulatorSetup): Result<readonly ScenarioOutcome[], DomainError<SimulationErrorCode>>;

// src/modules/finance/domain/project-sheet.ts
import type { ListingPhase, ParticipationClass, ProjectListing } from "@/modules/participations";   // SOLO import type (D1)
import type { Milestone, MilestoneKind, MilestoneState, ProjectRisk, ProjectUpdate, Property, PublicStage, RiskKind, ProjectCode, ProjectId } from "@/modules/projects";
export type SheetMode = "open" | "illustrative" | "settling" | "historic";
export type MilestoneView = { readonly kind: MilestoneKind; readonly state: MilestoneState; /** done → completedOn · planned → plannedOn · pending → null */ readonly date: IsoDate | null };
export type BudgetBreakdown = {
  readonly acquisitionCost: Money;                 // C · capital propio de la empresa
  readonly recoveryBudget: Money;                  // F = Σ grupos
  readonly groups: readonly BudgetGroup[];
  /** null en historic (lo sustituye el resultado realizado). */
  readonly projection: { readonly targetSalePrice: Money; readonly estimatedSaleCosts: Money } | null;
};
export type RealizedResult = {
  readonly settledOn: IsoDate;
  readonly salePrice: Money;
  readonly saleCosts: Money;
  readonly distribution: Distribution;             // de la liquidación sembrada, tal cual
  readonly perParticipation: HolderPayout;         // calculateHolderPayout(distribution, 1), basis "realized"
};
export type ProjectSheet = {
  readonly projectId: ProjectId;
  readonly code: ProjectCode;
  readonly slug: string;
  readonly name: string;
  readonly acquiredOn: IsoDate;
  readonly stage: PublicStage;
  readonly phase: ListingPhase;
  readonly mode: SheetMode;                         // D4
  readonly property: { readonly city: string; readonly zone: string; readonly kind: Property["kind"]; readonly areaM2: number };  // D6: sin dirección
  readonly participations: {
    readonly total: number;
    readonly placed: number;
    readonly available: number;                     // de la tarjeta (P3-3)
    readonly retained: number;                      // mode open ? 0 : total − placed
    readonly unitPrice: Money;
  };
  readonly targetTermMonths: number | null;         // de la tarjeta
  readonly budget: BudgetBreakdown;
  readonly scenarios: readonly ScenarioOutcome[];   // [] salvo open/illustrative
  readonly simulator: SimulatorSetup | null;        // solo open/illustrative
  readonly realized: RealizedResult | null;         // solo historic
  readonly milestones: readonly MilestoneView[];    // orden MILESTONE_KINDS
  readonly updates: readonly ProjectUpdate[];       // más reciente primero
  readonly risks: readonly RiskKind[];              // orden RISK_KINDS, sin duplicados
};
export type ProjectSheetSource = {
  readonly listing: ProjectListing;
  readonly property: Property;
  readonly participationClass: ParticipationClass;
  readonly economics: ProjectEconomics;
  readonly budget: ProjectBudget;
  readonly settlement: Settlement | null;
  readonly milestones: readonly Milestone[];
  readonly updates: readonly ProjectUpdate[];
  readonly risks: readonly ProjectRisk[];
  readonly today: IsoDate;
  readonly holdingLimits: { readonly min: number; readonly max: number };
};
export type ProjectSheetErrorCode = BudgetErrorCode | SimulationErrorCode | "MISSING_SETTLEMENT" | "PROJECT_MISMATCH";
/** Pura, nunca lanza. PROJECT_MISMATCH si algún projectId difiere del de la tarjeta. historic sin settlement → MISSING_SETTLEMENT. */
export function buildProjectSheet(source: ProjectSheetSource): Result<ProjectSheet, DomainError<ProjectSheetErrorCode>>;
```
Si `project-sheet.ts` pasa de 200 líneas, se separa en `project-sheet-types.ts` (tipos) y `project-sheet.ts` (función). El contrato no cambia.

### 3.3 `finance/application` (paquete D)

```ts
// src/modules/finance/application/ports.ts: se AÑADE
export interface ProjectBudgetRepository {
  findByProject(projectId: ProjectId): Promise<ProjectBudget | null>;
}

// src/modules/finance/application/get-project-sheet.ts
import type { ListMarketplace, ParticipationClassRepository } from "@/modules/participations";   // import type
import type { ProjectDetailsRepository, PropertyRepository } from "@/modules/projects";
import type { Clock } from "@/shared/domain/clock";
export type ProjectSheetLookup = { readonly kind: "found"; readonly sheet: ProjectSheet } | { readonly kind: "not_found" };
export type GetProjectSheet = (slug: string) => Promise<ProjectSheetLookup>;
export type GetProjectSheetDeps = {
  readonly listMarketplace: ListMarketplace;
  readonly properties: Pick<PropertyRepository, "findById">;
  readonly details: ProjectDetailsRepository;
  readonly classes: Pick<ParticipationClassRepository, "findByProject">;
  readonly economics: Pick<ProjectEconomicsRepository, "findByProject">;
  readonly budgets: ProjectBudgetRepository;
  readonly settlements: Pick<SettlementRepository, "findByProject">;
  readonly clock: Clock;
  readonly holdingLimits: { readonly min: number; readonly max: number };   // inyectado (D1)
};
/**
 * `async`: cualquier throw síncrono de un repo se convierte en rechazo.
 * 1) listMarketplace() y buscar por slug → si no está: { kind: "not_found" } (D2).
 * 2) Promise.all con property (findById(listing… vía projectId → la tarjeta no trae propertyId: usa projects? NO; ver nota), clase, economía, presupuesto, liquidación, hitos, actualizaciones, riesgos.
 * 3) Si falta algo obligatorio o buildProjectSheet da err → rechaza con Error(`ficha ${slug}: ${code}`).
 */
export function createGetProjectSheet(deps: GetProjectSheetDeps): GetProjectSheet;
```
**Nota de contrato.** `ProjectListing` no trae `propertyId`. Para no tocar P3, `GetProjectSheetDeps` añade `projects: Pick<ProjectRepository, "findBySlug">`: se busca el `Project` por slug y de ahí sale `propertyId`. Si falta el proyecto, es un dato incoherente y la promesa se rechaza.

### 3.4 `participations` (paquete UI escribe `index.ts`; D actualiza `CLAUDE.md`)

```ts
// src/modules/participations/index.ts: se AÑADE (sin quitar nada)
export type { ParticipationClassRepository, ParticipationRepository } from "./application/ports";
export { PHASE_PRESENTATION } from "./ui/components/investor/phase-presentation";
```
`CLAUDE.md`: "`finance` NO importa de aquí" pasa a decir "`finance` importa de aquí **solo tipos**, salvo `PHASE_PRESENTATION` en `finance/ui` (D1)".

### 3.5 Datos semilla v2 (paquete DATA)

```ts
// src/modules/projects/infrastructure/seed.ts
export type ProjectsSlice = {
  readonly properties: readonly Property[];
  readonly projects: readonly Project[];
  readonly milestones: readonly Milestone[];     // NUEVO
  readonly updates: readonly ProjectUpdate[];    // NUEVO
  readonly risks: readonly ProjectRisk[];        // NUEVO
};
// projectsSliceSchema amplía con los tres arrays (z.enum(MILESTONE_KINDS) etc.). buildProjectsSeed(clock) los arma con
// buildProjectProgress(projects, dates) de seed-progress.ts y buildProjectUpdates(projects) de seed-updates.ts.

// src/modules/finance/infrastructure/seed.ts
export type FinanceSlice = {
  readonly economics: readonly ProjectEconomics[];
  readonly settlements: readonly Settlement[];
  readonly budgets: readonly ProjectBudget[];    // NUEVO (7, incluido M2-007 para B2)
};
// buildFinanceSeed valida cada presupuesto con checkProjectBudget(budget, economics.recoveryBudget); si err → throw (fallo de semilla).

// src/composition/demo-snapshot.ts
export type DemoSnapshot = { readonly version: 2; /* resto igual */ };   // z.literal(2)
// src/shared/config/demo.ts
storageKey: "club-demo:v2",
```

**Ids legibles:** `mil_<key>_<kind>` (p. ej. `mil_chacao_02_purchase`), `upd_<key>_<n>`. Los riesgos no llevan id.

**Presupuesto (mismo para los 7, USD enteros; [SUPUESTO P4-5], P4-Q5).** Se fija en `seed-budget.ts`. La suma de las líneas es `F = 10.000`. Obra = 5.000 y honorarios + contingencia = 5.000, como en el maestro §6.

| Ítem | USD | Ítem | USD |
|---|---:|---|---:|
| demolition | 400 | project_management | 1.000 |
| masonry | 900 | works_supervision | 1.250 |
| electrical | 700 | administration_reporting | 750 |
| plumbing | 600 | contingency | 2.000 |
| flooring | 1.100 | reserve | (no se siembra) |
| carpentry_kitchen | 800 | | |
| paint_finishes | 500 | | |

**Hitos ([SUPUESTO P4-8], cronograma de referencia derivado del plazo objetivo de 3 meses).** `plannedOn = acquiredOn + offset` en días: purchase 0 · placement_open 1 · placement_close 20 · works_start 21 · works_end 60 · listing 62 · sale_signed 90 · settlement 105.

Los hitos cumplidos dependen del estado:
- funding: {purchase, placement_open}
- renovation: lo anterior + {placement_close, works_start}
- on_sale: lo anterior + {works_end, listing}
- sold: lo anterior + {sale_signed}
- settled: todos

`completedOn = plannedOn`, salvo `sale_signed = timeline.saleSignedOn` y `settlement = timeline.settledOn`. M2-007 no lleva hitos, actualizaciones ni riesgos.

**Riesgos.** Los 6 proyectos con clase llevan los seis de `RISK_KINDS`.

**Actualizaciones** (`seed-updates.ts`; `publishedOn = acquiredOn + días`; texto exacto; DATA corre `check-copy` sobre este archivo):

| Proyecto | +días | source · responsible · evidence | Título | Cuerpo |
|---|---:|---|---|---|
| palos_grandes_01 | 1 | purchase_record · acquisitions · document | Compra firmada y expediente abierto | La empresa firmó la compra con capital propio y abrió el expediente del inmueble. |
| palos_grandes_01 | 60 | works_report · works · photos | Obra terminada | Se completaron cocina, baños y pisos según el presupuesto por rubros. |
| palos_grandes_01 | 140 | commercial_report · commercial · document | Venta firmada | Se firmó la venta del inmueble. Comienza la liquidación. |
| palos_grandes_01 | 160 | settlement_report · finance · document | Liquidación publicada | Se publicó la liquidación con la devolución de capitales y el reparto del excedente de ejemplo. |
| hatillo_01 | 1 | purchase_record · acquisitions · document | Compra firmada y expediente abierto | (igual que arriba) |
| hatillo_01 | 60 | works_report · works · photos | Obra terminada | Se terminaron la remodelación de la cocina, los baños y la fachada. |
| hatillo_01 | 64 | commercial_report · commercial · null | Inmueble publicado | El inmueble se publicó en portales y con agentes de la zona. |
| hatillo_01 | 200 | commercial_report · commercial · document | Ajuste de la estrategia comercial | La venta toma más tiempo que el plazo objetivo. Se revisó el precio de publicación y se sumaron canales de venta. |
| hatillo_01 | 240 | commercial_report · commercial · null | Nuevas visitas | Hubo visitas de compradores interesados; todavía no hay una oferta firmada. |
| chacao_01 | 1 | purchase_record · acquisitions · document | Compra firmada y expediente abierto | (igual) |
| chacao_01 | 60 | works_report · works · photos | Obra terminada | Se completaron pisos, pintura y carpintería según el presupuesto por rubros. |
| chacao_01 | 75 | commercial_report · commercial · document | Venta firmada | Se firmó la venta del inmueble. Comienza la liquidación. |
| chacao_01 | 90 | settlement_report · finance · document | Liquidación publicada | (igual que palos_grandes_01) |
| valencia_01 | 1 | purchase_record · acquisitions · document | Compra firmada y expediente abierto | (igual) |
| valencia_01 | 45 | works_report · works · photos | Avance de obra | Se terminaron electricidad y plomería; siguen pisos y pintura. |
| valencia_01 | 62 | commercial_report · commercial · null | Inmueble publicado | (igual que hatillo_01) |
| valencia_01 | 100 | commercial_report · commercial · null | Primeras visitas | Se recibieron las primeras visitas; todavía no hay una oferta firmada. |
| paraiso_01 | 1 | purchase_record · acquisitions · document | Compra firmada y expediente abierto | (igual) |
| paraiso_01 | 20 | placement_report · finance · document | Colocación completa | Se colocaron las 100 participaciones de ejemplo del proyecto. |
| paraiso_01 | 40 | works_report · works · photos | Avance de obra | Demolición y albañilería terminadas; empieza la electricidad. |
| chacao_02 | 1 | purchase_record · acquisitions · document | Compra firmada y expediente abierto | (igual) |
| chacao_02 | 3 | placement_report · finance · null | Colocación abierta | Se abrió la colocación de participaciones de ejemplo para financiar la reforma. |
| chacao_02 | 10 | works_report · works · document | Presupuesto de obra aprobado | Se aprobó el presupuesto por rubros con dos contratistas evaluados. |

### 3.6 `composition` (paquete DATA)

```ts
// src/composition/modules/projects.ts
export type ProjectsModule = { projectRepository; propertyRepository; readonly detailsRepository: ProjectDetailsRepository };

// src/composition/modules/finance.ts
import { HOLDING_LIMITS } from "@/modules/participations/domain/participation";   // ruta interna (D1)
export type FinanceModule = {
  readonly economicsRepository: ProjectEconomicsRepository;
  readonly settlementRepository: SettlementRepository;
  readonly budgetRepository: ProjectBudgetRepository;     // NUEVO
  readonly getProjectSheet: GetProjectSheet;              // NUEVO
};
export function registerFinance(
  store: DemoStore<DemoSnapshot>,
  deps: {
    readonly clock: Clock;
    readonly projects: Pick<ProjectsModule, "projectRepository" | "propertyRepository" | "detailsRepository">;
    readonly participations: Pick<ParticipationsModule, "classRepository" | "listMarketplace">;
  },
): FinanceModule;

// src/composition/container.ts: solo cambia el cableado
const projects = registerProjects(store);
const participations = registerParticipations(store, projects);
const finance = registerFinance(store, { clock, projects, participations });
```
`Container` conserva su forma. Sigue prohibido importar valores desde `@/modules/participations` o `@/modules/finance` (sus `index`) en `composition/**`.

### 3.7 `shared` (paquete UI)

```ts
// src/shared/ui/app-shell/route-map.ts
/** [SUPUESTO S3 → resuelto en P4] Proyecto de ejemplo real (abierto a participar) para P4, P5 y B3. */
export const EXAMPLE_PROJECT_SLUG = "m2-006-chacao";
/** URL de P5 de un proyecto: `/proyectos/${slug}/participar`. Coincide con ROUTES.p5.pattern. */
export function participateHref(slug: string): AppPath;
// app-shell/index.ts: exporta participateHref.

// src/shared/lib/format-percentage.ts
/** 2500 → "25 %" · −2000 → "−20 %" (signo menos U+2212) · con signed: 500 → "+5 %", 0 → "0 %". Decimales con coma: 250 → "2,5 %". NBSP antes de %. */
export function formatBps(bps: number, options?: { readonly signed?: boolean }): string;

// src/shared/ui/primitives/range.tsx · "use client" no hace falta (input controlado por el padre)
export type RangeInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange" | "min" | "max" | "step"> & {
  value: number; min: number; max: number; step?: number;
  onValueChange(next: number): void;          // Number(e.currentTarget.value)
  "aria-valuetext"?: string;
};
// <input type="range"> con accent-[var(--primary)], h-11 de zona táctil, focus-visible:ring-2 ring-ring, w-full. Sin colores de marca a mano.
```
README: añadir la sección "RangeInput (`primitives/range.tsx`)", que se usa en simuladores y rangos numéricos. Siempre con `<Label htmlFor>` visible y `aria-valuetext`. No se usa para elegir entre opciones discretas sin orden. Añadir también `formatBps` en "Formateadores".

### 3.8 `finance/ui` (paquete UI)

```ts
// hooks · "use client"
// src/modules/finance/ui/hooks/use-project-sheet.ts
export const projectSheetQueryKey = (slug: string) => ["finance", "project-sheet", slug] as const;
/** useQuery({ queryKey, queryFn: () => useContainer().finance.getProjectSheet(slug), retry: false }). */
export function useProjectSheet(slug: string): UseQueryResult<ProjectSheetLookup, Error>;

// src/modules/finance/ui/hooks/use-simulator.ts
export type SimulatorController = {
  readonly inputs: SimulatorInputs;
  readonly result: Result<SimulationResult, DomainError<SimulationErrorCode>>;
  readonly activePreset: StressPresetId | null;
  readonly placed: { readonly min: number; readonly max: number };
  dispatch(change: SimulatorChange): void;
};
/** useReducer((s, c) => applySimulatorChange(setup, s, c), setup, initialSimulatorInputs); result = useMemo(simulateProjection). */
export function useSimulator(setup: SimulatorSetup): SimulatorController;
```

Componentes en `src/modules/finance/ui/components/investor/`. Todos aceptan `TestIdProp`, tienen menos de 200 líneas y **no importan `../../domain` ni `@/shared/domain/money` (valores)**:

| Archivo | Tipo | Props | Notas |
|---|---|---|---|
| `ProjectSheet.tsx` | Server | `TestIdProp & { params: Promise<{ slug: string }> }` | `<div data-testid="pagina-p4" data-route-id="p4">` + `<Suspense fallback={<ProjectSheetSkeleton/>}><SheetForSlug params/></Suspense>`. `SheetForSlug` (async, en el mismo archivo) hace `await params`. Si `!isProjectSlug(slug)` → `notFound()`. Si no → `<ProjectSheetView slug/>` |
| `ProjectSheetSkeleton.tsx` | Server | `TestIdProp` | `data-testid="ficha-cargando"`: bloque de cabecera + 3 `CardSkeleton`. Sin `h1` |
| `ProjectSheetView.tsx` | Client | `TestIdProp & { slug: string }` | pending → `ProjectSheetSkeleton` · error → `ErrorState data-testid="ficha-error"` + `Button data-testid="ficha-reintentar" onClick=refetch` · `not_found` → `<ProjectNotFound/>` · found → `<article data-testid="ficha" data-project-code data-mode data-phase>` con las secciones de §3.9 |
| `ProjectNotFound.tsx` | Server (sin hooks) | `TestIdProp` | `data-testid="ficha-no-encontrada"`: `PageHeader` (h1) + `Link` a `routeHref("p3")` con `data-testid="ficha-no-encontrada-volver"` |
| `SheetHeader.tsx` | Server | `{ sheet }` | `PageHeader id="titulo-p4"`. Lateral (aside): `ProjectSeal data-testid="ficha-sello"` + `StatusBadge data-testid="ficha-etapa" {...PHASE_PRESENTATION[phase]}`. Acción: `SheetCta` |
| `SheetCta.tsx` | Server | `{ sheet; testId }` | open → `Button asChild` + `Link href={participateHref(slug)}` (copy `cta.participate`) · resto → `Link href={routeHref("p3")}` (`cta.browse`). Siempre seguido de `LegalNotice notice="riskNotice" variant="inline"` |
| `SheetSummary.tsx` | Server | `{ sheet }` | Disponibles, colocadas/retenidas, precio (`MoneyDisplay kind="amount"`), plazo objetivo en `ProjectionLabel` (si no es null) |
| `SheetProperty.tsx` | Server | `{ sheet }` | Tipo, superficie, zona y nota de dirección (D6). Sin mapa ni fotos |
| `SheetBudget.tsx` | Server | `{ budget: BudgetBreakdown }` | `<dl>` por grupo; montos con `MoneyDisplay kind="amount"`; proyección con `kind="projection"` |
| `SheetScenarios.tsx` | Server | `{ scenarios; unitPrice }` | 3 `Surface`. Capital por participación (`kind="capital"`, size `md`) primero; precio, excedente, ganancia por participación y cobro con `kind="projection"` size `md` (D: capital ≥ proyección) |
| `Simulator.tsx` | Client | `{ setup: SimulatorSetup }` | `useSimulator`; compone Controls, Presets, Result, Breakdown y el descargo `LegalNotice notice="simulatorDisclaimer" data-testid="simulador-descargo"` **debajo** de todo |
| `SimulatorControls.tsx` | Client | `{ controller; setup }` | Base (2 botones `aria-pressed`) y 5 `RangeInput` con `Label` + valor visible `<output>` |
| `SimulatorPresets.tsx` | Client | `{ active; onPreset; onReset }` | `role="group"`: 7 botones `aria-pressed` y uno de "volver a base". `flex-wrap` en 390 |
| `SimulatorResult.tsx` | Client | `{ result; setup }` | `role="status" aria-live="polite" data-testid="simulador-resultado"`. 3 bloques (capital `size="lg"`, ganancia y cobro `size="lg"`, nunca mayores). Plazo proyectado en `ProjectionLabel` |
| `SimulatorBreakdown.tsx` | Client | `{ outcome: DistributionOutcome }` | Reparto del excedente (6 filas) o "sin reparto" |
| `SheetRealized.tsx` | Server | `{ realized; settledOn }` | Capital (`kind="capital"`), ganancia y cobro realizados (`kind="realized"`) y reparto realizado. Nota `ficha-simulador-inactivo` |
| `SheetTimeline.tsx` | Server | `{ milestones; updates }` | `<ol>` de hitos + `<ul>` de actualizaciones con fecha (`formatIsoDate`), fuente, responsable y evidencia |
| `SheetRisks.tsx` | Server | `{ risks }` | `BulletList marker="dash"` (título + mitigación) + `LegalNotice riskNotice` |
| `SheetNextStep.tsx` | Server | `{ sheet }` | `Section` final con `SheetCta testId="siguiente-paso"` |
| `presentation.ts` | — | — | Tablas `MILESTONE_LABEL`, `MILESTONE_STATE_LABEL`, `BUDGET_ITEM_LABEL`, `BUDGET_CATEGORY_LABEL`, `RISK_PRESENTATION`, `SOURCE_LABEL`, `RESPONSIBLE_LABEL`, `EVIDENCE_LABEL`, `PRESET_TEST_ID`. `Record` exhaustivos que leen de `copy.ts` |

Los "Server" sin hooks que se usan dentro de `ProjectSheetView` (cliente) se renderizan como componentes del cliente. Por eso no pueden ser `async` ni importar nada de servidor.

```ts
// src/modules/finance/index.ts (paquete UI; contenido COMPLETO)
export type { ValueBasis, DistributionShares, ParticipationTerms, DistributionInput, DistributionInputErrorCode, CapitalReturn, Distribution, NoDistribution, DistributionOutcome } from "./domain/distribution";
export { DEFAULT_DISTRIBUTION_SHARES, calculateDistribution } from "./domain/distribution";
export { validateDistributionInput } from "./domain/validate-distribution-input";
export type { HolderPayout } from "./domain/holder-payout";
export { calculateHolderPayout } from "./domain/holder-payout";
export type { ProjectEconomics } from "./domain/project-economics";
export type { SettlementId, RealizedDistributionInput, Settlement, SettlementErrorCode } from "./domain/settlement";
export { createSettlement } from "./domain/settlement";
export type { BudgetCategory, BudgetItem, BudgetLine, ProjectBudget, BudgetGroup } from "./domain/budget";
export type { SimulationSource, SimulationBase, SimulatorSetup, SimulatorInputs, SimulatorChange } from "./domain/simulator";
export type { StressPresetId } from "./domain/stress-presets";
export type { SimulationResult, HolderProjection } from "./domain/simulate-projection";
export type { ScenarioKind, ScenarioOutcome } from "./domain/scenarios";
export type { SheetMode, ProjectSheet, RealizedResult, BudgetBreakdown, MilestoneView } from "./domain/project-sheet";
export { simulateProjection } from "./domain/simulate-projection";
export type { GetProjectSheet, ProjectSheetLookup, ProjectBudgetRepository } from "./application/…";   // de get-project-sheet.ts y ports.ts
export { ProjectSheet, type ProjectSheetProps } from "./ui/components/investor/ProjectSheet";
export { ProjectNotFound, type ProjectNotFoundProps } from "./ui/components/investor/ProjectNotFound";
```
`index.ts` **no** exporta `ProjectSheet` como tipo y como componente con el mismo nombre. El tipo de dominio se exporta como `ProjectSheet` y el componente como `ProjectSheetPage`. **Corrección del contrato:** el componente y su archivo se llaman `ProjectSheetPage` / `ProjectSheetPage.tsx` (props `ProjectSheetPageProps`), para evitar el choque con el tipo. Esto aplica en toda la tabla de arriba.

### 3.9 `app/` (paquete UI)

```tsx
// src/app/(inversionista)/proyectos/[slug]/page.tsx
import { ProjectSheetPage } from "@/modules/finance";
import { routeMetadata } from "@/shared/ui/app-shell";
export const metadata = routeMetadata("p4");
export default function ProjectPage({ params }: PageProps<"/proyectos/[slug]">) {
  return <ProjectSheetPage params={params} />;
}
// Si PageProps<"/proyectos/[slug]"> no resuelve con los grupos de rutas: { params: Promise<{ slug: string }> }.

// src/app/(inversionista)/proyectos/[slug]/not-found.tsx
import { ProjectNotFound } from "@/modules/finance";
export default function ProjectNotFoundPage() {
  return <ProjectNotFound />;
}
```

**Orden y tonos de la ficha** (ADR-010: una banda, una idea; no hay dos tonos iguales seguidos):

| # | Sección (`data-testid`) | Tono | open / illustrative | settling | historic |
|---|---|---|---|---|---|
| 0 | `PageHeader` (`ficha-cabecera`) | dark | ✔ | ✔ | ✔ |
| 1 | Resumen (`ficha-resumen`) | light | ✔ | ✔ | ✔ |
| 2 | El inmueble (`ficha-inmueble`) | paper | ✔ | ✔ | ✔ |
| 3 | Presupuesto (`ficha-presupuesto`) | sand | ✔ | ✔ | ✔ (sin `projection`) |
| 4 | Escenarios (`ficha-escenarios`) | light | ✔ | — | — |
| 5 | Simulador (`ficha-simulador`) / Liquidación en curso (`ficha-liquidacion-en-curso`) / Resultado (`ficha-resultado`) | sand ruled | simulador | en curso | resultado |
| 6 | Cronograma y actualizaciones (`ficha-cronograma`) | paper | ✔ | ✔ | ✔ |
| 7 | Riesgos (`ficha-riesgos`) | dark | ✔ | ✔ | ✔ |
| 8 | Siguiente paso (`ficha-siguiente-paso`) | sand | ✔ | ✔ | ✔ |

En `settling` y `historic` la #4 no está, así que #3 (sand) va seguida de #5 (sand): por eso #5 lleva `ruled`.

### 3.10 Copy

`src/modules/finance/ui/copy.ts` → `PROJECT_SHEET_COPY` y `src/modules/finance/ui/simulator-copy.ts` → `SIMULATOR_COPY` (los dos `as const`; los dos cumplen `copy\.ts$` para `check-copy`). Sin "rueda", "estancado", "días sin vender", "real/reales", "Invierte/Compra/Invertir/Comprar", "Club M²" ni promesas. **Tampoco en comentarios.** Los avisos legales salen de `LEGAL_COPY`.

| Clave (`PROJECT_SHEET_COPY`) | Texto |
|---|---|
| `header.eyebrow` | Ficha del proyecto |
| `header.description(kind, m2, city, zone)` | `${kind} de ${m2} m² en ${city} · ${zone}. Proyecto de ejemplo con datos simulados.` |
| `kind.apartment · house` | Apartamento · Casa |
| `cta.participate · browse` | Vista previa: cómo participar · Ver proyectos abiertos a participar |
| `summary.title` | Resumen |
| `summary.availability(a, t)` · `closedNote` | `Participaciones disponibles: ${a} de ${t}` · colocación cerrada |
| `summary.placed(p, t)` · `retained(n)` | `Colocadas: ${p} de ${t}` · `Retenidas por la empresa: ${n}` |
| `summary.price` · `summary.targetTerm(m)` | Precio por participación · `Plazo objetivo: ${m} meses desde la compra` |
| `property.title · kind · area · zone` | El inmueble · Tipo · Superficie · Zona |
| `property.areaValue(m)` · `zoneValue(c, z)` | `${m} m²` · `${c} · ${z}` |
| `property.addressNote` · `photosNote` | Mostramos la zona, no la dirección exacta. · Esta sección mostrará las fotos del antes y el después. |
| `budget.title` | Presupuesto desglosado |
| `budget.description` | Cifras de ejemplo. La empresa compra el inmueble con capital propio; las participaciones financian solo el presupuesto integral de recuperación. |
| `budget.acquisition · recovery` | Compra del inmueble · capital propio de la empresa · Presupuesto integral de recuperación · lo financian las participaciones |
| `budget.category.works · management_fee · contingency · reserve` | Obra por rubros · Honorarios de gestión de la empresa · Contingencia · Reserva |
| `budget.item.*` | Demolición y retiro de escombros · Albañilería · Electricidad · Plomería · Pisos y revestimientos · Carpintería y cocina · Pintura y acabados · Gestión del proyecto y compras · Supervisión técnica de obra · Administración, documentos y reportes · Imprevistos de obra · Reserva del proyecto |
| `budget.subtotal` | Subtotal |
| `budget.feesNote` | Los honorarios y la contingencia son parte del presupuesto, no una ganancia adicional de la empresa. Lo que no se use se informará como remanente. |
| `budget.saleCosts · targetSale` | Costos de venta estimados (comisiones, impuestos y registro) · Precio de venta objetivo |
| `scenarios.title · description` | Escenarios · Tres escenarios de ejemplo para el precio de venta y el costo de obra. Ninguno es una promesa. |
| `scenarios.kind.conservative · base · optimistic` | Conservador · Base · Optimista |
| `scenarios.assumptions(sale, works)` | `Venta ${sale} · obra ${works}` (con `formatBps(…, {signed:true})`) |
| `scenarios.capital · salePrice · surplus · perParticipation · payout` | Capital por participación · Precio de venta · Excedente · Ganancia por participación · Cobro por 1 participación |
| `scenarios.noDistribution` | Sin excedente: no hay reparto del fondo. |
| `settling.title · description` | Liquidación en curso · El inmueble se vendió. El resultado se publicará al liquidar el proyecto. |
| `realized.title · description` | Resultado de la liquidación · Proyecto finalizado. Estas cifras son el resultado realizado de la liquidación de ejemplo. |
| `realized.settledOn(date)` | `Liquidado el ${date}` |
| `realized.capital · gain · payout` | Capital aportado por participación · Ganancia realizada por participación · Cobro realizado por participación |
| `realized.simulatorInactive` | El simulador no aplica a un proyecto finalizado. |
| `timeline.title · milestonesHeading · updatesHeading` | Cronograma y actualizaciones · Hitos · Actualizaciones |
| `timeline.milestone.*` | Compra firmada · Apertura de la colocación · Cierre de la colocación · Inicio de obra · Fin de obra · Publicación para la venta · Firma de venta · Liquidación |
| `timeline.state.done · planned · pending` | Hecho · Previsto · Pendiente |
| `timeline.pendingNote` | Se informa en las actualizaciones. |
| `timeline.publishedOn(date)` · `responsible(label)` | `Publicado el ${date}` · `Responsable: ${label}` |
| `timeline.source.*` | Acta de compra · Informe de colocación · Informe de obra · Informe comercial · Informe de liquidación |
| `timeline.responsibleRole.*` | Equipo de adquisiciones · Coordinación de obra · Equipo comercial · Equipo de finanzas |
| `timeline.evidence.photos · document` | Evidencia: fotos de avance (simuladas) · Evidencia: documento de ejemplo |
| `timeline.emptyUpdates` | Este proyecto todavía no tiene actualizaciones publicadas. |
| `risks.title · description` | Riesgos · Lo que puede salir distinto de lo previsto y cómo se gestiona. |
| `risks.sale_price` | Precio de venta menor al previsto — Se usan comparables cerrados y un escenario conservador. |
| `risks.works_overrun` | Obra más cara de lo presupuestado — Presupuesto por rubros, contratistas evaluados y una contingencia. |
| `risks.slow_sale` | Venta más lenta o sin comprador — Estrategia de precio, varios canales de venta y opciones de conservación o alquiler. |
| `risks.liquidity` | Liquidez insuficiente al cierre — Caja separada por proyecto y reservas. Qué pasa con el capital si no hay excedente está por definir. |
| `risks.conflict_of_interest` | Conflicto de intereses — Los honorarios de la empresa se muestran desglosados en el presupuesto. |
| `risks.legal_structure` | Estructura legal pendiente — Hoy no se reciben aportes: las participaciones son de ejemplo hasta que exista una estructura habilitada. |
| `nextStep.open.title · description` | ¿Te interesa este proyecto? · Mira cómo será el proceso para participar. Es una vista previa: hoy no se reciben aportes. |
| `nextStep.closed.title · description` | Este proyecto ya no recibe participaciones · Explora los proyectos abiertos a participar. |
| `loading` · `error.title · description · action` | Cargando la ficha… · No pudimos cargar la ficha · Inténtalo de nuevo. Si continúa, reinicia los datos simulados. · Reintentar |
| `notFound.eyebrow · title · description · action` | Proyectos · No encontramos este proyecto · Puede que el enlace no sea correcto o que el proyecto todavía no esté publicado. · Ver los proyectos del club |

| Clave (`SIMULATOR_COPY`) | Texto |
|---|---|
| `title · description` | Simulador del reparto · Mueve las variables y mira cómo cambiaría tu parte del fondo del 25 %. Todo es proyección. |
| `illustrative` | Este proyecto ya no tiene participaciones disponibles. La simulación ilustra el reparto para quien tuviera esas participaciones. |
| `base.label · project · reference` | Base de la simulación · Este proyecto · Ejemplo de referencia |
| `base.referenceNote(c, f, p)` | `Ejemplo del modelo del club: compra ${c} · presupuesto ${f} · venta ${p} · sin costos de venta.` (montos con `formatMoney`) |
| `held.label · hint(max)` | Participaciones que simulas · `Entre 1 y ${max} por persona` |
| `held.value(n)` | `1 participación` / `${n} participaciones` |
| `placed.label · value(p, t) · hint` | Colocación total del proyecto · `${p} de ${t}` · Incluye las tuyas. Las no colocadas quedan en manos de la empresa. |
| `salePrice.label · value(pct)` | Precio de venta · `${pct} sobre el precio objetivo` |
| `overrun.label · value(pct) · note` | Sobrecosto de obra · `${pct} sobre la obra` · El sobrecosto se suma al presupuesto y reduce el excedente. |
| `delay.label · value(m) · none · note` | Retraso de la venta · `${m} meses` · Sin retraso · En esta simulación el retraso solo cambia el plazo; su costo está por definir. |
| `presets.label · reset` | Pruebas de estrés · Volver a los valores base |
| `presets.sale_minus_20 · works_plus_20 · works_plus_50` | Venta −20 % · Obra +20 % · Obra +50 % |
| `presets.delay_3 · delay_6 · delay_9 · placement_zero` | Retraso 3 meses · Retraso 6 meses · Retraso 9 meses · Colocación 0 % (sin otros participantes) |
| `result.heading · capital · gain · payout` | Resultado de la simulación · Capital aportado · Ganancia proyectada · Cobro proyectado |
| `result.noDistribution` | Sin excedente: no hay reparto del fondo de participaciones. |
| `result.capitalPolicy` | Qué pasa con el capital aportado si no hay excedente: por definir. |
| `result.term(projected, target, delay)` | `Plazo proyectado: ${projected} meses desde la compra (objetivo ${target}${delay > 0 ? ` + retraso ${delay}` : ""})` |
| `breakdown.title` | Cómo se reparte el excedente proyectado |
| `breakdown.surplus · fund · perParticipation · toExternal · companyFromFund · companyDirect` | Excedente · Fondo de participaciones (25 %) · Por participación · A los participantes · A la empresa por sus participaciones retenidas · A la empresa (75 %) |
| `error.title · description` | No pudimos simular con estos valores · Vuelve a los valores base. |
| `aria.result` | Resultado actualizado |

`participations/ui/copy.ts` (paquete UI), solo `nextStep`: `title` "Abre la ficha de un proyecto" · `description` "La ficha muestra el inmueble, el presupuesto desglosado, los escenarios y el simulador del reparto." · `action` "Ver la ficha de un proyecto abierto".

## 4. Paquetes

| # | Agente | Archivos (exclusivos) | Depende de | Paralelo con | Criterios |
|---|---|---|---|---|---|
| D | dominio-financiero | **projects:** `domain/project-slug.ts` (+`.test.ts`), `domain/milestone.ts` (+test), `domain/project-update.ts` (+test), `domain/project-risk.ts`, `application/ports.ts`, `index.ts`, `public-api.test.ts`, `CLAUDE.md` · **finance:** `domain/budget.ts` (+test), `domain/reference-case.ts` (+test), `domain/simulator.ts` (+test), `domain/stress-presets.ts` (+test), `domain/simulate-projection.ts`, `domain/simulate-projection.canonical.test.ts`, `domain/simulate-projection.properties.test.ts`, `domain/scenarios.ts` (+test), `domain/project-sheet.ts` (+`project-sheet-types.ts` si hace falta, +test), `application/ports.ts`, `application/get-project-sheet.ts` (+test), `money-in-ui.test.ts`, `CLAUDE.md` · **participations:** `CLAUDE.md` | contratos §3.1–3.3 | DATA, UI, E2E (redacción) | CA3–CA6 (lógica), CA9 (guardia) |
| DATA | datos-demo | **projects:** `infrastructure/seed.ts`, `infrastructure/seed-progress.ts` (nuevo), `infrastructure/seed-updates.ts` (nuevo), `infrastructure/projects.mock-repository.ts` (+test) · **finance:** `infrastructure/seed.ts`, `infrastructure/seed-budget.ts` (nuevo), `infrastructure/finance.mock-repository.ts` (+test) · **composition:** `demo-snapshot.ts`, `modules/projects.ts`, `modules/finance.ts`, `container.ts`, `container.test.ts`, `seed-consistency.test.ts`, `project-sheet-seed.test.ts` (nuevo) · `src/shared/config/demo.ts` | §3.1–3.3 (tipos) y §3.5–3.6. Escribe contra las firmas; verifica cuando D entregue | D, UI | CA1, CA2 (cifras), CA5, CA6, CA7 |
| UI | constructor-ui | **finance/ui:** `copy.ts`, `simulator-copy.ts`, `hooks/use-project-sheet.ts`, `hooks/use-simulator.ts`, `components/investor/{ProjectSheetPage, ProjectSheetSkeleton, ProjectSheetView, ProjectNotFound, SheetHeader, SheetCta, SheetSummary, SheetProperty, SheetBudget, SheetScenarios, Simulator, SimulatorControls, SimulatorPresets, SimulatorResult, SimulatorBreakdown, SheetRealized, SheetTimeline, SheetRisks, SheetNextStep}.tsx`, `components/investor/presentation.ts` (+`presentation.test.ts`), `components/investor/ProjectSheetView.test.tsx`, `components/investor/Simulator.test.tsx` · `src/modules/finance/index.ts` · `src/modules/participations/index.ts` · `src/modules/participations/ui/copy.ts` · **shared:** `ui/primitives/range.tsx`, `lib/format-percentage.ts` (+test), `ui/README.md`, `ui/app-shell/route-map.ts`, `ui/app-shell/route-map.test.ts`, `ui/app-shell/index.ts` · **app:** `(inversionista)/proyectos/[slug]/page.tsx`, `(inversionista)/proyectos/[slug]/not-found.tsx` | §3 completo; tipos de D | D, DATA, E2E (redacción) | CA1–CA4, CA6, CA8 |
| E2E | qa-e2e | `tests/e2e/ficha.spec.ts` (nuevo) · `tests/e2e/rutas.spec.ts` · `tests/e2e/reiniciar-datos.spec.ts` | testids de §5.3; se ejecuta después de D, DATA y UI | redacción con todos | CA1, CA3–CA6, CA8, CA9 |

**Orden.** D ∥ DATA ∥ UI ∥ (redacción de E2E), todos contra §3. Se integra en este orden: **D → DATA → UI → ejecución de E2E**. El orquestador corre `pnpm verify` y `pnpm build`. Después vienen `revisor-codigo` ∥ `revisor-cumplimiento` y, al final, la integración. DATA y UI pueden compilar contra tipos provisionales, pero no entregan `HECHO` hasta que D haya entregado.

**Notas por paquete.**
- **D.**
  - El dominio no usa `Date` ni hace aritmética sobre `.cents`: usa solo `shared/domain/money` (`applyPercentageFloor`, `addMoney`, `multiplyMoney`, `sumMoney`) y `percentage`.
  - `simulate-projection.ts` llama a `calculateDistribution` y `calculateHolderPayout`, nunca a fórmulas propias. Si `calculateHolderPayout` devuelve `HELD_OUT_OF_RANGE`, se propaga.
  - `money-in-ui.test.ts` recorre `src/modules/finance/ui/**/*.{ts,tsx}` con `readFileSync` y falla si encuentra `/\.cents\s*[-+*/%]|[-+*/%]\s*[\w.]*\.cents/` o un `import {` no-`type` desde `"@/shared/domain/money"`.
  - `finance/CLAUDE.md` añade: primera `ui/` (D1), las cuatro reglas de la trampa de ciclo (D1), "solo los hooks importan domain" (D9), y los supuestos P4-1…P4-10 con un enlace a este plan. Debe seguir en 30 líneas o menos.
  - `projects/CLAUDE.md` añade una línea sobre hitos, actualizaciones y riesgos (sin niveles) e `isProjectSlug`.
  - `public-api.test.ts` amplía la lista exacta y mantiene "ninguna clave /wheel/i".
- **DATA.**
  - Es el único paquete que toca `seed*.ts` y `composition/**`.
  - Las fechas salen de `relativeDates(clock)` o de `addDays(acquiredOn, n)`. No hay fechas literales: el test se amplía a `seed-progress.ts`, `seed-updates.ts` y `seed-budget.ts`.
  - `buildFinanceSeed` valida los presupuestos con `checkProjectBudget` y lanza un error si fallan.
  - `seed-consistency.test.ts` pasa a importar el motor de `@/modules/finance/domain/*` (D1). La aserción `parseDemoSnapshot({ version: 2 })` cambia a `({ version: 1 })` → `ok === false`.
  - Antes de entregar: `node scripts/check-copy.mjs src/modules/projects/infrastructure`.
- **UI.**
  - Lee `dynamic-routes.md` (§With Cache Components), `not-found.md` y `preserving-ui-state.md` antes de escribir.
  - Ningún componente lee el container en el render. Solo `useQuery` lo hace (R6 de P3).
  - Reutiliza `PageHeader`, `Section`, `Surface`, `BulletList`, `ProjectSeal`, `StatusBadge`, `MoneyDisplay`, `ProjectionLabel`, `LegalNotice`, `ErrorState`, `CardSkeleton`, `TextSkeleton`, `Button` y `Label`. **No** crea componentes en `shared/ui` aparte de `range.tsx`. Si falta algo más, devuelve `BLOQUEADO`.
  - Los valores de `aria-valuetext` y de `<output>` se arman con `formatMoney` y `formatBps`, nunca con aritmética.
  - Antes de entregar: `node scripts/check-copy.mjs src/modules/finance src/modules/participations src/app`.
- **E2E.**
  - Importa `LEGAL_COPY` por ruta relativa. Normaliza NBSP (U+00A0) y el signo menos (U+2212) antes de comparar.
  - Acota los locators a `[data-testid="pagina-p4"]:visible` (Activity).
  - Mueve los rangos con `locator.fill("63")`.
  - En `reiniciar-datos.spec.ts`: `KEY = "club-demo:v2"` y `snap.version` = 2. El valor alterado conserva `version: 1`, que se descarta y siembra de nuevo igual.

## 5. Pruebas

### 5.1 Unitarias e integración (Vitest)

**D · projects**
- `project-slug.test.ts`: acepta `m2-006-chacao`. Rechaza `M2_RARO`, `""`, `a--b`, `-a`, `a-` y valores que no son string.
- `milestone.test.ts`: `milestoneState` da `done`, `planned` (plannedOn = today cuenta como planned) y `pending`. `sortMilestones` sigue el orden de `MILESTONE_KINDS` y no muta la entrada.
- `project-update.test.ts`: orden descendente por fecha; en empate, por id.
- `public-api.test.ts`: lista exacta ampliada y ninguna clave /wheel/i.

**D · finance**
- `budget.test.ts`:
  - La plantilla de §3.5 suma USD 10.000, con obra 5.000, honorarios 3.000 y contingencia 2.000.
  - `BUDGET_TOTAL_MISMATCH` con una línea de USD 1 de más. También `DUPLICATE_ITEM`, `NEGATIVE_AMOUNT` y `NO_WORKS_LINES`.
  - `groupBudget` respeta el orden y omite `reserve` vacío. `worksTotal` = 5.000.
  - `BUDGET_ITEM_CATEGORY` es exhaustivo.
- `reference-case.test.ts`: `REFERENCE_SIMULATION_BASE` con `placed 100` da con `calculateDistribution` el C1 exacto del test canónico.
- `simulator.test.ts`:
  - `initialSimulatorInputs` en open M2-like (colocadas 63, disponibles 37) da `placed 64` y `held 1`. En illustrative (81) da `placed 81`. Al cambiar a la base de referencia, `placed 100`.
  - `held` se recorta a `heldLimits` (21 → 20 y 0 → 1). Con disponibles 5: máximo 5.
  - `placed` se recorta a [held, total]. NaN e Infinity vuelven al valor inicial.
  - `normalize` es idempotente (fast-check).
  - `reset` conserva `source`.
- `stress-presets.test.ts`:
  - Cada preset fija solo su variable y deja el resto en el valor inicial. `placement_zero` da `placed = held`.
  - `activeStressPreset` reconoce los 7 presets y devuelve `null` con valores mixtos.
  - Aplicar `delay_6` después de `sale_minus_20` deja la venta en 0 (un preset a la vez).
- `simulate-projection.canonical.test.ts` (CA5), con nombres de negocio:
  - **C1** · referencia, held 1, placed 100: `fund` 500 000 ¢, `perParticipation` 5 000 ¢, `toExternal` 500 000 ¢, `companyFromFund` 0, `companyDirect` 1 500 000 ¢. `holder` = {contributed 10 000 ¢, gain 5 000 ¢, payout 15 000 ¢}.
  - **C6** · placed 63: `toExternal` 315 000 ¢ y `companyFromFund` 185 000 ¢.
  - **C3 vía colocación mínima** · placed = held = 1: `perParticipation` 5 000 ¢.
  - **Sin excedente** · referencia con venta −5000 pb: P 20.000 → `no_distribution`, `holder.kind "no_distribution"`, `capitalPolicy "to_be_defined"` y `contributed` 10 000 ¢.
  - **Pérdida (como C5)** · venta −5000 pb y obra +5000 pb: excedente −2.500 → sin reparto.
  - **M2-006** (base: C 50.000, F 10.000, obra 5.000, P 76.000, O 2.280):
    - inicial → gain 3 430 ¢ y payout 13 430 ¢
    - venta −20 % → `no_distribution` (excedente −148 000 ¢)
    - obra +20 % → gain 3 180 ¢
    - obra +50 % → 2 805 ¢
    - retraso 6 → `projectedMonths 9` con el mismo gain
    - colocación 0 → `companyFromFund` 339 570 ¢
- `simulate-projection.properties.test.ts`, con fast-check sobre entradas arbitrarias (también fuera de rango):
  - nunca lanza;
  - si hay reparto, `toExternal + companyTotal === surplus`, `holder.gain === perParticipation × held` y `payout = contributed + gain`;
  - `projectedMonths = target + delay`;
  - `recoveryBudget ≥ F`;
  - `JSON.stringify(result)` no coincide con /wheel|rueda|stalled/.
- `scenarios.test.ts`:
  - devuelve 3 escenarios, en orden.
  - En M2-006, por participación: conservador 1 280 ¢ (P 6 840 000 ¢, F' 1 100 000 ¢), base 3 430 ¢ y optimista 4 380 ¢.
  - Las asunciones coinciden con D6.
- `project-sheet.test.ts`, con fixtures en línea:
  - Modos D4 para las 6 fases.
  - `open`: `heldLimits.max` = min(20, disponibles) y `retained 0`.
  - `illustrative`: `retained = total − placed`.
  - `historic`: `simulator null`, `scenarios []`, `realized.perParticipation` = `calculateHolderPayout(dist, 1)` y `budget.projection null`. Sin liquidación → `MISSING_SETTLEMENT`.
  - Otro `projectId` en cualquier parte → `PROJECT_MISMATCH`.
  - Un hito vencido sin cumplir da `pending` con `date null`.
  - Los riesgos salen ordenados y sin duplicados.
  - Las claves del resultado no coinciden con /wheel/i.
- `get-project-sheet.test.ts`, con repos falsos:
  - Un slug ausente en `listMarketplace` da `not_found` y no consulta los demás repos.
  - Con datos completos da `found`.
  - Si falta la economía, la promesa se rechaza.
  - Si un repo lanza en síncrono, se rechaza (no hay excepción sin capturar).
  - Usa `clock.today()` para los hitos.
- `money-in-ui.test.ts` (guardia, CA9): pasa sobre el árbol actual y detecta una cadena de prueba con `.cents +`.

**DATA**
- `seed-consistency.test.ts` amplía:
  - (a) cada presupuesto pasa `checkProjectBudget` con su `recoveryBudget`; obra = 5.000 y honorarios + contingencia = 5.000 (maestro §6); hay 7 presupuestos.
  - (b) hitos: los 6 publicados tienen 8 cada uno; `completedOn ≤ today`; los cumplidos son los de su estado; `sale_signed` y `settlement` de los liquidados coinciden con `timeline`; M2-007 no tiene ninguno.
  - (c) actualizaciones: hay 23 (§3.5). `publishedOn` está entre `acquiredOn` y today, y en los liquidados es ≤ `settledOn`. Los ids son únicos.
  - (d) los 6 publicados tienen los 6 riesgos.
  - (e) `JSON.stringify(snapshot)` no coincide con /rueda|estancad|días sin vender|wheel/i.
  - (f) no hay fechas literales en los 5 `seed*.ts`.
  - (g) desplazar today desplaza también hitos y actualizaciones.
  - (h) versión 2: el snapshot sobrevive a JSON, y `{version: 1}` no se acepta.
- `container.test.ts`: `storageKey "club-demo:v2"`, `c.finance.getProjectSheet` existe, sigue sin exponer backoffice.
- `project-sheet-seed.test.ts` (`createContainer({ clock: fixedClock(isoDate("2026-11-22")), storage: memoryStorage() })`):
  - Los 6 slugs de CA1 dan `found`.
  - `m2-007-palos-grandes`, `m2-001` y `no-existe` dan `not_found`.
  - M2-006: `mode "open"`, `available 37`, `placed 63`, `heldLimits.max 20`, compra 5 000 000 ¢ y 3 grupos de presupuesto. Su hito `placement_close` está `planned`.
  - M2-005 `illustrative` · M2-002 `illustrative`, sin texto /estanc/ · M2-003 `historic` con `realized.perParticipation.gain` 3 450 ¢ · M2-001 `historic` con 3 024 ¢.
  - Tras `c.demo.reset()` da lo mismo.
- Repos mock: `detailsRepository` filtra por proyecto y `budgetRepository.findByProject` devuelve null si el id no existe.

**UI**
- `format-percentage.test.ts`: 2500 → "25 %", −2000 → "−20 %", 500 con signed → "+5 %", 0 con signed → "0 %", 250 → "2,5 %".
- `route-map.test.ts`: `EXAMPLE_PROJECT_SLUG === "m2-006-chacao"`; `participateHref` coincide con el patrón de p5; las pruebas actuales siguen en verde.
- `presentation.test.ts`: los `Record` son exhaustivos sobre `MILESTONE_KINDS`, `RISK_KINDS`, `BUDGET_ITEMS`, `UPDATE_SOURCES`, `RESPONSIBLE_ROLES`, `EVIDENCE_KINDS` y `STRESS_PRESET_IDS`, y ninguna etiqueta coincide con /rueda|estanc|días/i.
- `ProjectSheetView.test.tsx` (jsdom, `<Providers container={fake}>`):
  - Una promesa pendiente muestra `ficha-cargando`.
  - Un rechazo muestra `ficha-error`, y `ficha-reintentar` hace una segunda llamada.
  - `not_found` muestra `ficha-no-encontrada`.
  - Con un fixture open están las 9 secciones. Con uno historic hay `ficha-resultado` y `ficha-simulador-inactivo`, y no hay `ficha-simulador`, `ficha-escenarios` ni `projection-label` dentro de `ficha-resultado`.
  - `textContent` no coincide con /rueda|estancad/i.
- `Simulator.test.tsx` (jsdom, setup de referencia):
  - El estado inicial muestra C1 (USD 100 / 50 / 150).
  - Con `fireEvent.change` de `simulador-colocacion` a 63, `reparto-externos` muestra 3.150.
  - `preset-venta-menos-20` deja `aria-pressed="true"`.
  - Con un setup de M2-006 y el preset venta −20 % aparecen `resultado-sin-reparto` y `resultado-politica-capital`, y no hay `resultado-cobro`.
  - `simulador-descargo` es el último hijo de `ficha-simulador` y tiene el texto exacto.

### 5.2 E2E (`tests/e2e/ficha.spec.ts`, proyectos `movil-390` y `desktop-1440`)

1. **Desde P3.** `/proyectos` → `tarjeta-enlace` de M2-006 → URL `/proyectos/m2-006-chacao$` → `ficha` con `data-mode="open"` y un solo `h1` ("Apartamento El Rosal").
2. **Secciones y avisos (M2-006).**
   - Son visibles las 9 secciones de §3.9.
   - `ficha-disponibles` = "Participaciones disponibles: 37 de 100".
   - `presupuesto-compra` contiene "USD 50.000" y `presupuesto-integral` "USD 10.000".
   - Hay 3 `presupuesto-grupo`; el de `works` tiene 7 `presupuesto-linea` y el de honorarios 3.
   - `presupuesto-costos-venta` está dentro de un `projection-label`.
   - `ficha-aviso-riesgo-cta` y `ficha-aviso-riesgo` muestran `LEGAL_COPY.riskNotice`.
   - `simulador-descargo` muestra `LEGAL_COPY.simulatorDisclaimer`.
   - La zona `ficha-inmueble-zona` = "Caracas · Chacao", sin dirección.
3. **Escenarios.** Hay 3 `escenario`. El de `base` tiene `escenario-por-participacion` con "USD 34,30" y el conservador "USD 12,80". Cada uno tiene `projection-label`.
4. **Simulador · C1 y C6.**
   - Clic en `simulador-base-referencia` → `resultado-capital` "USD 100", `resultado-ganancia` "USD 50" y `resultado-cobro` "USD 150". `reparto-externos` "USD 5.000", `reparto-empresa-fondo` "USD 0" y `reparto-empresa-directo` "USD 15.000".
   - `simulador-colocacion.fill("63")` → `reparto-externos` "USD 3.150" y `reparto-empresa-fondo` "USD 1.850". La ganancia sigue en "USD 50".
   - `simulador-participaciones.fill("20")` → capital "USD 2.000" y ganancia "USD 1.000".
5. **Presets (M2-006, base del proyecto).**
   - `preset-venta-menos-20` → `resultado-sin-reparto` y `resultado-politica-capital` ("por definir") visibles; no hay `resultado-cobro`; `resultado-capital` sigue visible.
   - `preset-obra-mas-20` → "USD 31,80" · `preset-obra-mas-50` → "USD 28,05".
   - `preset-retraso-6` → `resultado-plazo` contiene "9 meses" y la ganancia vuelve a "USD 34,30".
   - `preset-colocacion-0` → `simulador-colocacion-valor` = "1 de 100".
   - `simulador-restablecer` → ningún preset tiene `aria-pressed="true"`.
6. **Límites D4.** `simulador-participaciones` tiene `max="20"` en M2-006 y `min="1"`.
7. **Ilustrativo (M2-002).** `/proyectos/m2-002-el-hatillo` → `data-mode="illustrative"` y `simulador-modo-ilustrativo` visible. El cuerpo no coincide con /rueda|estancad|días sin vender/i. `ficha-etapa` no tiene `data-tone="attention"`.
8. **Finalizado (M2-003).**
   - `data-mode="historic"`.
   - `resultado-realizado-ganancia` = "USD 34,50" (con `data-kind="realized"`) y `resultado-realizado-capital` = "USD 100" (con `data-kind="capital"`).
   - `ficha-simulador-inactivo` visible; no hay `ficha-simulador` ni `ficha-escenarios`.
   - Dentro de `ficha-resultado` no hay `projection-label`.
9. **No encontrado.** `/proyectos/m2-007-palos-grandes`, `/proyectos/no-existe` y `/proyectos/M2_RARO` → `ficha-no-encontrada` visible, `zona-investor` visible y un solo `h1`. `ficha-no-encontrada-volver` lleva a `/proyectos`. El cuerpo no contiene "Dúplex Los Palos Grandes".
10. **Reiniciar datos.** En la ficha de M2-006 se mueve el simulador y se corre `demo-reset-*`. Después `ficha` sigue visible con `ficha-disponibles` "37 de 100".
11. **Accesibilidad.** Cada `input[type=range]` dentro de `ficha-simulador` tiene un `label` asociado (`getByLabel`) y `aria-valuetext`. `simulador-resultado` tiene `aria-live="polite"`. Al tabular, el foco visible llega a `simulador-participaciones`.
12. **Sin errores.** Ningún `console.error` ni `pageerror` al cargar, simular y navegar (incluidos los de hidratación).
13. **Responsive.** En 390: `scrollWidth ≤ 390` en las fichas de M2-006 y M2-003, y los presets hacen wrap. En 1440: `resultado-capital` y `resultado-ganancia` comparten `boundingBox().y`.

`rutas.spec.ts`:
- `BUILT` = `["p1", "p3", "p4"]`.
- Recorrido inversionista: `["/registro", "/proyectos", "/proyectos/m2-006-chacao", "/proyectos/m2-006-chacao/participar", "/portafolio"]`.
- Recorrido operativo: `"/admin/proyectos/m2-006-chacao"`.

El test de p4 sigue exigiendo `pagina-p4`, un `h1` y `siguiente-paso` con href `/proyectos/m2-006-chacao/participar`.

### 5.3 `data-testid`

- **Página y estados:** `pagina-p4` (+`data-route-id`) · `ficha` (+`data-project-code`, `data-mode`, `data-phase`) · `ficha-cargando` · `ficha-error` · `ficha-reintentar` · `ficha-no-encontrada` · `ficha-no-encontrada-volver`
- **Cabecera:** `ficha-cabecera` · `ficha-sello` · `ficha-etapa` · `ficha-cta-participar` (o `ficha-cta-proyectos`) · `ficha-aviso-riesgo-cta`
- **Resumen e inmueble:** `ficha-resumen` · `ficha-disponibles` · `ficha-colocacion` · `ficha-precio` · `ficha-plazo` · `ficha-inmueble` · `ficha-inmueble-tipo` · `ficha-inmueble-superficie` · `ficha-inmueble-zona`
- **Presupuesto:** `ficha-presupuesto` · `presupuesto-compra` · `presupuesto-integral` · `presupuesto-grupo` (+`data-category`) · `presupuesto-linea` (+`data-item`) · `presupuesto-subtotal` · `presupuesto-nota-honorarios` · `presupuesto-costos-venta` · `presupuesto-precio-objetivo`
- **Escenarios:** `ficha-escenarios` · `escenario` (+`data-scenario`) · `escenario-capital` · `escenario-precio` · `escenario-excedente` · `escenario-por-participacion` · `escenario-cobro` · `escenario-sin-reparto`
- **Simulador:** `ficha-simulador` · `simulador-modo-ilustrativo` · `simulador-base-proyecto` · `simulador-base-referencia` · `simulador-participaciones`/`-valor` · `simulador-colocacion`/`-valor` · `simulador-precio`/`-valor` · `simulador-sobrecosto`/`-valor` · `simulador-retraso`/`-valor` · `simulador-presets` · `preset-venta-menos-20` · `preset-obra-mas-20` · `preset-obra-mas-50` · `preset-retraso-3` · `preset-retraso-6` · `preset-retraso-9` · `preset-colocacion-0` · `simulador-restablecer` · `simulador-resultado` · `resultado-capital` · `resultado-ganancia` · `resultado-cobro` · `resultado-sin-reparto` · `resultado-politica-capital` · `resultado-plazo` · `simulador-reparto` · `reparto-excedente` · `reparto-fondo` · `reparto-por-participacion` · `reparto-externos` · `reparto-empresa-fondo` · `reparto-empresa-directo` · `simulador-descargo` · `simulador-error`
- **Liquidación:** `ficha-liquidacion-en-curso` · `ficha-resultado` · `resultado-realizado-capital` · `resultado-realizado-ganancia` · `resultado-realizado-cobro` · `ficha-simulador-inactivo`
- **Cronograma y riesgos:** `ficha-cronograma` · `hito` (+`data-kind`, `data-state`) · `hito-fecha` · `ficha-actualizaciones` · `actualizacion` (+`data-source`) · `actualizacion-fecha` · `actualizacion-responsable` · `actualizacion-evidencia` · `ficha-riesgos` · `riesgo` (+`data-kind`) · `ficha-aviso-riesgo`
- **Cierre:** `ficha-siguiente-paso` · `siguiente-paso`
- **Ya existentes:** `projection-label`, `money-display` (cada `MoneyDisplay` recibe el testid de la lista), `demo-reset-*`, `zona-investor`.

## 6. Riesgos, supuestos y preguntas

- **R1 · El lint de dinero ignora `src/modules/finance/**` entero**, también la futura `finance/ui`. Una pantalla de finance podría calcular sin que el lint se queje. Mitigación sin tocar `eslint.config.mjs`: la guardia `money-in-ui.test.ts` (CA9) y D9. Para `docs/mejoras.md`: acotar el `ignores` a `finance/{domain,application,infrastructure}` en un cambio de lint aparte.
- **R2 · Trampa de ciclo en finance** (D1). Si un módulo a la derecha (investors en P6) importa valores de `@/modules/finance`, arrastra la UI y el container. Va a `docs/mejoras.md`, junto a la R4 de P3: hace falta una entrada de UI separada por módulo, con un ADR, cuando P6 lo necesite.
- **R3 · Hidratación.** El HTML del servidor solo tiene el esqueleto (sin `h1`) y el `h1` aparece cuando el cliente resuelve la consulta. `rutas.spec` espera el `h1` con reintento automático. El E2E 12 detecta errores de hidratación, y `pnpm build` es criterio de aceptación.
- **R4 · Activity (Next 16).** Al pasar de una ficha a otra o volver de P5, la ficha anterior queda oculta en el DOM y conserva el estado del simulador. Es lo deseado. El E2E acota a `:visible`.
- **R5 · El "no encontrado" responde 200** (D3), con `noindex` solo en el caso de `notFound()`. Se acepta en la demo porque los datos están en el cliente. Para `docs/mejoras.md`: un 404 real cuando haya backend.
- **R6 · Snapshot v2.** Una clave `club-demo:v1` antigua queda huérfana en `localStorage` (es inofensiva, unos KB). Para `docs/mejoras.md`: limpiarla al crear el container.
- **R7 · Volumen.** Hay unos 20 componentes nuevos en UI. Si constructor-ui pasa de su presupuesto, el orquestador puede dividir UI en **UI-a** (ficha sin simulador) y **UI-b** (`Simulator*.tsx`, `use-simulator.ts`, `simulator-copy.ts`, `range.tsx`, `format-percentage.ts`), que son archivos disjuntos y pueden correr en paralelo. `ProjectSheetView` monta `<Simulator setup/>` con la firma de §3.8.
- **R8 · Choque de nombres** `ProjectSheet` (tipo) / componente. Ya está resuelto en §3.8: el componente se llama `ProjectSheetPage`.
- **R9 · Escenario de referencia en una ficha de proyecto.** Puede confundir si no se rotula bien. Siempre aparece la nota con las cifras base y el botón "Este proyecto" es el que está activo por defecto (P4-Q8).

**Supuestos aplicados** (todos con propuesta por defecto; el usuario los confirma al aprobar el plan):
- **[SUPUESTO P4-1]** Los deltas de escenarios de D6.
- **[SUPUESTO P4-2]** El retraso solo alarga el plazo.
- **[SUPUESTO P4-3]** El modo ilustrativo en `placement_complete`, `renovation` y `on_sale`, con 1…min(20, total).
- **[SUPUESTO P4-4]** El sobrecosto se aplica al subtotal de obra, se suma a F y no lo absorbe la contingencia.
- **[SUPUESTO P4-5]** Reparto de la bolsa en honorarios 3.000 (desglosados en 3) y contingencia 2.000, más rubros de obra iguales en los 7 proyectos.
- **[SUPUESTO P4-6]** "Colocación 0 %" = sin otros participantes (colocación = tus participaciones).
- **[SUPUESTO P4-6b]** O se mantiene fijo al cambiar el precio.
- **[SUPUESTO P4-7]** El máximo de D4 no descuenta tenencias previas en la ficha.
- **[SUPUESTO P4-8]** El cronograma de referencia (offsets de §3.5). Un hito vencido sin cumplir se ve "Pendiente" sin fecha, con "Se informa en las actualizaciones".
- **[SUPUESTO P4-9]** `sold` → "Liquidación en curso", sin simulador.
- **[SUPUESTO P4-10]** El ejemplo de referencia del maestro está disponible en el simulador.

**Reglas de negocio inventadas:** ninguna. Lo que no fija el maestro (§6 "bolsa mixta", §7 pruebas sin fórmula, §17 "por validar") queda como supuesto y como pregunta.

**Preguntas para `docs/08`.** El arquitecto no edita ese archivo. El orquestador las añade como "Bloque Q · Ficha y simulador (P4, 22-nov) 🟠":

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| P4-Q1 | ¿Qué deltas usan los escenarios conservador/base/optimista? | Conservador: venta −10 % y obra +20 %; base: 0; optimista: venta +5 % |
| P4-Q2 | ¿Un retraso cuesta dinero (mantenimiento, servicios, impuestos por mes)? ¿Cuánto? | Por ahora solo alarga el plazo y se rotula "su costo está por definir" |
| P4-Q3 | En un proyecto sin colocación abierta (obra, venta), ¿se puede simular? | Sí, en modo ilustrativo, de 1 a 20 participaciones |
| P4-Q4 | Un sobrecosto de obra, ¿lo absorbe primero la contingencia? ¿Quién lo financia? | Se suma completo al presupuesto (lectura conservadora); quién lo financia está por definir |
| P4-Q5 | ¿Cómo se reparte la bolsa de USD 5.000 entre honorarios y contingencia, y qué rubros tiene la obra? | Honorarios 3.000 (gestión 1.000, supervisión 1.250, administración 750) y contingencia 2.000; obra en 7 rubros que suman 5.000 |
| P4-Q6 | ¿Los costos de venta son un monto fijo o un % del precio de venta? | Fijos en el simulador (hoy cada proyecto siembra ~3 % del precio objetivo) |
| P4-Q7 | El preset "colocación 0 %", ¿significa "nadie más participa"? | Sí: la colocación queda en tus participaciones y la empresa retiene el resto |
| P4-Q8 | ¿Se mantiene en el simulador la base "Ejemplo de referencia" del modelo? | Sí, como segunda opción; por defecto se simula el proyecto |
| P4-Q9 | ¿El límite de 20 por persona descuenta lo que ya tienes en el proyecto? | En la ficha no; P5 lo aplicará al reservar |
| P4-Q10 | ¿Un hito vencido sin cumplir muestra su fecha original? | No: "Pendiente · se informa en las actualizaciones" |

**Para `docs/mejoras.md`:** R1 (acotar el lint de dinero), R2 (entrada de UI separada en finance y participations), R5 (404 real), R6 (limpiar la clave v1), mapa aproximado (D6), galería de fotos (F4-2), simulador compartible (fuera de alcance).

**Para `docs/01`** (lo hace el orquestador, sin ADR): en el árbol de §3, `finance/ui/` y `[slug]/not-found.tsx`. En la tabla de §4, la celda ui → domain propio pasa a "tipos; funciones puras solo desde `ui/hooks`" (D9). En §6, la clave `club-demo:v2`.

## 7. ADR requerido

No. D1 aplica `docs/01 §4` regla 2b tal como está: no hay módulo nuevo y no cambian ni el orden de módulos ni `eslint.config.mjs`. `range.tsx` es una primitiva compartida que se documenta en el README. Las notas de §6 para `docs/01` aclaran el documento sin cambiar ninguna regla. El cambio de snapshot a v2 es de datos simulados y no exige decisión de arquitectura. Las decisiones de producto P4-Q1…Q10 llevan propuesta por defecto y no bloquean. **El usuario debe confirmarlas al aprobar este plan**, en especial P4-Q1, P4-Q4 y P4-Q5, porque fijan las cifras que verá el inversionista.
