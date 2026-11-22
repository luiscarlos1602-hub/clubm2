import { beforeEach, describe, expect, it } from "vitest";
import { asId } from "@/shared/domain/id";
import type { ProjectProcess } from "../domain/process";
import type { ProjectImage } from "../domain/project-image";
import type { ProjectRisks } from "../domain/project-risk";
import type { PropertyProfile } from "../domain/property-profile";
import { contractProject, contractProperty } from "./projects-repository.contract";
import type {
  ProjectContentRepository,
  ProjectContentWriter,
  ProjectMediaRepository,
  ProjectMediaWriter,
  ProjectRepository,
  ProjectWriter,
  PropertyRepository,
  PropertyWriter,
} from "./ports";

export type ProjectContentContractSubject = {
  readonly projects: ProjectRepository & ProjectWriter;
  readonly properties: PropertyRepository & PropertyWriter;
  readonly content: ProjectContentRepository & ProjectContentWriter;
  readonly media: ProjectMediaRepository & ProjectMediaWriter;
};

const profile: PropertyProfile = {
  propertyId: contractProperty.id,
  description: "Apartamento de ejemplo para el contrato.",
  highlights: ["Dos baños", "Cocina integrada"],
};

const process: ProjectProcess = {
  projectId: contractProject.id,
  steps: {
    works_start: { status: "done", offsetDays: 10, started: true },
    works_50: { status: "current", offsetDays: 40, started: true },
    works_80: { status: "upcoming", offsetDays: 70, started: false },
    sale_start: { status: "upcoming", offsetDays: 90, started: false },
    on_sale: { status: "upcoming", offsetDays: 100, started: false },
    sold: { status: "upcoming", offsetDays: 130, started: false },
  },
};

const risks: ProjectRisks = {
  projectId: contractProject.id,
  kinds: ["sale_below_target", "works_overrun", "slow_sale"],
};

const image = (kind: ProjectImage["kind"], file: string): ProjectImage => ({
  projectId: contractProject.id,
  kind,
  url: `/images/proyectos/m2-001/${file}.svg`,
  alt: `Imagen ${kind}`,
  isReference: true,
});
const before = image("before", "antes");
const after = image("after", "despues");
const projection = image("projection", "proyeccion");

/**
 * Suite de contrato de los puertos de contenido e imágenes de projects (W-2), escrita contra los puertos.
 * La ejecutan el mock y, en DB-4, el adaptador Supabase. `setup` debe dar un almacén aislado; la suite crea
 * su propio inmueble y proyecto (ids del contrato de W-1).
 */
