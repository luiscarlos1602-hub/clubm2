import { describe, expect, it } from "vitest";
import { usdUnits } from "@/shared/domain/money";
import { buildProjectSheet } from "./build-project-sheet";
import type { ProjectSheet, ProjectSheetInput } from "./project-sheet";
import { checkPartRemovals } from "./project-sheet-edit-rules";
import { CREATE_CTX, MINIMAL_INPUT, PUBLISHABLE_INPUT } from "./project-sheet.test-fixtures";

const built = buildProjectSheet(PUBLISHABLE_INPUT, CREATE_CTX);
if (!built.ok) throw new Error("fixture inválida");
const EXISTING: ProjectSheet = built.value;
const EDIT: ProjectSheetInput = { ...PUBLISHABLE_INPUT, projectId: EXISTING.project.id };
const fieldsOf = (input: ProjectSheetInput, existing: ProjectSheet | null = EXISTING) =>
  checkPartRemovals(input, existing).map((i) => [i.code, i.field]);

describe("checkPartRemovals (revisión W-2: quitar una parte guardada no se puede)", () => {
  it("alta o edición que conserva todo → sin issues", () => {
    expect(fieldsOf(MINIMAL_INPUT, null)).toEqual([]);
    expect(fieldsOf(EDIT)).toEqual([]);
  });

  it("quitar perfil, proceso, riesgos o clase guardados → PART_REMOVAL_NOT_ALLOWED en su campo", () => {
    const input: ProjectSheetInput = {
      ...EDIT,
      profile: null,
      processSteps: null,
      riskKinds: [],
      participationClass: null,
    };
    expect(fieldsOf(input)).toEqual([
      ["PART_REMOVAL_NOT_ALLOWED", "profile"],
      ["PART_REMOVAL_NOT_ALLOWED", "processSteps"],
      ["PART_REMOVAL_NOT_ALLOWED", "riskKinds"],
      ["PART_REMOVAL_NOT_ALLOWED", "participationClass"],
    ]);
  });

  it("partes que el existente no tenía pueden seguir vacías", () => {
    const bare = {
      ...EXISTING,
      profile: null,
      process: null,
      risks: null,
      participationClass: null,
    };
    expect(fieldsOf({ ...MINIMAL_INPUT, projectId: EXISTING.project.id }, bare)).toEqual([]);
  });

  it("clase con colocadas > 0: no se duplica (ya lo dice CLASS_LOCKED_BY_PLACEMENTS)", () => {
    const placed = {
      ...EXISTING,
      participationClass: { ...EXISTING.participationClass!, placed: 3 },
    };
    expect(fieldsOf({ ...EDIT, participationClass: null }, placed)).toEqual([]);
  });

  it("cambiar riesgos o clase sin vaciarlos sigue permitido", () => {
    expect(
      fieldsOf({
        ...EDIT,
        riskKinds: ["local_market"],
        participationClass: { total: 50, unitPrice: usdUnits(200) },
      }),
    ).toEqual([]);
  });
});
