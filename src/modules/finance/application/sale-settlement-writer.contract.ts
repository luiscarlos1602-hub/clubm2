import { beforeEach, describe, expect, it } from "vitest";
import { changeProjectStatus, type Project, type ProjectRepository } from "@/modules/projects";
import { isoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { usdUnits } from "@/shared/domain/money";
import type { DistributionOutcome } from "../domain/distribution";
import type { ProjectSale } from "../domain/project-sale";
import { createSettlement, type Settlement } from "../domain/settlement";
import type { ProjectSaleRepository, ProjectSaleWriter, SettlementRepository, SettlementWriter } from "./ports";

export type SaleSettlementWriterContractSubject = {
  readonly writer: ProjectSaleWriter & SettlementWriter;
  readonly projects: Pick<ProjectRepository, "findById">;
  readonly sales: ProjectSaleRepository;
  readonly settlements: SettlementRepository;
  /** Proyecto `prj_contrato_01` ya guardado en `on_sale` (con `acquiredOn` ≤ 2026-10-01). DB-4 lo crea antes. */
  readonly project: Project;
};

const SIGNED_ON = isoDate("2026-11-01");
const SETTLED_ON = isoDate("2026-11-10");
const TERMS = { total: 100, placed: 100, unitPrice: usdUnits(100) };

function sale(project: Project, over: Partial<ProjectSale> = {}): ProjectSale {
  return { projectId: project.id, salePrice: usdUnits(47_000), saleCosts: usdUnits(1_000), signedOn: SIGNED_ON, ...over };
}

function mustChange(project: Project, to: "sold" | "settled", on: ReturnType<typeof isoDate>): Project {
  const r = changeProjectStatus(project, to, on);
  if (!r.ok) throw new Error(`el proyecto del contrato no puede pasar a ${to}: ${r.error.code}`);
  return r.value;
}

function settlementOf(project: Project, input: { salePrice: number; saleCosts: number }): Settlement {
  const r = createSettlement({
    id: asId<"Settlement">("stl_contrato_01"),
    projectId: project.id,
    settledOn: SETTLED_ON,
    input: {
      basis: "realized",
      salePrice: usdUnits(input.salePrice),
      acquisitionCost: usdUnits(30_000),
      recoveryBudget: usdUnits(20_000),
      saleCosts: usdUnits(input.saleCosts),
      participations: TERMS,
    },
  });
  if (!r.ok) throw new Error(`la liquidación del contrato no es válida: ${r.error.code}`);
  return r.value;
}

/**
 * Suite de contrato de `ProjectSaleWriter` y `SettlementWriter` (W-5), contra el puerto. Cada caso parte de un sujeto
 * nuevo con el proyecto en `on_sale`. La reutiliza el adaptador Supabase (DB-4).
 */
export function describeSaleSettlementWriterContract(
  label: string,
  setup: () => SaleSettlementWriterContractSubject | Promise<SaleSettlementWriterContractSubject>,
): void {
  describe(`Contrato de venta y liquidación · ${label}`, () => {
    let s: SaleSettlementWriterContractSubject;
    let sold: Project;

    beforeEach(async () => {
      s = await setup();
      sold = mustChange(s.project, "sold", SIGNED_ON);
    });

    it("record: devuelve la venta, queda legible y el proyecto queda en sold con saleSignedOn", async () => {
      const r = await s.writer.record({ project: sold, sale: sale(s.project) });
      expect(r).toEqual({ ok: true, value: sale(s.project) });
      expect(await s.sales.findByProject(s.project.id)).toEqual(sale(s.project));
      expect((await s.sales.list()).filter((x) => x.projectId === s.project.id)).toHaveLength(1);
      const stored = await s.projects.findById(s.project.id);
      expect(stored?.status).toBe("sold");
      expect(stored?.timeline.saleSignedOn).toBe(SIGNED_ON);
    });

    it("record: segunda venta del mismo proyecto → DUPLICATE y nada cambia", async () => {
      await s.writer.record({ project: sold, sale: sale(s.project) });
      const r = await s.writer.record({ project: sold, sale: sale(s.project, { salePrice: usdUnits(50_000) }) });
      expect(!r.ok && r.error.code).toBe("DUPLICATE");
      expect((await s.sales.findByProject(s.project.id))?.salePrice).toEqual(usdUnits(47_000));
    });

    it("record: proyecto inexistente → REFERENCE_NOT_FOUND", async () => {
      const ghost = { ...sold, id: asId<"Project">("prj_fantasma_01") };
      const r = await s.writer.record({ project: ghost, sale: sale(ghost) });
      expect(!r.ok && r.error.code).toBe("REFERENCE_NOT_FOUND");
      expect(await s.sales.findByProject(ghost.id)).toBeNull();
    });

    it("record: venta inválida → INVALID_RECORD y ni el proyecto ni la venta cambian", async () => {
      const bad = sale(s.project, { salePrice: { cents: 1.5, currency: "USD" } });
      const r = await s.writer.record({ project: sold, sale: bad });
      expect(!r.ok && r.error.code).toBe("INVALID_RECORD");
      expect(await s.sales.findByProject(s.project.id)).toBeNull();
      expect(await s.projects.findById(s.project.id)).toEqual(s.project);
    });

    it("settle sin venta → REFERENCE_NOT_FOUND y nada cambia", async () => {
      const settledProject = mustChange(sold, "settled", SETTLED_ON);
      const r = await s.writer.settle({ project: settledProject, settlement: settlementOf(s.project, { salePrice: 47_000, saleCosts: 1_000 }) });
      expect(!r.ok && r.error.code).toBe("REFERENCE_NOT_FOUND");
      expect(await s.settlements.findByProject(s.project.id)).toBeNull();
      expect(await s.projects.findById(s.project.id)).toEqual(s.project);
    });

    it("settle: guarda la liquidación y el proyecto queda en settled; el segundo → DUPLICATE", async () => {
      await s.writer.record({ project: sold, sale: sale(s.project) });
      const settledProject = mustChange(sold, "settled", SETTLED_ON);
      const settlement = settlementOf(s.project, { salePrice: 47_000, saleCosts: 1_000 });
      expect(await s.writer.settle({ project: settledProject, settlement })).toEqual({ ok: true, value: settlement });
      expect(await s.settlements.findByProject(s.project.id)).toEqual(settlement);
      const stored = await s.projects.findById(s.project.id);
      expect(stored?.status).toBe("settled");
      expect(stored?.timeline.settledOn).toBe(SETTLED_ON);
      const again = await s.writer.settle({ project: settledProject, settlement });
      expect(!again.ok && again.error.code).toBe("DUPLICATE");
    });

    it("una liquidación con pérdida vuelve idéntica (LossDistribution)", async () => {
      await s.writer.record({ project: sold, sale: sale(s.project, { salePrice: usdUnits(47_000) }) });
      const settledProject = mustChange(sold, "settled", SETTLED_ON);
      const settlement = settlementOf(s.project, { salePrice: 47_000, saleCosts: 1_000 });
      expect(settlement.distribution.kind).toBe("loss");
      await s.writer.settle({ project: settledProject, settlement });
      const back = await s.settlements.findByProject(s.project.id);
      const d: DistributionOutcome | undefined = back?.distribution;
      expect(d).toEqual(settlement.distribution);
      expect(back).toEqual(settlement);
    });
  });
}
