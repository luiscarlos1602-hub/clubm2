import { describe, expect, it } from "vitest";
import { isoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { usdUnits } from "@/shared/domain/money";
import { memoryStorage } from "@/shared/infrastructure/browser-storage";
import { createContainer } from "./container";

const clock = fixedClock(isoDate("2026-11-22"));
const make = () => createContainer({ clock, storage: memoryStorage() });

describe("Marketplace sobre las semillas", () => {
  it("lista 6 proyectos en el orden P3-2 y sin M2-007", async () => {
    const listing = await make().participations.listMarketplace();
    expect(listing.map((l) => l.code)).toEqual(["M2-006", "M2-005", "M2-004", "M2-002", "M2-003", "M2-001"]);
  });

  it("M2-006 está abierto con 37 de 100 a USD 100", async () => {
    const listing = await make().participations.listMarketplace();
    const p = listing.find((l) => l.code === "M2-006");
    expect(p).toBeDefined();
    expect(p?.phase).toBe("open");
    expect(p?.participations).toEqual({ total: 100, available: 37 });
    expect(p?.unitPrice).toEqual(usdUnits(100));
    expect(p?.slug).toBe("m2-006-chacao");
    expect([p?.city, p?.zone]).toEqual(["Caracas", "Chacao"]);
  });

  it("M2-002 (stalled si aplica) se ve como en venta, sin disponibles", async () => {
    const listing = await make().participations.listMarketplace();
    const p = listing.find((l) => l.code === "M2-002");
    expect(p?.stage).toBe("on_sale");
    expect(p?.phase).toBe("on_sale");
    expect(p?.participations.available).toBe(0);
    expect(JSON.stringify(listing)).not.toMatch(/stalled|wheel|rueda/i);
  });

  it("M2-001 y M2-003 son histórico finalizado con fecha de liquidación", async () => {
    const listing = await make().participations.listMarketplace();
    for (const code of ["M2-001", "M2-003"]) {
      const p = listing.find((l) => l.code === code);
      expect(p?.phase).toBe("finished");
      expect(p?.targetTermMonths).toBeNull();
      expect(p?.settledOn).not.toBeNull();
    }
  });

  it("tras demo.reset() el resultado es el mismo", async () => {
    const c = make();
    const before = await c.participations.listMarketplace();
    c.demo.reset();
    expect(await c.participations.listMarketplace()).toEqual(before);
  });
});
