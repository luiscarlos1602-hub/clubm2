> **Plan final (22-nov, interconexión de P4): sustituye al borrador interrumpido.** El borrador se escribió antes de la maqueta (ADR-012) y de los ajustes de ADR-013. Este plan parte del código real (`src/modules/finance/ui/**`, consumido por `investors/ui` y `app/admin`). Del borrador se conservan los criterios CA1–CA9, D3 (not-found en el cliente), la regla "infraestructura no importa otros módulos", la guardia de dinero en la UI y los nombres de prueba con lenguaje de negocio. Lo demás (los ids de presets, `SheetMode`, el modo ilustrativo, el caso de referencia, `RangeInput`, las ~20 pantallas nuevas) queda descartado porque la maqueta ya resolvió esas pantallas.

> **Decisiones del usuario al aprobar (22-nov) — mandan sobre el resto del plan:**
> 1. **Se quitan del estrés los presets de sobrecosto de obra** (`works-20`, `works-50`). Presets que quedan: base, venta −20 %, retraso 3/6/9 meses, colocación 0 %. Ajusta tests, `data-testid` y E2E que los usen.
> 2. **[SUPUESTO P4-4] NO se aplica**: el control de sobrecosto del simulador y el escenario conservador siguen aplicando el sobrecosto como hoy (a todo el presupuesto integral F); no cambian cifras visibles. Q5 queda abierta en docs/08.
> 3. Plan aprobado con Q1 (2.500 · 1.500 · 1.000), Q3 (conservador venta −10 % y obra +20 %; optimista venta +5 %) y P5-1 como supuestos.


# Plan 006 · P4 · Interconexión de la ficha, el simulador y la reserva

Estado: borrador (pendiente de aprobación del usuario) · Fecha: 2026-11-22 · Autor: arquitecto
Fuentes: `docs/planes/brief-P4.md` (con el Addendum) · ADR-004, ADR-010, ADR-011, ADR-012, ADR-013 · `docs/01 §3, §4, §6, §8` · `docs/02 §3–§6` · `docs/06` (reglas 4 y 4b) · `docs/08` (bloques D, O, P, Q y R) · maestro §6, §7, §10, §15 (solo lectura) · el código actual de `finance`, `projects`, `participations`, `investors/ui/components/{panel,admin}`, `composition` y `app/(inversionista)/proyectos/[slug]`.
Rama sugerida: `feat/finance-interconexion-p4`.

## 1. Historia y criterios

**Historia** (del brief). Como visitante o inversionista quiero abrir la ficha de un proyecto y ver qué es, cuánto cuesta, cómo avanza, qué riesgos tiene y simular cuánto podría tocarme en distintos escenarios, para decidir si participo, sabiendo que nada está garantizado.

**Qué cambia (Addendum).** La UI **no cambia de aspecto ni de `data-testid`**. Lo que cambia es el origen de los datos y dónde vive la lógica:
- La lógica de negocio sale de `finance/ui/hooks/*` y pasa a `finance/domain`: simulador, presets, escenarios, estimación de la reserva, proyección por tenencia y desglose del presupuesto.
- Las etapas del proceso pasan a `projects/domain`.
- Los literales de `examples.ts` (investor) pasan a semillas tipadas en el snapshot `club-demo:v2`, que se leen con puertos y casos de uso desde el container.

**Criterios** (CA1–CA9 del brief, adaptados a ADR-012/013; las cifras marcadas [PROPUESTO] las deriva el motor con las semillas del 22-nov y la base de sobrecosto de P4-4):

- **CA1 · Rutas.**
  - `/proyectos/<slug>` muestra la ficha de los 6 proyectos publicables. La fuente de verdad es `listMarketplace`, no una lista de slugs en la UI.
  - `m2-007-palos-grandes` y `no-existe` muestran `ficha-no-encontrada` dentro del shell.
  - Un slug con formato inválido (`M2_RARO`) llama a `notFound()` en el servidor.
  - `/proyectos/<slug>/participar` sigue la misma regla.
  - Desaparecen `PUBLISHED_PROJECT_SLUGS` e `isPublishedProjectSlug`.
- **CA2 · Secciones.** Las de la maqueta, sin cambios visuales: cabecera, galería, inmueble, presupuesto, escenarios, simulador o resultado realizado, proceso y actualizaciones, riesgos y CTA. Lo que cambia es el origen de los datos:
  - descripción y puntos destacados → `PropertyProfile` (projects);
  - rubros y bolsa → `ProjectBudget` (finance);
  - tablero → `ProjectProcess` (projects);
  - actualizaciones → `ProjectUpdate` (projects);
  - riesgos → `ProjectRisks` (projects), con el texto en `copy.ts`.

  [PROPUESTO] M2-006 muestra: compra USD 50.000 · reforma USD 10.000 = obra USD 5.000 (4 rubros) + bolsa USD 5.000 (2.500 · 1.500 · 1.000) · costos de venta USD 2.280 · total USD 62.280.
- **CA3 · Simulador** (solo en fase `open`, ADR-013 §3).
  - Controles: precio de venta, participaciones (1…`heldRange.max`), colocación, sobrecosto y retraso, más 8 presets con sus ids actuales.
  - Todos los números salen de `simulateProjection` (finance/domain), que llama a `calculateDistribution` y a `calculateHolderPayout`.
  - El resultado se muestra en tres bloques: capital, ganancia con su % (`calculateProfitRate` vía `profitRateLabel`) y cobro. Debajo va el descargo `simulatorDisclaimer`.
  - [PROPUESTO] M2-006, valores iniciales (colocación 63, 1 participación):
    - estado inicial → ganancia USD 34,30 · "34,3 % sobre el capital" · cobro USD 134,30;
    - `sale-20` → `simulador-sin-reparto`;
    - `works-20` → USD 31,80;
    - `works-50` → USD 28,05;
    - `delay-6` → "9 meses" con la ganancia igual;
    - `placement-0` → `simulador-sin-colocacion`.
- **CA4 · Sin ruedas.**
  - Ningún tipo, clave ni dato de la ficha coincide con /wheel|rueda|stalled/.
  - El texto de la página no coincide con /rueda|estancad|días sin vender/i.
- **CA5 · Casos canónicos** (test de integración contra el motor, `simulate-projection.canonical.test.ts`):
  - **C1** (colocación 100) y **C6** (63) dan exactamente las cifras de docs/02 §4.
  - **C3** (colocación 0) da `no_placement`, con la empresa recibiendo 5.000 del fondo.
  - **C5** (pérdida) da `no_distribution`.
  - Invariante con fast-check: externos + empresa total = excedente, al centavo.
- **CA6 · Finalizados** (M2-001, M2-003): sin simulador ni escenarios. Muestran capital, ganancia realizada y % desde `detail.realized` (`calculateHolderPayout(dist, 1)`). [PROPUESTO] M2-003: USD 100 · USD 34,50 · "34,5 % sobre el capital". M2-001: USD 30,24.
  - En `on_sale`, `renovation`, `placement_complete` y `sold` no hay simulador, pero sí escenarios fijos (ADR-013 §3, como en la maqueta).
- **CA7 · Datos.**
  - Snapshot `club-demo:v2` (`version: 2`) con perfiles, proceso, actualizaciones y riesgos en projects, y presupuestos en finance.
  - Fechas relativas al Clock, sin ruedas y sin `stalled`.
  - `seed-consistency.test.ts` se amplía (§5.2). La v1 se **reinicia**, sin migración (§2 D6).
- **CA8 · Calidad.** Responsive 390/1440. Estados de carga, error y no encontrado. `aria-live` en el resultado. `data-testid` sin cambios. Copy en `ui/copy*.ts` con `check-copy` en verde y sin cintillo.
  - [PROPUESTO] Una guardia `src/modules/finance/money-in-ui.test.ts` falla si `finance/ui/{hooks,components/investor}/**` importa **valores** de `@/shared/domain/money` o hace aritmética con `.cents`.
- **CA9 · Pruebas.**
  - E2E en 390 y 1440 (§5.3). `pnpm verify`, `pnpm build` y `src/architecture-rules.test.ts` en verde.
  - Los E2E existentes (`ficha`, `rutas`, `visitas-terminos`, `admin-detalle`, `navegacion`, `marketplace`, `capturas-*`) siguen pasando. `reiniciar-datos.spec.ts` se actualiza a v2.
  - [PROPUESTO] C1/C6 se comprueban en Vitest. En el navegador se comprueban las cifras de M2-006, porque la maqueta no ofrece una base "de referencia".

## 2. Módulos afectados y decisiones

