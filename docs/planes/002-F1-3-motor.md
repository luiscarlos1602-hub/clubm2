# Plan 002 · F1-3 · Motor: `shared/domain`, reparto 25/75 y ruedas internas

Estado: borrador · Fecha: 2026-11-22 · Autor: arquitecto

Fuentes: `docs/prompts/F1-fundacion-visual.md` §F1-3 · `docs/02-modelo-de-dominio.md` §2, §4, §5 · skill `motor-reparto` · ADR-004 · `docs/01-arquitectura.md` §3, §4, §5, §8 · `eslint.config.mjs` y `architecture.modules.mjs` ya en la rama `feat/app-andamiaje`.
Rama sugerida: `feat/finance-motor-reparto` (desde `feat/app-andamiaje` o `main` tras el merge de F1-1).

## 1. Historia y criterios

**Historia.** Como club necesitamos un único motor de cálculo, puro y probado, que reparta el excedente 25/75 al centavo y clasifique la velocidad de cada proyecto (rueda) solo para el backoffice, para que ninguna pantalla calcule dinero y las semillas de F1-4 y el simulador de P4 tengan una sola fuente de verdad.

No hay brief formal para esta fila: los criterios salen del prompt de F1 y de `docs/02`. Los marcados [PROPUESTO] los añade el arquitecto.

| CA | Criterio verificable |
|---|---|
| CA1 | `src/shared/domain` expone `Money` (centavos), `Percentage` (pb), `Result`/`DomainError`, `Id`/`IdGenerator`, `IsoDate` y `Clock` con las firmas exactas de §3. El redondeo de dinero solo ocurre en `money.ts`. |
| CA2 | Existen tests `C1 · …` … `C6 · …` (nombres exactos en §5) y pasan con los valores de `docs/02 §4` al centavo. |
| CA3 | K1: test `K1 · …` con fondo no divisible (225.001 ¢ entre 100) → por participación 2.250 ¢, residuo 1 ¢ a la empresa y expuesto en `roundingResidue`. |
| CA4 | Tests de propiedades con fast-check (≥ 1.000 ejecuciones por propiedad) para los invariantes I1–I9 de §5. |
| CA5 | Máquina de estados: test exhaustivo 10 × 10 de transiciones; toda transición fuera de la tabla devuelve `Result.err` con código `INVALID_TRANSITION`. |
| CA6 | Ruedas: bordes K2–K4 probados (3 meses, 3 m + 1 día, 6 meses, 6 m + 1 día, vendida y sin vender); `classifyWheel` se exporta **solo** por `modules/projects/backoffice.ts`, y un test confirma que `index.ts` no la exporta (ADR-004). |
| CA7 | `pnpm verify:fast` en verde y `pnpm vitest run src/shared/domain src/modules/finance src/modules/projects` en verde en < 10 s. |
| CA8 [PROPUESTO] | `domain/` sin `Date`, `Math.random`, React ni Next (el lint ya lo impone; cero `eslint-disable`). |
| CA9 [PROPUESTO] | `src/modules/finance/CLAUDE.md` y `src/modules/projects/CLAUDE.md` (≤ 30 líneas, plantilla de la skill `nuevo-modulo`). |
| CA10 [PROPUESTO] | Cobertura 100 % de `modules/finance/domain` (`docs/01 §1`), **si** se aprueba instalar `@vitest/coverage-v8` (pregunta L7). Si no se aprueba, CA10 queda fuera y se registra en `docs/mejoras.md`. |

## 2. Módulos afectados

| Módulo | Por qué | Nuevo |
|---|---|---|
| `shared/domain` | Tipos de valor transversales: Money, Percentage, Result, Id, IsoDate, Clock | Sí |
| `projects` | Inmueble y proyecto mínimos, estados y transiciones, ruedas (solo `backoffice.ts`) | Sí (solo `domain/`, `index.ts`, `backoffice.ts`, `CLAUDE.md`) |
| `finance` | Motor de reparto 25/75, validación de entradas y cobro por titular | Sí (solo `domain/`, `index.ts`, `CLAUDE.md`) |

Orden de dependencias (`01 §4` regla 3): `shared → projects → … → finance`. En F1-3 **finance no importa de projects** (no lo necesita); ambos solo importan de `shared/domain`. `application/`, `infrastructure/`, `ui/` y el registro en `composition/` quedan para F1-4/F1-5 (no se crean carpetas vacías aquí). `architecture.modules.mjs` no cambia: ya lista ambos módulos.

## 3. Contratos (TypeScript)

Son el acuerdo entre paquetes y con F1-4 (`datos-demo`) y P4 (simulador). Cambiar una firma exige avisar al agente principal.

Restricciones técnicas que condicionan los contratos:
- `tsconfig` apunta a ES2017: **sin `bigint`**. Todo es `number` entero seguro; el motor valida un techo de montos para que `cents × 10.000` no supere `Number.MAX_SAFE_INTEGER`.
- El lint prohíbe el global `Date` en `src/shared/domain/**` y `src/modules/*/domain/**`: la aritmética de fechas es **pura sobre strings `YYYY-MM-DD`** (algoritmo días-desde-época civil), sin `new Date()`.

