import { usd, type Money } from "@/shared/domain/money";

// Datos de ejemplo del backoffice (ADR-012). Montos en centavos, con origen citado.

/** Capital propio inmovilizado: suma de C de M2-002, 004, 005, 006 (semilla finanzas: 62.000 + 38.000 + 34.000 + 50.000). */
export const OWN_CAPITAL_IMMOBILIZED: Money = usd(18_400_000);

/** Colocación por código (semilla participaciones, de 100). */
export const PLACED_BY_CODE: Readonly<Record<string, number>> = {
  "M2-001": 88,
  "M2-002": 81,
  "M2-003": 100,
  "M2-004": 94,
  "M2-005": 100,
  "M2-006": 63,
};

/** Participaciones disponibles por código, de 100 (literales: 100 − colocadas de PLACED_BY_CODE). */
export const AVAILABLE_BY_CODE: Readonly<Record<string, number>> = {
  "M2-001": 12,
  "M2-002": 19,
  "M2-003": 0,
  "M2-004": 6,
  "M2-005": 0,
  "M2-006": 37,
};

export type ExampleInvestor = { readonly name: string; readonly since: string; readonly participations: number };
/** Muestra de inversionistas por código (ejemplo; personas ficticias, no es la lista completa). */
export const INVESTORS_BY_CODE: Readonly<Record<string, readonly ExampleInvestor[]>> = {
  "M2-001": [
    { name: "Inversionista de ejemplo 01", since: "2026-01-12", participations: 20 },
    { name: "Inversionista de ejemplo 02", since: "2026-01-20", participations: 10 },
  ],
  "M2-002": [
    { name: "Inversionista de ejemplo 03", since: "2026-03-30", participations: 25 },
    { name: "Inversionista de ejemplo 04", since: "2026-04-02", participations: 12 },
  ],
  "M2-003": [{ name: "Inversionista de ejemplo 05", since: "2026-02-08", participations: 30 }],
  "M2-004": [
    { name: "Inversionista de ejemplo 06", since: "2026-08-03", participations: 15 },
    { name: "Inversionista de ejemplo 07", since: "2026-08-10", participations: 8 },
  ],
  "M2-005": [
    { name: "Inversionista de ejemplo 01", since: "2026-10-12", participations: 18 },
    { name: "Inversionista de ejemplo 08", since: "2026-10-15", participations: 10 },
  ],
  "M2-006": [
    { name: "Inversionista de ejemplo 02", since: "2026-11-12", participations: 20 },
    { name: "Inversionista de ejemplo 09", since: "2026-11-15", participations: 15 },
    { name: "Inversionista de ejemplo 10", since: "2026-11-18", participations: 10 },
  ],
};

export type BoardCard = {
  readonly id: string;
  readonly name: string;
  readonly zone: string;
  readonly asking: Money;
  readonly checklist: { readonly done: number; readonly total: number };
};

/** Oportunidades de ejemplo (no existen en la semilla). Due diligence y Comprado salen del container. */
export const OPPORTUNITY_CARDS: readonly BoardCard[] = [
  { id: "OP-014", name: "Apartamento La Castellana", zone: "Caracas · La Castellana", asking: usd(5_200_000), checklist: { done: 0, total: 6 } },
  { id: "OP-015", name: "Casa Prados del Este", zone: "Caracas · Prados del Este", asking: usd(6_900_000), checklist: { done: 1, total: 6 } },
];
export const OFFER_CARDS: readonly BoardCard[] = [
  { id: "OP-012", name: "Apartamento Altamira", zone: "Caracas · Altamira", asking: usd(4_600_000), checklist: { done: 6, total: 6 } },
];

/** Checklist de due diligence de ejemplo para M2-007 (semilla en due_diligence). */
export const DUE_DILIGENCE_ITEMS: readonly { readonly label: string; readonly done: boolean }[] = [
  { label: "Documento de propiedad y cadena titulativa", done: true },
  { label: "Solvencias y gravámenes", done: true },
  { label: "Inspección técnica de estructura", done: true },
  { label: "Presupuesto de reforma desglosado", done: false },
  { label: "Estudio de precios de venta en la zona", done: false },
  { label: "Revisión de condominio y servicios", done: false },
];

export type OpportunityKind = "apartment" | "house" | "duplex";
export type OpportunityDetail = {
  readonly id: string;
  /** Código de proyecto cuyas imágenes de referencia se usan para este tipo de inmueble. */
  readonly imageCode: string;
  readonly name: string;
  readonly stage: "opportunity" | "due_diligence" | "offer";
  readonly kind: OpportunityKind;
  readonly zone: string;
  readonly areaM2: number;
  readonly rooms: number;
  readonly bathrooms: number;
  readonly parking: number;
  readonly condition: string;
  readonly source: string;
  readonly asking: Money;
  readonly offer: Money | null;
  /** Presupuesto de reforma de referencia (F = USD 10.000, ref. maestro §6). */
  readonly reformBudget: Money;
  /** Precio de venta de referencia (proyección, ejemplo). */
  readonly referenceSale: Money;
  /** Revisiones de due diligence ya hechas, de DUE_DILIGENCE_ITEMS.length. */
  readonly checklistDone: number;
};