| Módulo / carpeta | Por qué | Nuevo |
|---|---|---|
| `projects` (domain, application, infrastructure, index, CLAUDE.md) | Perfil del inmueble, proceso de 6 etapas, actualizaciones, riesgos y `isProjectSlug`. Puerto `ProjectContentRepository` y caso de uso `getProjectProcess` | se amplía |
| `participations` (index, CLAUDE.md) | Exporta los **tipos** de sus puertos | 1 línea + doc |
| `finance` (domain, application, infrastructure, ui, index, ui.ts, backoffice-ui.ts, CLAUDE.md) | Simulador, presets, escenarios, reserva, tenencia, presupuesto y ficha en domain. Casos de uso `getProjectDetail` y `getHoldingProjections`. La UI consume el container | se amplía; se borran `examples.ts` (investor), `types.ts`, `simulate.ts`, `scenarios.ts`, `project-figures.ts` y `process-stages.ts` |
| `investors/ui/components/{panel,admin}` | `HoldingProcess` pasa a `useProcessStages`; se ajustan dos tests de paridad | se cambia |
| `composition` | Snapshot v2, cableado de los repos y casos de uso nuevos, limpieza de la clave v1 | se amplía |
| `shared/config/demo.ts` | `storageKey: "club-demo:v2"` y `legacyStorageKeys` | 2 líneas |
| `app/(inversionista)/proyectos/[slug]/{page,participar/page}.tsx` | Sin `generateStaticParams`. `notFound()` solo con formato inválido | se cambia |
| `tests/e2e/` | `ficha.spec.ts` se amplía; `reiniciar-datos.spec.ts` pasa a v2 | se cambia |

No se tocan: `eslint.config.mjs`, `architecture.modules.mjs`, `docs/referencia/**`, el motor (`distribution.ts`, `holder-payout.ts`, `settlement.ts`, `validate-distribution-input.ts`, `profit-rate.ts`) ni sus tests, `shared/ui/**` (`ProcessBoard` y `PROCESS_STAGES` siguen igual), `finance/ui/components/admin/**` (B5) ni `projects/ui/components/admin/**` (B3).

**D1 · Dueño de cada dato** (el orden `projects → participations → finance → … → investors` se respeta, y la infraestructura no importa otros módulos):

| Dato (hoy en `examples.ts`) | Módulo dueño | Por qué |
|---|---|---|
| Descripción y puntos destacados del inmueble | projects (`PropertyProfile`) | Describe el inmueble (docs/02 §3) |
| Proceso de 6 etapas (días tras la compra) | projects (`ProjectProcess`) | Hitos y etapas del proyecto (docs/01 §3: "etapas, hitos") |
| Actualizaciones fechadas | projects (`ProjectUpdate`) | docs/02 §3 |
| Riesgos del proyecto | projects (`ProjectRisks`, solo el tipo; el texto va en copy) | Son del proyecto y no hablan de dinero. Sin niveles ni puntuaciones |
| Rubros de obra y bolsa (honorarios, contingencia, reserva) | finance (`ProjectBudget`) | docs/02 §3 y §6 (`BudgetLine`) |
| Escenarios | finance (**derivados** con el motor, no sembrados) | Así un escenario nunca descuadra con el motor |
| Presets y rangos del simulador | finance/domain (constantes) | Regla de negocio (maestro §7) |

**D2 · La ficha sigue en `finance`** (docs/01 §4 regla 2b): combina projects, participations y finance. Desde ADR-012, `finance/index.ts` **no** exporta UI (la UI va por `ui.ts`), así que la trampa de ciclo del borrador ya no aplica a finance. Sí sigue aplicando a participations (R4 de P3):
1. `finance/domain` y `finance/application` importan de `@/modules/participations` **solo con `import type`**.
2. `HOLDING_LIMITS.max` llega por inyección (`holdingMax`) desde `composition/modules/finance.ts`, que lo importa por la ruta interna `@/modules/participations/domain/participation`.
3. `finance/ui` puede seguir importando valores de `@/modules/participations` (está a la derecha del orden y es ui → ui pública).

**D3 · El tablero de proceso se vuelve asíncrono.** Hoy `processStagesFor(code, acquiredOn)` es síncrono y lee literales. Con datos en el store pasa a ser:
- `projects/application/get-project-process.ts`, expuesto como `container.projects.getProjectProcess(code)`;
- el hook de UI `useProcessStages(code)` en `finance/ui`, exportado por `ui.ts` y `backoffice-ui.ts`.

`ProjectProcessBoard` y `HoldingProcess` (investors) usan ese hook. La firma de `ProjectProcessBoardProps` **no cambia**, porque `projects/ui/admin` la inyecta como `ProcessBoardView`. `acquiredOn` sigue en las props, pero deja de leerse: la fecha sale del proyecto. Se anota en `docs/mejoras.md` quitar la prop en B3. Las etapas del dominio usan ids en inglés (`works_start` …). La tabla que las traduce a los ids visuales de `shared/ui/brand` (`inicio-obra` …) vive en `finance/ui`.

**D4 · `not-found` en el cliente** (del borrador). Con `cacheComponents`, los datos viven en `localStorage` y el servidor no sabe qué slugs existen. Por eso:
- se quita `generateStaticParams` de las dos páginas;
- `page.tsx` espera `params` dentro de `<Suspense>`;
- si `isProjectSlug(slug)` (projects) es falso, el servidor llama a `notFound()`;
- si no, monta la pantalla; cuando `getProjectDetail` devuelve `null`, se pinta el `ProjectDetailMissing` actual (`ficha-no-encontrada`).

Antes, M2-007 daba el 404 global; ahora da `ficha-no-encontrada` (CA1), con respuesta 200. Ese 404 real pendiente queda en `docs/mejoras.md`. `pnpm build` es criterio.

**D5 · Modos** (iguales a la maqueta; los define `buildProjectDetail`):

| `listing.phase` | `mode` | Simulador | Escenarios | Resultado realizado |
|---|---|---|---|---|
| `open` | `open` | sí | sí | — |
| `placement_complete`, `renovation`, `on_sale`, `sold` | `fixed_projection` | no | sí | — |
| `finished` (con liquidación) | `realized` | no | no | sí |

Un proyecto `finished` sin liquidación es un dato incoherente: `buildProjectDetail` devuelve `MISSING_SETTLEMENT` y la promesa se rechaza (`ficha-error`).

**D6 · v1 → v2 por reinicio, sin migración.** La v1 no guarda nada que haya escrito el usuario (la reserva de la maqueta no persiste). DATA lo confirma con `grep -rn "\.update(\|\.write(" src/composition src/modules/*/infrastructure`; si encuentra un escritor, devuelve `BLOQUEADO` (sería necesaria una migración). Con la clave nueva, el store siembra de cero. El container borra en la creación, con un `try/catch` silencioso, las claves de `demoConfig.legacyStorageKeys` (`["club-demo:v1"]`). Así se cierra la deuda R6 del borrador.

**D7 · Solo los hooks llaman al dominio** (precedente de P3 y de la maqueta). Los componentes reciben datos ya calculados. `useSimulator` importa `simulateProjection` y `applyStressPreset`, y nada más. Para `docs/01 §4` (aclaración del orquestador, sin ADR): la celda ui → domain propio pasa a "tipos; funciones puras solo desde `ui/hooks`".

## 3. Contratos (TypeScript)

Son el acuerdo entre D, DATA, UI y QA. Si cambia una firma, se avisa al orquestador antes de entregar. `Result`, `DomainError`, `Money`, `IsoDate` e `Id` salen de `shared/domain`.

### 3.1 `projects/domain` (paquete D)