### 3.1 `src/shared/domain/result.ts`
```ts
export type DomainError<C extends string = string> = {
  readonly code: C;
  readonly detail?: string;
};
export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = DomainError> = Ok<T> | Err<E>;

function ok<T>(value: T): Ok<T>;
function err<C extends string>(code: C, detail?: string): Err<DomainError<C>>;
function map<T, U, E>(r: Result<T, E>, f: (v: T) => U): Result<U, E>;
function flatMap<T, U, E, F>(r: Result<T, E>, f: (v: T) => Result<U, F>): Result<U, E | F>;

// Objeto con el mismo nombre que el tipo: permite `Result.err('INVALID_TRANSITION')` como en docs/02 §2.
export const Result: { readonly ok: typeof ok; readonly err: typeof err; readonly map: typeof map; readonly flatMap: typeof flatMap };
```

### 3.2 `src/shared/domain/money.ts`
```ts
export type Currency = "USD";
export type Money = { readonly cents: number; readonly currency: Currency };

/** Techo: cents × 10_000 (pb) debe caber en Number.MAX_SAFE_INTEGER. 9e11 ¢ = USD 9.000 millones. */
export const MAX_MONEY_CENTS = 900_000_000_000;

/** Literal en centavos. Precondición: entero seguro. Ver [SUPUESTO T1] sobre el error de programación. */
export function usd(cents: number): Money;
/** Literal en dólares enteros (usdUnits(100) = 10.000 ¢). Precondición: entero seguro. */
export function usdUnits(units: number): Money;
/** Frontera (Zod, semillas, formularios): nunca lanza. */
export function parseUsdCents(value: unknown): Result<Money, DomainError<"INVALID_MONEY">>;

export const ZERO_USD: Money;

export function addMoney(a: Money, b: Money): Money;
export function sumMoney(items: readonly Money[]): Money;          // [] → ZERO_USD
export function subtractMoney(a: Money, b: Money): Money;          // puede ser negativo
export function multiplyMoney(m: Money, factor: number): Money;    // factor entero (p. ej. n.º de participaciones)
export function compareMoney(a: Money, b: Money): -1 | 0 | 1;
export function equalsMoney(a: Money, b: Money): boolean;
export function isPositive(m: Money): boolean;
export function isNegative(m: Money): boolean;
export function isZero(m: Money): boolean;

// ── Únicos puntos de redondeo del proyecto (docs/01 §5) ──
/** floor(cents × bps / 10_000). Precondición: m.cents ≥ 0. */
export function applyPercentageFloor(m: Money, p: Percentage): Money;
/** División entera hacia abajo: m = quotient × divisor + remainder, 0 ≤ remainder < divisor ¢. Precondición: m.cents ≥ 0, divisor entero ≥ 1. */
export function divideFloor(m: Money, divisor: number): { readonly quotient: Money; readonly remainder: Money };
```

### 3.3 `src/shared/domain/percentage.ts`
```ts
export type Percentage = { readonly bps: number };  // 2500 = 25 %
export const BPS_PER_WHOLE = 10_000;
export function percentage(bps: number): Percentage;              // precondición: entero seguro
export function parsePercentage(value: unknown): Result<Percentage, DomainError<"INVALID_PERCENTAGE">>; // entero 0..10_000
export function complementPercentage(p: Percentage): Percentage;  // 10_000 − bps
export const PERCENT_0: Percentage;
export const PERCENT_100: Percentage;
```

### 3.4 `src/shared/domain/id.ts`
```ts
export type Id<Tag extends string> = string & { readonly __brand: Tag };
/** Sin validación: ids de semilla legibles (`prj_chacao_01`) y tests. */
export function asId<Tag extends string>(raw: string): Id<Tag>;
/** Formato: /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/ */
export function parseId<Tag extends string>(raw: unknown): Result<Id<Tag>, DomainError<"INVALID_ID">>;
/** Puerto: la implementación vive en infrastructure (F1-4). */
export interface IdGenerator {
  next<Tag extends string>(prefix: string): Id<Tag>;
}
```

### 3.5 `src/shared/domain/calendar-date.ts`
```ts
/** Fecha civil sin hora ni zona: "YYYY-MM-DD", años 1900–9999. Se compara lexicográficamente. */
export type IsoDate = string & { readonly __brand: "IsoDate" };
export function isoDate(raw: string): IsoDate;   // literal; precondición: formato válido
export function parseIsoDate(raw: unknown): Result<IsoDate, DomainError<"INVALID_DATE">>; // valida mes, día y bisiestos
export function compareIsoDate(a: IsoDate, b: IsoDate): -1 | 0 | 1;
export function isLeapYear(year: number): boolean;
export function daysInMonth(year: number, month: number): number;  // month 1..12
/** K2: mes calendario. Si el día no existe en el mes destino, se ajusta al último día ([SUPUESTO L2]). months entero ≥ 0. */
export function addCalendarMonths(d: IsoDate, months: number): IsoDate;
export function addDays(d: IsoDate, days: number): IsoDate;        // days entero (puede ser negativo)
```

