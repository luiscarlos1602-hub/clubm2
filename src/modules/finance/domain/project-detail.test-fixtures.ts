/** Fixtures en línea de buildProjectDetail (M2-006 ficticio). Solo para tests; no lo importa código de producción. */
import type { ListingPhase, ParticipationClass, ProjectListing } from "@/modules/participations";
import type {
  Project,
  ProjectCode,
  ProjectId,
  ProjectProcess,
  ProjectStatus,
  ProjectUpdate,
  Property,
  PropertyId,
} from "@/modules/projects";
import { isoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { usdUnits } from "@/shared/domain/money";
import type { ProjectDetailSource } from "./project-detail-types";
import { createSettlement, type Settlement } from "./settlement";

export const PID = asId<"Project">("prj_chacao_02") as ProjectId;
export const PROP = asId<"Property">("prp_chacao_02") as PropertyId;
export const OTHER = asId<"Project">("prj_otro_01") as ProjectId;

const STATUS_BY_PHASE: Record<ListingPhase, ProjectStatus> = {
  open: "funding",
  placement_complete: "funding",
  renovation: "renovation",
  on_sale: "on_sale",
  sold: "sold",
  finished: "settled",
};

function settlement(): Settlement {
  const r = createSettlement({
    id: asId<"Settlement">("stl_chacao_02"),
    projectId: PID,
    settledOn: isoDate("2026-10-01"),
    input: {
      basis: "realized",
      salePrice: usdUnits(76_000),
      acquisitionCost: usdUnits(50_000),
      recoveryBudget: usdUnits(10_000),
      saleCosts: usdUnits(2_280),
      participations: { total: 100, placed: 100, unitPrice: usdUnits(100) },
    },
  });
  if (!r.ok) throw new Error(r.error.code);
  return r.value;
}

export const update = (n: number, on: string): ProjectUpdate => ({
  id: asId<"ProjectUpdate">(`upd_chacao_02_${n}`),
  projectId: PID,
  publishedOn: isoDate(on),
  title: `t${n}`,
  body: "b",
});

export const PROCESS: ProjectProcess = {
  projectId: PID,
  steps: {
    works_start: { status: "current", offsetDays: 30, started: false },
    works_50: { status: "upcoming", offsetDays: 60, started: false },
    works_80: { status: "upcoming", offsetDays: 78, started: false },
    sale_start: { status: "upcoming", offsetDays: 90, started: false },
    on_sale: { status: "upcoming", offsetDays: 94, started: false },
    sold: { status: "upcoming", offsetDays: 125, started: false },
  },
};

export function source(phase: ListingPhase, placed = 63): ProjectDetailSource {
  const finished = phase === "finished";
  const listing: ProjectListing = {
    projectId: PID,
    code: "M2-006" as ProjectCode,
    slug: "m2-006-chacao",
    name: "Apartamento Chacao",
    city: "Caracas",
    zone: "Chacao",
    acquiredOn: isoDate("2026-11-01"),
    stage: "funding",
    phase,
    participations: { total: 100, available: phase === "open" ? 100 - placed : 0 },
    unitPrice: usdUnits(100),
    targetTermMonths: phase === "sold" || finished ? null : 3,
    settledOn: finished ? isoDate("2026-10-01") : null,
  };
  const project: Project = {
    id: PID,
    code: listing.code,
    slug: listing.slug,
    name: listing.name,
    propertyId: PROP,
    status: STATUS_BY_PHASE[phase],
    timeline: { acquiredOn: listing.acquiredOn, saleSignedOn: null, settledOn: null },
  };
  const property: Property = {
    id: PROP,
    city: "Caracas",
    zone: "Chacao",
    kind: "apartment",
    areaM2: 90,
  };
  const participationClass: ParticipationClass = {
    id: asId<"ParticipationClass">("cls_chacao_02"),
    projectId: PID,
    total: 100,
    placed,
    unitPrice: usdUnits(100),
  };
  return {
    listing,
    project,
    property,
    profile: { propertyId: PROP, description: "Apartamento", highlights: ["Tres ambientes"] },
    participationClass,
    economics: {
      projectId: PID,
      acquisitionCost: usdUnits(50_000),
      recoveryBudget: usdUnits(10_000),
      targetSalePrice: usdUnits(76_000),
      estimatedSaleCosts: usdUnits(2_280),
    },
    budget: {
      projectId: PID,
      lines: [
        { item: "kitchen", amount: usdUnits(2_500) },
        { item: "bathrooms", amount: usdUnits(2_500) },
        { item: "management_fee", amount: usdUnits(2_500) },
        { item: "contingency", amount: usdUnits(1_500) },
        { item: "reserve", amount: usdUnits(1_000) },
      ],
    },
    settlement: finished ? settlement() : null,
    process: PROCESS,
    updates: [update(1, "2026-11-04"), update(2, "2026-11-10")],
    risks: {
      projectId: PID,
      kinds: ["incomplete_placement", "slow_sale", "sale_below_target", "works_overrun"],
    },
    holdingMax: 20,
  };
}