```ts
// projects/domain/project-slug.ts
export const PROJECT_SLUG_PATTERN: RegExp;                       // /^[a-z0-9]+(-[a-z0-9]+)*$/ (el mismo de la semilla)
export function isProjectSlug(raw: unknown): raw is string;

// projects/domain/property-profile.ts
/** Texto de ejemplo del inmueble (maqueta → semilla). Sin dirección exacta (D6). */
export type PropertyProfile = {
  readonly propertyId: PropertyId;
  readonly description: string;
  readonly highlights: readonly string[];                        // 1..5
};

// projects/domain/process.ts  (ADR-013 §5)
export const PROCESS_STAGE_KINDS = ["works_start", "works_50", "works_80", "sale_start", "on_sale", "sold"] as const;
export type ProcessStageKind = (typeof PROCESS_STAGE_KINDS)[number];
export const PROCESS_STEP_STATUSES = ["done", "current", "upcoming"] as const;
export type ProcessStepStatus = (typeof PROCESS_STEP_STATUSES)[number];
/** offsetDays: días tras la compra. started: la etapa en curso ya empezó (fecha cierta); si no, fecha estimada. */
export type ProcessStep = { readonly status: ProcessStepStatus; readonly offsetDays: number; readonly started: boolean };
export type ProjectProcess = { readonly projectId: ProjectId; readonly steps: Readonly<Record<ProcessStageKind, ProcessStep>> };
export type ProcessStageTimeline = {
  readonly stage: ProcessStageKind;
  readonly status: ProcessStepStatus;
  readonly date: IsoDate;                                        // addDays(acquiredOn, offsetDays)
  /** true = proyección: upcoming, o current sin empezar. */
  readonly estimated: boolean;
};
export type ProcessErrorCode =
  | "NEGATIVE_OFFSET" | "DECREASING_OFFSETS"                     // offsets ≥ 0 y no decrecientes en el orden de PROCESS_STAGE_KINDS
  | "STATUS_ORDER"                                               // done* current? upcoming* (como máximo un current)
  | "DONE_NOT_STARTED" | "UPCOMING_STARTED";
export function checkProjectProcess(p: ProjectProcess): Result<ProjectProcess, DomainError<ProcessErrorCode>>;
/** En el orden de PROCESS_STAGE_KINDS. Pura; no valida (eso lo hace checkProjectProcess). */
export function toProcessTimeline(acquiredOn: IsoDate, p: ProjectProcess): readonly ProcessStageTimeline[];

// projects/domain/project-update.ts
export type ProjectUpdateId = Id<"ProjectUpdate">;
export type ProjectUpdate = {
  readonly id: ProjectUpdateId;
  readonly projectId: ProjectId;
  readonly publishedOn: IsoDate;
  readonly title: string;
  readonly body: string;
};
/** publishedOn descendente; en empate, id ascendente. No muta. */
export function sortUpdatesNewestFirst(us: readonly ProjectUpdate[]): readonly ProjectUpdate[];

// projects/domain/project-risk.ts  (maestro §15; el texto vive en finance/ui/copy)
export const PROJECT_RISK_KINDS = [
  "sale_below_target", "works_overrun", "slow_sale",           // comunes a todos (COMMON_RISKS de la maqueta)
  "narrow_buyer_pool", "local_market", "hidden_works_issues", "incomplete_placement",
] as const;
export type ProjectRiskKind = (typeof PROJECT_RISK_KINDS)[number];
export type ProjectRisks = { readonly projectId: ProjectId; readonly kinds: readonly ProjectRiskKind[] };
/** Sin duplicados, en el orden de PROJECT_RISK_KINDS. */
export function normalizeRiskKinds(kinds: readonly ProjectRiskKind[]): readonly ProjectRiskKind[];
```

### 3.2 `projects/application` e `index.ts` (paquete D)

```ts
// projects/application/ports.ts: se AÑADE
export interface ProjectContentRepository {
  profileOf(propertyId: PropertyId): Promise<PropertyProfile | null>;
  processOf(projectId: ProjectId): Promise<ProjectProcess | null>;
  /** Sin orden garantizado: ordena el dominio. */
  updatesOf(projectId: ProjectId): Promise<readonly ProjectUpdate[]>;
  risksOf(projectId: ProjectId): Promise<ProjectRisks | null>;
}

// projects/application/get-project-process.ts
export type GetProjectProcess = (code: string) => Promise<readonly ProcessStageTimeline[] | null>;
export type GetProjectProcessDeps = {
  readonly projects: Pick<ProjectRepository, "list">;
  readonly content: Pick<ProjectContentRepository, "processOf">;
};
/** async. null si no hay proyecto con ese código, si acquiredOn es null o si no hay proceso. Si el proceso no pasa checkProjectProcess → rechaza. */
export function createGetProjectProcess(deps: GetProjectProcessDeps): GetProjectProcess;

// projects/index.ts: se AÑADE (sin quitar nada)
export { PROJECT_SLUG_PATTERN, isProjectSlug } from "./domain/project-slug";
export type { PropertyProfile } from "./domain/property-profile";
export type { ProcessStageKind, ProcessStepStatus, ProcessStep, ProjectProcess, ProcessStageTimeline, ProcessErrorCode } from "./domain/process";
export { PROCESS_STAGE_KINDS, PROCESS_STEP_STATUSES, checkProjectProcess, toProcessTimeline } from "./domain/process";
export type { ProjectUpdateId, ProjectUpdate } from "./domain/project-update";
export { sortUpdatesNewestFirst } from "./domain/project-update";
export type { ProjectRiskKind, ProjectRisks } from "./domain/project-risk";
export { PROJECT_RISK_KINDS, normalizeRiskKinds } from "./domain/project-risk";
export type { ProjectRepository, PropertyRepository, ProjectContentRepository } from "./application/ports";
export type { GetProjectProcess } from "./application/get-project-process";
```

### 3.3 `finance/domain` (paquete D)