### 3.6 `src/shared/domain/clock.ts`
```ts
/** Puerto del "hoy" de la demo (permite viajar en el tiempo). */
export interface Clock {
  today(): IsoDate;   // fecha civil en America/Caracas ([SUPUESTO L9])
}
/** Implementación pura para tests y para la demo con fecha fija. */
export function fixedClock(today: IsoDate): Clock;
// El reloj del sistema (`shared/infrastructure/system-clock.ts`) es de F1-4: allí sí se permite Date.
```

### 3.7 `modules/projects` — `domain/project.ts`, `domain/project-status.ts`, `domain/project-consistency.ts`
```ts
// project.ts
export type ProjectId = Id<"Project">;
export type PropertyId = Id<"Property">;
/** Código público del proyecto, p. ej. "M2-001". El prefijo lo pone F1-4 desde brand.shortName; aquí solo se valida la forma. */
export type ProjectCode = string & { readonly __brand: "ProjectCode" };
export function parseProjectCode(raw: unknown): Result<ProjectCode, DomainError<"INVALID_PROJECT_CODE">>; // /^[A-Z0-9]{1,4}-\d{3}$/

/** Mínimo para F1. F1-4 puede añadir campos descriptivos (fotos, m², tipo) avisando al agente principal. */
export type Property = {
  readonly id: PropertyId;
  readonly city: string;   // "Caracas" | "Valencia" en la demo
  readonly zone: string;   // "Chacao", "Los Palos Grandes", …  (sin dirección exacta: D6)
};

export type ProjectTimeline = {
  readonly acquiredOn: IsoDate | null;     // firma de compra: inicio de la medición de rueda
  readonly saleSignedOn: IsoDate | null;   // firma de venta: fin de la medición (K4)
  readonly settledOn: IsoDate | null;      // liquidación: no afecta la rueda
};

export type Project = {
  readonly id: ProjectId;
  readonly code: ProjectCode;
  readonly slug: string;          // URL en español, kebab-case
  readonly name: string;
  readonly propertyId: PropertyId;
  readonly status: ProjectStatus;
  readonly timeline: ProjectTimeline;
};

// project-status.ts
export const PROJECT_STATUSES = [
  "opportunity", "due_diligence", "acquired", "funding", "renovation",
  "on_sale", "sold", "settled", "discarded", "stalled",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/** Tabla única de transiciones (docs/02 §2). Ver §3.9. */
export const PROJECT_TRANSITIONS: Readonly<Record<ProjectStatus, readonly ProjectStatus[]>>;
export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean;
export function transitionStatus(from: ProjectStatus, to: ProjectStatus):
  Result<ProjectStatus, DomainError<"INVALID_TRANSITION">>;
export function isTerminalStatus(s: ProjectStatus): boolean;   // settled, discarded

/** Cambia el estado y sella la fecha cuando corresponde: → acquired fija acquiredOn, → sold fija saleSignedOn, → settled fija settledOn. */
export function changeProjectStatus(project: Project, to: ProjectStatus, effectiveOn: IsoDate):
  Result<Project, DomainError<"INVALID_TRANSITION" | "DATE_OUT_OF_ORDER">>;
  // DATE_OUT_OF_ORDER: effectiveOn anterior a una fecha ya registrada en timeline.

// project-consistency.ts  (lo usa seed-consistency.test.ts de F1-4)
export function checkProjectConsistency(project: Project):
  Result<Project, DomainError<"INCONSISTENT_TIMELINE">>;
  // Reglas: opportunity/due_diligence/discarded ⇒ acquiredOn = null
  //         acquired…on_sale, stalled ⇒ acquiredOn ≠ null y saleSignedOn = null
  //         sold ⇒ acquiredOn y saleSignedOn ≠ null, settledOn = null
  //         settled ⇒ las tres ≠ null
  //         siempre acquiredOn ≤ saleSignedOn ≤ settledOn
```

### 3.8 `modules/projects` — `domain/classify-wheel.ts` (solo `backoffice.ts`)
```ts
export type Wheel = "good" | "medium" | "bad" | "in_progress";

type Measured = { readonly measuredFrom: IsoDate; readonly measuredUntil: IsoDate };
export type WheelClassification =
  | ({ readonly wheel: "good"; readonly sold: true } & Measured)
  | ({ readonly wheel: "medium"; readonly sold: true } & Measured)
  | ({ readonly wheel: "bad"; readonly sold: boolean } & Measured)     // sold: true = "mala (vendida)" (K3)
  | ({ readonly wheel: "in_progress"; readonly sold: false } & Measured);

export const WHEEL_THRESHOLDS_MONTHS: { readonly good: 3; readonly medium: 6 };

export type WheelInput = { readonly acquiredOn: IsoDate; readonly saleSignedOn: IsoDate | null };

/** Pura: recibe "hoy" como valor (el Clock se lee en application/ui). */
export function classifyWheel(input: WheelInput, today: IsoDate):
  Result<WheelClassification, DomainError<"SALE_BEFORE_ACQUISITION" | "TODAY_BEFORE_ACQUISITION" | "SALE_AFTER_TODAY">>;

export function classifyProjectWheel(project: Project, today: IsoDate):
  Result<WheelClassification, DomainError<"NOT_ACQUIRED" | "SALE_BEFORE_ACQUISITION" | "TODAY_BEFORE_ACQUISITION" | "SALE_AFTER_TODAY">>;
```
Regla exacta (t3 = `addCalendarMonths(acquiredOn, 3)`, t6 = `addCalendarMonths(acquiredOn, 6)`):

