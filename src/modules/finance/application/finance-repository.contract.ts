import { beforeEach, describe, expect, it } from "vitest";
import type { ProjectId } from "@/modules/projects";
import { asId } from "@/shared/domain/id";
import { usdUnits } from "@/shared/domain/money";
import type { ProjectBudget } from "../domain/budget";
import type { ProjectEconomics } from "../domain/project-economics";
import type {
  ProjectBudgetRepository,
  ProjectBudgetWriter,
  ProjectEconomicsRepository,
  ProjectEconomicsWriter,
} from "./ports";

export type FinanceRepositoryContractSubject = {
  readonly economics: ProjectEconomicsRepository & ProjectEconomicsWriter;
  readonly budgets: ProjectBudgetRepository & ProjectBudgetWriter;
};

/** Proyecto propio del contrato. En Supabase (DB-4) `setup` debe crear antes este proyecto (FK). */
export const CONTRACT_PROJECT_ID: ProjectId = asId<"Project">("prj_contrato_01");

export const contractEconomics: ProjectEconomics = {
  projectId: CONTRACT_PROJECT_ID,
  acquisitionCost: usdUnits(60_000),
  recoveryBudget: usdUnits(10_000),
  targetSalePrice: usdUnits(82_000),
  estimatedSaleCosts: usdUnits(2_500),
};

export const contractBudget: ProjectBudget = {
  projectId: CONTRACT_PROJECT_ID,
  lines: [
    { item: "kitchen", amount: usdUnits(2_500) },
    { item: "bathrooms", amount: usdUnits(2_500) },
    { item: "management_fee", amount: usdUnits(2_500) },
    { item: "contingency", amount: usdUnits(1_500) },
    { item: "reserve", amount: usdUnits(1_000) },
  ],
};

/** Suite de contrato de los puertos de finance (W-1), contra el puerto; la reutiliza el adaptador Supabase (DB-4). */
export function describeFinanceRepositoryContract(
  label: string,
  setup: () => FinanceRepositoryContractSubject | Promise<FinanceRepositoryContractSubject>,
): void {
  describe(`Contrato de repositorios de finance · ${label}`, () => {
    let repo: FinanceRepositoryContractSubject;

    beforeEach(async () => {
      repo = await setup();
    });

    it("economía: save la devuelve y queda legible por proyecto y en list", async () => {
      expect(await repo.economics.save(contractEconomics)).toEqual({ ok: true, value: contractEconomics });
      expect(await repo.economics.findByProject(CONTRACT_PROJECT_ID)).toEqual(contractEconomics);
      expect((await repo.economics.list()).filter((e) => e.projectId === CONTRACT_PROJECT_ID)).toHaveLength(1);
    });

    it("economía: una por proyecto; guardar de nuevo reemplaza", async () => {
      await repo.economics.save(contractEconomics);
      const before = (await repo.economics.list()).length;
      const changed = { ...contractEconomics, targetSalePrice: usdUnits(85_000) };
      await repo.economics.save(changed);
      expect(await repo.economics.findByProject(CONTRACT_PROJECT_ID)).toEqual(changed);
      expect(await repo.economics.list()).toHaveLength(before);
    });

    it("economía: centavos no enteros se rechazan con INVALID_RECORD", async () => {
      const r = await repo.economics.save({
        ...contractEconomics,
        acquisitionCost: { cents: 10.5, currency: "USD" } as ProjectEconomics["acquisitionCost"],
      });
      expect(!r.ok && r.error.code).toBe("INVALID_RECORD");
      expect(await repo.economics.findByProject(CONTRACT_PROJECT_ID)).toBeNull();
    });

    it("economía: un reemplazo rechazado deja intacta la versión guardada", async () => {
      await repo.economics.save(contractEconomics);
      const r = await repo.economics.save({
        ...contractEconomics,
        acquisitionCost: { cents: 10.5, currency: "USD" } as ProjectEconomics["acquisitionCost"],
      });
      expect(!r.ok && r.error.code).toBe("INVALID_RECORD");
      expect(await repo.economics.findByProject(CONTRACT_PROJECT_ID)).toEqual(contractEconomics);
    });

    it("presupuesto: save conserva las líneas y su orden", async () => {
      await repo.economics.save(contractEconomics);
      expect(await repo.budgets.save(contractBudget)).toEqual({ ok: true, value: contractBudget });
      expect(await repo.budgets.findByProject(CONTRACT_PROJECT_ID)).toEqual(contractBudget);
    });

    it("presupuesto: guardar de nuevo reemplaza todas las líneas", async () => {
      await repo.economics.save(contractEconomics);
      await repo.budgets.save(contractBudget);
      const changed: ProjectBudget = {
        projectId: CONTRACT_PROJECT_ID,
        lines: [
          { item: "floors_paint", amount: usdUnits(5_000) },
          { item: "management_fee", amount: usdUnits(2_500) },
          { item: "contingency", amount: usdUnits(1_500) },
          { item: "reserve", amount: usdUnits(1_000) },
        ],
      };
      await repo.budgets.save(changed);
      expect(await repo.budgets.findByProject(CONTRACT_PROJECT_ID)).toEqual(changed);
    });

    it("presupuesto: sin economía del proyecto se rechaza con REFERENCE_NOT_FOUND", async () => {
      const r = await repo.budgets.save(contractBudget);
      expect(!r.ok && r.error.code).toBe("REFERENCE_NOT_FOUND");
      expect(await repo.budgets.findByProject(CONTRACT_PROJECT_ID)).toBeNull();
    });

    it("presupuesto: un reemplazo rechazado deja todas las líneas anteriores", async () => {
      await repo.economics.save(contractEconomics);
      await repo.budgets.save(contractBudget);
      const r = await repo.budgets.save({
        projectId: CONTRACT_PROJECT_ID,
        lines: [
          { item: "kitchen", amount: usdUnits(5_000) },
          { item: "pool", amount: usdUnits(5_000) },
        ],
      } as unknown as ProjectBudget);
      expect(!r.ok && r.error.code).toBe("INVALID_RECORD");
      expect(await repo.budgets.findByProject(CONTRACT_PROJECT_ID)).toEqual(contractBudget);
    });

    it("presupuesto: un rubro desconocido se rechaza con INVALID_RECORD", async () => {
      await repo.economics.save(contractEconomics);
      const r = await repo.budgets.save({
        projectId: CONTRACT_PROJECT_ID,
        lines: [{ item: "pool", amount: usdUnits(10_000) }],
      } as unknown as ProjectBudget);
      expect(!r.ok && r.error.code).toBe("INVALID_RECORD");
      expect(await repo.budgets.findByProject(CONTRACT_PROJECT_ID)).toBeNull();
    });
  });
}