```ts
// finance/domain/budget.ts  (docs/02 §6)
export const BUDGET_CATEGORIES = ["works", "management_fee", "contingency", "reserve"] as const;
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];
export const BUDGET_ITEMS = [
  "kitchen", "bathrooms", "floors_paint", "electrical_plumbing", "garden_exterior", "carpentry",   // works
  "management_fee", "contingency", "reserve",                                                    // bolsa (maestro §6)
] as const;
export type BudgetItem = (typeof BUDGET_ITEMS)[number];
export const BUDGET_ITEM_CATEGORY: Readonly<Record<BudgetItem, BudgetCategory>>;               // la categoría se deriva, no se guarda
export type BudgetLine = { readonly item: BudgetItem; readonly amount: Money };
/** Presupuesto integral F por líneas (lo presupuestado; lo devengado/gastado/remanente es de B3/B5). El orden de las líneas es el de presentación. */
export type ProjectBudget = { readonly projectId: ProjectId; readonly lines: readonly BudgetLine[] };
export type BudgetErrorCode = "PROJECT_MISMATCH" | "NEGATIVE_AMOUNT" | "DUPLICATE_ITEM" | "NO_WORKS_LINES" | "BUDGET_TOTAL_MISMATCH";
/** Σ líneas = economics.recoveryBudget; mismo projectId; sin ítems repetidos; amount ≥ 0; al menos una línea works. Nunca lanza. */
export function checkProjectBudget(b: ProjectBudget, economics: ProjectEconomics): Result<ProjectBudget, DomainError<BudgetErrorCode>>;
/** Σ de las líneas works (base del sobrecosto, P4-4). */
export function worksSubtotal(b: ProjectBudget): Money;
export type BudgetBreakdown = {
  readonly acquisition: Money;                      // C (capital propio de la empresa)
  readonly works: readonly BudgetLine[];            // categoría works, en el orden de la semilla
  readonly fees: readonly BudgetLine[];             // management_fee · contingency · reserve, en el orden de la semilla
  readonly recovery: Money;                         // F
  readonly saleCosts: Money;                        // O estimado
  readonly total: Money;                            // C + F + O (sale hoy de un hook: se mueve aquí)
};
export function buildBudgetBreakdown(economics: ProjectEconomics, b: ProjectBudget): BudgetBreakdown;

// finance/domain/simulator.ts  (reemplaza ui/hooks/simulate.ts; misma semántica salvo P4-4)
export type SimulationBase = {
  readonly salePrice: Money;          // P objetivo
  readonly acquisitionCost: Money;    // C
  readonly recoveryBudget: Money;     // F
  readonly worksBudget: Money;        // subtotal de obra (base del sobrecosto) [SUPUESTO P4-4]
  readonly saleCosts: Money;          // O estimado, fijo al mover el precio
  readonly total: number;
  readonly unitPrice: Money;
  readonly placed: number;            // colocación actual de la clase
  readonly targetTermMonths: number;  // TARGET_TERM_MONTHS si la tarjeta no trae plazo
};
/** Porcentajes en puntos básicos (docs/01 §5). */
export type SimulationControls = {
  readonly saleAdjustmentBps: number;   // −3000…+2000, paso 500
  readonly worksOverrunBps: number;     // 0…5000, paso 1000
  readonly delayMonths: number;         // 0…9 [SUPUESTO Q2: solo alarga el plazo]
  readonly placed: number;              // 0…total
  readonly held: number;                // 1…heldRange.max
};
export const SIMULATION_RANGES: {
  readonly saleAdjustmentBps: { readonly min: -3000; readonly max: 2000; readonly step: 500 };
  readonly worksOverrunBps: { readonly min: 0; readonly max: 5000; readonly step: 1000 };
  readonly delayMonths: { readonly min: 0; readonly max: 9; readonly step: 1 };
};
export type SimulationOutcome =
  | { readonly kind: "payout"; readonly distribution: Distribution; readonly payout: HolderPayout }
  | { readonly kind: "no_distribution"; readonly distribution: NoDistribution }       // O1/H2: capital "por definir"
  | { readonly kind: "no_placement"; readonly distribution: Distribution }            // colocación 0 (C3)
  | { readonly kind: "invalid" };
export type SimulationResult = {
  readonly basis: "projection";
  readonly salePrice: Money;          // P' = P ± floor(P × |ajuste|)
  readonly worksOverrun: Money;       // floor(worksBudget × sobrecosto)
  readonly recoveryBudget: Money;     // F' = F + worksOverrun
  readonly termMonths: number;        // target + delay
  readonly heldUsed: number;          // min(held, placed)
  readonly outcome: SimulationOutcome;
};
export function neutralControls(base: SimulationBase, held?: number): SimulationControls;   // ajustes 0, placed = base.placed, held = 1
/** Recorta a los rangos (held a [1, heldMax], placed a [0, total]); Math.trunc; NaN/±Infinity → valor neutro. Idempotente. */
export function normalizeControls(base: SimulationBase, heldMax: number, c: SimulationControls): SimulationControls;
/** Único cálculo del simulador: normaliza (con heldMax = total) → calculateDistribution (basis "projection") → calculateHolderPayout(heldUsed). Nunca lanza. Sin Date. */
export function simulateProjection(base: SimulationBase, c: SimulationControls): SimulationResult;

// finance/domain/stress-presets.ts  (maestro §7, docs/02 §4; ids = los de la maqueta, que fijan los data-testid)
export const STRESS_PRESET_IDS = ["base", "sale-20", "works-20", "works-50", "delay-3", "delay-6", "delay-9", "placement-0"] as const;
export type StressPresetId = (typeof STRESS_PRESET_IDS)[number];
export const STRESS_PRESETS: Readonly<Record<StressPresetId, Partial<Pick<SimulationControls, "saleAdjustmentBps" | "worksOverrunBps" | "delayMonths" | "placed">>>>;
// base {} · sale-20 {saleAdjustmentBps: −2000} · works-20 {worksOverrunBps: 2000} · works-50 {5000} · delay-n {delayMonths: n} · placement-0 {placed: 0}
/** neutralControls(base, current.held) + el parche del preset (un preset a la vez). */
export function applyStressPreset(base: SimulationBase, current: SimulationControls, id: StressPresetId): SimulationControls;

// finance/domain/scenarios.ts  [SUPUESTO Q3]
export const SCENARIO_IDS = ["conservative", "base", "optimistic"] as const;
export type ScenarioId = (typeof SCENARIO_IDS)[number];
export const SCENARIO_ASSUMPTIONS: Readonly<Record<ScenarioId, { readonly saleAdjustmentBps: number; readonly worksOverrunBps: number }>>;
// conservative {−1000, 2000} · base {0, 0} · optimistic {500, 0}
export type ScenarioRow = { readonly id: ScenarioId; readonly salePrice: Money; readonly outcome: SimulationOutcome };
/** 1 participación, colocación actual y retraso 0, con simulateProjection. */
export function buildScenarios(base: SimulationBase): readonly ScenarioRow[];

// finance/domain/holding-projection.ts
/** [SUPUESTO P5-1] La reserva se suma a lo colocado (con el total como tope). */
export function estimateReservation(base: SimulationBase, quantity: number): SimulationResult;
/** Capital de una reserva: unitPrice × quantity (multiplyMoney). quantity < 0 → RangeError de Money: valida antes. */
export function reservationAmount(unitPrice: Money, quantity: number): Money;
/** Ganancia proyectada de `held` participaciones en el escenario base (la misma cuenta del simulador). null si no hay payout. */
export function projectHoldingGain(base: SimulationBase, held: number): Money | null;

// finance/domain/project-detail.ts  (si pasa de 200 líneas: project-detail-types.ts + project-detail.ts)
import type { ListingPhase, ParticipationClass, ProjectListing } from "@/modules/participations";   // SOLO import type (D2)
import type { Project, Property, PropertyProfile, ProjectProcess, ProcessStageTimeline, ProjectUpdate, ProjectRisks, ProjectRiskKind } from "@/modules/projects";
export type DetailMode = "open" | "fixed_projection" | "realized";       // D5
export type ProjectDetail = {
  readonly listing: ProjectListing;
  readonly property: Property;
  readonly profile: PropertyProfile;
  readonly participationClass: ParticipationClass;
  readonly economics: ProjectEconomics;
  readonly settlement: Settlement | null;
  readonly mode: DetailMode;
  readonly budget: BudgetBreakdown;
  readonly simulation: {
    readonly base: SimulationBase;
    /** D4: open → min(holdingMax, disponibles); resto → min(holdingMax, colocadas). 0 = sin cupos (P5 "sin cupos"). */
    readonly maxHeld: number;
    /** Para el control: { min: 1, max: max(1, maxHeld) }. */
    readonly heldRange: { readonly min: 1; readonly max: number };
  };
  readonly scenarios: readonly ScenarioRow[];                  // [] en realized
  /** Solo en realized: calculateHolderPayout(settlement.distribution, 1) (capital, ganancia y cobro por participación). */
  readonly realized: HolderPayout | null;
  readonly process: readonly ProcessStageTimeline[] | null;    // null sin proceso publicado
  readonly updates: readonly ProjectUpdate[];                  // más reciente primero
  readonly risks: readonly ProjectRiskKind[];                  // normalizados
};
export type ProjectDetailSource = {
  readonly listing: ProjectListing;
  readonly project: Project;
  readonly property: Property;
  readonly profile: PropertyProfile;
  readonly participationClass: ParticipationClass;
  readonly economics: ProjectEconomics;
  readonly budget: ProjectBudget;
  readonly settlement: Settlement | null;
  readonly process: ProjectProcess | null;
  readonly updates: readonly ProjectUpdate[];
  readonly risks: ProjectRisks | null;
  readonly holdingMax: number;                                 // HOLDING_LIMITS.max inyectado
};
export type ProjectDetailErrorCode = BudgetErrorCode | "PROJECT_MISMATCH" | "MISSING_SETTLEMENT" | "INVALID_PROCESS";
/** Pura, nunca lanza. PROJECT_MISMATCH si algún projectId/propertyId no coincide con la tarjeta y el proyecto. */
export function buildProjectDetail(s: ProjectDetailSource): Result<ProjectDetail, DomainError<ProjectDetailErrorCode>>;
```

### 3.4 `finance/application` e `index.ts` (paquete D)

```ts
// finance/application/ports.ts: se AÑADE
export interface ProjectBudgetRepository {
  findByProject(projectId: ProjectId): Promise<ProjectBudget | null>;
}

// finance/application/get-project-detail.ts
import type { ListMarketplace, ParticipationClassRepository } from "@/modules/participations";   // import type
import type { ProjectContentRepository, ProjectRepository, PropertyRepository } from "@/modules/projects";
export type GetProjectDetail = (slug: string) => Promise<ProjectDetail | null>;
export type GetProjectDetailDeps = {
  readonly listMarketplace: ListMarketplace;
  readonly projects: Pick<ProjectRepository, "findById">;
  readonly properties: Pick<PropertyRepository, "findById">;
  readonly content: ProjectContentRepository;
  readonly classes: Pick<ParticipationClassRepository, "findByProject">;
  readonly economics: Pick<ProjectEconomicsRepository, "findByProject">;
  readonly budgets: ProjectBudgetRepository;
  readonly settlements: Pick<SettlementRepository, "findByProject">;
  readonly holdingMax: number;
};
/**
 * async (un throw síncrono de un repo se convierte en rechazo).
 * 1) listMarketplace() y búsqueda por slug → si no está: null (no consulta nada más).
 * 2) Promise.all(project, class, economics, budget, settlement, process, updates, risks); después, property y profile.
 * 3) Si falta un obligatorio (project, property, profile, class, economics, budget) o buildProjectDetail da err → rechaza con Error(`ficha ${slug}: ${code}`).
 */
export function createGetProjectDetail(deps: GetProjectDetailDeps): GetProjectDetail;

// finance/application/get-holding-projections.ts  (sale de useHoldingProjections: la suma deja de hacerse en la UI)
export type HoldingProjectionRequest = { readonly code: string; readonly quantity: number };
export type HoldingProjections = {
  readonly byCode: Readonly<Record<string, Money | null>>;     // null = sin reparto o sin ficha
  readonly total: Money | null;                                 // sumMoney de los no-null; null si no hay ninguno
};
export type GetHoldingProjections = (requests: readonly HoldingProjectionRequest[]) => Promise<HoldingProjections>;
export function createGetHoldingProjections(deps: {
  readonly listMarketplace: ListMarketplace;
  readonly getProjectDetail: GetProjectDetail;
}): GetHoldingProjections;   // projectHoldingGain(detail.simulation.base, quantity)

// finance/index.ts: se AÑADE (sin quitar nada; sigue sin exportar UI)
export type { BudgetCategory, BudgetItem, BudgetLine, ProjectBudget, BudgetErrorCode, BudgetBreakdown } from "./domain/budget";
export { BUDGET_CATEGORIES, BUDGET_ITEMS, BUDGET_ITEM_CATEGORY, checkProjectBudget, worksSubtotal, buildBudgetBreakdown } from "./domain/budget";
export type { SimulationBase, SimulationControls, SimulationOutcome, SimulationResult } from "./domain/simulator";
export { SIMULATION_RANGES, neutralControls, normalizeControls, simulateProjection } from "./domain/simulator";
export type { StressPresetId } from "./domain/stress-presets";
export { STRESS_PRESET_IDS, STRESS_PRESETS, applyStressPreset } from "./domain/stress-presets";
export type { ScenarioId, ScenarioRow } from "./domain/scenarios";
export { SCENARIO_IDS, SCENARIO_ASSUMPTIONS, buildScenarios } from "./domain/scenarios";
export { estimateReservation, reservationAmount, projectHoldingGain } from "./domain/holding-projection";
export type { DetailMode, ProjectDetail, ProjectDetailErrorCode } from "./domain/project-detail";
export { buildProjectDetail } from "./domain/project-detail";
export type { ProjectBudgetRepository } from "./application/ports";
export type { GetProjectDetail } from "./application/get-project-detail";
export type { GetHoldingProjections, HoldingProjectionRequest, HoldingProjections } from "./application/get-holding-projections";

// participations/index.ts: se AÑADE (paquete D)
export type { ParticipationClassRepository, ParticipationRepository } from "./application/ports";
```