| Situación | Resultado | `measuredUntil` |
|---|---|---|
| vendida y `saleSignedOn ≤ t3` | `good` | `saleSignedOn` |
| vendida y `t3 < saleSignedOn ≤ t6` | `medium` | `saleSignedOn` |
| vendida y `saleSignedOn > t6` | `bad`, `sold: true` (K3) | `saleSignedOn` |
| sin vender y `today ≤ t6` | `in_progress` | `today` |
| sin vender y `today > t6` | `bad`, `sold: false` | `today` |

`settledOn` nunca interviene (K4). El texto "Mide velocidad, no garantiza rentabilidad." y "en curso · objetivo: buena" son copy de B1/B3 (`ui/copy.ts`), no de F1-3.

### 3.9 Transiciones válidas (`PROJECT_TRANSITIONS`)

| Desde | Hacia | Fuente |
|---|---|---|
| `opportunity` | `due_diligence` | `docs/02 §2` |
| `due_diligence` | `acquired`, `discarded` | `docs/02 §2` |
| `acquired` | `funding` | `docs/02 §2` |
| `funding` | `renovation` | `docs/02 §2` |
| `renovation` | `on_sale` | `docs/02 §2` |
| `on_sale` | `sold`, `stalled` | `docs/02 §2` |
| `stalled` | `on_sale`, `sold` | **[SUPUESTO L3]** el diagrama no define salida; sin ella un proyecto estancado nunca se vende ni liquida |
| `sold` | `settled` | `docs/02 §2` |
| `settled`, `discarded` | — (terminales) | `docs/02 §2` |

Cualquier otro par (incluido `x → x`) → `Result.err("INVALID_TRANSITION")`. No se añade `opportunity → discarded` (ver L4).

### 3.10 `modules/finance` — `domain/distribution.ts`, `domain/validate-distribution-input.ts`, `domain/holder-payout.ts`
```ts
/** Rotula el origen de los números: la UI muestra "proyección" o "realizado" a partir de aquí (regla 2 de CLAUDE.md). */
export type ValueBasis = "projection" | "realized";

export type DistributionShares = { readonly fund: Percentage; readonly company: Percentage };
export const DEFAULT_DISTRIBUTION_SHARES: DistributionShares;   // { fund: 2500 pb, company: 7500 pb }

export type ParticipationTerms = {
  readonly total: number;      // entero ≥ 1 (ref. 100)
  readonly placed: number;     // entero 0..total
  readonly unitPrice: Money;   // > 0 (ref. USD 100)
};

export type DistributionInput = {
  readonly basis: ValueBasis;
  readonly salePrice: Money;        // P
  readonly acquisitionCost: Money;  // C
  readonly recoveryBudget: Money;   // F
  readonly saleCosts: Money;        // O
  readonly participations: ParticipationTerms;
  readonly shares?: DistributionShares;   // por defecto DEFAULT_DISTRIBUTION_SHARES
};

export type DistributionInputErrorCode =
  | "NEGATIVE_AMOUNT"               // P, C, F u O < 0
  | "AMOUNT_TOO_LARGE"              // algún monto > MAX_MONEY_CENTS
  | "INVALID_PARTICIPATION_TOTAL"   // total no entero o < 1
  | "PLACED_OUT_OF_RANGE"           // placed no entero, < 0 o > total
  | "NON_POSITIVE_UNIT_PRICE"
  | "INVALID_SHARES";               // fuera de 0..10_000 o fund + company ≠ 10_000

/** validate-distribution-input.ts */
export function validateDistributionInput(input: DistributionInput):
  Result<DistributionInput, DomainError<DistributionInputErrorCode>>;

export type CapitalReturn = {
  readonly external: Money;   // placed × unitPrice
  readonly company: Money;    // C + (total − placed) × unitPrice
};

export type Distribution = {
  readonly kind: "distributed";
  readonly basis: ValueBasis;
  readonly participations: ParticipationTerms & { readonly retained: number };
  readonly surplus: Money;            // excedente = P − C − F − O (> 0)
  readonly fund: Money;               // floor(25 % × excedente) — [SUPUESTO L1]
  readonly perParticipation: Money;   // floor(fund / total) — K1
  readonly roundingResidue: Money;    // fund − perParticipation × total (0 en C1–C6); va a la empresa y B5 lo registra en AuditEntry
  readonly toExternal: Money;         // perParticipation × placed
  readonly companyFromFund: Money;    // perParticipation × retained + roundingResidue
  readonly companyDirect: Money;      // excedente − fund (= 75 % cuando divide exacto) — [SUPUESTO L1]
  readonly companyTotal: Money;       // companyDirect + companyFromFund
  readonly capital: CapitalReturn;    // se devuelve aparte de la ganancia
};

export type NoDistribution = {
  readonly kind: "no_distribution";
  readonly basis: ValueBasis;
  readonly surplus: Money;                    // ≤ 0
  readonly reason: "NON_POSITIVE_SURPLUS";
  readonly lossPolicy: "to_be_defined";       // UI: "Política de pérdidas: por definir" (docs/02 §4, H2)
};

export type DistributionOutcome = Distribution | NoDistribution;

/** distribution.ts — llama a validateDistributionInput primero. Nunca lanza. */
export function calculateDistribution(input: DistributionInput):
  Result<DistributionOutcome, DomainError<DistributionInputErrorCode>>;

/** holder-payout.ts — cobro de un titular con `held` participaciones (C1 × 1 = 100 capital + 50 ganancia). */
export type HolderPayout = {
  readonly basis: ValueBasis;
  readonly held: number;
  readonly capital: Money;   // held × unitPrice
  readonly gain: Money;      // held × perParticipation
  readonly total: Money;     // capital + gain
};
export function calculateHolderPayout(outcome: DistributionOutcome, held: number):
  Result<HolderPayout, DomainError<"HELD_OUT_OF_RANGE" | "LOSS_POLICY_UNDEFINED">>;
  // HELD_OUT_OF_RANGE: held no entero, < 1 o > placed. LOSS_POLICY_UNDEFINED: outcome.kind === "no_distribution" (H2).
```
Toda la aritmética de `finance` usa las funciones de `money.ts`; ningún `Math.floor` fuera de ese archivo.

