import { describe, expect, it } from "vitest";
import { buildProjectSheet } from "../domain/build-project-sheet";
import { CREATE_CTX, MINIMAL_INPUT, PUBLISHABLE_INPUT } from "../domain/project-sheet.test-fixtures";
import { createCheckPublishReadiness } from "./check-publish-readiness";

const sheetOf = (input: typeof PUBLISHABLE_INPUT) => {
  const r = buildProjectSheet(input, CREATE_CTX);
  if (!r.ok) throw new Error("fixture inválida");
  return r.value;
};

describe("checkPublishReadiness (W-3)", () => {
  it("ficha completa: lista para publicar", async () => {
    const sheet = sheetOf(PUBLISHABLE_INPUT);
    const check = createCheckPublishReadiness({ getSheet: () => Promise.resolve(sheet) });
    expect(await check(sheet.project)).toEqual([]);
  });

  it("usa la etapa nueva del proyecto, no la guardada", async () => {
    const sheet = sheetOf(MINIMAL_INPUT);
    const check = createCheckPublishReadiness({ getSheet: () => Promise.resolve(sheet) });
    const missing = await check({ ...sheet.project, status: "funding" });
    expect(missing.map((m) => m.code)).toContain("REQUIRED_FOR_PUBLISHED");
  });

  it("sin ficha o si la lectura falla: pendiente, nunca lanza", async () => {
    const sheet = sheetOf(PUBLISHABLE_INPUT);
    const none = createCheckPublishReadiness({ getSheet: () => Promise.resolve(null) });
    const broken = createCheckPublishReadiness({ getSheet: () => Promise.reject(new Error("falta la economía")) });
    expect((await none(sheet.project))[0]?.code).toBe("SHEET_NOT_FOUND");
    expect((await broken(sheet.project))[0]).toEqual({ code: "SHEET_NOT_FOUND", detail: "falta la economía" });
  });
});