/** Fichas de ejemplo de las oportunidades del tablero (no existen en la semilla). M2-007 es el proyecto en due diligence. */
export const OPPORTUNITY_DETAILS: Readonly<Record<string, OpportunityDetail>> = {
  "OP-014": { id: "OP-014", imageCode: "M2-001", name: "Apartamento La Castellana", stage: "opportunity", kind: "apartment", zone: "Caracas · La Castellana", areaM2: 85, rooms: 3, bathrooms: 2, parking: 1, condition: "Habitable, acabados de hace décadas", source: "Referido de ejemplo", asking: usd(5_200_000), offer: null, reformBudget: usd(1_000_000), referenceSale: usd(7_400_000), checklistDone: 0 },
  "OP-015": { id: "OP-015", imageCode: "M2-002", name: "Casa Prados del Este", stage: "opportunity", kind: "house", zone: "Caracas · Prados del Este", areaM2: 190, rooms: 4, bathrooms: 3, parking: 2, condition: "Requiere obra gris parcial", source: "Corredor de ejemplo", asking: usd(6_900_000), offer: null, reformBudget: usd(1_000_000), referenceSale: usd(9_600_000), checklistDone: 1 },
  "OP-012": { id: "OP-012", imageCode: "M2-003", name: "Apartamento Altamira", stage: "offer", kind: "apartment", zone: "Caracas · Altamira", areaM2: 74, rooms: 2, bathrooms: 2, parking: 1, condition: "Habitable, cocina y baños por renovar", source: "Búsqueda propia de ejemplo", asking: usd(4_600_000), offer: usd(4_300_000), reformBudget: usd(1_000_000), referenceSale: usd(6_500_000), checklistDone: 6 },
  "M2-007": { id: "M2-007", imageCode: "M2-007", name: "Dúplex Los Palos Grandes", stage: "due_diligence", kind: "duplex", zone: "Caracas · Los Palos Grandes", areaM2: 120, rooms: 3, bathrooms: 3, parking: 2, condition: "Estructura revisada; pendiente presupuesto de reforma", source: "Referido de ejemplo", asking: usd(6_800_000), offer: null, reformBudget: usd(1_000_000), referenceSale: usd(9_200_000), checklistDone: 3 },
};

export type BudgetLineKey = "works" | "management_fee" | "contingency" | "reserve";
/** F = USD 10.000 (ref. maestro §6): obra 5.000 y bolsa mixta de 5.000 repartida en honorarios, contingencia y reserva. */
export const BUDGET_LINES: Readonly<Record<BudgetLineKey, Money>> = {
  works: usd(500_000),
  management_fee: usd(250_000),
  contingency: usd(150_000),
  reserve: usd(100_000),
};

export type WorksProfile = "funding" | "renovation" | "finished";
/** Gasto devengado por perfil de etapa (ejemplo). `finished` incluye una contingencia sobre su línea. */
export const SPENT_BY_PROFILE: Readonly<Record<WorksProfile, Readonly<Record<BudgetLineKey, Money>>>> = {
  funding: { works: usd(0), management_fee: usd(0), contingency: usd(0), reserve: usd(0) },
  renovation: { works: usd(310_000), management_fee: usd(90_000), contingency: usd(40_000), reserve: usd(0) },
  finished: { works: usd(470_000), management_fee: usd(250_000), contingency: usd(172_000), reserve: usd(0) },
};

export type MilestoneState = "done" | "current" | "upcoming";
export const WORK_ORDERS: readonly { readonly id: string; readonly contractor: string; readonly budget: Money; readonly status: MilestoneState }[] = [
  { id: "OT-101 · Obra gris", contractor: "Contratista de ejemplo A", budget: usd(220_000), status: "done" },
  { id: "OT-102 · Electricidad y plomería", contractor: "Contratista de ejemplo B", budget: usd(150_000), status: "current" },
  { id: "OT-103 · Acabados", contractor: "Contratista de ejemplo A", budget: usd(130_000), status: "upcoming" },
];

/** Avances publicados de ejemplo (fecha ISO). */
export const PUBLISHED_UPDATES: readonly { readonly date: string; readonly text: string }[] = [
  { date: "2026-11-10", text: "Terminada la obra gris; comienzan las instalaciones eléctricas." },
  { date: "2026-10-27", text: "Retirados los escombros y revisado el sistema de tuberías." },
];

export type ListingExample = {
  readonly listed: Money;
  readonly published: boolean;
  readonly daysOnSale: number;
  readonly visits: number;
  readonly offers: number;
};
/** Comercialización de ejemplo por código (M2-002 y M2-004 están en venta en la semilla). */
export const LISTING_BY_CODE: Readonly<Record<string, ListingExample>> = {
  "M2-002": { listed: usd(8_800_000), published: true, daysOnSale: 96, visits: 11, offers: 2 },
  "M2-004": { listed: usd(5_800_000), published: true, daysOnSale: 31, visits: 6, offers: 1 },
};

export const OFFERS: readonly { readonly code: string; readonly date: string; readonly amount: Money; readonly status: string }[] = [
  { code: "M2-002", date: "2026-11-14", amount: usd(8_200_000), status: "En negociación" },
  { code: "M2-002", date: "2026-10-30", amount: usd(7_900_000), status: "Rechazada" },
  { code: "M2-004", date: "2026-11-18", amount: usd(5_500_000), status: "En negociación" },
];

export const UPCOMING_VISITS: readonly { readonly code: string; readonly when: string; readonly who: string }[] = [
  { code: "M2-002", when: "2026-11-25", who: "Visita de ejemplo 1" },
  { code: "M2-004", when: "2026-11-26", who: "Visita de ejemplo 2" },
  { code: "M2-004", when: "2026-11-28", who: "Visita de ejemplo 3" },
];