### 3.11 APIs públicas
```ts
// src/modules/finance/index.ts
export type { ValueBasis, DistributionShares, ParticipationTerms, DistributionInput, DistributionInputErrorCode,
  CapitalReturn, Distribution, NoDistribution, DistributionOutcome, HolderPayout } from "./domain/…";
export { DEFAULT_DISTRIBUTION_SHARES, validateDistributionInput, calculateDistribution, calculateHolderPayout } from "./domain/…";

// src/modules/projects/index.ts   (sin nada de ruedas)
export type { ProjectId, PropertyId, ProjectCode, Property, ProjectTimeline, Project, ProjectStatus } from "./domain/…";
export { parseProjectCode, PROJECT_STATUSES, PROJECT_TRANSITIONS, canTransition, transitionStatus,
  isTerminalStatus, changeProjectStatus, checkProjectConsistency } from "./domain/…";

// src/modules/projects/backoffice.ts   (solo app/admin/** y ui/components/admin/**; ADR-004, docs/01 §8.3)
export type { Wheel, WheelClassification, WheelInput } from "./domain/classify-wheel";
export { WHEEL_THRESHOLDS_MONTHS, classifyWheel, classifyProjectWheel } from "./domain/classify-wheel";
```
`shared/domain` no tiene barrel: se importa por archivo (`@/shared/domain/money`), sin magia (`01 §8.2`).

## 4. Paquetes

| # | Agente | Archivos (exclusivos) | Depende de | Paralelo con | Criterios |
|---|---|---|---|---|---|
| 1 | `dominio-financiero` | `src/shared/domain/{result,money,percentage,id,calendar-date,clock}.ts` y `src/shared/domain/{result,money,percentage,id,calendar-date}.test.ts` | contratos §3.1–3.6 | — (es corto; arranca primero) | CA1, CA7, CA8 |
| 2 | `dominio-financiero` (instancia A) | `src/modules/finance/domain/{distribution,validate-distribution-input,holder-payout}.ts`, `src/modules/finance/domain/{distribution.canonical,distribution.properties,validate-distribution-input,holder-payout}.test.ts`, `src/modules/finance/index.ts` | 1 (puede escribir tests contra §3 mientras 1 termina) | 3 | CA2, CA3, CA4, CA7, CA8, CA10 |
| 3 | `dominio-financiero` (instancia B) | `src/modules/projects/domain/{project,project-status,project-consistency,classify-wheel}.ts`, `src/modules/projects/domain/{project-status,project-consistency,classify-wheel}.test.ts`, `src/modules/projects/index.ts`, `src/modules/projects/backoffice.ts`, `src/modules/projects/public-api.test.ts` | 1 | 2 | CA5, CA6, CA7, CA8 |
| 4 | agente principal | `src/modules/finance/CLAUDE.md`, `src/modules/projects/CLAUDE.md`, `docs/08-preguntas-por-funcionalidad.md` (bloque L de §6), `docs/mejoras.md`, `docs/estado.md` | 2, 3 | — | CA9 |

