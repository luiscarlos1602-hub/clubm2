import { afterEach, describe, expect, it, vi } from "vitest";
import { systemClock } from "./system-clock";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("systemClock", () => {
  it("L9 · 2026-11-23T03:30Z es 2026-11-22 en Caracas", () => {
    const clock = systemClock({ now: () => new Date("2026-11-23T03:30:00Z") });
    expect(clock.today()).toBe("2026-11-22");
  });

  it("usa la zona indicada", () => {
    const clock = systemClock({ timeZone: "UTC", now: () => new Date("2026-11-23T03:30:00Z") });
    expect(clock.today()).toBe("2026-11-23");
  });
});

describe("demoClock", () => {
  it("usa fixedToday válido", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_TODAY", "2027-03-10");
    vi.resetModules();
    const { demoClock } = await import("./system-clock");
    expect(demoClock().today()).toBe("2027-03-10");
  });

  it("fixedToday inválido cae al reloj del sistema con console.warn", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_TODAY", "2027-13-45");
    vi.resetModules();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { demoClock } = await import("./system-clock");
    expect(demoClock().today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(warn).toHaveBeenCalled();
  });
});
