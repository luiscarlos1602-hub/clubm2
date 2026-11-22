import { beforeEach, describe, expect, it } from "vitest";
import type { ParticipationClassRepository } from "@/modules/participations"; // SOLO import type (D2)
import type {
  ProjectContentRepository,
  ProjectMediaRepository,
  ProjectRepository,
  PropertyRepository,
} from "@/modules/projects";
import { asId } from "@/shared/domain/id";
import { usdUnits } from "@/shared/domain/money";
import { buildProjectSheet } from "../domain/build-project-sheet";
import type { ProjectSheet } from "../domain/project-sheet";
import { CREATE_CTX, PUBLISHABLE_INPUT } from "../domain/project-sheet.test-fixtures";
import type { ProjectBudgetRepository, ProjectEconomicsRepository, ProjectSheetWriter } from "./ports";

export type ProjectSheetWriterContractSubject = {
  readonly writer: ProjectSheetWriter;
  readonly projects: ProjectRepository;
  readonly properties: PropertyRepository;
  readonly content: ProjectContentRepository;
  readonly media: ProjectMediaRepository;
  readonly classes: ParticipationClassRepository;
  readonly economics: ProjectEconomicsRepository;
  readonly budgets: ProjectBudgetRepository;
};

function mustBuild(sheet: ReturnType<typeof buildProjectSheet>): ProjectSheet {
  if (!sheet.ok) throw new Error(`la ficha del contrato no es válida: ${JSON.stringify(sheet.error)}`);
  return sheet.value;
}

/**
 * Suite de contrato de `ProjectSheetWriter` (W-2), contra el puerto y los repos de lectura de todos los módulos.
 * El sujeto parte de las semillas (M2-001…M2-007). La reutiliza el adaptador Supabase (DB-4).
 */
export function describeProjectSheetWriterContract(
  label: string,
  setup: () => ProjectSheetWriterContractSubject | Promise<ProjectSheetWriterContractSubject>,
): void {
  describe(`Contrato de ProjectSheetWriter · ${label}`, () => {
    let subject: ProjectSheetWriterContractSubject;
    let sheet: ProjectSheet;

    beforeEach(async () => {
      subject = await setup();
      sheet = mustBuild(buildProjectSheet(PUBLISHABLE_INPUT, CREATE_CTX));
    });

    it("alta: save devuelve la ficha y todas las partes quedan legibles", async () => {
      const r = await subject.writer.save(sheet);
      expect(r).toEqual({ ok: true, value: sheet });
      const { project, property } = sheet;
      expect(await subject.projects.findBySlug(project.slug)).toEqual(project);
      expect(await subject.properties.findById(property.id)).toEqual(property);
      expect(await subject.content.profileOf(property.id)).toEqual(sheet.profile);
      expect(await subject.content.processOf(project.id)).toEqual(sheet.process);
      expect(await subject.content.risksOf(project.id)).toEqual(sheet.risks);
      expect(await subject.classes.findByProject(project.id)).toEqual(sheet.participationClass);
      expect(await subject.economics.findByProject(project.id)).toEqual(sheet.economics);
      expect(await subject.budgets.findByProject(project.id)).toEqual(sheet.budget);
      expect(await subject.media.imagesOf(project.id)).toEqual(sheet.images);
    });

    it("código o slug repetido: DUPLICATE y no se escribe nada", async () => {
      await subject.writer.save(sheet);
      const other = {
        projectId: asId<"Project">("prj_otro_01"),
        propertyId: asId<"Property">("prp_otro_01"),
        classId: asId<"ParticipationClass">("cls_otro_01"),
      };
      const clash = mustBuild(buildProjectSheet(PUBLISHABLE_INPUT, { ...CREATE_CTX, ids: other }));
      expect(clash.project.code).toBe(sheet.project.code);
      const r = await subject.writer.save(clash);
      expect(!r.ok && r.error.code).toBe("DUPLICATE");
      expect(await subject.projects.findById(other.projectId)).toBeNull();
      expect(await subject.properties.findById(other.propertyId)).toBeNull();
      expect(await subject.classes.findByProject(other.projectId)).toBeNull();
      expect(await subject.economics.findByProject(other.projectId)).toBeNull();
      expect(await subject.budgets.findByProject(other.projectId)).toBeNull();
      expect(await subject.media.imagesOf(other.projectId)).toEqual([]);
      expect(await subject.content.profileOf(other.propertyId)).toBeNull();
      expect((await subject.projects.list()).filter((p) => p.code === sheet.project.code)).toHaveLength(1);
    });

    it("edición: reemplaza las partes sin duplicar filas", async () => {
      await subject.writer.save(sheet);
      const before = (await subject.projects.list()).length;
      const edited = mustBuild(
        buildProjectSheet(
          {
            ...PUBLISHABLE_INPUT,
            projectId: sheet.project.id,
            project: { ...PUBLISHABLE_INPUT.project, name: "Apartamento renombrado" },
            participationClass: { total: 80, unitPrice: usdUnits(125) },
            images: [
              { kind: "projection", url: "/images/proyectos/m2-005/proyeccion.svg" },
              { kind: "before", url: "/images/proyectos/m2-005/antes.svg" },
              { kind: "after", url: "/images/proyectos/m2-005/despues.svg" },
            ],
          },
          { ...CREATE_CTX, existing: sheet },
        ),
      );
      expect(await subject.writer.save(edited)).toEqual({ ok: true, value: edited });
      expect(await subject.projects.list()).toHaveLength(before);
      expect(await subject.projects.findBySlug(sheet.project.slug)).toEqual(edited.project);
      expect((await subject.classes.list()).filter((c) => c.projectId === sheet.project.id)).toHaveLength(1);
      expect(await subject.classes.findByProject(sheet.project.id)).toEqual(edited.participationClass);
      expect(await subject.media.imagesOf(sheet.project.id)).toEqual(edited.images);
      expect((await subject.media.imagesOf(sheet.project.id)).length).toBe(3);
    });
  });
}
