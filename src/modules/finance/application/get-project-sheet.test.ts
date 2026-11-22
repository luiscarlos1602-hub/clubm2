import { describe, expect, it } from "vitest";
import { buildProjectSheet } from "../domain/build-project-sheet";
import { CREATE_CTX, PUBLISHABLE_INPUT } from "../domain/project-sheet.test-fixtures";
import { createGetProjectSheet, type GetProjectSheetDeps } from "./get-project-sheet";

const built = buildProjectSheet(PUBLISHABLE_INPUT, CREATE_CTX);
if (!built.ok) throw new Error("fixture inválida");
const sheet = built.value;

function deps(over: Partial<GetProjectSheetDeps> = {}): GetProjectSheetDeps {
  return {
    projects: { findBySlug: (s) => Promise.resolve(s === sheet.project.slug ? sheet.project : null) },
    properties: { findById: () => Promise.resolve(sheet.property) },
    content: {
      profileOf: () => Promise.resolve(sheet.profile),
      processOf: () => Promise.resolve(sheet.process),
      updatesOf: () => Promise.resolve([]),
      risksOf: () => Promise.resolve(sheet.risks),
    },
    classes: { findByProject: () => Promise.resolve(sheet.participationClass) },
    economics: { findByProject: () => Promise.resolve(sheet.economics) },
    budgets: { findByProject: () => Promise.resolve(sheet.budget) },
    media: { imagesOf: () => Promise.resolve(sheet.images) },
    ...over,
  };
}

describe("getProjectSheet", () => {
  it("reúne todas las partes de la ficha por slug", async () => {
    expect(await createGetProjectSheet(deps())(sheet.project.slug)).toEqual(sheet);
  });

  it("slug desconocido: null", async () => {
    expect(await createGetProjectSheet(deps())("nada")).toBeNull();
  });

  it("sin imágenes guardadas usa las SVG de referencia por código", async () => {
    const r = await createGetProjectSheet(deps({ media: { imagesOf: () => Promise.resolve([]) } }))(
      sheet.project.slug,
    );
    expect(r?.images.map((i) => i.kind)).toEqual(["before", "after", "projection"]);
    expect(r?.images.every((i) => i.isReference && i.url.includes("/m2-008/"))).toBe(true);
  });

  it("sin economía rechaza con el slug", async () => {
    const get = createGetProjectSheet(deps({ economics: { findByProject: () => Promise.resolve(null) } }));
    await expect(get(sheet.project.slug)).rejects.toThrow(/falta la economía/);
  });
});
