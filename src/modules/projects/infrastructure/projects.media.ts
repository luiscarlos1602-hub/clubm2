import { brand } from "@/shared/config/brand";
import { err, ok } from "@/shared/domain/result";
import type { SliceReader, SliceStore } from "@/shared/infrastructure/demo-store";
import { parseRecord } from "@/shared/infrastructure/zod-schemas";
import type {
  ProjectMediaRepository,
  ProjectMediaWriter,
  ReferenceImageOption,
} from "../application/ports";
import {
  PROJECT_IMAGE_KINDS,
  referenceImageUrl,
  type ProjectImage,
  type ProjectImageKind,
} from "../domain/project-image";
import { imageSchema, type ProjectsSlice } from "./seed";

/** Cantidad de proyectos de ejemplo con SVG en `public/images/proyectos/` (m2-001…m2-007). */
const LIBRARY_PROJECTS = 7;

const KIND_LABEL: Readonly<Record<ProjectImageKind, string>> = {
  before: "Antes",
  after: "Después",
  projection: "Proyección",
};

/** Las 21 ilustraciones de referencia locales (7 proyectos × 3 tipos). DB-3: el bucket. */
function buildReferenceLibrary(): readonly ReferenceImageOption[] {
  const options: ReferenceImageOption[] = [];
  for (let n = 1; n <= LIBRARY_PROJECTS; n += 1) {
    const code = `${brand.shortName}-${String(n).padStart(3, "0")}`;
    for (const kind of PROJECT_IMAGE_KINDS) {
      options.push({ url: referenceImageUrl(code, kind), kind, label: `${code} · ${KIND_LABEL[kind]}` });
    }
  }
  return options;
}

export function createProjectMediaMockRepository(source: SliceReader<ProjectsSlice>): ProjectMediaRepository {
  const library = buildReferenceLibrary();
  return {
    imagesOf: (projectId) => Promise.resolve(source.read().images.filter((i) => i.projectId === projectId)),
    referenceLibrary: () => Promise.resolve(library),
  };
}

export function createProjectMediaMockWriter(source: SliceStore<ProjectsSlice>): ProjectMediaWriter {
  return {
    replaceImages(projectId, images) {
      const next: ProjectImage[] = [];
      for (const image of images) {
        const parsed = parseRecord<ProjectImage>(imageSchema, image);
        if (!parsed.ok) return Promise.resolve(parsed);
        next.push(parsed.value);
      }
      if (!source.read().projects.some((p) => p.id === projectId)) {
        return Promise.resolve(err("REFERENCE_NOT_FOUND", `no existe el proyecto ${projectId}`));
      }
      if (next.some((i) => i.projectId !== projectId)) {
        return Promise.resolve(err("REFERENCE_NOT_FOUND", `hay imágenes de otro proyecto que ${projectId}`));
      }
      const kinds = new Set<ProjectImageKind>();
      for (const image of next) {
        if (kinds.has(image.kind)) return Promise.resolve(err("DUPLICATE", `dos imágenes del tipo ${image.kind}`));
        kinds.add(image.kind);
      }
      source.update((s) => ({
        ...s,
        images: [...s.images.filter((i) => i.projectId !== projectId), ...next],
      }));
      return Promise.resolve(ok(next));
    },
  };
}