Notas de paquetes:
- **`backoffice.ts`** no está en la lista "Puedes escribir en" del agente `dominio-financiero`; este plan se lo asigna al paquete 3 porque es la otra API pública del módulo (`01 §8.3`), equivalente a `index.ts`.
- Los `CLAUDE.md` de módulo van al paquete 4 (el agente de dominio no escribe fuera de `domain/`/`application/`/`index.ts`). Contenido mínimo: propósito, invariantes I1–I9 (finance) o tabla de transiciones + K2–K4 (projects), "puede importar de: shared" (y en finance también projects, aunque F1-3 no lo usa), API pública, comando de tests y trampas: "sin `Date` en domain: usa `calendar-date.ts`", "ruedas solo por `backoffice.ts`", "redondeo solo en `money.ts`".
- `public-api.test.ts` está en la raíz del módulo; si `eslint-plugin-boundaries` lo marca (no encaja en ningún elemento), muévelo a `src/modules/projects/domain/public-api.test.ts` y avisa en la entrega.
- Ningún paquete toca `eslint.config.mjs`, `architecture.modules.mjs` ni `package.json` (salvo L7 aprobada; entonces lo hace el agente principal).
- Cierre: el agente principal ejecuta `verificar` y lanza `revisor-codigo` ∥ `revisor-cumplimiento` (fila L).

## 5. Pruebas

### 5.1 `shared/domain` (paquete 1)
- `money.test.ts`: `usdUnits(100)` = 10.000 ¢; `applyPercentageFloor(usd(1), 25 %)` = 0 ¢; `applyPercentageFloor(usd(900_004), 25 %)` = 225.001 ¢; `divideFloor(usd(225_001), 100)` = { 2.250 ¢, 1 ¢ }; `divideFloor` cumple `q × d + r = m` y `0 ≤ r < d` (fast-check); `sumMoney([])` = 0; `parseUsdCents` rechaza `1.5`, `NaN`, `"100"`, `> MAX_MONEY_CENTS`.
- `percentage.test.ts`: `parsePercentage` acepta 0 y 10.000, rechaza −1, 10.001 y 25,5; `complementPercentage(2500)` = 7500.
- `calendar-date.test.ts`: `addCalendarMonths("2026-01-15", 3)` = `"2026-04-15"` (ejemplo K2); `"2026-08-31" + 6` = `"2027-02-28"`; `"2027-08-31" + 6` = `"2028-02-29"` (bisiesto); `"2026-01-31" + 1` = `"2026-02-28"`; `addDays("2026-12-31", 1)` = `"2027-01-01"`; `addDays("2028-02-28", 1)` = `"2028-02-29"`; `parseIsoDate` rechaza `"2026-02-30"`, `"2026-13-01"`, `"2026-1-5"`; propiedades: `addDays(d, n)` y `addDays(·, −n)` se invierten; `addCalendarMonths(d, m) ≥ d`.
- `result.test.ts`, `id.test.ts`: `Result.err("X").error.code === "X"`; `parseId("prj_chacao_01")` ok, `parseId("Prj-1")` err.

### 5.2 `finance` (paquete 2) — nombres exactos de `it()`
Valores en centavos; precio 10.000 ¢, total 100, C = F = 1.000.000 ¢ salvo indicación.

| Test (`it`) | P | O | Colocadas | Excedente | Fondo | Por part. | Externos | Empresa fondo | Empresa 75 % | Capital ext. / emp. (derivado) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `C1 · colocación total 100/100` | 4.000.000 | 0 | 100 | 2.000.000 | 500.000 | 5.000 | 500.000 | 0 | 1.500.000 | 1.000.000 / 1.000.000 |
| `C2 · colocación parcial 50/100` | 4.000.000 | 0 | 50 | 2.000.000 | 500.000 | 5.000 | 250.000 | 250.000 | 1.500.000 | 500.000 / 1.500.000 |
| `C3 · sin colocación 0/100` | 4.000.000 | 0 | 0 | 2.000.000 | 500.000 | 5.000 | 0 | 500.000 | 1.500.000 | 0 / 2.000.000 |
| `C4 · venta con costos de 1.000` | 3.000.000 | 100.000 | 100 | 900.000 | 225.000 | 2.250 | 225.000 | 0 | 675.000 | 1.000.000 / 1.000.000 |
| `C5 · excedente negativo sin reparto` | 1.900.000 | 0 | 100 | −100.000 | — | — | `kind: "no_distribution"`, `lossPolicy: "to_be_defined"` | — | — | — |
| `C6 · colocación 63/100` | 4.000.000 | 0 | 63 | 2.000.000 | 500.000 | 5.000 | 315.000 | 185.000 | 1.500.000 | 630.000 / 1.370.000 |

En C1–C4 y C6 además: `roundingResidue` = 0 y `companyTotal` = `companyDirect + companyFromFund`.