### 3.5 Semillas v2 (paquete DATA)

```ts
// projects/infrastructure/seed.ts
export type ProjectsSlice = {
  readonly properties: readonly Property[];
  readonly projects: readonly Project[];
  readonly profiles: readonly PropertyProfile[];     // NUEVO · 6 (sin M2-007)
  readonly processes: readonly ProjectProcess[];     // NUEVO · 6
  readonly updates: readonly ProjectUpdate[];        // NUEVO · 17
  readonly risks: readonly ProjectRisks[];           // NUEVO · 6
};
// projectsSliceSchema se amplía (z.enum(PROCESS_STAGE_KINDS / PROCESS_STEP_STATUSES / PROJECT_RISK_KINDS)) y el slug usa PROJECT_SLUG_PATTERN.
// Los datos de contenido van en projects/infrastructure/seed-content.ts (CONTENT por key; una función buildProjectContent(projects, dates)).
// publishedOn = dates.daysAfter(acquiredOn, offsetDays). Cada proceso pasa checkProjectProcess y, si no, throw (fallo de semilla).

// finance/infrastructure/seed.ts
export type FinanceSlice = {
  readonly economics: readonly ProjectEconomics[];
  readonly settlements: readonly Settlement[];
  readonly budgets: readonly ProjectBudget[];        // NUEVO · 7 (M2-007 incluido, para B2)
};
// Las líneas van en finance/infrastructure/seed-budget.ts. buildFinanceSeed valida cada una con checkProjectBudget(b, economics) → si da err, throw.

// composition/demo-snapshot.ts
export type DemoSnapshot = { readonly version: 2; /* resto igual */ };     // z.literal(2); buildDemoSnapshot → version: 2
// shared/config/demo.ts
storageKey: "club-demo:v2",
legacyStorageKeys: ["club-demo:v1"] as const,
```

**Traslado literal de `examples.ts`.** Los mismos valores y el mismo orden, para que el aspecto sea idéntico:
- **Perfiles:** `description` y `highlights` de cada slug, sin cambios.
- **Proceso:** los `d/c/u(offset, started)` de cada slug, con las claves traducidas: `inicio-obra → works_start` · `obra-50 → works_50` · `obra-80 → works_80` · `inicio-venta → sale_start` · `en-venta → on_sale` · `vendida → sold`.
- **Actualizaciones:** `offsetDays`, `title` y `text → body`. Ids `upd_<key>_<n>`, con n desde 1 por fecha ascendente.
- **Riesgos:** los 3 comunes en los seis. Los extra son: hatillo_01 `narrow_buyer_pool` · valencia_01 `local_market` · paraiso_01 `hidden_works_issues` · chacao_02 `incomplete_placement`.
- **Presupuestos:** las líneas de obra de cada slug con su ítem (Cocina→`kitchen`, Baños→`bathrooms`, Pisos y pintura→`floors_paint`, Electricidad y plomería→`electrical_plumbing`, Jardín y exteriores→`garden_exterior`, Carpintería→`carpentry`), más la bolsa `management_fee 2.500 · contingency 1.500 · reserve 1.000` [SUPUESTO Q1].
  - palos_grandes_02 (M2-007) usa las líneas de chacao_02. Es un ejemplo de ejemplo y no se muestra en ninguna pantalla.

Antes de entregar, DATA corre `node scripts/check-copy.mjs src/modules/projects/infrastructure`.

### 3.6 `composition` (paquete DATA)

```ts
// composition/modules/projects.ts
export type ProjectsModule = {
  readonly projectRepository: ProjectRepository;
  readonly propertyRepository: PropertyRepository;
  readonly contentRepository: ProjectContentRepository;     // NUEVO
  readonly getProjectProcess: GetProjectProcess;            // NUEVO
};

// composition/modules/finance.ts
import { HOLDING_LIMITS } from "@/modules/participations/domain/participation";   // ruta interna (D2)
export type FinanceModule = {
  readonly economicsRepository: ProjectEconomicsRepository;
  readonly settlementRepository: SettlementRepository;
  readonly budgetRepository: ProjectBudgetRepository;       // NUEVO
  readonly getProjectDetail: GetProjectDetail;              // NUEVO
  readonly getHoldingProjections: GetHoldingProjections;    // NUEVO
};
export function registerFinance(
  store: DemoStore<DemoSnapshot>,
  deps: {
    readonly projects: Pick<ProjectsModule, "projectRepository" | "propertyRepository" | "contentRepository">;
    readonly participations: Pick<ParticipationsModule, "classRepository" | "listMarketplace">;
  },
): FinanceModule;

// composition/container.ts: cambian el cableado y la limpieza de claves (D6). Container conserva su forma.
const projects = registerProjects(store);
const participations = registerParticipations(store, projects);
const finance = registerFinance(store, { projects, participations });
```
`composition/**` sigue sin importar valores desde `@/modules/participations` (su index). Puede importar de `@/modules/finance` (index sin UI) y de las rutas internas de application/infrastructure, como hoy.

### 3.7 `finance/ui` (paquete UI)

```ts
// ui/hooks/use-project-detail.ts ("use client")
export const projectDetailQueryKey: (slug: string) => readonly ["finance", "project-detail", string];
export function useProjectDetail(slug: string): UseQueryResult<ProjectDetail | null, Error>;   // container.finance.getProjectDetail
/** Se conserva para los tests de paridad: delega en container.finance.getProjectDetail. */
export function loadProjectDetail(container: Container, slug: string): Promise<ProjectDetail | null>;

// ui/hooks/holding-projection.ts
/** Envoltorio de compatibilidad: projectHoldingGain(detail.simulation.base, held). */
export function projectHolding(detail: ProjectDetail, held: number): Money | null;
export function useHoldingProjections(requests: readonly HoldingProjectionRequest[]): UseQueryResult<HoldingProjections, Error>;  // container.finance.getHoldingProjections

// ui/hooks/use-process-stages.ts ("use client")
export function useProcessStages(code: string): UseQueryResult<readonly ProcessStageView[] | null, Error>;  // container.projects.getProjectProcess + toProcessStageViews
// ui/hooks/process-stage-view.ts (tabla de presentación, sin lógica de negocio)
export const PROCESS_STAGE_ID: Readonly<Record<ProcessStageKind, ProcessStageId>>;
export function toProcessStageViews(timeline: readonly ProcessStageTimeline[]): readonly ProcessStageView[];

// ui/hooks/use-simulator.ts: misma forma que hoy; los tipos pasan a ser los del dominio
export type UseSimulator = {
  controls: SimulationControls; result: SimulationResult; activePreset: StressPresetId | null;
  setControl: <K extends keyof SimulationControls>(key: K, value: SimulationControls[K]) => void;
  applyPreset: (id: StressPresetId) => void;
};
export function useSimulator(base: SimulationBase, heldMax: number): UseSimulator;   // normalizeControls en cada setControl

// ui/hooks/profit-rate.ts: sin cambios (profitRateLabel, PROFIT_RATE_COPY)

// finance/ui.ts: exportaciones finales
export * from "./ui/components/investor";      // ProjectDetail, ProjectParticipate, ProjectDetailLoading, ProjectProcessBoard (+Props). SIN PUBLISHED_PROJECT_SLUGS ni isPublishedProjectSlug
export { projectHolding, useHoldingProjections } from "./ui/hooks/holding-projection";
export type { HoldingProjections, HoldingProjectionRequest } from "@/modules/finance";
export { loadProjectDetail } from "./ui/hooks/use-project-detail";
export type { ProjectDetail as ProjectDetailData } from "@/modules/finance";   // alias de compatibilidad
export { profitRateLabel, PROFIT_RATE_COPY } from "./ui/hooks/profit-rate";
export { useProcessStages } from "./ui/hooks/use-process-stages";             // reemplaza a processStagesFor
// finance/backoffice-ui.ts: export * from "./ui/components/admin"; export { useProcessStages } from "./ui/hooks/use-process-stages";
```

