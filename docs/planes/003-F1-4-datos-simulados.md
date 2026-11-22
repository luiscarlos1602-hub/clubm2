# Plan 003 · F1-4 · Datos simulados: composition root, demo-store y 7 proyectos semilla

Estado: borrador · Fecha: 2026-11-22 · Autor: arquitecto

Fuentes: `docs/prompts/F1-fundacion-visual.md` §F1-4 · `docs/01-arquitectura.md` §3, §4, §6, §8 · `docs/02-modelo-de-dominio.md` §1–§5 · skill `datos-semilla` · skill `nuevo-modulo` · ADR-004 · `docs/08` D2, D4, D5, D6, E1, H2, L5, L9 · plan 002 · código ya construido en `src/shared/domain`, `src/modules/finance` y `src/modules/projects` (`index.ts`, `backoffice.ts`), `eslint.config.mjs`, `architecture.modules.mjs`.
Rama sugerida: `feat/composition-datos-simulados` (desde la rama que tenga F1-3; si F1-2 ya está en `main`, desde `main`).

## 1. Historia y criterios

**Historia.** Como club necesitamos un conjunto de datos simulados creíble y que cuadre con el motor (7 proyectos, uno por escenario, y un inversionista demo con historial), guardado en el navegador y reiniciable, servido por repositorios detrás de puertos y conectado en un único composition root. Así F1-5 y F2 construyen pantallas sobre datos reales de la demo sin calcular dinero, y cambiar a Supabase más adelante solo exige otro adaptador.

No hay brief formal: los criterios salen del prompt de F1 y de `docs/01 §6`. Los marcados [PROPUESTO] los añade el arquitecto.

| CA | Criterio verificable |
|---|---|
| CA1 | Existen 7 proyectos con códigos `M2-001…M2-007` construidos desde `brand.shortName` (nunca el literal escrito a mano), ids y slugs únicos y legibles (§3.7), y todos pasan `checkProjectConsistency`. |
| CA2 | Los escenarios de `docs/01 §6` están presentes, con la asignación exacta de §3.7: 1 en due diligence, 1 en colocación con 63/100, 1 en obra, 1 en venta, 1 liquidado con rueda buena, 1 liquidado con rueda media, 1 con rueda mala (sin vender, más de 6 meses en cartera). Las ruedas se comprueban en el test con `classifyProjectWheel` de `backoffice.ts`; nunca se guardan. |
| CA3 | Zonas: Chacao, Los Palos Grandes, El Hatillo y El Paraíso en Caracas, y una en Valencia (El Viñedo). |
| CA4 | Inversionista demo `inv_demo`: 1 participación en un proyecto liquidado y 2 en proyectos en curso; cantidades dentro de D4 (1–20) y que no superan las colocadas. Su cobro del liquidado sale de `calculateHolderPayout`. |
| CA5 | Los montos derivados salen del motor: cada liquidación sembrada se construye con `createSettlement` (que llama a `calculateDistribution`) y `seed-consistency.test.ts` la recalcula e iguala al centavo. M2-001 tiene un residuo K1 distinto de cero (90 ¢) y se comprueba. |
| CA6 | Fechas relativas al `Clock`: generar las semillas con dos fechas "hoy" distintas desplaza todas las fechas exactamente el mismo número de días y da los mismos escenarios y ruedas. Ningún archivo `seed.ts` contiene una fecha literal `YYYY-MM-DD` (lo comprueba un test). |
| CA7 | `demo-store` guarda en `localStorage` con la clave `club-demo:v1`: la primera lectura siembra y persiste; una segunda instancia lee lo persistido; un JSON corrupto o inválido se descarta y se vuelve a sembrar; `reset()` borra la clave y devuelve las semillas iniciales; sin `localStorage` (SSR, modo privado) funciona en memoria. |
| CA8 | Composition root: `createContainer()` en `src/composition/container.ts` con una línea por módulo (`registerProjects`, `registerParticipations`, `registerFinance` en `src/composition/modules/<m>.ts`). Los repositorios devuelven `Promise` y leen del demo-store. |
| CA9 | "Reiniciar datos simulados": `useResetDemoData()` y `<ResetDemoDataButton />` con confirmación en dos pasos, que llaman a `container.demo.reset()` e invalidan las consultas de TanStack Query. Hay un test de componente. El E2E de punta a punta corre en F1-5, cuando el botón ya esté montado en el layout (§5.3). |
| CA10 | ADR-004: ninguna clave del snapshot contiene `wheel` ni `rueda`; ningún proyecto sembrado está en `stalled`; el container no expone nada de `backoffice.ts`. |
| CA11 | `pnpm verify:fast` en verde (capas, check-copy) y `pnpm vitest run src/shared src/modules src/composition` en verde. Cero `eslint-disable`. |
| CA12 [PROPUESTO] | El módulo `participations` se crea con la skill `nuevo-modulo` (`CLAUDE.md`, `domain/`, `application/ports.ts`, `infrastructure/`, `index.ts`). `architecture.modules.mjs` ya lo lista, así que no cambia. |
| CA13 [PROPUESTO] | Ningún archivo de `app/` cambia en F1-4: el montaje de `<Providers>` y del botón es de F1-5 (§4, nota de coordinación). |

## 2. Módulos afectados

| Módulo | Por qué | Nuevo |
|---|---|---|
| `shared/infrastructure` | demo-store genérico, almacenamiento del navegador o en memoria, reloj del sistema (America/Caracas), generador de ids, fechas relativas, esquemas Zod de valores | Sí |
| `shared/config` | `demo.ts`: clave `club-demo:v1`, zona horaria y `fixedToday` | Sí (archivo) |
| `projects` | `Property` gana `kind` y `areaM2`; puertos de repositorio; semillas de inmuebles y proyectos; repositorios mock | No (añade `application/` e `infrastructure/`) |
| `participations` | Clase de participación por proyecto (100 × USD 100, colocadas) y tenencias del inversionista demo | **Sí** |
| `finance` | `ProjectEconomics` (C, F, P objetivo, O estimado) y `Settlement` (liquidación realizada calculada con el motor); puertos, semillas y repositorios mock | No (añade `application/` e `infrastructure/`) |
| `composition` | Container, snapshot de la demo, registros por módulo, providers, reinicio y `seed-consistency.test.ts` | Sí |
| `shared/ui/brand` | Solo un archivo nuevo de copy (`demo-copy.ts`), sin tocar el barrel | No |

