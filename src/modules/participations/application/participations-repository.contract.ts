import { beforeEach, describe, expect, it } from "vitest";
import { asId } from "@/shared/domain/id";
import { usdUnits } from "@/shared/domain/money";
import type { ParticipationClass } from "../domain/participation";
import type { ParticipationClassRepository, ParticipationClassWriter } from "./ports";

export type ParticipationsRepositoryContractSubject = {
  readonly classes: ParticipationClassRepository & ParticipationClassWriter;
};

/** Clase propia del contrato. En Supabase (DB-4) `setup` debe crear antes el proyecto `prj_contrato_01` (FK). */
export const contractClass: ParticipationClass = {
  id: asId<"ParticipationClass">("pcl_contrato_01"),
  projectId: asId<"Project">("prj_contrato_01"),
  total: 100,
  placed: 0,
  unitPrice: usdUnits(100),
};

/** Suite de contrato de los puertos de participations (W-1); la reutiliza el adaptador Supabase (DB-4). */
export function describeParticipationsRepositoryContract(
  label: string,
  setup: () => ParticipationsRepositoryContractSubject | Promise<ParticipationsRepositoryContractSubject>,
): void {
  describe(`Contrato de repositorios de participations · ${label}`, () => {
    let repo: ParticipationsRepositoryContractSubject;

    beforeEach(async () => {
      repo = await setup();
    });

    it("clase: save la devuelve y queda legible por proyecto y en list", async () => {
      expect(await repo.classes.save(contractClass)).toEqual({ ok: true, value: contractClass });
      expect(await repo.classes.findByProject(contractClass.projectId)).toEqual(contractClass);
      expect((await repo.classes.list()).filter((c) => c.id === contractClass.id)).toHaveLength(1);
    });

    it("clase: save con el mismo id reemplaza (cambian las colocadas)", async () => {
      await repo.classes.save(contractClass);
      const before = (await repo.classes.list()).length;
      await repo.classes.save({ ...contractClass, placed: 40 });
      expect((await repo.classes.findByProject(contractClass.projectId))?.placed).toBe(40);
      expect(await repo.classes.list()).toHaveLength(before);
    });

    it("clase: otra clase para el mismo proyecto se rechaza con DUPLICATE", async () => {
      await repo.classes.save(contractClass);
      const r = await repo.classes.save({ ...contractClass, id: asId<"ParticipationClass">("pcl_contrato_02") });
      expect(!r.ok && r.error.code).toBe("DUPLICATE");
      expect((await repo.classes.findByProject(contractClass.projectId))?.id).toBe(contractClass.id);
    });

    it("clase: un total no entero se rechaza con INVALID_RECORD", async () => {
      const r = await repo.classes.save({ ...contractClass, total: 99.5 });
      expect(!r.ok && r.error.code).toBe("INVALID_RECORD");
      expect(await repo.classes.findByProject(contractClass.projectId)).toBeNull();
    });
  });
}
