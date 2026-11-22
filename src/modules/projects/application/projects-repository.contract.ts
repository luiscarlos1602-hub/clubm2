import { beforeEach, describe, expect, it } from "vitest";
import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { asId } from "@/shared/domain/id";
import type { Project, ProjectCode, Property } from "../domain/project";
import type { ProjectStatus } from "../domain/project-status";
import { createChangeProjectStage } from "./change-project-stage";
import type { ProjectRepository, ProjectWriter, PropertyRepository, PropertyWriter } from "./ports";

export type ProjectsRepositoryContractSubject = {
  readonly projects: ProjectRepository & ProjectWriter;
  readonly properties: PropertyRepository & PropertyWriter;
};

/** Ids y códigos propios del contrato: no chocan con las semillas ni con datos reales. */
export const contractProperty: Property = {
  id: asId<"Property">("prop_contrato_01"),
  city: "Caracas",
  zone: "Altamira",
  kind: "apartment",
  areaM2: 95,
};

export const contractProject: Project = {
  id: asId<"Project">("prj_contrato_01"),
  code: "QA-901" as ProjectCode,
  slug: "qa-901-altamira",
  name: "Apartamento en Altamira",
  propertyId: contractProperty.id,
  status: "funding",
  timeline: { acquiredOn: isoDate("2026-10-01"), saleSignedOn: null, settledOn: null },
};

/**
 * Suite de contrato de los puertos de projects (W-1), escrita contra el puerto y no contra el mock.
 * La ejecutan el repositorio mock y, en DB-4, el adaptador Supabase. `setup` debe dar un repositorio
 * aislado (vacío o con semillas); el contrato solo usa sus propios ids.
 */