### Decisión: dónde viven el inversionista y las participaciones

Orden de `architecture.modules.mjs`: `projects → participations → finance → … → investors`.

- **Se crea `participations` (mínimo).** La colocación (63/100) y las tenencias son entidades de `participations` según `02 §3`. `finance` necesita `total`, `placed` y `unitPrice` para liquidar, y `finance` está a la derecha de `participations`: la dependencia va en el sentido permitido. Poner la colocación en `projects` mezclaría conceptos. Ponerla en `finance` dejaría vacío un módulo que P5 (reservas) va a necesitar igual.
- **No se crea `investors` en F1-4.** Su contenido (perfil, verificación, portafolio) es de F2 (P2, P6, P8) y B6. El historial del inversionista demo **son sus participaciones**, y eso vive en `participations`, que define `HolderId = Id<"Investor">` como referencia opaca. Cuando F2 cree `investors` (a la derecha), importará `HolderId` de `participations` y le colgará el perfil. El id fijo `inv_demo` lo exporta la semilla de `participations` y el container lo expone como `container.demo.holderId`. No adelanta funcionalidad de F2/F3: no hay perfil, portafolio, reservas ni casos de uso de escritura.
- **No se crea `acquisitions`.** La "oportunidad en due diligence" se siembra como `Project` en estado `due_diligence`, que es parte de `projects` desde F1-3. El pipeline, el checklist y los comparables son de B2 (F3).

### Decisión: la infraestructura de un módulo no importa otros módulos

`01 §4` (fila infrastructure → `index.ts` de otro módulo: ❌) es más estricta que el lint actual, que sí lo permite. El plan cumple el documento:
- Cada `seed.ts` escribe solo los datos propios de su módulo, unidos por ids legibles que hacen de clave foránea.
- Lo que una semilla necesita de otro módulo (fecha de compra, fecha de liquidación, términos de la clase) se lo pasa `composition/demo-snapshot.ts` en un objeto de contexto tipado con los tipos del propio módulo (§3.6).
- Por la misma razón, `seed-consistency.test.ts` va en `src/composition/` y no en `src/shared/infrastructure/`: `shared/infrastructure` no puede importar módulos (lint `shared-infra` y "transversal sin lógica de negocio", `01 §3`), y solo `composition` ve todas las semillas. El paquete 6 corrige esa ruta en la skill `datos-semilla` y en el agente `datos-demo`.

## 3. Contratos (TypeScript)

Son el acuerdo entre los paquetes 1 (dominio), 2–4 (datos) y 5 (UI), y con F1-5 y F2. Cambiar una firma exige avisar al agente principal. Restricciones heredadas del plan 002: ES2017 (sin `bigint` ni `String.prototype.replaceAll`), sin `Date` en `domain/`, dinero solo con las funciones de `money.ts`.

### 3.1 `projects` — `domain/project.ts` (modificado) y `application/ports.ts` (nuevo)
```ts
// domain/project.ts: Property gana dos campos descriptivos (el plan 002 §3.7 lo dejó previsto)
export type PropertyKind = "apartment" | "house";
export type Property = {
  readonly id: PropertyId;
  readonly city: string;        // "Caracas" | "Valencia" en la demo
  readonly zone: string;        // sin dirección exacta (D6)
  readonly kind: PropertyKind;
  readonly areaM2: number;      // entero > 0
};

// application/ports.ts
import type { Project, ProjectId, Property, PropertyId } from "../domain/project";
export interface ProjectRepository {
  list(): Promise<readonly Project[]>;                 // orden por code ascendente
  findById(id: ProjectId): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
}
export interface PropertyRepository {
  list(): Promise<readonly Property[]>;
  findById(id: PropertyId): Promise<Property | null>;
}
// index.ts: añade `export type { PropertyKind }`. No cambia ninguna clave en tiempo de ejecución (public-api.test.ts sigue igual).
```
En F1-4 no hay escrituras: `save`/`update` los añaden B3/B4 cuando existan casos de uso.

### 3.2 `participations` (módulo nuevo) — `domain/participation.ts`, `domain/participation-consistency.ts`, `application/ports.ts`
```ts
// domain/participation.ts
import type { ProjectId } from "@/modules/projects";
import type { IsoDate } from "@/shared/domain/calendar-date";
import type { Id } from "@/shared/domain/id";
import type { Money } from "@/shared/domain/money";

/** Referencia opaca al inversionista. El perfil vive en `investors` (F2). */
export type HolderId = Id<"Investor">;
export type ParticipationClassId = Id<"ParticipationClass">;
export type ParticipationId = Id<"Participation">;

/**
 * Clase de participación de un proyecto (ref. 100 × USD 100).
 * `placed` = total colocado a terceros (agregado); total − placed = retenidas por la empresa.
 * Es estructuralmente compatible con `ParticipationTerms` de finance: se pasa tal cual al motor.
 */
export type ParticipationClass = {
  readonly id: ParticipationClassId;
  readonly projectId: ProjectId;
  readonly total: number;       // entero ≥ 1
  readonly placed: number;      // entero 0..total
  readonly unitPrice: Money;    // > 0
};

export const PARTICIPATION_STATUSES = ["pending_confirmation", "confirmed"] as const; // D5: P5 crea las pendientes
export type ParticipationStatus = (typeof PARTICIPATION_STATUSES)[number];

/** Tenencia de un titular en un proyecto. */
export type Participation = {
  readonly id: ParticipationId;
  readonly classId: ParticipationClassId;
  readonly projectId: ProjectId;
  readonly holderId: HolderId;
  readonly quantity: number;          // entero dentro de HOLDING_LIMITS
  readonly status: ParticipationStatus;
  readonly subscribedOn: IsoDate;
};

/** D4 (decidido 22-nov): mínimo 1 y máximo 20 participaciones por persona y proyecto. */
export const HOLDING_LIMITS: { readonly min: 1; readonly max: 20 };

// domain/participation-consistency.ts
export function checkParticipationClass(cls: ParticipationClass):
  Result<ParticipationClass, DomainError<"INVALID_PARTICIPATION_CLASS">>;
  // total entero ≥ 1; placed entero 0..total; unitPrice.cents > 0
export function checkHoldings(cls: ParticipationClass, holdings: readonly Participation[]):
  Result<readonly Participation[], DomainError<"HOLDING_CLASS_MISMATCH" | "HOLDING_OUT_OF_LIMITS" | "HOLDINGS_EXCEED_PLACED">>;
  // cada holding: classId y projectId de la clase; quantity entera en HOLDING_LIMITS;
  // la suma de quantity con status "confirmed" ≤ cls.placed

// application/ports.ts
export interface ParticipationClassRepository {
  list(): Promise<readonly ParticipationClass[]>;
  findByProject(projectId: ProjectId): Promise<ParticipationClass | null>;
}
export interface ParticipationRepository {
  listByHolder(holderId: HolderId): Promise<readonly Participation[]>;   // orden por subscribedOn
}

// index.ts
export type { HolderId, ParticipationClassId, ParticipationId, ParticipationClass, ParticipationStatus, Participation } from "./domain/participation";
export { PARTICIPATION_STATUSES, HOLDING_LIMITS } from "./domain/participation";
export { checkParticipationClass, checkHoldings } from "./domain/participation-consistency";
```

