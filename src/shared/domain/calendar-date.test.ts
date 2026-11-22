import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  addCalendarMonths,
  addDays,
  compareIsoDate,
  daysInMonth,
  isLeapYear,
  isoDate,
  parseIsoDate,
  type IsoDate,
} from "./calendar-date";
import { fixedClock } from "./clock";

const RUNS = { numRuns: 1000 };

const pad = (n: number, w: number) => String(n).padStart(w, "0");
const arbIsoDate: fc.Arbitrary<IsoDate> = fc
  .record({
    y: fc.integer({ min: 1960, max: 9000 }),
    m: fc.integer({ min: 1, max: 12 }),
    d: fc.integer({ min: 1, max: 31 }),
  })
  .map(({ y, m, d }) =>
    isoDate(`${pad(y, 4)}-${pad(m, 2)}-${pad(Math.min(d, daysInMonth(y, m)), 2)}`),
  );

describe("calendar-date · validación", () => {
  it("parseIsoDate acepta fechas válidas, incluido 29-feb bisiesto", () => {
    expect(parseIsoDate("2026-01-15")).toEqual({ ok: true, value: "2026-01-15" });
    expect(parseIsoDate("2028-02-29").ok).toBe(true);
    expect(parseIsoDate("1900-01-01").ok).toBe(true);
    expect(parseIsoDate("9999-12-31").ok).toBe(true);
  });

  it.each([
    "2026-02-30",
    "2026-13-01",
    "2026-1-5",
    "2027-02-29",
    "1900-02-29",
    "2026-00-10",
    "2026-04-31",
    "1899-12-31",
    "2026-01-15T00:00",
    "",
    20260115,
    null,
  ])("parseIsoDate rechaza %s", (raw) => {
    const r = parseIsoDate(raw);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_DATE");
  });

  it("isoDate lanza RangeError con formato inválido (SUPUESTO T1)", () => {
    expect(() => isoDate("2026-02-30")).toThrow(RangeError);
  });

  it("isLeapYear y daysInMonth", () => {
    expect(isLeapYear(2028)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2027, 2)).toBe(28);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  it("compareIsoDate ordena cronológicamente", () => {
    expect(compareIsoDate(isoDate("2026-01-15"), isoDate("2026-04-15"))).toBe(-1);
    expect(compareIsoDate(isoDate("2026-04-15"), isoDate("2026-04-15"))).toBe(0);
    expect(compareIsoDate(isoDate("2027-01-01"), isoDate("2026-12-31"))).toBe(1);
  });
});

describe("calendar-date · aritmética", () => {
  it("K2 · 15-ene + 3 meses = 15-abr", () => {
    expect(addCalendarMonths(isoDate("2026-01-15"), 3)).toBe("2026-04-15");
    expect(addCalendarMonths(isoDate("2026-01-15"), 6)).toBe("2026-07-15");
  });

  it("K2 · fin de mes se ajusta al último día (SUPUESTO L2)", () => {
    expect(addCalendarMonths(isoDate("2026-08-31"), 6)).toBe("2027-02-28");
    expect(addCalendarMonths(isoDate("2027-08-31"), 6)).toBe("2028-02-29");
    expect(addCalendarMonths(isoDate("2026-01-31"), 1)).toBe("2026-02-28");
    expect(addCalendarMonths(isoDate("2026-10-31"), 3)).toBe("2027-01-31");
  });

  it("addCalendarMonths con 0 meses y con cruce de varios años", () => {
    expect(addCalendarMonths(isoDate("2026-05-20"), 0)).toBe("2026-05-20");
    expect(addCalendarMonths(isoDate("2026-11-30"), 27)).toBe("2029-02-28");
  });

  it("addDays cruza año y bisiesto", () => {
    expect(addDays(isoDate("2026-12-31"), 1)).toBe("2027-01-01");
    expect(addDays(isoDate("2028-02-28"), 1)).toBe("2028-02-29");
    expect(addDays(isoDate("2028-02-29"), 1)).toBe("2028-03-01");
    expect(addDays(isoDate("2027-01-01"), -1)).toBe("2026-12-31");
    expect(addDays(isoDate("2026-01-15"), 0)).toBe("2026-01-15");
    expect(addDays(isoDate("2026-01-01"), 365)).toBe("2027-01-01");
    expect(addDays(isoDate("2028-01-01"), 366)).toBe("2029-01-01");
    expect(addDays(isoDate("1900-02-28"), 1)).toBe("1900-03-01");
    expect(addDays(isoDate("2000-02-28"), 1)).toBe("2000-02-29");
    expect(addDays(isoDate("1970-01-01"), 20_000)).toBe("2024-10-04");
  });

  it("addDays fuera de 1900–9999 lanza RangeError", () => {
    expect(() => addDays(isoDate("1900-01-01"), -1)).toThrow(RangeError);
    expect(() => addDays(isoDate("9999-12-31"), 1)).toThrow(RangeError);
  });

  it("addCalendarMonths y addDays lanzan RangeError con argumentos inválidos", () => {
    expect(() => addCalendarMonths(isoDate("2026-01-15"), -1)).toThrow(RangeError);
    expect(() => addCalendarMonths(isoDate("2026-01-15"), 1.5)).toThrow(RangeError);
    expect(() => addDays(isoDate("2026-01-15"), 0.5)).toThrow(RangeError);
  });

  it("propiedad: addDays(d, n) y addDays(·, −n) se invierten", () => {
    fc.assert(
      fc.property(
        arbIsoDate,
        fc.integer({ min: -20_000, max: 20_000 }),
        (d, n) => addDays(addDays(d, n), -n) === d,
      ),
      RUNS,
    );
  });

  it("propiedad: addDays(d, 1) es el día siguiente válido y estrictamente mayor", () => {
    fc.assert(
      fc.property(arbIsoDate, (d) => {
        const next = addDays(d, 1);
        return parseIsoDate(next).ok && compareIsoDate(next, d) === 1;
      }),
      RUNS,
    );
  });

  it("propiedad: addCalendarMonths(d, m) ≥ d y es una fecha válida", () => {
    fc.assert(
      fc.property(arbIsoDate, fc.integer({ min: 0, max: 120 }), (d, m) => {
        const r = addCalendarMonths(d, m);
        return parseIsoDate(r).ok && compareIsoDate(r, d) >= 0;
      }),
      RUNS,
    );
  });
});

describe("clock", () => {
  it("fixedClock devuelve siempre la fecha fijada", () => {
    const clock = fixedClock(isoDate("2026-11-22"));
    expect(clock.today()).toBe("2026-11-22");
    expect(clock.today()).toBe("2026-11-22");
  });
});
