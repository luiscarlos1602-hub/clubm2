import { describe, expect, it } from "vitest";
import { PROJECT_SLUG_PATTERN, isProjectSlug } from "./project-slug";

describe("isProjectSlug (D4: el servidor solo rechaza formatos inválidos)", () => {
  it("acepta un slug de la semilla", () => {
    expect(isProjectSlug("m2-006-chacao")).toBe(true);
    expect(isProjectSlug("no-existe")).toBe(true);
    expect(isProjectSlug("abc")).toBe(true);
  });

  it("rechaza mayúsculas, guion bajo, vacío, guiones dobles o en los bordes", () => {
    for (const raw of ["M2_RARO", "", "a--b", "-a", "a-", "m2 006", "ñandú"]) {
      expect(isProjectSlug(raw)).toBe(false);
    }
  });

  it("rechaza valores que no son string", () => {
    for (const raw of [undefined, null, 42, {}, ["m2-006-chacao"]]) {
      expect(isProjectSlug(raw)).toBe(false);
    }
  });

  it("el patrón es el mismo de la semilla", () => {
    expect(PROJECT_SLUG_PATTERN.source).toBe("^[a-z0-9]+(-[a-z0-9]+)*$");
  });
});