### 3.3 `finance` — `domain/project-economics.ts`, `domain/settlement.ts`, `application/ports.ts` (nuevos)
```ts
// domain/project-economics.ts — supuestos base del proyecto; todo es proyección salvo lo que diga Settlement
import type { ProjectId } from "@/modules/projects";
export type ProjectEconomics = {
  readonly projectId: ProjectId;
  readonly acquisitionCost: Money;     // C. En due diligence es el precio de oferta.
  readonly recoveryBudget: Money;      // F (ref. USD 10.000). El desglose en líneas (02 §6) es de P4/B3.
  readonly targetSalePrice: Money;     // P objetivo, siempre proyección
  readonly estimatedSaleCosts: Money;  // O estimado, siempre proyección
};

// domain/settlement.ts
import type { ProjectId } from "@/modules/projects";
export type SettlementId = Id<"Settlement">;
export type RealizedDistributionInput = DistributionInput & { readonly basis: "realized" };
export type Settlement = {
  readonly id: SettlementId;
  readonly projectId: ProjectId;
  readonly settledOn: IsoDate;
  readonly input: RealizedDistributionInput;
  /** Resultado de calculateDistribution(input) al liquidar. Es un hecho histórico: se guarda y seed-consistency.test.ts lo recalcula. */
  readonly distribution: Distribution;
};
export type SettlementErrorCode = DistributionInputErrorCode | "LOSS_POLICY_UNDEFINED";
export function createSettlement(args: {
  readonly id: SettlementId;
  readonly projectId: ProjectId;
  readonly settledOn: IsoDate;
  readonly input: RealizedDistributionInput;
}): Result<Settlement, DomainError<SettlementErrorCode>>;
  // Llama a calculateDistribution. Si kind === "no_distribution" → LOSS_POLICY_UNDEFINED (H2 está por definir: no se siembran pérdidas).
  // El orden de cobro (H1), los AuditEntry y el remanente (H3) son de B5.

// application/ports.ts
export interface ProjectEconomicsRepository {
  list(): Promise<readonly ProjectEconomics[]>;
  findByProject(projectId: ProjectId): Promise<ProjectEconomics | null>;
}
export interface SettlementRepository {
  list(): Promise<readonly Settlement[]>;
  findByProject(projectId: ProjectId): Promise<Settlement | null>;
}

// index.ts: añade
export type { ProjectEconomics } from "./domain/project-economics";
export type { SettlementId, RealizedDistributionInput, Settlement, SettlementErrorCode } from "./domain/settlement";
export { createSettlement } from "./domain/settlement";
```
`finance/domain` importa `ProjectId` de `@/modules/projects` (domain → `index.ts` de un módulo a su izquierda: ✅). Finance **no** importa `participations` en F1-4: `ParticipationClass` encaja estructuralmente en `ParticipationTerms`.

### 3.4 `shared/config/demo.ts`
```ts
export const demoConfig = {
  storageKey: "club-demo:v1",
  timeZone: "America/Caracas",                              // SUPUESTO L9
  /** "Viaje en el tiempo" para capturas y E2E: NEXT_PUBLIC_DEMO_TODAY=YYYY-MM-DD. */
  fixedToday: process.env.NEXT_PUBLIC_DEMO_TODAY ?? null,   // string | null; se valida con parseIsoDate en demoClock()
} as const;
```

