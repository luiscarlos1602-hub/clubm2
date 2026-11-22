/** Datos de ejemplo del panel (maqueta, ADR-012). Literales en centavos con su origen; ninguna cifra se calcula en pantalla.
 *  Cuando se interconecte, se sustituyen por los casos de uso de participations y finance. */

export type ExampleMoney = { readonly cents: number; readonly currency: "USD" };
const usdCents = (cents: number): ExampleMoney => ({ cents, currency: "USD" });

export type HoldingStatus = "settled" | "renovation" | "funding";

export type ExampleHolding = {
  /** Código público; el nombre, la zona y el slug salen del marketplace. */
  readonly code: string;
  readonly quantity: number;
  readonly status: HoldingStatus;
  readonly capital: ExampleMoney;
  readonly realized: ExampleMoney | null;
};

export const EXAMPLE_PROFILE = {
  fullName: "Mariana Rojas",
  firstName: "Mariana",
  email: "mariana.ejemplo@correo.example",
  city: "Caracas",
  memberSince: "2026-03-14",
  holderId: "inv_demo",
} as const;

/** inv_demo en la semilla (src/composition/seed-consistency.test.ts): 5 en M2-003, 3 en M2-005 y 2 en M2-006, de USD 100 cada una. */
export const EXAMPLE_HOLDINGS: readonly ExampleHolding[] = [
  // semilla M2-003 liquidado: capital 50.000 ¢ + ganancia realizada 17.250 ¢ (motor, seed-consistency.test.ts)
  { code: "M2-003", quantity: 5, status: "settled", capital: usdCents(50_000), realized: usdCents(17_250) },
  // semilla M2-005 en obra: 3 × 10.000 ¢; su proyección la calcula finance (projectHolding)
  { code: "M2-005", quantity: 3, status: "renovation", capital: usdCents(30_000), realized: null },
  // semilla M2-006 en colocación 63/100: 2 × 10.000 ¢; su proyección la calcula finance (projectHolding)
  { code: "M2-006", quantity: 2, status: "funding", capital: usdCents(20_000), realized: null },
];

/** Capital y ganancia realizada de las tres filas, como literales. La proyección total sale de finance (useHoldingProjections). */
export const EXAMPLE_TOTALS = {
  capital: usdCents(100_000),
  realized: usdCents(17_250),
  /** Capital de las tenencias liquidadas (M2-003: 5 × 10.000 ¢): base del % de la ganancia realizada. */
  settledCapital: usdCents(50_000),
  /** Capital de las tenencias en curso (M2-005: 30.000 ¢ + M2-006: 20.000 ¢): base del % de la proyección total. */
  inProgressCapital: usdCents(50_000),
} as const;

/** Histórico de la liquidación de M2-003 para 5 participaciones (semilla). */
export const EXAMPLE_SETTLEMENT = {
  code: "M2-003",
  quantity: 5,
  capital: usdCents(50_000),
  realized: usdCents(17_250),
} as const;

export type ExampleNews = { readonly date: string; readonly code: string; readonly text: string };
/** Novedades de obra de ejemplo (fechas ilustrativas). */
export const EXAMPLE_NEWS: readonly ExampleNews[] = [
  { date: "2026-11-18", code: "M2-005", text: "Se terminó la demolición de tabiques interiores y comenzó el cableado eléctrico." },
  { date: "2026-11-10", code: "M2-005", text: "Llegó el segundo lote de materiales. Los avances se publican con su fecha." },
  { date: "2026-11-04", code: "M2-006", text: "Quedó registrada la visita técnica previa al inicio de obra." },
];

export type ExampleMilestone = { readonly code: string; readonly text: string; readonly dateLabel: string };
/** Hitos futuros de ejemplo: todos son fechas objetivo, no compromisos. */
export const EXAMPLE_MILESTONES: readonly ExampleMilestone[] = [
  { code: "M2-005", text: "Fin de la instalación eléctrica", dateLabel: "dic 2026" },
  { code: "M2-005", text: "Inicio de acabados", dateLabel: "ene 2027" },
  { code: "M2-006", text: "Cierre de la colocación de participaciones", dateLabel: "dic 2026" },
];

export type ExampleSteps = { readonly label: string; readonly state: "done" | "review" | "pending" };
export const EXAMPLE_VERIFICATION: readonly ExampleSteps[] = [
  { label: "Correo", state: "done" },
  { label: "Identidad", state: "review" },
  { label: "Perfil de experiencia", state: "done" },
];
