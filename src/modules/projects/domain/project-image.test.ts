import { describe, expect, it } from "vitest";
import { asId } from "@/shared/domain/id";
import type { ProjectCode, ProjectId } from "./project";
import {
  PROJECT_IMAGE_KINDS,
  imagesFromChoices,
  referenceImageAlt,
  referenceImageUrl,
  referenceImagesFor,
  resolveProjectImages,
  type ProjectImage,
} from "./project-image";

const project = { id: asId<"Project">("prj_new_01") as ProjectId, code: "M2-001" as ProjectCode };

describe("project-image (plan 011 §3)", () => {
  it("tipos: antes, después y proyección (sin galería hasta DB-3)", () => {
    expect(PROJECT_IMAGE_KINDS).toEqual(["before", "after", "projection"]);
  });

  it("referenceImageUrl apunta a las ilustraciones por código", () => {
    expect(referenceImageUrl(project.code, "before")).toBe("/images/proyectos/m2-001/antes.svg");
    expect(referenceImageUrl(project.code, "after")).toBe("/images/proyectos/m2-001/despues.svg");
    expect(referenceImageUrl(project.code, "projection")).toBe(
      "/images/proyectos/m2-001/proyeccion.svg",
    );
  });

  it("referenceImagesFor: las tres SVG del código, marcadas como referencia y con alt", () => {
    const images = referenceImagesFor(project);
    expect(images.map((i) => i.kind)).toEqual(["before", "after", "projection"]);
    for (const image of images) {
      expect(image.projectId).toBe(project.id);
      expect(image.isReference).toBe(true);
      expect(image.alt.length).toBeGreaterThan(0);
    }
  });

  it("resolveProjectImages: sin guardadas → respaldo por código", () => {
    expect(resolveProjectImages(project, [])).toEqual(referenceImagesFor(project));
  });

  it("resolveProjectImages: con guardadas → solo las guardadas, en el orden de los tipos", () => {
    const stored: readonly ProjectImage[] = [
      {
        projectId: project.id,
        kind: "projection",
        url: "/images/proyectos/m2-004/proyeccion.svg",
        alt: "p",
        isReference: true,
      },
      {
        projectId: project.id,
        kind: "before",
        url: "/images/proyectos/m2-002/antes.svg",
        alt: "a",
        isReference: true,
      },
    ];
    expect(resolveProjectImages(project, stored).map((i) => i.url)).toEqual([
      "/images/proyectos/m2-002/antes.svg",
      "/images/proyectos/m2-004/proyeccion.svg",
    ]);
  });

  it("imagesFromChoices: elegidas de la biblioteca → referencia con alt, en el orden de los tipos y sin espacios", () => {
    const images = imagesFromChoices(project.id, [
      { kind: "projection", url: " /images/proyectos/m2-004/proyeccion.svg " },
      { kind: "before", url: "/images/proyectos/m2-002/antes.svg" },
    ]);
    expect(images).toEqual([
      {
        projectId: project.id,
        kind: "before",
        url: "/images/proyectos/m2-002/antes.svg",
        alt: referenceImageAlt("before"),
        isReference: true,
      },
      {
        projectId: project.id,
        kind: "projection",
        url: "/images/proyectos/m2-004/proyeccion.svg",
        alt: referenceImageAlt("projection"),
        isReference: true,
      },
    ]);
  });
});