### 3.5 `shared/infrastructure` (genérico: no importa ningún módulo)
```ts
// browser-storage.ts
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
/** window.localStorage o null (SSR, o SecurityError en modo privado). */
export function browserStorage(): KeyValueStorage | null;
export function memoryStorage(initial?: Readonly<Record<string, string>>): KeyValueStorage;

// demo-store.ts
export type SliceReader<T> = { read(): T };
export type DemoStore<S> = {
  readonly key: string;
  /** Caché en memoria. Si falta la clave o no pasa `parse`: buildSeed(), persiste y lo devuelve. */
  read(): S;
  write(next: S): void;               // actualiza la caché y persiste; si setItem falla (cuota), console.warn y sigue en memoria
  update(change: (current: S) => S): S;
  /** "Reiniciar datos simulados": removeItem(key) → buildSeed() → persiste → devuelve. */
  reset(): S;
};
export type DemoStoreOptions<S> = {
  readonly key: string;
  readonly storage: KeyValueStorage | null;    // null = solo memoria
  readonly buildSeed: () => S;
  readonly parse: (raw: unknown) => Result<S, DomainError<"INVALID_SNAPSHOT">>;
};
export function createDemoStore<S>(options: DemoStoreOptions<S>): DemoStore<S>;

// system-clock.ts (aquí sí se permite Date)
export function systemClock(options?: { readonly timeZone?: string; readonly now?: () => Date }): Clock;
  // Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }) → IsoDate
export function demoClock(): Clock;   // demoConfig.fixedToday válido ? fixedClock(...) : systemClock({ timeZone: demoConfig.timeZone })

// id-generator.ts
export function randomIdGenerator(randomUUID?: () => string): IdGenerator;
  // `${prefix}_${uuid sin guiones}`; cumple el patrón de parseId. Por defecto, crypto.randomUUID.

// relative-dates.ts
export type RelativeDates = {
  readonly today: IsoDate;
  daysAgo(days: number): IsoDate;                 // addDays(today, −days); days entero ≥ 0
  daysAfter(base: IsoDate, days: number): IsoDate;
};
export function relativeDates(clock: Clock): RelativeDates;

// zod-schemas.ts: esquemas de valores para validar semillas y snapshot
export const moneySchema: z.ZodType<Money>;          // vía parseUsdCents
export const isoDateSchema: z.ZodType<IsoDate>;      // vía parseIsoDate
export function idSchema<Tag extends string>(): z.ZodType<Id<Tag>>;   // vía parseId
```

### 3.6 Infraestructura de cada módulo (semillas y repositorios mock)
```ts
// projects/infrastructure/seed.ts
export type ProjectsSlice = { readonly properties: readonly Property[]; readonly projects: readonly Project[] };
export const projectsSliceSchema: z.ZodType<ProjectsSlice>;
/** Única semilla que lee el Clock. El código se construye como `${brand.shortName}-00N` y se valida con parseProjectCode. */
export function buildProjectsSeed(clock: Clock): ProjectsSlice;
// projects/infrastructure/projects.mock-repository.ts
export function createProjectMockRepository(source: SliceReader<ProjectsSlice>): ProjectRepository;
export function createPropertyMockRepository(source: SliceReader<ProjectsSlice>): PropertyRepository;

// participations/infrastructure/seed.ts
export const DEMO_HOLDER_ID: HolderId;   // asId("inv_demo")
export type ParticipationsSlice = { readonly classes: readonly ParticipationClass[]; readonly participations: readonly Participation[] };
export const participationsSliceSchema: z.ZodType<ParticipationsSlice>;
export type ParticipationsSeedContext = {
  /** Fecha de compra por proyecto (la pone composition desde la semilla de projects). subscribedOn = acquiredOn + N días. */
  readonly acquiredOn: ReadonlyMap<ParticipationClass["projectId"], IsoDate>;
};
export function buildParticipationsSeed(ctx: ParticipationsSeedContext): ParticipationsSlice;
// participations/infrastructure/participations.mock-repository.ts
export function createParticipationClassMockRepository(source: SliceReader<ParticipationsSlice>): ParticipationClassRepository;
export function createParticipationMockRepository(source: SliceReader<ParticipationsSlice>): ParticipationRepository;

// finance/infrastructure/seed.ts
export type FinanceSlice = { readonly economics: readonly ProjectEconomics[]; readonly settlements: readonly Settlement[] };
export const financeSliceSchema: z.ZodType<FinanceSlice>;
export type FinanceSeedContext = {
  /** Proyectos liquidados: fecha y términos de la clase (los pone composition). */
  readonly settled: readonly {
    readonly projectId: Settlement["projectId"];
    readonly settledOn: IsoDate;
    readonly terms: ParticipationTerms;
  }[];
};
/** Construye cada liquidación con createSettlement. Si el motor devuelve err, lanza Error (es un fallo de la semilla, no de negocio). */
export function buildFinanceSeed(ctx: FinanceSeedContext): FinanceSlice;
// finance/infrastructure/finance.mock-repository.ts
export function createProjectEconomicsMockRepository(source: SliceReader<FinanceSlice>): ProjectEconomicsRepository;
export function createSettlementMockRepository(source: SliceReader<FinanceSlice>): SettlementRepository;
```
Los repositorios mock devuelven `Promise.resolve(...)` y nunca mutan el slice. Cada `seed.ts` valida su salida con su `*SliceSchema.parse` antes de devolverla.

### 3.7 Escenarios sembrados (datos primarios; los derivados los calcula el motor)
Hoy = `T` (Clock). Todas las clases de participación: total 100, precio USD 100 (ref. del maestro), F = USD 10.000. Montos en USD (en la semilla se escriben con `usdUnits` o `usd` en centavos).

| Código | Proyecto / inmueble id | Nombre | Ciudad · zona | Tipo · m² | Estado | acquiredOn | saleSignedOn | settledOn | Colocadas | C | P objetivo | O estimado | Escenario `01 §6` |
|---|---|---|---|---|---|---|---|---|---:|---:|---:|---:|---|
| M2-001 | `prj_palos_grandes_01` / `prop_palos_grandes_01` | Apartamento Los Palos Grandes | Caracas · Los Palos Grandes | apartment · 92 | `settled` | T−300 | acquiredOn + 140 d | T−140 | 88 | 55.000 | 82.000 | 2.460 | liquidado, rueda media |
| M2-002 | `prj_hatillo_01` / `prop_hatillo_01` | Casa El Hatillo | Caracas · El Hatillo | house · 180 | `on_sale` | T−250 | — | — | 81 | 62.000 | 88.000 | 2.640 | rueda mala (sin vender, > 6 meses) |
| M2-003 | `prj_chacao_01` / `prop_chacao_01` | Apartamento Bello Campo | Caracas · Chacao | apartment · 78 | `settled` | T−210 | acquiredOn + 75 d | T−120 | 100 | 48.000 | 72.000 | 2.160 | liquidado, rueda buena |
| M2-004 | `prj_valencia_01` / `prop_valencia_01` | Apartamento El Viñedo | Valencia · El Viñedo | apartment · 85 | `on_sale` | T−110 | — | — | 94 | 38.000 | 58.000 | 1.740 | en venta (en curso) |
| M2-005 | `prj_paraiso_01` / `prop_paraiso_01` | Apartamento El Paraíso | Caracas · El Paraíso | apartment · 70 | `renovation` | T−45 | — | — | 100 | 34.000 | 52.000 | 1.560 | en obra |
| M2-006 | `prj_chacao_02` / `prop_chacao_02` | Apartamento El Rosal | Caracas · Chacao | apartment · 88 | `funding` | T−12 | — | — | 63 | 50.000 | 76.000 | 2.280 | colocación 63/100 |
| M2-007 | `prj_palos_grandes_02` / `prop_palos_grandes_02` | Dúplex Los Palos Grandes | Caracas · Los Palos Grandes | apartment · 120 | `due_diligence` | — | — | — | sin clase | 58.000 (oferta) | 84.000 | 2.520 | due diligence |

