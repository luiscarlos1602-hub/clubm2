import { describe, expect, it } from "vitest";
import { isProjectSlug } from "./project-slug";
import type { ProjectCode } from "./project";
import { buildProjectSlug, nextProjectCode } from "./project-code";

const codes = (...raw: string[]): readonly ProjectCode[] => raw as ProjectCode[];

describe("nextProjectCode (CA6: max + 1 con el prefijo de brand)", () => {
  it("sin códigos → 001", () => {
    expect(nextProjectCode([], "M2")).toEqual({ ok: true, value: "M2-001" });
  });

  it("con huecos → max + 1 (no rellena huecos)", () => {
    expect(nextProjectCode(codes("M2-001", "M2-007", "M2-003"), "M2")).toEqual({
      ok: true,
      value: "M2-008",
    });
  });

  it("ignora códigos de otro prefijo", () => {
    expect(nextProjectCode(codes("AB-050", "M2-002", "M22-009"), "M2")).toEqual({
      ok: true,
      value: "M2-003",
    });
  });

  it("999 ocupado → CODE_SPACE_EXHAUSTED", () => {
    const r = nextProjectCode(codes("M2-999"), "M2");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("CODE_SPACE_EXHAUSTED");
  });

  it("prefijo inválido → INVALID_PROJECT_CODE", () => {
    for (const prefix of ["", "m2", "ABCDE", "M-2"]) {
      const r = nextProjectCode([], prefix);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("INVALID_PROJECT_CODE");
    }
  });
});

describe("buildProjectSlug (CA6)", () => {
  const code = "M2-008" as ProjectCode;

  it("código en minúsculas + zona en kebab", () => {
    expect(buildProjectSlug(code, "Los Palos Grandes")).toEqual({
      ok: true,
      value: "m2-008-los-palos-grandes",
    });
  });

  it("quita tildes y la ñ pasa a n", () => {
    expect(buildProjectSlug(code, "Chacaíto")).toEqual({ ok: true, value: "m2-008-chacaito" });
    expect(buildProjectSlug(code, "La Viña")).toEqual({ ok: true, value: "m2-008-la-vina" });
  });

  it("espacios dobles, bordes y signos no dejan guiones repetidos", () => {
    const r = buildProjectSlug(code, "  El   Rosal, (Este) ");
    expect(r).toEqual({ ok: true, value: "m2-008-el-rosal-este" });
    if (r.ok) expect(isProjectSlug(r.value)).toBe(true);
  });

  it("zona vacía o sin letras → INVALID_SLUG", () => {
    for (const zone of ["", "   ", "¿?", "—"]) {
      const r = buildProjectSlug(code, zone);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("INVALID_SLUG");
    }
  });
});