Componentes que cambian (mismo marcado, mismas clases y mismos `data-testid`):

| Archivo | Cambio |
|---|---|
| `ProjectDetail.tsx` | Rama por `data.mode` (D5). `BudgetSection budget={data.budget}` · `ScenariosSection rows={data.scenarios}` · `SimulatorSection data` · `RealizedResult` con `data.realized` y `data.settlement` · `TimelineSection` · `RisksSection risks={data.risks}` |
| `BudgetSection.tsx` | Tipo `BudgetBreakdown`. La etiqueta de cada línea sale de `C.budget.items[line.item]` (key = item) |
| `ScenariosSection.tsx` | Recibe `rows: readonly ScenarioRow[]`; no calcula nada |
| `SimulatorSection.tsx` · `SimulatorControls.tsx` · `SimulatorResultPanel.tsx` | Tipos del dominio. Los controles en pb muestran `formatPercentage({ bps })` en `valueText`. `maxHeld` = `data.simulation.heldRange.max` (se quita el `Math.max` de la UI). Presets desde `STRESS_PRESET_IDS` (mismo testid `simulador-preset-${id}`) |
| `RealizedResult.tsx` | Capital, ganancia y % desde `realized: HolderPayout`. Precio, excedente y fondo desde `settlement` |
| `TimelineSection.tsx` | `ProcessBoard stages={toProcessStageViews(data.process ?? [])}`. Las actualizaciones muestran `formatIsoDate(u.publishedOn)` · `u.title` · `u.body` |
| `RisksSection.tsx` · `ProjectParticipate.tsx` | Textos `C.risks.kinds[kind]` |
| `ProjectParticipate.tsx` | `estimateReservation(data.simulation.base, q)` y `reservationAmount` desde un hook nuevo `use-reservation-estimate.ts`. Sin cupos = `data.simulation.maxHeld < 1` |
| `PropertySection.tsx` | `data.profile.description` y `data.profile.highlights` |
| `ProjectProcessBoard.tsx` | `useProcessStages(code)`. Mientras está pendiente → `null`; con `null` → `noProcess`. Props sin cambios (D3) |
| `copy.ts` | Añade `budget.items: Record<BudgetItem, string>` (las etiquetas actuales; `management_fee` "Honorarios de gestión de la empresa", `contingency` "Contingencia de obra", `reserve` "Reserva") y `risks.kinds: Record<ProjectRiskKind, string>` (los 7 textos actuales, literales) |
| `copy-simulator.ts` | `saleVariation(bps)` y `overrunValue(bps)` con `formatPercentage`. Mismo texto visible ("−20 % sobre el objetivo", "+20 %") |

Se borran: `ui/components/investor/examples.ts` y `examples.test.ts`, `ui/types.ts`, `ui/hooks/{simulate,scenarios,project-figures,process-stages}.ts` y sus tests `simulate.test.ts`, `estimate-reservation.test.ts` y `figures.test.ts`. Su cobertura se reparte así: los tests de dominio van en D, `profit-rate.test.ts` y `process-stage-view.test.ts` en UI.

**Fuera del módulo (paquete UI).**
- `investors/ui/components/panel/HoldingProcess.tsx`: `"use client"` y `useProcessStages(code)`, con el mismo marcado. `acquiredOn` sigue en las props pero no se usa (D3).
- `investors/.../panel/projection-parity.test.tsx`: tipos nuevos, con la misma aserción.
- `investors/.../admin/process-parity.test.tsx`: monta el tablero admin dentro de `<Providers>` y usa `await findByTestId`.
- `app/(inversionista)/proyectos/[slug]/page.tsx` y `participar/page.tsx`: sin `generateStaticParams`; `isProjectSlug` de `@/modules/projects` (D4).

## 4. Paquetes

| # | Agente | Archivos (exclusivos) | Depende de | Paralelo con | Criterios |
|---|---|---|---|---|---|
| D | dominio-financiero | **projects:** `domain/{project-slug,property-profile,process,project-update,project-risk}.ts` + `.test.ts` de slug, process, update y risk · `application/ports.ts` · `application/get-project-process.ts` (+test) · `index.ts` · `public-api.test.ts` · `CLAUDE.md` · **finance:** `domain/{budget,simulator,stress-presets,scenarios,holding-projection,project-detail}.ts` (+`project-detail-types.ts` si hace falta) · `domain/budget.test.ts` · `domain/simulate-projection.canonical.test.ts` · `domain/simulate-projection.properties.test.ts` · `domain/stress-presets.test.ts` · `domain/scenarios.test.ts` · `domain/holding-projection.test.ts` · `domain/project-detail.test.ts` · `application/ports.ts` · `application/get-project-detail.ts` (+test) · `application/get-holding-projections.ts` (+test) · `index.ts` · `money-in-ui.test.ts` · `CLAUDE.md` · **participations:** `index.ts` · `CLAUDE.md` | contratos §3.1–3.4 | DATA y la redacción de UI/QA | CA3–CA6 (lógica), CA8 (guardia) |
| DATA | datos-demo | **projects:** `infrastructure/seed.ts` · `infrastructure/seed-content.ts` (nuevo) · `infrastructure/projects.mock-repository.ts` (+test) · **finance:** `infrastructure/seed.ts` · `infrastructure/seed-budget.ts` (nuevo) · `infrastructure/finance.mock-repository.ts` (+test) · **composition:** `demo-snapshot.ts` · `modules/projects.ts` · `modules/finance.ts` · `container.ts` · `container.test.ts` · `seed-consistency.test.ts` · `project-detail-seed.test.ts` (nuevo) · **shared:** `config/demo.ts` | §3 (tipos de D). Escribe contra las firmas; entrega `HECHO` cuando D haya entregado | D | CA1 (datos), CA2, CA5–CA7 |
| UI | constructor-ui | **finance:** `ui/**` excepto `ui/components/admin/**` (más `ui/components/admin/index.ts`, solo para reexportar el tablero) · `ui.ts` · `backoffice-ui.ts` · **investors:** `ui/components/panel/HoldingProcess.tsx` · `ui/components/panel/projection-parity.test.tsx` · `ui/components/admin/process-parity.test.tsx` · **app:** `(inversionista)/proyectos/[slug]/page.tsx` · `(inversionista)/proyectos/[slug]/participar/page.tsx` | D y DATA (sus tests usan `createContainer`) | redacción con D y DATA | CA1–CA4, CA6, CA8 |
| QA | qa-e2e | `tests/e2e/ficha.spec.ts` · `tests/e2e/reiniciar-datos.spec.ts` | D, DATA y UI integrados | redacción con todos | CA1, CA3–CA6, CA8, CA9 |

**Orden.** D ∥ DATA ∥ (redacción de UI y QA), todos contra §3. Se integra **D → DATA → UI → QA**. El orquestador corre `pnpm verify` y `pnpm build` después de cada integración, y luego vienen `revisor-codigo` ∥ `revisor-cumplimiento`. Si UI pasa de su presupuesto, se divide en **UI-a** (hooks, `ui.ts`, `backoffice-ui.ts`, investors y app) y **UI-b** (componentes y copy de investor). UI-b depende de las firmas de los hooks de §3.7.