Venta realizada de los liquidados (semilla de finance, `basis: "realized"`):

| Liquidación | Proyecto | P realizado | O realizado |
|---|---|---:|---:|
| `stl_palos_grandes_01` | M2-001 | 79.500,00 | 2.400,37 (fuerza un residuo K1) |
| `stl_chacao_01` | M2-003 | 74.000,00 | 2.200,00 |

Tenencias del inversionista demo (`inv_demo`, todas `confirmed`):

| Id | Proyecto | Cantidad | subscribedOn |
|---|---|---:|---|
| `par_demo_chacao_01` | M2-003 (liquidado) | 5 | acquiredOn + 3 d |
| `par_demo_paraiso_01` | M2-005 (en obra) | 3 | acquiredOn + 4 d |
| `par_demo_chacao_02` | M2-006 (colocación) | 2 | acquiredOn + 2 d |

Clases: `pcl_<sufijo del proyecto>` (p. ej. `pcl_chacao_01`); M2-007 no tiene clase (se publica tras la compra).

Notas del diseño de escenarios:
- Los códigos siguen el orden de compra (el `ProjectSeal` muestra código y fecha: así cuadran).
- Las ruedas salen solo de las fechas: 75 d ≤ 3 meses (buena), 140 d entre 3 y 6 meses (media), 250 d sin venta (mala), 110 d sin venta (en curso). Los márgenes están lejos de los bordes K2 para cualquier `T`.
- M2-002 (rueda mala) se siembra en `on_sale`, **no** en `stalled` ([SUPUESTO N1]). La cara del inversionista ve "en venta" sin depender de un mapeo de F2 (L5) y el backoffice lo detecta con `classifyProjectWheel`.
- El inversionista demo no tiene participaciones en M2-002.
- Todos los proyectos no liquidados tienen excedente proyectado positivo (no se siembran pérdidas: H2 por definir).

Valores esperados (los fija el test como regresión; si el motor da otra cosa, manda el motor y se corrige esta tabla con aviso):

| | M2-001 (88/100) | M2-003 (100/100) |
|---|---:|---:|
| Excedente | 1.209.963 ¢ | 1.380.000 ¢ |
| Fondo 25 % | 302.490 ¢ | 345.000 ¢ |
| Por participación | 3.024 ¢ | 3.450 ¢ |
| Residuo K1 | 90 ¢ | 0 ¢ |
| Externos | 266.112 ¢ | 345.000 ¢ |
| Empresa del fondo | 36.378 ¢ | 0 ¢ |
| Empresa directo | 907.473 ¢ | 1.035.000 ¢ |
| Capital externo / empresa | 880.000 / 5.620.000 ¢ | 1.000.000 / 4.800.000 ¢ |
| Cobro de `inv_demo` (5 part.) | — | capital 50.000 ¢ · ganancia 17.250 ¢ · total 67.250 ¢ |

### 3.8 `composition`
```ts
// demo-snapshot.ts
export type DemoSnapshot = {
  readonly version: 1;
  readonly seededOn: IsoDate;
  readonly projects: ProjectsSlice;
  readonly participations: ParticipationsSlice;
  readonly finance: FinanceSlice;
};
export const demoSnapshotSchema: z.ZodType<DemoSnapshot>;
export function parseDemoSnapshot(raw: unknown): Result<DemoSnapshot, DomainError<"INVALID_SNAPSHOT">>;
/** 1) buildProjectsSeed(clock) 2) buildParticipationsSeed({ acquiredOn }) 3) buildFinanceSeed({ settled }) con los términos de la clase. */
export function buildDemoSnapshot(clock: Clock): DemoSnapshot;

// modules/projects.ts · modules/participations.ts · modules/finance.ts
export type ProjectsModule = { readonly projectRepository: ProjectRepository; readonly propertyRepository: PropertyRepository };
export function registerProjects(store: DemoStore<DemoSnapshot>): ProjectsModule;
export type ParticipationsModule = { readonly classRepository: ParticipationClassRepository; readonly participationRepository: ParticipationRepository };
export function registerParticipations(store: DemoStore<DemoSnapshot>): ParticipationsModule;
export type FinanceModule = { readonly economicsRepository: ProjectEconomicsRepository; readonly settlementRepository: SettlementRepository };
export function registerFinance(store: DemoStore<DemoSnapshot>): FinanceModule;
  // cada uno: create…MockRepository({ read: () => store.read().<slice> })

// container.ts
export type Container = {
  readonly clock: Clock;
  readonly ids: IdGenerator;
  readonly demo: {
    readonly storageKey: string;        // "club-demo:v1"
    readonly holderId: HolderId;        // inv_demo: el "yo" del rol Inversionista
    seededOn(): IsoDate;
    reset(): void;
  };
  readonly projects: ProjectsModule;               // una línea por módulo
  readonly participations: ParticipationsModule;
  readonly finance: FinanceModule;
};
export type ContainerOptions = { readonly clock?: Clock; readonly storage?: KeyValueStorage | null; readonly ids?: IdGenerator };
/** Por defecto: demoClock(), browserStorage(), randomIdGenerator(). */
export function createContainer(options?: ContainerOptions): Container;

// providers.tsx ("use client")
export function Providers(props: { readonly children: ReactNode; readonly container?: Container }): ReactElement;
  // useState(() => props.container ?? createContainer()) + QueryClientProvider + ContainerContext
export function useContainer(): Container;   // lanza si no hay <Providers> (error de programación)

// use-reset-demo-data.ts ("use client")
export function useResetDemoData(): { reset(): Promise<void>; readonly isResetting: boolean };
  // container.demo.reset() → queryClient.invalidateQueries()

// ResetDemoDataButton.tsx ("use client")
export function ResetDemoDataButton(props: { readonly className?: string }): ReactElement;
  // Paso 1: botón "Reiniciar datos simulados" → paso 2: aviso + "Sí, reiniciar" / "Cancelar" → estado hecho (aria-live).
  // data-testid: demo-reset-button, demo-reset-confirm, demo-reset-cancel, demo-reset-done
```
El container no importa ni expone `backoffice.ts`. Las pantallas del admin clasifican la rueda con `classifyProjectWheel(project, container.clock.today())` (F3).

