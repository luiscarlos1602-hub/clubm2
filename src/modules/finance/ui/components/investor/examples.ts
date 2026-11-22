import { usd, type Money } from "@/shared/domain/money";

/**
 * Datos de ejemplo de la ficha P4 (maqueta, plan 007 paquete C). Nada de esto existe aún en el dominio.
 * Montos en centavos. Compra, reforma total (F), venta objetivo y costos de venta salen del container
 * (semilla de finance); aquí solo va lo que lo desglosa o lo acompaña.
 * Desglose de F = USD 10.000 [maestro §6]: obra 5.000 + bolsa de honorarios/contingencia/reserva 5.000.
 * El reparto interno de la bolsa (2.500 · 1.500 · 1.000) es de ejemplo y está por definir.
 */

export type BudgetLine = { readonly label: string; readonly amount: Money };
export type MilestoneStatus = "done" | "current" | "upcoming";
export type Milestone = {
  readonly label: string;
  readonly status: MilestoneStatus;
  /** Días tras la compra (fecha real del hito); null si aún no ocurre. */
  readonly offsetDays: number | null;
  /** Mes objetivo desde la compra (proyección); solo en hitos futuros. */
  readonly targetMonth: number | null;
};
export type ProjectUpdate = { readonly offsetDays: number; readonly title: string; readonly text: string };

export type ProjectExample = {
  readonly description: string;
  readonly highlights: readonly string[];
  /** Rubros de obra (suman USD 5.000). */
  readonly works: readonly BudgetLine[];
  /** Bolsa de gestión (suma USD 5.000). Los honorarios son parte del presupuesto, no una ganancia adicional. */
  readonly fees: readonly BudgetLine[];
  readonly milestones: readonly Milestone[];
  readonly updates: readonly ProjectUpdate[];
  readonly risks: readonly string[];
};

const FEES: readonly BudgetLine[] = [
  { label: "Honorarios de gestión de la empresa", amount: usd(250_000) }, // ejemplo, por definir
  { label: "Contingencia de obra", amount: usd(150_000) }, // ejemplo, por definir
  { label: "Reserva", amount: usd(100_000) }, // ejemplo, por definir
];

const COMMON_RISKS = [
  "El precio de venta puede quedar por debajo del objetivo.",
  "La obra puede costar más de lo presupuestado.",
  "La venta puede tardar más que el plazo objetivo.",
] as const;

const done = (label: string, offsetDays: number): Milestone => ({ label, status: "done", offsetDays, targetMonth: null });
const current = (label: string, offsetDays: number | null = null): Milestone => ({ label, status: "current", offsetDays, targetMonth: null });
const upcoming = (label: string, targetMonth: number): Milestone => ({ label, status: "upcoming", offsetDays: null, targetMonth });