Otros tests con nombre:
- `K1 · residuo de redondeo a la empresa` — P = 3.000.004, O = 100.000, colocadas 100 → excedente 900.004, fondo 225.001, por part. 2.250, externos 225.000, residuo 1, empresa fondo 1, empresa directo 675.003.
- `K1 · fondo menor a un centavo` — excedente 1 ¢ → fondo 0, por part. 0, empresa directo 1 ¢.
- `Borde · excedente cero sin reparto` — P = 2.000.000 → `no_distribution`.
- `Cobro ilustrativo C1 · 1 participación = 100 capital + 50 ganancia` — `calculateHolderPayout(C1, 1)` → capital 10.000, ganancia 5.000, total 15.000, `basis` igual al de la entrada.
- `Cobro · C5 sin política de pérdidas` → `LOSS_POLICY_UNDEFINED`; `Cobro · más participaciones que colocadas` → `HELD_OUT_OF_RANGE` (C6, held = 64).
- `validate-distribution-input.test.ts`: un test por código de error (monto negativo, monto > techo, total 0, total 1,5, colocadas 101 con total 100, colocadas −1, precio 0, shares 2500/7000, shares 2500/7500 ok).

**Invariantes con fast-check** (`distribution.properties.test.ts`, `{ numRuns: 1000 }` cada una). Arbitrarios: montos `fc.integer({ min: 0, max: 1_000_000_000 })` ¢; `total` 1..1.000; `placed` 0..total (`fc.chain`); `unitPrice` 1..1.000.000 ¢; `basis` cualquiera; shares por defecto salvo I9.

| # | `it` | Propiedad |
|---|---|---|
| I1 | `I1 · el excedente se reparte completo al centavo` | si `distributed`: `toExternal + companyFromFund + companyDirect === surplus` |
| I2 | `I2 · el fondo se reparte completo` | `toExternal + companyFromFund === fund` y `companyTotal === companyDirect + companyFromFund` |
| I3 | `I3 · capitales + excedente + costos = venta` | con `F = total × unitPrice`: `capital.external + capital.company + surplus + O === P` |
| I4 | `I4 · ningún monto negativo ni fraccionario` | en `distributed`, todos los `Money` son enteros seguros ≥ 0 |
| I5 | `I5 · más colocadas no reduce a los externos` | `placed → placed + 1` ⇒ `toExternal` no disminuye y `companyFromFund` no aumenta |
| I6 | `I6 · sin excedente no hay reparto` | `P − C − F − O ≤ 0` ⇔ `kind === "no_distribution"` |
| I7 | `I7 · K1 residuo acotado` | `perParticipation × total + roundingResidue === fund` y `0 ≤ roundingResidue < total` ¢ |
| I8 | `I8 · el fondo es el 25 % redondeado hacia abajo` | `fund × 10_000 ≤ surplus × 2_500 < (fund + 1) × 10_000` |
| I9 | `I9 · la colocación no cambia excedente ni fondo` | variar solo `placed` deja iguales `surplus`, `fund`, `perParticipation`, `companyDirect`; con shares aleatorios válidos (fund + company = 10.000) I1 se mantiene |

### 5.3 `projects` (paquete 3)
- `project-status.test.ts`: `Transiciones · tabla exhaustiva 10 × 10` (`it.each` sobre los 100 pares contra §3.9); `Transiciones · settled y discarded son terminales`; `Transiciones · todo estado es alcanzable desde opportunity` (recorrido del grafo); propiedad fast-check: secuencias aleatorias de estados aplicadas con `transitionStatus` solo avanzan por aristas de la tabla. `changeProjectStatus`: `→ acquired` fija `acquiredOn`; `→ sold` fija `saleSignedOn`; `→ settled` fija `settledOn`; fecha anterior a una registrada → `DATE_OUT_OF_ORDER`.
- `project-consistency.test.ts`: un caso válido y uno inválido por cada regla de §3.7.
- `classify-wheel.test.ts` (compra `2026-01-15`; t3 = `2026-04-15`, t6 = `2026-07-15`):
  - `K2 · venta a los 3 meses exactos (15-abr) → buena`
  - `K2 · venta a 3 meses + 1 día (16-abr) → media`
  - `K2 · venta a los 6 meses exactos (15-jul) → media`
  - `K3 · venta a 6 meses + 1 día (16-jul) → mala (vendida)`
  - `Ruedas · venta el mismo día de la compra → buena`
  - `Ruedas · sin venta y hoy = 15-jul → en curso`
  - `Ruedas · sin venta y hoy = 16-jul → mala`
  - `K4 · la liquidación posterior no cambia la rueda` (mismo `saleSignedOn`, distinto `settledOn`)
  - `K2 · fin de mes: compra 31-ago-2026, 6 meses = 28-feb-2027` [SUPUESTO L2]
  - errores: venta antes de compra, hoy antes de compra, venta posterior a hoy, proyecto sin `acquiredOn` → `NOT_ACQUIRED`
  - propiedad: atrasar la venta nunca mejora la rueda (orden good < medium < bad).
- `public-api.test.ts`: `ADR-004 · index.ts no expone ruedas` — `Object.keys(await import("./index"))` no contiene `classifyWheel`, `classifyProjectWheel` ni `WHEEL_THRESHOLDS_MONTHS`, y `backoffice.ts` sí.

### 5.4 E2E
No aplica: F1-3 no tiene UI. La visibilidad de ruedas en pantallas la cubren el lint (`no-restricted-imports` ya configurado en `eslint.config.mjs`), `check-copy` R9 y el E2E de F1-5.

