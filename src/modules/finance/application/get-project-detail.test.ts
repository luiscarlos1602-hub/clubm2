import { describe, expect, it, vi } from "vitest";
import type { ParticipationClass, ProjectListing } from "@/modules/participations";
import type { Project, ProjectCode, ProjectId, PropertyId } from "@/modules/projects";
import { isoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { usd, usdUnits } from "@/shared/domain/money";
import type { ProjectBudget } from "../domain/budget";
import type { ProjectEconomics } from "../domain/project-economics";
import { createGetProjectDetail, type GetProjectDetailDeps } from "./get-project-detail";

const PID = asId<"Project">("prj_chacao_02") as ProjectId;
const PROP = asId<"Property">("prp_chacao_02") as PropertyId;

const LISTING: ProjectListing = {
  projectId: PID,
  code: "M2-006" as ProjectCode,
  slug: "m2-006-chacao",
  images: [],
  name: "Apartamento Chacao",
  city: "Caracas",
  zone: "Chacao",
  acquiredOn: isoDate("2026-11-01"),
  stage: "funding",
  phase: "open",
  participations: { total: 100, available: 37 },
  unitPrice: usdUnits(100),
  targetTermMonths: 3,
  settledOn: null,
};
const PROJECT: Project = {
  id: PID,
  code: LISTING.code,
  slug: LISTING.slug,
  name: LISTING.name,
  propertyId: PROP,
  status: "funding",
  timeline: { acquiredOn: LISTING.acquiredOn, saleSignedOn: null, settledOn: null },
};
const CLASS: ParticipationClass = {
  id: asId<"ParticipationClass">("cls_chacao_02"),
  projectId: PID,
  total: 100,
  placed: 63,
  unitPrice: usdUnits(100),
};
const ECONOMICS: ProjectEconomics = {
  projectId: PID,
  acquisitionCost: usdUnits(50_000),
  recoveryBudget: usdUnits(10_000),
  targetSalePrice: usdUnits(76_000),
  estimatedSaleCosts: usdUnits(2_280),
};
const BUDGET: ProjectBudget = {
  projectId: PID,
  lines: [
    { item: "kitchen", amount: usdUnits(5_000) },
    { item: "management_fee", amount: usdUnits(2_500) },
    { item: "contingency", amount: usdUnits(1_500) },
    { item: "reserve", amount: usdUnits(1_000) },
  ],
};

type Overrides = {
  economics?: ProjectEconomics | null;
  budget?: ProjectBudget | null;
  profile?: boolean;
};

function deps(o: Overrides = {}) {
  const spies = {
    findProject: vi.fn(async (id: ProjectId) => (id === PID ? PROJECT : null)),
    findClass: vi.fn(async () => CLASS),
  };
  const d: GetProjectDetailDeps = {
    listMarketplace: async () => [LISTING],
    projects: { findById: spies.findProject },
    properties: {
      findById: async () => ({
        id: PROP,
        city: "Caracas",
        zone: "Chacao",
        kind: "apartment",
        areaM2: 90,
      }),
    },
    content: {
      profileOf: async () =>
        o.profile === false ? null : { propertyId: PROP, description: "d", highlights: ["h"] },
      processOf: async () => null,
      updatesOf: async () => [],
      risksOf: async () => ({ projectId: PID, kinds: ["slow_sale", "sale_below_target"] }),
    },
    classes: { findByProject: spies.findClass },
    economics: { findByProject: async () => (o.economics === undefined ? ECONOMICS : o.economics) },
    budgets: { findByProject: async () => (o.budget === undefined ? BUDGET : o.budget) },
    settlements: { findByProject: async () => null },
    holdingMax: 20,
  };
  return { d, spies };
}

describe("getProjectDetail", () => {
  it("un slug ausente → null sin consultar los demás repositorios", async () => {
    const { d, spies } = deps();
    expect(await createGetProjectDetail(d)("no-existe")).toBeNull();
    expect(spies.findProject).not.toHaveBeenCalled();
    expect(spies.findClass).not.toHaveBeenCalled();
  });

  it("con datos completos → la ficha armada por el dominio", async () => {
    const detail = await createGetProjectDetail(deps().d)("m2-006-chacao");
    expect(detail?.mode).toBe("open");
    expect(detail?.simulation.maxHeld).toBe(20);
    expect(detail?.budget.total).toEqual(usdUnits(62_280));
    expect(detail?.risks).toEqual(["sale_below_target", "slow_sale"]);
    const base = detail?.scenarios[1]?.outcome;
    expect(base?.kind === "payout" ? base.payout.gain : null).toEqual(usd(3_430));
  });

  it("sin economía, presupuesto o perfil → rechaza", async () => {
    await expect(
      createGetProjectDetail(deps({ economics: null }).d)("m2-006-chacao"),
    ).rejects.toThrow(/m2-006-chacao/);
    await expect(createGetProjectDetail(deps({ budget: null }).d)("m2-006-chacao")).rejects.toThrow(
      /m2-006-chacao/,
    );
    await expect(
      createGetProjectDetail(deps({ profile: false }).d)("m2-006-chacao"),
    ).rejects.toThrow(/m2-006-chacao/);
  });

  it("si el dominio da error → rechaza con el código", async () => {
    const broken = { ...BUDGET, lines: BUDGET.lines.slice(0, -1) };
    await expect(
      createGetProjectDetail(deps({ budget: broken }).d)("m2-006-chacao"),
    ).rejects.toThrow("ficha m2-006-chacao: BUDGET_TOTAL_MISMATCH");
  });

  it("un repositorio que lanza en síncrono → rechaza", async () => {
    const { d } = deps();
    const get = createGetProjectDetail({
      ...d,
      listMarketplace: () => {
        throw new Error("repo roto");
      },
    });
    await expect(get("m2-006-chacao")).rejects.toThrow("repo roto");
  });
});