**Notas por paquete.**
- **D.**
  - Nada de `Date` ni aritmética con `.cents` en domain: solo `applyPercentageFloor`, `addMoney`, `subtractMoney`, `multiplyMoney`, `sumMoney` y `percentage`.
  - `simulateProjection` reproduce `ui/hooks/simulate.ts` línea por línea, salvo que el sobrecosto se aplica a `worksBudget` (P4-4).
  - `money-in-ui.test.ts` recorre `src/modules/finance/ui/{hooks,components/investor}/**/*.{ts,tsx}` (sin `*.test.*`) con `readFileSync`. Falla ante `/\.cents\b/` o ante un `import {` sin `type` desde `"@/shared/domain/money"`. Sobre el árbol actual **fallará** hasta que UI termine; D lo entrega marcado `it.todo` → UI lo activa (`it`) como último paso. Lo coordina el orquestador.
  - `finance/CLAUDE.md` (≤ 30 líneas) añade:
    - las reglas D2 y D7;
    - "la ficha se arma en `buildProjectDetail`";
    - los supuestos P4-4, Q1–Q3 y P5-1 con un enlace a este plan.
  - `participations/CLAUDE.md`: "`finance` importa de aquí **solo tipos** en domain/application; `finance/ui` puede importar valores".
  - `projects/CLAUDE.md`: perfil, proceso, actualizaciones y riesgos, sin niveles; `isProjectSlug`.
  - `public-api.test.ts` amplía la lista exacta y mantiene "ninguna clave /wheel/i".
- **DATA.**
  - Es el único paquete que toca `seed*.ts`, `composition/**` y `shared/config/demo.ts`.
  - Fechas solo con `relativeDates(clock)`, sin literales: el test de "sin fechas literales" incluye `seed-content.ts` y `seed-budget.ts`.
  - Confirma D6 con el grep antes de empezar.
  - `seed-consistency.test.ts` puede seguir importando de `@/modules/finance`, porque su index no lleva UI.
- **UI.**
  - El aspecto **no cambia**. Antes y después, compara con `pnpm playwright test tests/e2e/capturas-maqueta.spec.ts` (capturas de ficha, participar, panel y admin).
  - Ningún componente importa `../../../domain/*` con valores ni valores de `@/shared/domain/money`.
  - Corre `node scripts/check-copy.mjs src/modules/finance src/modules/investors src/app` antes de entregar.
- **QA.**
  - Acota los locators a `[data-testid="pagina-p4"]:visible`.
  - Normaliza NBSP y el signo menos (U+2212).
  - Compara importes con el texto que da `formatMoney`, no con literales armados a mano.

## 5. Pruebas

### 5.1 Dominio (paquete D, Vitest)
- `simulate-projection.canonical.test.ts` (CA5). Base C1 = P 40.000 · C 10.000 · F 10.000 · obra 5.000 · O 0 · 100 × USD 100:
  - **C1** (placed 100, held 1): excedente 20.000 · fondo 5.000 · 50 por participación · externos 5.000 · empresa del fondo 0 · empresa 75 % 15.000 · capital 100 · ganancia 50 · cobro 150.
  - **C6** (63): externos 3.150 · empresa del fondo 1.850 · cobro 150.
  - **C3** (`placement-0`): `no_placement` · externos 0 · empresa del fondo 5.000.
  - **C5** (P 19.000): `no_distribution`.
  - **C4** (P 30.000, O 1.000): 22,50 por participación.
- Estrés sobre C1:
  - `sale-20` → P 32.000 y excedente 12.000;
  - `works-50` → `worksOverrun` 2.500 y F' 12.500 (P4-4);
  - `delay-6` → `termMonths` 9 con el excedente igual.
- `simulate-projection.properties.test.ts` (fast-check, entradas arbitrarias, también fuera de rango):
  - nunca lanza;
  - con `payout`: `toExternal + companyTotal === surplus` y `capitalExterno + capitalEmpresa + surplus + O === P'`;
  - `heldUsed ≤ placed`;
  - `termMonths = target + delay`;
  - `recoveryBudget ≥ F`;
  - `normalizeControls` es idempotente;
  - `JSON.stringify(result)` no coincide con /wheel|rueda|stalled/.
- `stress-presets.test.ts`: cada preset cambia solo su variable, conserva `held` y parte de los valores neutros; `base` = `neutralControls`. Los ids coinciden con la maqueta (protegen los testids).
- `scenarios.test.ts`: 3 filas en el orden de `SCENARIO_IDS`. [PROPUESTO] Con la base M2-006, ganancia por participación: conservador USD 12,80 · base USD 34,30 · optimista USD 43,80.
- `holding-projection.test.ts` (P5-1, base M2-006):
  - con 1, la colocación pasa a 64 y reparte;
  - con 37, llega a 100;
  - con 42, se queda en 100 (tope);
  - más colocadas suben `toExternal`;
  - sin excedente → `no_distribution`;
  - `projectHoldingGain(base, 2)` = 2 × 34,30;
  - `reservationAmount(100, 3)` = 300.
- `budget.test.ts`:
  - la plantilla de M2-006 suma 10.000, con obra 5.000 y bolsa 5.000;
  - errores `BUDGET_TOTAL_MISMATCH` (+1 ¢), `DUPLICATE_ITEM`, `NEGATIVE_AMOUNT`, `NO_WORKS_LINES` y `PROJECT_MISMATCH`;
  - `buildBudgetBreakdown` da total = C + F + O y separa works de fees conservando el orden;
  - `BUDGET_ITEM_CATEGORY` es exhaustivo.
- `project-detail.test.ts` (fixtures en línea):
  - modos D5 para las 6 fases;
  - `maxHeld` open = min(20, disponibles) y, en el resto, min(20, colocadas); `heldRange.max ≥ 1`;
  - realized → `scenarios []` y `realized` = `calculateHolderPayout(dist, 1)`; `finished` sin liquidación → `MISSING_SETTLEMENT`;
  - un id ajeno → `PROJECT_MISMATCH`; un proceso inválido → `INVALID_PROCESS`;
  - actualizaciones ordenadas y riesgos normalizados;
  - claves sin /wheel/i.
- `get-project-detail.test.ts` (repos falsos):
  - un slug ausente → `null`, sin consultar los demás repos;
  - con datos completos → el detalle;
  - sin economía, presupuesto o perfil → rechaza;
  - un repo que lanza en síncrono → rechaza.
- `get-holding-projections.test.ts`: suma correcta con `sumMoney`; un código desconocido → `null`; si todos son null, `total` es `null`.
- projects:
  - `project-slug.test.ts`: acepta `m2-006-chacao`; rechaza `M2_RARO`, `""`, `a--b`, `-a` y valores que no son string;
  - `process.test.ts`: los 5 códigos de error; `toProcessTimeline` en orden y con `estimated` según la regla;
  - `project-update.test.ts` y `project-risk.test.ts`;
  - `get-project-process.test.ts`: código inexistente, `acquiredOn` null y sin proceso → `null`.

### 5.2 Datos (paquete DATA)
- `seed-consistency.test.ts` amplía:
  - (a) 7 presupuestos que pasan `checkProjectBudget`, con obra 5.000 y bolsa 5.000 (maestro §6);
  - (b) 6 procesos que pasan `checkProjectProcess`, con estas coherencias:
    - `settled` → todo `done` y `sold.offsetDays` = días de `acquiredOn` a `saleSignedOn`;
    - `on_sale` → `on_sale` en `current`;
    - `renovation` → una etapa de obra en `current` o `upcoming` y ninguna de venta `done`;
    - `funding` → `works_start` no `done`;
  - (c) en el reloj de hoy, `done` o `current started` → fecha ≤ today, y `estimated` → fecha ≥ today;
  - (d) 17 actualizaciones con ids únicos, `acquiredOn ≤ publishedOn ≤ today` y, en los liquidados, ≤ `settledOn`;
  - (e) los 6 publicados llevan los 3 riesgos comunes; M2-007 no lleva perfil, proceso, actualizaciones ni riesgos;
  - (f) `JSON.stringify(snapshot)` no coincide con /rueda|estancad|días sin vender|wheel|stalled/i;
  - (g) no hay fechas literales en ningún `seed*.ts`;
  - (h) desplazar today desplaza también las actualizaciones;
  - (i) `version 2` sobrevive a JSON y `{ version: 1 }` no se acepta.
- `container.test.ts`:
  - `storageKey "club-demo:v2"`;
  - `finance.getProjectDetail`, `finance.getHoldingProjections` y `projects.getProjectProcess` existen;
  - con un `memoryStorage` que trae `club-demo:v1`, al crear el container la clave v1 desaparece;
  - sigue sin exponer backoffice.
- `project-detail-seed.test.ts` (`fixedClock("2026-11-22")`, `storage: null`):
  - los 6 slugs dan detalle; `m2-007-palos-grandes` y `no-existe` dan `null`;
  - M2-006: `mode "open"`, `maxHeld 20`, `budget.total` 62.280, 4 líneas de obra y 3 de bolsa, `scenarios[1]` 34,30;
  - M2-002 y M2-005: `fixed_projection`;
  - M2-003: `realized.gain` 34,50; M2-001: 30,24;
  - `getProjectProcess("M2-005")` da las mismas fechas que `detail.process`;
  - tras `demo.reset()` da lo mismo.
- Repos mock: filtran por id y devuelven `null` o `[]` cuando no hay datos.