Comando: `pnpm vitest run src/shared/domain src/modules/finance src/modules/projects` y `pnpm verify:fast`.

## 6. Riesgos, supuestos y preguntas

### Riesgos
- **Fechas sin `Date`**: el lint prohíbe `Date` en `domain`. Implementar calendario a mano es la parte con más riesgo de error; por eso `calendar-date.ts` lleva tests de bisiestos, fin de mes y cambio de año, y una propiedad de inversión de `addDays`.
- **Desbordamiento**: sin `bigint` (ES2017). Mitigado con `MAX_MONEY_CENTS` validado en `validateDistributionInput` (`AMOUNT_TOO_LARGE`).
- **Deriva de contratos**: los paquetes 2 y 3 corren en paralelo sobre `shared/domain`; cualquier cambio a §3.1–3.6 se detiene y se reporta.
- **`stalled` puede delatar la rueda** al inversionista si F2 muestra el estado tal cual (L5). F1-3 no lo resuelve, solo lo señala.

### Supuestos tomados
- **[SUPUESTO T1 · técnico]** `usd()`, `usdUnits()`, `percentage()` e `isoDate()` son constructores de literales: ante una precondición violada (no entero, formato inválido) lanzan `RangeError`. Es un error de programación, no una regla de negocio; los errores de negocio siguen siendo `Result` (`01 §5`). Las fronteras usan siempre `parse*`. Si `revisor-codigo` lo considera contrario a `01 §5`, se resuelve con un ADR, no cambiando el contrato en silencio.
- **[SUPUESTO L1]** El 25 % del excedente se redondea hacia abajo al centavo y el sobrante va al tramo directo de la empresa (`companyDirect = excedente − fondo`). Garantiza I1 al centavo y sigue el espíritu de K1 (residuos a la empresa). En C1–C6 no cambia nada.
- **[SUPUESTO L2]** K2 en fin de mes: si el día de compra no existe en el mes destino, se toma el último día de ese mes.
- **[SUPUESTO L3]** `stalled → on_sale` y `stalled → sold` son válidas.
- **[SUPUESTO L4]** Se respeta el diagrama: no hay `opportunity → discarded` directo.
- **[SUPUESTO L9]** "Hoy" es la fecha civil de America/Caracas (lo implementa el reloj de F1-4).
- Moneda única USD en v1 (el maestro usa USD). `F` no tiene por qué ser igual a `total × precio`; el motor no lo exige (I3 solo se prueba cuando sí lo es).
- En pérdida (C5) el motor no calcula devolución de capital: H2 sigue "por definir" y `calculateHolderPayout` devuelve `LOSS_POLICY_UNDEFINED`.
- El `AuditEntry` del residuo K1 lo escribe el caso de uso de liquidación (B5); el motor solo expone `roundingResidue`.

### Preguntas para `docs/08` (bloque nuevo, lo añade el paquete 4)
No edito `docs/08` desde aquí porque F1-2 puede estar planificándose a la vez sobre los mismos docs; el agente principal pega este bloque al final:

```
## Bloque L · Motor y estados (F1-3, 22-nov) 🟠

| # | Pregunta | Propuesta por defecto |
|---|---|---|
| L1 | Si el 25 % del excedente no da centavos exactos (p. ej. excedente de 0,01), ¿cómo se redondea el fondo? | Hacia abajo al centavo; el sobrante va al 75 % de la empresa (igual que K1) |
| L2 | Rueda (K2) con compra a fin de mes (31-ago + 6 meses), ¿qué fecha es el límite? | El último día del mes destino (28 o 29-feb) |
| L3 | Un proyecto "estancado" (`stalled`), ¿a qué estados puede pasar? | Volver a "en venta" o pasar a "vendido" |
| L4 | ¿Se puede descartar una oportunidad sin pasar por due diligence? | No; se mantiene el diagrama de `02 §2` |
| L5 | El estado "estancado" deriva de la rueda mala (ADR-004). ¿Qué ve el inversionista cuando su proyecto está estancado? | Etapa "en venta" con las actualizaciones fechadas y el plazo objetivo como proyección; la palabra "estancado" solo en el backoffice |
| L7 | ¿Instalamos `@vitest/coverage-v8` para exigir cobertura 100 % del motor (`01 §1`)? | Sí, solo como dependencia de desarrollo |
| L9 | ¿El "hoy" de la demo es la fecha de Caracas? | Sí, America/Caracas |
```

### Para `docs/mejoras.md` (paquete 4)
- Regla de lint: prohibir `Math.floor/ceil/round/trunc` en `src/modules/**` fuera de `shared/domain/money.ts` (convierte "redondeo solo en `money.ts`" en error imposible).

## 7. ADR requerido
No. El plan respeta `01-arquitectura.md` y `02-modelo-de-dominio.md`. Solo haría falta un ADR si `revisor-codigo` rechaza [SUPUESTO T1] o si el usuario responde L3/L4 de forma que cambie el diagrama de `02 §2` (entonces se actualiza `02 §2` y se registra la decisión).
