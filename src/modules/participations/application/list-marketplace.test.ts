import { describe, expect, it, vi } from "vitest";
import { referenceImagesFor, type Project, type ProjectCode, type ProjectImage, type Property } from "@/modules/projects";
import { isoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import { usdUnits } from "@/shared/domain/money";
import { buildMarketplaceListing } from "../domain/marketplace-listing";
import type { ParticipationClass } from "../domain/participation";
import { createListMarketplace, type ListMarketplaceDeps } from "./list-marketplace";

const PROJECTS: readonly Project[] = [
  {
    id: asId("prj_t_006"),
    code: "M2-006" as ProjectCode,
    slug: "m2-006-chacao",
    name: "Proyecto 006",
    propertyId: asId("ppt_t_006"),
    status: "funding",
    timeline: { acquiredOn: isoDate("2026-10-01"), saleSignedOn: null, settledOn: null },
  },
  {
    id: asId("prj_t_007"),
    code: "M2-007" as ProjectCode,
    slug: "m2-007-zona",
    name: "Proyecto 007",
    propertyId: asId("ppt_t_007"),
    status: "due_diligence",
    timeline: { acquiredOn: null, saleSignedOn: null, settledOn: null },
  },
];
const PROPERTIES: readonly Property[] = [
  { id: asId("ppt_t_006"), city: "Caracas", zone: "Chacao", kind: "apartment", areaM2: 80 },
  { id: asId("ppt_t_007"), city: "Caracas", zone: "Otra", kind: "apartment", areaM2: 90 },
];
const CLASSES: readonly ParticipationClass[] = [
  {
    id: asId("pcl_t_006"),
    projectId: asId("prj_t_006"),
    total: 100,
    placed: 63,
    unitPrice: usdUnits(100),
  },
];

function fakeDeps(): ListMarketplaceDeps & {
  readonly spies: {
    projects: ReturnType<typeof vi.fn>;
    properties: ReturnType<typeof vi.fn>;
    classes: ReturnType<typeof vi.fn>;
    images: ReturnType<typeof vi.fn>;
  };
} {
  const spies = {
    projects: vi.fn(async () => PROJECTS),
    properties: vi.fn(async () => PROPERTIES),
    classes: vi.fn(async () => CLASSES),
    images: vi.fn(async () => [] as readonly ProjectImage[]),
  };
  return {
    projects: { list: spies.projects },
    properties: { list: spies.properties },
    classes: { list: spies.classes },
    media: { imagesOf: spies.images },
    spies,
  };
}

describe("createListMarketplace", () => {
  it("lee cada repositorio una vez y delega en buildMarketplaceListing", async () => {
    const deps = fakeDeps();
    const result = await createListMarketplace(deps)();
    expect(deps.spies.projects).toHaveBeenCalledTimes(1);
    expect(deps.spies.properties).toHaveBeenCalledTimes(1);
    expect(deps.spies.classes).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      buildMarketplaceListing({ projects: PROJECTS, properties: PROPERTIES, classes: CLASSES, images: [] }),
    );
    expect(result.map((l) => l.code)).toEqual(["M2-006"]);
  });

  it("un throw síncrono de un repositorio se convierte en promesa rechazada", async () => {
    const deps = fakeDeps();
    const failing: ListMarketplaceDeps = {
      ...deps,
      classes: {
        list: () => {
          throw new Error("almacenamiento corrupto");
        },
      },
    };
    const run = createListMarketplace(failing);
    let promise: Promise<unknown> | undefined;
    expect(() => {
      promise = run();
    }).not.toThrow();
    await expect(promise).rejects.toThrow("almacenamiento corrupto");
  });

  it("un rechazo asíncrono de un repositorio se propaga", async () => {
    const deps = fakeDeps();
    const failing: ListMarketplaceDeps = {
      ...deps,
      projects: { list: () => Promise.reject(new Error("sin datos")) },
    };
    await expect(createListMarketplace(failing)()).rejects.toThrow("sin datos");
  });

  it("sin imágenes guardadas usa las SVG por código; con guardadas, las suyas", async () => {
    const deps = fakeDeps();
    const [bare] = await createListMarketplace(deps)();
    expect(bare?.images).toEqual(referenceImagesFor(PROJECTS[0]!));

    const mine: ProjectImage = {
      projectId: PROJECTS[0]!.id,
      kind: "before",
      url: "/images/proyectos/m2-003/antes.svg",
      alt: "Imagen",
      isReference: true,
    };
    deps.spies.images.mockImplementation(async (id: unknown) => (id === PROJECTS[0]!.id ? [mine] : []));
    const [custom] = await createListMarketplace(deps)();
    expect(custom?.images).toEqual([mine]);
  });
});
