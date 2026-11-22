import { describe, expect, it } from "vitest";
import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { memorySlice } from "@/shared/infrastructure/demo-store";
import { createProjectMediaMockRepository } from "./projects.media";
import { buildProjectsSeed, projectsSliceSchema } from "./seed";

describe("imágenes del slice projects", () => {
  it("la semilla no guarda imágenes (se resuelven por código)", () => {
    expect(buildProjectsSeed(fixedClock(isoDate("2026-11-22"))).images).toEqual([]);
  });

  it("un snapshot guardado antes de W-2 (sin `images`) se lee sin reiniciar", () => {
    const { images: _omit, ...old } = buildProjectsSeed(fixedClock(isoDate("2026-11-22")));
    const parsed = projectsSliceSchema.safeParse(old);
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.images).toEqual([]);
  });

  it("la biblioteca lista las 21 SVG de public/images/proyectos/", async () => {
    const lib = await createProjectMediaMockRepository(
      memorySlice(buildProjectsSeed(fixedClock(isoDate("2026-11-22")))),
    ).referenceLibrary();
    expect(lib).toHaveLength(21);
    expect(lib[0]?.url).toBe("/images/proyectos/m2-001/antes.svg");
    expect(new Set(lib.map((o) => o.url)).size).toBe(21);
  });
});