export function describeProjectContentContract(
  label: string,
  setup: () => ProjectContentContractSubject | Promise<ProjectContentContractSubject>,
): void {
  describe(`Contrato de contenido e imágenes de projects · ${label}`, () => {
    let s: ProjectContentContractSubject;

    beforeEach(async () => {
      s = await setup();
      await s.properties.save(contractProperty);
      await s.projects.save(contractProject);
    });

    it("perfil: save es legible y un segundo save reemplaza, no duplica", async () => {
      expect(await s.content.saveProfile(profile)).toEqual({ ok: true, value: profile });
      expect(await s.content.profileOf(contractProperty.id)).toEqual(profile);
      await s.content.saveProfile({ ...profile, description: "Otra descripción." });
      expect((await s.content.profileOf(contractProperty.id))?.description).toBe("Otra descripción.");
    });

    it("proceso: upsert por proyecto", async () => {
      expect(await s.content.saveProcess(process)).toEqual({ ok: true, value: process });
      const moved = { ...process, steps: { ...process.steps, sold: { status: "upcoming" as const, offsetDays: 150, started: false } } };
      await s.content.saveProcess(moved);
      expect(await s.content.processOf(contractProject.id)).toEqual(moved);
    });

    it("riesgos: upsert por proyecto", async () => {
      expect(await s.content.saveRisks(risks)).toEqual({ ok: true, value: risks });
      await s.content.saveRisks({ ...risks, kinds: ["slow_sale"] });
      expect((await s.content.risksOf(contractProject.id))?.kinds).toEqual(["slow_sale"]);
    });

    it("rechaza un registro inválido con INVALID_RECORD y no cambia nada", async () => {
      await s.content.saveProfile(profile);
      const bad = await s.content.saveProfile({ ...profile, description: "" });
      expect(bad.ok ? null : bad.error.code).toBe("INVALID_RECORD");
      expect((await s.content.profileOf(contractProperty.id))?.description).toBe(profile.description);
    });

    it("rechaza con REFERENCE_NOT_FOUND si el inmueble o el proyecto no existen", async () => {
      const ghostProperty = await s.content.saveProfile({ ...profile, propertyId: asId<"Property">("prop_fantasma") });
      expect(ghostProperty.ok ? null : ghostProperty.error.code).toBe("REFERENCE_NOT_FOUND");
      const ghost = asId<"Project">("prj_fantasma");
      const p = await s.content.saveProcess({ ...process, projectId: ghost });
      const r = await s.content.saveRisks({ ...risks, projectId: ghost });
      expect(p.ok ? null : p.error.code).toBe("REFERENCE_NOT_FOUND");
      expect(r.ok ? null : r.error.code).toBe("REFERENCE_NOT_FOUND");
      expect(await s.content.processOf(ghost)).toBeNull();
      expect(await s.content.risksOf(ghost)).toBeNull();
    });

    it("imágenes: sin guardar, imagesOf es vacío", async () => {
      expect(await s.media.imagesOf(contractProject.id)).toEqual([]);
    });

    it("imágenes: replaceImages guarda el juego y un segundo reemplaza el juego entero", async () => {
      const first = await s.media.replaceImages(contractProject.id, [before, after, projection]);
      expect(first.ok).toBe(true);
      expect(await s.media.imagesOf(contractProject.id)).toHaveLength(3);
      const second = { ...before, url: "/images/proyectos/m2-002/antes.svg" };
      await s.media.replaceImages(contractProject.id, [second]);
      expect(await s.media.imagesOf(contractProject.id)).toEqual([second]);
      await s.media.replaceImages(contractProject.id, []);
      expect(await s.media.imagesOf(contractProject.id)).toEqual([]);
    });

    it("imágenes: dos del mismo tipo → DUPLICATE y no cambia nada", async () => {
      await s.media.replaceImages(contractProject.id, [before]);
      const bad = await s.media.replaceImages(contractProject.id, [after, { ...after, url: "/images/proyectos/m2-002/despues.svg" }]);
      expect(bad.ok ? null : bad.error.code).toBe("DUPLICATE");
      expect(await s.media.imagesOf(contractProject.id)).toEqual([before]);
    });

    it("imágenes: proyecto inexistente → REFERENCE_NOT_FOUND; registro inválido → INVALID_RECORD", async () => {
      const ghost = asId<"Project">("prj_fantasma");
      const missing = await s.media.replaceImages(ghost, [{ ...before, projectId: ghost }]);
      expect(missing.ok ? null : missing.error.code).toBe("REFERENCE_NOT_FOUND");
      const invalid = await s.media.replaceImages(contractProject.id, [{ ...before, url: "" }]);
      expect(invalid.ok ? null : invalid.error.code).toBe("INVALID_RECORD");
      expect(await s.media.imagesOf(contractProject.id)).toEqual([]);
    });

    it("imágenes: las de un proyecto no aparecen en otro", async () => {
      await s.media.replaceImages(contractProject.id, [before]);
      expect(await s.media.imagesOf(asId<"Project">("prj_otro"))).toEqual([]);
    });

    it("biblioteca de referencia: 3 tipos por proyecto de ejemplo, con url y rótulo", async () => {
      const library = await s.media.referenceLibrary();
      expect(library.length).toBeGreaterThan(0);
      expect(library.length % 3).toBe(0);
      for (const o of library) {
        expect(o.url.length).toBeGreaterThan(0);
        expect(o.label.length).toBeGreaterThan(0);
      }
    });
  });
}