export function describeProjectsRepositoryContract(
  label: string,
  setup: () => ProjectsRepositoryContractSubject | Promise<ProjectsRepositoryContractSubject>,
): void {
  describe(`Contrato de repositorios de projects · ${label}`, () => {
    let repo: ProjectsRepositoryContractSubject;

    beforeEach(async () => {
      repo = await setup();
    });

    it("inmueble: save lo devuelve y queda legible por id y en list", async () => {
      const saved = await repo.properties.save(contractProperty);
      expect(saved).toEqual({ ok: true, value: contractProperty });
      expect(await repo.properties.findById(contractProperty.id)).toEqual(contractProperty);
      expect(
        (await repo.properties.list()).filter((p) => p.id === contractProperty.id),
      ).toHaveLength(1);
    });

    it("inmueble: save con el mismo id reemplaza, no duplica", async () => {
      await repo.properties.save(contractProperty);
      const before = (await repo.properties.list()).length;
      await repo.properties.save({ ...contractProperty, areaM2: 120 });
      expect((await repo.properties.findById(contractProperty.id))?.areaM2).toBe(120);
      expect(await repo.properties.list()).toHaveLength(before);
    });

    it("inmueble: un registro fuera de esquema se rechaza con INVALID_RECORD y no se guarda", async () => {
      const r = await repo.properties.save({ ...contractProperty, areaM2: 0 });
      expect(!r.ok && r.error.code).toBe("INVALID_RECORD");
      expect(await repo.properties.findById(contractProperty.id)).toBeNull();
    });

    it("inmueble: un reemplazo rechazado deja intacta la versión guardada", async () => {
      await repo.properties.save(contractProperty);
      const r = await repo.properties.save({ ...contractProperty, areaM2: 0 });
      expect(!r.ok && r.error.code).toBe("INVALID_RECORD");
      expect(await repo.properties.findById(contractProperty.id)).toEqual(contractProperty);
    });

    it("proyecto: save lo devuelve y queda legible por id, slug y en list ordenado por código", async () => {
      await repo.properties.save(contractProperty);
      const saved = await repo.projects.save(contractProject);
      expect(saved).toEqual({ ok: true, value: contractProject });
      expect(await repo.projects.findById(contractProject.id)).toEqual(contractProject);
      expect(await repo.projects.findBySlug(contractProject.slug)).toEqual(contractProject);
      const codes = (await repo.projects.list()).map((p) => p.code);
      expect(codes).toContain(contractProject.code);
      expect(codes).toEqual([...codes].sort());
    });

    it("proyecto: save con el mismo id reemplaza (cambio de nombre y de estado)", async () => {
      await repo.properties.save(contractProperty);
      await repo.projects.save(contractProject);
      const before = (await repo.projects.list()).length;
      const renamed: Project = {
        ...contractProject,
        name: "Apartamento renovado en Altamira",
        status: "renovation",
      };
      expect((await repo.projects.save(renamed)).ok).toBe(true);
      expect(await repo.projects.findById(contractProject.id)).toEqual(renamed);
      expect(await repo.projects.list()).toHaveLength(before);
    });

    it("proyecto: otro id con el mismo código o slug se rechaza con DUPLICATE y no cambia nada", async () => {
      await repo.properties.save(contractProperty);
      await repo.projects.save(contractProject);
      const before = await repo.projects.list();
      const other = { ...contractProject, id: asId<"Project">("prj_contrato_02") };
      const sameCode = await repo.projects.save({ ...other, slug: "qa-902-altamira" });
      const sameSlug = await repo.projects.save({ ...other, code: "QA-902" as ProjectCode });
      expect(!sameCode.ok && sameCode.error.code).toBe("DUPLICATE");
      expect(!sameSlug.ok && sameSlug.error.code).toBe("DUPLICATE");
      expect(await repo.projects.findById(other.id)).toBeNull();
      expect(await repo.projects.list()).toEqual(before);
    });

    it("proyecto: un reemplazo rechazado deja intacta la versión guardada", async () => {
      await repo.properties.save(contractProperty);
      await repo.projects.save(contractProject);
      const r = await repo.projects.save({ ...contractProject, slug: "Con Espacios" });
      expect(!r.ok && r.error.code).toBe("INVALID_RECORD");
      expect(await repo.projects.findById(contractProject.id)).toEqual(contractProject);
    });

    it("proyecto: un inmueble inexistente se rechaza con REFERENCE_NOT_FOUND", async () => {
      const r = await repo.projects.save(contractProject);
      expect(!r.ok && r.error.code).toBe("REFERENCE_NOT_FOUND");
      expect(await repo.projects.findById(contractProject.id)).toBeNull();
    });

    it("proyecto: un registro fuera de esquema se rechaza con INVALID_RECORD", async () => {
      await repo.properties.save(contractProperty);
      const badSlug = await repo.projects.save({ ...contractProject, slug: "Con Espacios" });
      const badCode = await repo.projects.save({ ...contractProject, code: "m2-1" as ProjectCode });
      expect(!badSlug.ok && badSlug.error.code).toBe("INVALID_RECORD");
      expect(!badCode.ok && badCode.error.code).toBe("INVALID_RECORD");
      expect(await repo.projects.findById(contractProject.id)).toBeNull();
    });
    it("etapa (W-3): la compra sellada se relee igual por id, slug y list", async () => {
      await repo.properties.save(contractProperty);
      const inReview: Project = {
        ...contractProject,
        status: "due_diligence",
        timeline: { acquiredOn: null, saleSignedOn: null, settledOn: null },
      };
      await repo.projects.save(inReview);
      const bought: Project = {
        ...inReview,
        status: "acquired",
        timeline: { ...inReview.timeline, acquiredOn: isoDate("2026-11-20") },
      };
      expect(await repo.projects.save(bought)).toEqual({ ok: true, value: bought });
      expect(await repo.projects.findById(bought.id)).toEqual(bought);
      expect(await repo.projects.findBySlug(bought.slug)).toEqual(bought);
      expect((await repo.projects.list()).find((p) => p.id === bought.id)).toEqual(bought);
    });

    it("etapa (W-3): changeProjectStage recorre B2 → B3 sobre el puerto y cada paso queda guardado", async () => {
      await repo.properties.save(contractProperty);
      await repo.projects.save({
        ...contractProject,
        status: "opportunity",
        timeline: { acquiredOn: null, saleSignedOn: null, settledOn: null },
      });
      const today = isoDate("2026-11-22");
      const change = createChangeProjectStage({
        projects: repo.projects,
        clock: fixedClock(today),
        publishGuard: () => Promise.resolve([]),
      });
      const path: readonly ProjectStatus[] = [
        "due_diligence",
        "acquired",
        "funding",
        "renovation",
        "on_sale",
        "stalled",
        "on_sale",
      ];
      for (const to of path) {
        const r = await change(contractProject.id, to);
        expect(r.ok, `→ ${to}`).toBe(true);
        expect((await repo.projects.findById(contractProject.id))?.status).toBe(to);
      }
      const final = await repo.projects.findBySlug(contractProject.slug);
      expect(final?.timeline).toEqual({ acquiredOn: today, saleSignedOn: null, settledOn: null });
    });

    it("etapa (W-3): un cambio rechazado no toca lo guardado", async () => {
      await repo.properties.save(contractProperty);
      await repo.projects.save(contractProject);
      const change = createChangeProjectStage({
        projects: repo.projects,
        clock: fixedClock(isoDate("2026-11-22")),
        publishGuard: () => Promise.resolve([]),
      });
      const r = await change(contractProject.id, "opportunity");
      expect(!r.ok && r.error.code).toBe("INVALID_TRANSITION");
      expect(await repo.projects.findById(contractProject.id)).toEqual(contractProject);
    });
  });
}