/** Clave = slug de la semilla de projects (M2-001…M2-006). M2-007 no se publica y no tiene ficha. */
export const PROJECT_EXAMPLES = {
  "m2-001-palos-grandes": {
    description: "Apartamento de tres ambientes en un edificio de los años 80, con reforma integral de cocina, baños y acabados.",
    highlights: ["Tres ambientes", "Dos baños", "Un puesto de estacionamiento"],
    works: [
      { label: "Cocina", amount: usd(140_000) }, // ejemplo
      { label: "Baños", amount: usd(120_000) }, // ejemplo
      { label: "Pisos y pintura", amount: usd(130_000) }, // ejemplo
      { label: "Electricidad y plomería", amount: usd(110_000) }, // ejemplo
    ],
    fees: FEES,
    milestones: [done("Compra del inmueble", 0), done("Reforma terminada", 62), done("Publicado en venta", 70), done("Firma de venta", 140), done("Liquidación", 160)],
    updates: [
      { offsetDays: 160, title: "Liquidación realizada", text: "Se cerró la liquidación del proyecto y se registró el resultado realizado." },
      { offsetDays: 140, title: "Venta firmada", text: "Se firmó la venta del inmueble." },
      { offsetDays: 62, title: "Reforma terminada", text: "La obra concluyó y el inmueble quedó listo para mostrarse." },
    ],
    risks: [...COMMON_RISKS],
  },
  "m2-002-el-hatillo": {
    description: "Casa de dos plantas con jardín, con reforma de cocina, baños, pisos y exteriores.",
    highlights: ["Dos plantas", "Jardín", "Tres baños"],
    works: [
      { label: "Cocina", amount: usd(120_000) }, // ejemplo
      { label: "Baños", amount: usd(90_000) }, // ejemplo
      { label: "Pisos y pintura", amount: usd(150_000) }, // ejemplo
      { label: "Electricidad y plomería", amount: usd(80_000) }, // ejemplo
      { label: "Jardín y exteriores", amount: usd(60_000) }, // ejemplo
    ],
    fees: FEES,
    milestones: [done("Compra del inmueble", 0), done("Reforma terminada", 120), done("Publicado en venta", 135), current("Venta en curso"), upcoming("Firma de venta", 6)],
    updates: [
      { offsetDays: 210, title: "Visitas de interesados", text: "Se atendieron nuevas visitas y se recibieron comentarios sobre precio y acabados." },
      { offsetDays: 135, title: "Publicada en venta", text: "La casa se publicó en los canales de venta de la empresa." },
      { offsetDays: 120, title: "Reforma terminada", text: "La obra concluyó con exteriores y jardín listos." },
    ],
    risks: [...COMMON_RISKS, "Una casa puede tener un público comprador más reducido que un apartamento."],
  },
  "m2-003-chacao": {
    description: "Apartamento de dos habitaciones con reforma de cocina, baños y acabados.",
    highlights: ["Dos habitaciones", "Un baño", "Edificio con vigilancia"],
    works: [
      { label: "Cocina", amount: usd(130_000) }, // ejemplo
      { label: "Baños", amount: usd(100_000) }, // ejemplo
      { label: "Pisos y pintura", amount: usd(150_000) }, // ejemplo
      { label: "Electricidad y plomería", amount: usd(120_000) }, // ejemplo
    ],
    fees: FEES,
    milestones: [done("Compra del inmueble", 0), done("Reforma terminada", 35), done("Publicado en venta", 42), done("Firma de venta", 75), done("Liquidación", 90)],
    updates: [
      { offsetDays: 90, title: "Liquidación realizada", text: "Se cerró la liquidación y se registró el resultado realizado." },
      { offsetDays: 75, title: "Venta firmada", text: "Se firmó la venta del inmueble." },
      { offsetDays: 35, title: "Reforma terminada", text: "La obra concluyó dentro del presupuesto." },
    ],
    risks: [...COMMON_RISKS],
  },
  "m2-004-el-vinedo": {
    description: "Apartamento con reforma de cocina, baños, pisos y carpintería a medida.",
    highlights: ["Tres ambientes", "Carpintería a medida", "Un puesto de estacionamiento"],
    works: [
      { label: "Cocina", amount: usd(110_000) }, // ejemplo
      { label: "Baños", amount: usd(110_000) }, // ejemplo
      { label: "Pisos y pintura", amount: usd(160_000) }, // ejemplo
      { label: "Carpintería", amount: usd(120_000) }, // ejemplo
    ],
    fees: FEES,
    milestones: [done("Compra del inmueble", 0), done("Reforma terminada", 60), done("Publicado en venta", 75), current("Venta en curso"), upcoming("Firma de venta", 4)],
    updates: [
      { offsetDays: 98, title: "Visitas programadas", text: "Se programaron visitas con interesados en la zona." },
      { offsetDays: 75, title: "Publicado en venta", text: "El apartamento se publicó para la venta." },
      { offsetDays: 60, title: "Reforma terminada", text: "La obra concluyó y se hizo la limpieza final." },
    ],
    risks: [...COMMON_RISKS, "El mercado de la ciudad puede moverse distinto al de Caracas."],
  },
  "m2-005-el-paraiso": {
    description: "Apartamento en obra: reforma de cocina, baños, pisos y electricidad.",
    highlights: ["Dos habitaciones", "Un baño", "Reforma en curso"],
    works: [
      { label: "Cocina", amount: usd(150_000) }, // ejemplo
      { label: "Baños", amount: usd(100_000) }, // ejemplo
      { label: "Pisos y pintura", amount: usd(140_000) }, // ejemplo
      { label: "Electricidad y plomería", amount: usd(110_000) }, // ejemplo
    ],
    fees: FEES,
    milestones: [done("Compra del inmueble", 0), done("Demolición y preparación", 14), current("Reforma en curso"), upcoming("Publicación en venta", 2), upcoming("Firma de venta", 3)],
    updates: [
      { offsetDays: 38, title: "Instalaciones eléctricas", text: "Avanza el cambio de instalaciones eléctricas y de plomería." },
      { offsetDays: 21, title: "Demolición terminada", text: "Terminó la demolición de la cocina y los baños." },
      { offsetDays: 7, title: "Inicio de obra", text: "Comenzó la preparación del inmueble." },
    ],
    risks: [...COMMON_RISKS, "En obra pueden aparecer problemas ocultos que encarezcan o retrasen la reforma."],
  },
  "m2-006-chacao": {
    description: "Apartamento recién comprado, con reforma planificada de cocina, baños y acabados.",
    highlights: ["Tres ambientes", "Dos baños", "Colocación abierta"],
    works: [
      { label: "Cocina", amount: usd(130_000) }, // ejemplo
      { label: "Baños", amount: usd(120_000) }, // ejemplo
      { label: "Pisos y pintura", amount: usd(140_000) }, // ejemplo
      { label: "Electricidad y plomería", amount: usd(110_000) }, // ejemplo
    ],
    fees: FEES,
    milestones: [done("Compra del inmueble", 0), current("Colocación de participaciones"), upcoming("Inicio de obra", 1), upcoming("Publicación en venta", 3)],
    updates: [
      { offsetDays: 9, title: "Presupuesto de obra definido", text: "Se cerró el presupuesto de reforma con sus rubros y honorarios." },
      { offsetDays: 3, title: "Colocación abierta", text: "Se abrió la colocación de participaciones económicas del proyecto." },
    ],
    risks: [...COMMON_RISKS, "Si la colocación no se completa, la empresa financia el resto de la reforma."],
  },
} as const satisfies Readonly<Record<string, ProjectExample>>;

export type PublishedSlug = keyof typeof PROJECT_EXAMPLES;
export const PUBLISHED_PROJECT_SLUGS = Object.keys(PROJECT_EXAMPLES) as readonly PublishedSlug[];

export function isPublishedProjectSlug(slug: string): slug is PublishedSlug {
  return Object.hasOwn(PROJECT_EXAMPLES, slug);
}
