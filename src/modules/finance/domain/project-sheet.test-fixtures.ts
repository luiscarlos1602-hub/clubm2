/** Fixtures en línea de buildProjectSheet (alta M2-008 ficticia). Solo para tests; no lo importa código de producción. */
import type { ParticipationClass } from "@/modules/participations";
import type { ProjectCode, ProjectProcess } from "@/modules/projects";
import { isoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { usdUnits } from "@/shared/domain/money";
import { err, ok } from "@/shared/domain/result";
import type { ProjectSheetContext, ProjectSheetInput } from "./project-sheet";

export const TODAY = isoDate("2026-11-22");

const upcoming = (offsetDays: number) => ({
  status: "upcoming" as const,
  offsetDays,
  started: false,
});

export const PROCESS_STEPS: ProjectProcess["steps"] = {
  works_start: upcoming(15),
  works_50: upcoming(45),
  works_80: upcoming(70),
  sale_start: upcoming(85),
  on_sale: upcoming(95),
  sold: upcoming(120),
};

/** Caso canónico ref. 100 × USD 100 = F 10.000 (S5), con rubros que suman F. Etapa publicable (funding). */
export const PUBLISHABLE_INPUT: ProjectSheetInput = {
  projectId: null,
  property: { city: "Caracas", zone: "Los Palos Grandes", kind: "apartment", areaM2: 85 },
  project: {
    name: "Apartamento Los Palos Grandes",
    status: "funding",
    acquiredOn: isoDate("2026-11-10"),
  },
  profile: {
    description: "Apartamento de ejemplo para reformar.",
    highlights: ["Dos habitaciones", "Cerca del metro"],
  },
  processSteps: PROCESS_STEPS,
  riskKinds: ["slow_sale", "sale_below_target", "works_overrun", "local_market"],
  participationClass: { total: 100, unitPrice: usdUnits(100) },
  economics: {
    acquisitionCost: usdUnits(60_000),
    recoveryBudget: usdUnits(10_000),
    targetSalePrice: usdUnits(90_000),
    estimatedSaleCosts: usdUnits(4_000),
  },
  budgetLines: [
    { item: "kitchen", amount: usdUnits(4_000) },
    { item: "bathrooms", amount: usdUnits(2_500) },
    { item: "management_fee", amount: usdUnits(2_000) },
    { item: "contingency", amount: usdUnits(1_000) },
    { item: "reserve", amount: usdUnits(500) },
  ],
  images: [
    { kind: "projection", url: "/images/proyectos/m2-004/proyeccion.svg" },
    { kind: "before", url: "/images/proyectos/m2-002/antes.svg" },
  ],
};

/** Alta mínima S4 "siempre": due diligence, sin fecha, perfil, proceso, clase, riesgos ni imágenes. */
export const MINIMAL_INPUT: ProjectSheetInput = {
  ...PUBLISHABLE_INPUT,
  project: { name: "Casa en due diligence", status: "due_diligence", acquiredOn: null },
  profile: null,
  processSteps: null,
  riskKinds: [],
  participationClass: null,
  images: [],
};

/** Sustituto de participations.checkParticipationClass (D2: finance no importa sus valores). */
function checkClassStub(c: ParticipationClass) {
  if (!Number.isSafeInteger(c.total) || c.total < 1)
    return err("INVALID_PARTICIPATION_CLASS", "total ≥ 1");
  if (!Number.isSafeInteger(c.placed) || c.placed < 0 || c.placed > c.total) {
    return err("INVALID_PARTICIPATION_CLASS", "colocadas 0..total");
  }
  if (!Number.isSafeInteger(c.unitPrice.cents) || c.unitPrice.cents <= 0) {
    return err("INVALID_PARTICIPATION_CLASS", "precio > 0");
  }
  return ok(c);
}

export const SEED_CODES = [
  "M2-001",
  "M2-002",
  "M2-003",
  "M2-004",
  "M2-005",
  "M2-006",
  "M2-007",
] as ProjectCode[];

export const CREATE_CTX: ProjectSheetContext = {
  existing: null,
  existingCodes: SEED_CODES,
  codePrefix: "M2",
  today: TODAY,
  ids: {
    projectId: asId<"Project">("prj_new_01"),
    propertyId: asId<"Property">("prop_new_01"),
    classId: asId<"ParticipationClass">("pcl_new_01"),
  },
  checkParticipationClass: checkClassStub,
};
