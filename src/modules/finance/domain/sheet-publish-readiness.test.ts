import { describe, expect, it } from "vitest";
import { buildProjectSheet } from "./build-project-sheet";
import { CREATE_CTX, MINIMAL_INPUT, PUBLISHABLE_INPUT } from "./project-sheet.test-fixtures";
import { checkSheetPublishable, sheetToInput } from "./sheet-publish-readiness";

const build = (input: typeof PUBLISHABLE_INPUT) => {
  const r = buildProjectSheet(input, CREATE_CTX);
  if (!r.ok) throw new Error(JSON.stringify(r.error));
  return r.value;
};

describe("sheetToInput / checkSheetPublishable (W-3)", () => {
  it("ida y vuelta: la ficha publicable vuelve a construirse igual", () => {
    const sheet = build(PUBLISHABLE_INPUT);
    const again = buildProjectSheet(sheetToInput(sheet), { ...CREATE_CTX, existing: sheet });
    expect(again).toEqual({ ok: true, value: sheet });
  });

  it("ficha completa en funding: sin pendientes", () => {
    expect(checkSheetPublishable(build(PUBLISHABLE_INPUT))).toEqual([]);
  });

  it("ficha mínima comprada que pasa a funding: lista lo que falta para publicar", () => {
    const sheet = build(MINIMAL_INPUT);
    const next = { ...sheet, project: { ...sheet.project, status: "funding" as const } };
    const fields = checkSheetPublishable(next).map((i) => i.field);
    expect(fields.length).toBeGreaterThan(0);
    expect(fields).toEqual(expect.arrayContaining(["profile", "processSteps", "participationClass"]));
  });

  it("etapa interna: no exige nada", () => {
    expect(checkSheetPublishable(build(MINIMAL_INPUT))).toEqual([]);
  });
});