### 3.9 Copy — `src/shared/ui/brand/demo-copy.ts`
```ts
export const DEMO_RESET_COPY = {
  action: "Reiniciar datos simulados",
  warning: "Se borran los cambios que hiciste en esta demo y vuelven los datos iniciales.",
  confirm: "Sí, reiniciar",
  cancel: "Cancelar",
  done: "Datos simulados reiniciados.",
} as const;
```
Se importa por ruta (`@/shared/ui/brand/demo-copy`); no se toca el barrel `shared/ui/brand/index.ts` de F1-2.

## 4. Paquetes

| # | Agente | Archivos (exclusivos) | Depende de | Paralelo con | Criterios |
|---|---|---|---|---|---|
| 1 | `dominio-financiero` | `src/modules/projects/domain/project.ts` (solo §3.1), `src/modules/projects/application/ports.ts`, `src/modules/projects/index.ts` (solo `PropertyKind`) · `src/modules/participations/domain/{participation,participation-consistency}.ts`, `src/modules/participations/domain/participation-consistency.test.ts`, `src/modules/participations/application/ports.ts`, `src/modules/participations/index.ts` · `src/modules/finance/domain/{project-economics,settlement}.ts`, `src/modules/finance/domain/settlement.test.ts`, `src/modules/finance/application/ports.ts`, `src/modules/finance/index.ts` | contratos §3.1–3.3 | 2 | CA4 (límites), CA5 (createSettlement), CA11, CA12 |
| 2 | `datos-demo` (instancia A) | `src/shared/config/demo.ts` · `src/shared/infrastructure/{browser-storage,demo-store,system-clock,id-generator,relative-dates,zod-schemas}.ts` · `src/shared/infrastructure/{demo-store,system-clock,id-generator,relative-dates}.test.ts` | contratos §3.4–3.5 | 1 | CA6 (relativas), CA7, CA11 |
| 3 | `datos-demo` (instancia B) | `src/modules/projects/infrastructure/{seed,projects.mock-repository}.ts`, `src/modules/projects/infrastructure/projects.mock-repository.test.ts` · `src/modules/participations/infrastructure/{seed,participations.mock-repository}.ts`, `src/modules/participations/infrastructure/participations.mock-repository.test.ts` · `src/modules/finance/infrastructure/{seed,finance.mock-repository}.ts`, `src/modules/finance/infrastructure/finance.mock-repository.test.ts` | 1 (tipos), 2 (`relative-dates`, `zod-schemas`, `SliceReader`); puede empezar contra §3 | 2 (al final de 1) | CA1–CA5 (datos), CA10 |
| 4 | `datos-demo` (instancia A, al terminar 2) | `src/composition/{container,demo-snapshot}.ts`, `src/composition/modules/{projects,participations,finance}.ts`, `src/composition/{container,seed-consistency}.test.ts` | 2, 3 | 5 | CA1–CA8, CA10 |
| 5 | `constructor-ui` | `src/composition/providers.tsx`, `src/composition/use-reset-demo-data.ts`, `src/composition/ResetDemoDataButton.tsx`, `src/composition/ResetDemoDataButton.test.tsx`, `src/shared/ui/brand/demo-copy.ts` | contrato `Container` §3.8 (puede usar un container de prueba con `memoryStorage` y `fixedClock` mientras 4 termina) | 4 | CA9, CA13 |
| 6 | agente principal | `src/modules/participations/CLAUDE.md` · `src/modules/finance/CLAUDE.md` y `src/modules/projects/CLAUDE.md` (una línea cada uno: puertos e infraestructura) · `.claude/skills/datos-semilla/SKILL.md` §7 y `.claude/agents/datos-demo.md` ("Puedes escribir en"): ruta `src/composition/seed-consistency.test.ts` · `docs/02-modelo-de-dominio.md` §1 y §3 (`ProjectEconomics`, `HolderId`) · `docs/08` (bloque N de §6) · `docs/mejoras.md` · `docs/estado.md` | 1–5 | — | CA12 |

Notas de paquetes:
- **Asignaciones fuera de la lista habitual de cada agente** (como en el plan 002): `datos-demo` escribe en `src/shared/infrastructure/**` y `src/shared/config/demo.ts` (los nombra `01 §3`) y en el composition root completo, no solo en el registro de un módulo. `constructor-ui` escribe los tres archivos React de `composition/`.
- **No se tocan:** `eslint.config.mjs`, `architecture.modules.mjs`, `package.json` (Zod, TanStack Query y fast-check ya están instalados), `src/app/**`, `src/shared/ui/brand/index.ts`, `src/shared/ui/showcase/**`.
- **Sin carpetas vacías:** `participations/ui/` (componentes, hooks, `copy.ts`) se crea en F2 (P5/P6), igual que `ui/` de projects y finance. Es un desvío consciente del paso 2 de `nuevo-modulo`, alineado con el plan 002.
- **Coordinación con F1-5** (va en paralelo; el orquestador lo añade al brief de F1-5): F1-5 es dueño de `src/app/layout.tsx` y monta ahí `<Providers>` (de `@/composition/providers`) y `<ResetDemoDataButton />` (junto al selector de rol o al banner). También escribe el E2E de §5.3. Si F1-5 termina antes que este paquete 5, monta un `Providers` provisional sin datos y lo cambia al integrar.
- Los tests `*.tsx` de componente usan `// @vitest-environment jsdom` en la primera línea (vitest corre en `node` por defecto) o `renderToStaticMarkup`, como `MoneyDisplay.test.tsx`.
- Cierre: el agente principal ejecuta `verificar` y lanza `revisor-codigo` ∥ `revisor-cumplimiento` (fila M, pero toca dinero sembrado y visibilidad de ruedas).

