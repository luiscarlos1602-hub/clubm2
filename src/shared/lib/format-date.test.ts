import { describe, expect, it } from "vitest";
import { formatIsoDate } from "./format-date";

describe("formatIsoDate", () => {
  it("formato numérico y corto", () => {
    expect(formatIsoDate("2026-11-03", "numeric")).toBe("03.11.2026");
    expect(formatIsoDate("2026-11-03", "short")).toBe("3 nov 2026");
  });
  it("numeric es el estilo por defecto", () => {
    expect(formatIsoDate("2026-11-03")).toBe("03.11.2026");
  });
  it("un ISO completo conserva el día sin cambiar de zona", () => {
    expect(formatIsoDate("2026-11-03T23:30:00-04:00", "numeric")).toBe("03.11.2026");
  });
  it("valida días del mes y años bisiestos", () => {
    expect(formatIsoDate("2024-02-29", "short")).toBe("29 feb 2024");
    expect(formatIsoDate("2000-02-29")).toBe("29.02.2000");
    for (const bad of ["2026-02-29", "1900-02-29", "2026-04-31", "2026-11-31", "2026-01-00"]) {
      expect(() => formatIsoDate(bad)).toThrow(RangeError);
    }
  });
  it.each(["03/11/2026", "", "2026-13-01", "2026-11-3"])("lanza RangeError con %j", (bad) => {
    expect(() => formatIsoDate(bad)).toThrow(RangeError);
  });
});