### 5.3 UI y E2E
- UI (Vitest, jsdom):
  - `process-stage-view.test.ts`: tabla exhaustiva y estados que se trasladan igual;
  - `profit-rate.test.ts` (lo que hoy está en `figures.test.ts`);
  - los dos tests de paridad de investors siguen pasando (ficha = panel = portafolio = backoffice);
  - `money-in-ui.test.ts` se activa.
- E2E `ficha.spec.ts` (se conservan los 3 casos actuales; se añaden estos, en `movil-390` y `desktop-1440`):
  1. Desde P3: la tarjeta de M2-006 lleva a `/proyectos/m2-006-chacao`, con `pagina-p4` y un solo `h1`.
  2. M2-006:
     - `simulador-ganancia` contiene "USD 34,30" y "34,3 % sobre el capital";
     - `escenario-conservative-ganancia` "USD 12,80";
     - `presupuesto-total` "USD 62.280";
     - `simulador-descargo` = `LEGAL_COPY.simulatorDisclaimer`.
  3. Presets:
     - `simulador-preset-sale-20` → `simulador-sin-reparto` visible y sin `simulador-cobro`;
     - `works-20` → "USD 31,80";
     - `works-50` → "USD 28,05";
     - `delay-6` → `simulador-plazo` contiene "9 meses" y la ganancia vuelve a "USD 34,30";
     - `placement-0` → `simulador-sin-colocacion`;
     - `base` → `aria-pressed="true"`.
  4. `simulador-participaciones` tiene `max="20"` y `min="1"`; `simulador-resultado-vivo` tiene `aria-live="polite"`.
  5. M2-003: `realizado-ganancia` "USD 34,50" y "34,5 %"; sin `seccion-simulador` ni `seccion-escenarios`.
  6. `/proyectos/m2-007-palos-grandes` y `/proyectos/no-existe` → `ficha-no-encontrada` con `zona-investor` visible; el cuerpo no contiene "Dúplex Los Palos Grandes". `/proyectos/M2_RARO` → página not-found.
  7. `/proyectos/m2-006-chacao/participar` → `participar-ganancia` contiene "USD 34,30" con 1 participación.
  8. Reiniciar datos en la ficha → `ficha-disponibles` sigue en "37 de 100".
  9. Ningún `console.error` ni `pageerror`; el texto no coincide con /rueda|estancad|días sin vender/i; en 390, `scrollWidth ≤ 390`.
- `reiniciar-datos.spec.ts`: `KEY = "club-demo:v2"`, `snap.version === 2`. El valor alterado lleva `version: 2` con `projects: "alterado"`. Se añade: una `club-demo:v1` sembrada a mano desaparece al recargar.

## 6. Riesgos, supuestos y preguntas

**Riesgos.**
- **R1 · Cambian cifras visibles por P4-4.** Hoy el sobrecosto se aplica a F completo (obra + bolsa); el maestro §7 habla de "obra 20–50 % más cara". Con P4-4 cambian los presets y el escenario conservador: en M2-006, el conservador pasa de USD 10,30 a USD 12,80, `works-20` de 29,30 a 31,80 y `works-50` de 21,80 a 28,05. Ningún E2E actual depende de esas cifras. Si el usuario prefiere mantener F, basta con cambiar `worksBudget` por `recoveryBudget` en `simulateProjection` y las cifras [PROPUESTO] de §1 y §5.
- **R2 · El tablero de proceso se vuelve asíncrono** (D3). Es un parpadeo de un frame en el panel y en el backoffice. El test de paridad admin necesita `<Providers>`.
- **R3 · `generateStaticParams` desaparece** (D4). Si `pnpm build` falla con `cacheComponents`, UI devuelve `BLOQUEADO` con el error. La alternativa es conservar `generateStaticParams` con los slugs de `isProjectSlug` + un solo slug ejemplo (no una lista de negocio), y el orquestador lo decide.
- **R4 · El lint de dinero ignora `modules/finance/**`.** Mitigación: `money-in-ui.test.ts`. Para `docs/mejoras.md`:
  - acotar el `ignores` a `finance/{domain,application,infrastructure}`;
  - `admin/SettlementPanel.tsx:72` suma `.cents` en la UI, y `admin/FinanceScreen.tsx` usa `.cents` y `usd()` (B5).
- **R5 · Datos incoherentes.** Antes, un dato que faltaba daba "no encontrada"; ahora da `ficha-error`, que es lo correcto para un dato corrupto.
- **R6 · Compatibilidad.** Se mantienen los nombres públicos `loadProjectDetail`, `projectHolding`, `ProjectDetailData` y `ProjectProcessBoardProps` como envoltorios o alias, para no tocar más pantallas. Para `docs/mejoras.md`: limpiarlos en P6/B3.

**Supuestos aplicados** (todos con propuesta por defecto; el usuario los confirma al aprobar el plan):
- **[SUPUESTO Q1]** (docs/08 Q1) Bolsa de USD 5.000 = honorarios 2.500 · contingencia 1.500 · reserva 1.000, rotulada como ejemplo. La obra de cada proyecto, con los rubros de la maqueta, suma USD 5.000.
- **[SUPUESTO Q2]** (docs/08 Q2) El retraso solo alarga el plazo proyectado y no resta ganancia.
- **[SUPUESTO Q3]** (docs/08 Q3) Escenarios: conservador venta −10 % y obra +20 %; base 0; optimista venta +5 %.
- **[SUPUESTO P5-1]** (docs/08 R) La estimación de la reserva suma la cantidad a lo ya colocado, con el total como tope.
- **[SUPUESTO P4-4] (nuevo)** El sobrecosto se aplica al subtotal de obra (`works`), se suma a F y no lo absorbe la contingencia.
- **[SUPUESTO P4-11] (nuevo)** "Colocación 0 %" = 0 colocadas (C3 literal): se muestra "sin colocación" y no hay cobro externo, como en la maqueta.
- **[SUPUESTO P4-12] (nuevo)** Si `held` > colocación, se usa `heldUsed = min(held, placed)` y se muestra el aviso `heldAdjusted`, como en la maqueta.
- **[SUPUESTO P4-13] (nuevo)** M2-007 lleva presupuesto sembrado (para B2) pero no perfil, proceso, actualizaciones ni riesgos.
- **Ya no son supuestos:** P4-3 (el simulador solo en `open`, decidido en ADR-013 §3) y P4-2 (cubierto por Q2).

**Reglas de negocio inventadas:** ninguna. Lo que el maestro no fija (§6 "bolsa mixta" y §7, que nombra las pruebas sin dar fórmula) queda como supuesto.

**Preguntas para `docs/08`** (las añade el orquestador; el arquitecto no edita el archivo): al **bloque Q** se suman dos filas.

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| Q5 | ¿El sobrecosto de obra de las pruebas de estrés se aplica solo a la obra o a todo el presupuesto integral (incluida la bolsa)? ¿Lo absorbe primero la contingencia? | Solo a la obra, sumado completo a F (P4-4) |
| Q6 | ¿Los costos de venta (O) son fijos o un % del precio de venta cuando el simulador mueve el precio? | Fijos al valor estimado |

**Para `docs/mejoras.md`:** R4 (lint y admin de finance), R6 (alias), la prop `acquiredOn` sin uso (D3), el 404 real cuando haya backend (D4), las fotos reales (F4-2), y los campos `source`/`responsible`/`evidence` de `ProjectUpdate` (docs/02 §3, maestro §10) cuando B3 publique actualizaciones (snapshot v3).

**Para docs (los actualiza el orquestador en el mismo cambio, sin ADR):**
- `docs/01 §4`: la celda ui → domain propio pasa a "tipos; funciones puras solo desde `ui/hooks`" (D7).
- `docs/01 §6`: clave `club-demo:v2` y limpieza de claves antiguas.
- `docs/06` regla 4: `profitRateLabel` sigue en `@/modules/finance/ui`, sin cambios.

## 7. ADR requerido

**No.**
- D2 aplica la regla 2b de `docs/01 §4` tal como está.
- No cambian el orden de módulos, `eslint.config.mjs` ni la separación `index.ts` / `ui.ts` / `backoffice-ui.ts` de ADR-012.
- Lo que manda ADR-013 se mantiene: `calculateProfitRate`, el simulador solo en `open`, la reserva con estimación, los términos y el tablero de 6 etapas.
- El paso a v2 es un cambio de datos simulados.

El único cambio de cifras visibles (P4-4) es una decisión de producto que va como supuesto y como pregunta Q5. **El usuario debe confirmar Q1, Q3 y P4-4 al aprobar el plan**, porque fijan las cifras que verá el inversionista. Si rechaza P4-4, el cambio queda en una línea (R1).