## 5. Pruebas

### 5.1 Dominio (paquete 1)
- `participation-consistency.test.ts`: clase válida 100/63/USD 100; inválidas: total 0, total 1,5, placed 101, placed −1, precio 0 → `INVALID_PARTICIPATION_CLASS`. Holdings: `D4 · 20 participaciones es el máximo` (20 ok, 21 y 0 → `HOLDING_OUT_OF_LIMITS`); suma confirmada 64 con placed 63 → `HOLDINGS_EXCEED_PLACED`; una `pending_confirmation` no cuenta para ese tope; `classId` ajeno → `HOLDING_CLASS_MISMATCH`.
- `settlement.test.ts`: `Liquidación · C1 realizada igual al motor` (distribution deep-equal a `calculateDistribution`); `Liquidación · C5 sin política de pérdidas` → `LOSS_POLICY_UNDEFINED`; entrada inválida propaga el código del motor (`PLACED_OUT_OF_RANGE`); `basis` siempre `"realized"` (el tipo lo exige; test de tipo con `// @ts-expect-error` para `"projection"`).
- `projects/public-api.test.ts` sigue verde sin cambios.

### 5.2 Datos y composition (paquetes 2–4)
`src/shared/infrastructure`:
- `demo-store.test.ts`: `Demo-store · primera lectura siembra y persiste en club-demo:v1` · `segunda instancia lee lo persistido` · `JSON corrupto se descarta y se vuelve a sembrar` · `snapshot que no pasa parse se vuelve a sembrar` · `reset borra la clave y devuelve las semillas` · `sin storage funciona en memoria` · `setItem que falla no rompe la lectura`.
- `system-clock.test.ts`: `L9 · 2026-11-23T03:30Z es 2026-11-22 en Caracas` (con `now` inyectado) · `demoClock usa fixedToday válido` · `fixedToday inválido cae al reloj del sistema con console.warn`.
- `id-generator.test.ts`: el id generado pasa `parseId` y lleva el prefijo.
- `relative-dates.test.ts`: `daysAgo(0) = today`; `daysAgo(1)` cruza el fin de año.

Módulos (`*.mock-repository.test.ts`): `list` ordenado por código o por fecha; `findBySlug("m2-003-chacao")` encuentra; un slug o id desconocido → `null`; el repositorio no muta el slice (objeto congelado o copia).

`src/composition/seed-consistency.test.ts` (fixedClock `2026-11-22` salvo indicación). Nombres exactos de `it()`:
1. `Semillas · 7 proyectos M2-001…M2-007 con ids, códigos y slugs únicos` (códigos vía `parseProjectCode`; prefijo = `brand.shortName`; slug `<código en minúsculas>-<zona>`, p. ej. `m2-003-chacao`).
2. `Semillas · cada proyecto cumple checkProjectConsistency`.
3. `Semillas · escenarios de docs/01 §6` (tabla §3.7: estados, 63/100 en M2-006, y ruedas con `classifyProjectWheel`: M2-003 good, M2-001 medium, M2-002 bad sin vender, M2-004/005/006 in_progress).
4. `Semillas · zonas de Caracas y una en Valencia`.
5. `Semillas · cada liquidación se recalcula igual con el motor` (para cada `Settlement`: `createSettlement(input)` deep-equal; `input.acquisitionCost` y `recoveryBudget` = `ProjectEconomics`; `input.participations` = clase; `settledOn` = `project.timeline.settledOn`; el proyecto está en `settled`).
6. `Semillas · M2-001 cifras esperadas con residuo K1 de 90 ¢` y `Semillas · M2-003 cifras esperadas` (tabla §3.7).
7. `Semillas · todo proyecto con clase tiene economía y F = total × precio` (y M2-007, sin clase, tiene economía).
8. `Semillas · excedente proyectado positivo en los proyectos no liquidados` (`calculateDistribution` con `basis: "projection"` → `distributed`).
9. `Semillas · inversionista demo: 1 liquidado y 2 en curso` (y `calculateHolderPayout` de M2-003 × 5 = 50.000 + 17.250 ¢).
10. `Semillas · tenencias dentro de D4, de las colocadas y con fecha entre compra y hoy` (`checkHoldings` por clase).
11. `Semillas · fechas relativas: desplazar hoy desplaza todo igual` (clocks `2026-11-22` y `2027-03-10`: cada fecha difiere en el mismo número de días; mismos estados y ruedas).
12. `Semillas · los seed.ts no contienen fechas literales` (lee los tres `seed.ts` con `node:fs`; ningún `/\d{4}-\d{2}-\d{2}/`).
13. `ADR-004 · el snapshot no contiene ruedas ni proyectos estancados` (recorre las claves recursivamente: ninguna `/wheel|rueda/i`; ningún `status === "stalled"`).
14. `Semillas · el snapshot sobrevive JSON y pasa demoSnapshotSchema` (round trip `JSON.stringify` → `parseDemoSnapshot` deep-equal).

`src/composition/container.test.ts`: `Container · los repositorios sirven las 7 semillas` · `Container · reset descarta cambios escritos` (store.update que borra un proyecto → `demo.reset()` → vuelven 7) · `Container · holderId es inv_demo` · `Container · no expone backoffice` (`Object.keys` recursivo sin `/wheel/i`).

### 5.3 UI y E2E
- `ResetDemoDataButton.test.tsx` (paquete 5, jsdom): paso 1 → paso 2 → "Sí, reiniciar" llama a `reset` una vez e invalida consultas; "Cancelar" no llama; el texto sale de `DEMO_RESET_COPY`.
- **E2E (lo escribe F1-5 o `qa-e2e` al integrar):** `tests/e2e/reiniciar-datos.spec.ts` en 390 y 1440. Carga `/`, lee `localStorage["club-demo:v1"]`, lo modifica con `page.evaluate`, pulsa `demo-reset-button` → `demo-reset-confirm`, espera `demo-reset-done` y comprueba que la clave vuelve al snapshot sembrado (`seededOn` = hoy, 7 proyectos). Con `NEXT_PUBLIC_DEMO_TODAY` fijo para que sea determinista.

Comandos: `pnpm vitest run src/shared src/modules src/composition` y `pnpm verify:fast`.

## 6. Riesgos, supuestos y preguntas

### Riesgos
- **Hidratación SSR.** `Providers` se renderiza también en el servidor (sin `localStorage`, con memoria). Mitigación: ningún Server Component lee el demo-store; los datos llegan por TanStack Query solo en el cliente, y la primera pintura es un skeleton. F2 no debe prefetchear en servidor.
- **Snapshot persistido vs. motor.** Si el motor o la forma del snapshot cambian, un `localStorage` viejo puede no cuadrar. Mitigación: `parse` con Zod descarta lo inválido; un cambio de forma o de cifras sube a `club-demo:v2` (regla para `datos-semilla`).
- **Deriva de contratos.** Los paquetes 1 y 3 corren casi en paralelo: cualquier cambio a §3.1–3.3 se detiene y se reporta.
- **El lint permite infrastructure → `index.ts` de otro módulo y `01 §4` no.** El plan cumple el documento. Se propone cerrar el hueco en el lint (mejoras).
- **`seed-consistency.test.ts` cambia de carpeta** respecto a la skill y al agente. Si no se corrigen (paquete 6), el siguiente `datos-demo` lo pondrá donde el lint lo rechaza.

### Supuestos tomados
- **[SUPUESTO N1]** El proyecto con más de 6 meses sin venta se siembra en `on_sale`, no en `stalled`: lo marca como estancado el admin en B4. Así ningún dato sembrado delata la rueda en la cara del inversionista (ADR-004, L5).
- **[SUPUESTO N2]** Todas las clases son de 100 × USD 100 y F = USD 10.000 (referencia del maestro). No se varía el tamaño de la clase hasta que lo decidas.
- **[SUPUESTO N3]** Los precios de compra y venta (USD 34.000–88.000 según zona y m²) son verosímiles pero inventados, y se muestran como datos simulados. No son datos de mercado.
- **[SUPUESTO N4]** El snapshot guardado conserva sus fechas: los proyectos "envejecen" con el reloj real hasta que se pulsa "Reiniciar datos simulados", que vuelve a sembrar con las fechas relativas a hoy.
- **[SUPUESTO N5]** El inversionista demo es solo un id (`inv_demo`). Nombre y perfil llegan con el módulo `investors` en F2 (P2/P8).
- **[SUPUESTO N6]** "Reiniciar" borra solo los datos (`club-demo:v1`), no el rol elegido en el selector (Zustand, F1-5).
- **[SUPUESTO N7]** Nombres de proyecto descriptivos ("Apartamento Bello Campo"), sin dirección exacta (D6) y sin edificios reales identificables.
- Las fotos y `public/images/CREDITOS.md` (paso 6 de la skill) quedan para P3/F4-2: F1-4 no muestra imágenes.
- No se siembran liquidaciones con pérdida (H2 sigue por definir; `createSettlement` las rechaza con `LOSS_POLICY_UNDEFINED`).

### Preguntas para `docs/08` (bloque nuevo, lo pega el paquete 6)
```
## Bloque N · Datos simulados (F1-4, 22-nov) 🟠

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| N1 | El proyecto con más de 6 meses sin venta, ¿se siembra como "en venta" o como "estancado"? | "En venta"; "estancado" lo marca el admin en B4 y solo se ve en el backoffice |
| N2 | ¿Todos los proyectos simulados usan 100 participaciones de USD 100 (USD 10.000)? | Sí, la referencia del maestro, hasta que definas otra |
| N3 | Precios de compra/venta simulados entre USD 34.000 y 88.000 según zona y m², ¿te sirven o tienes datos de mercado? | Usar los del plan 003, rotulados como simulados |
| N4 | Si alguien vuelve a la demo semanas después, ¿las fechas se congelan o se recalculan? | Se congelan hasta "Reiniciar datos simulados", que vuelve a sembrar con fechas relativas a hoy |
| N5 | ¿Nombre y perfil del inversionista demo? | Se definen en F2 (P8) con el módulo investors; F1-4 solo fija el id |
| N6 | ¿"Reiniciar datos simulados" también reinicia el rol elegido? | No, solo los datos |
| N7 | La oportunidad en due diligence (M2-007), ¿aparece en el marketplace? | No; solo en el backoffice (B2). Se confirma en P3 |
```

### Para `docs/mejoras.md` (paquete 6)
- Lint: prohibir en `src/modules/*/infrastructure/**` importar `@/modules/<otro>` (alinear con `01 §4`, fila infrastructure).
- Regla de la skill `datos-semilla`: subir la versión de la clave (`club-demo:vN`) cuando cambie la forma del snapshot o una cifra sembrada.
- F2: un mapeo público de estado → etapa visible (`stalled` → "en venta", L5) en `projects/index.ts`, con un test.

## 7. ADR requerido
No. El plan respeta `01-arquitectura.md`. Crea `participations`, que ya está en `01 §3` y en `architecture.modules.mjs`. Aplica la fila infrastructure de `01 §4` con más rigor que el lint. Mover `seed-consistency.test.ts` a `composition/` corrige una ruta de la skill y del agente (que contradecía las capas); no cambia ninguna decisión. `ProjectEconomics` es un término nuevo del glosario y se añade a `02 §1` y `§3` en el mismo cambio. Haría falta un ADR si el usuario responde N1 eligiendo mostrar "estancado" a los inversionistas (entraría en conflicto con ADR-004).
