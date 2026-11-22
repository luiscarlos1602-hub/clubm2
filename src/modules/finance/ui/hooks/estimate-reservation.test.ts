import { describe, expect, it } from "vitest";
import { createContainer } from "@/composition/container";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { fixedClock } from "@/shared/domain/clock";
import { usd } from "@/shared/domain/money";
import { estimateReservation } from "./project-figures";
import { loadProjectDetail, type ProjectDetailData } from "./use-project-detail";

// M2-006: colocación abierta, 63 de 100 colocadas (semilla). [SUPUESTO P5-1] la reserva se suma a lo ya colocado.
async function open(): Promise<ProjectDetailData> {
  const container = createContainer({ clock: fixedClock("2026-11-22" as IsoDate), storage: null });
  const data = await loadProjectDetail(container, "m2-006-chacao");
  if (data === null) throw new Error("sin ficha M2-006");
  return data;
}

describe("estimateReservation [P5-1]", () => {
  it("1 participación: se suma a las 63 ya colocadas (64) y reparte", async () => {
    const data = await open();
    expect(data.participationClass.placed).toBe(63);
    const r = estimateReservation(data, 1);
    expect(r.heldUsed).toBe(1);
    expect(r.outcome.kind).toBe("payout");
    if (r.outcome.kind !== "payout") return;
    expect(r.outcome.distribution.kind).toBe("distributed");
  });

  it("hasta llenar los disponibles: la colocación llega a 100 y reparte", async () => {
    const data = await open();
    const available = data.listing.participations.available;
    expect(available).toBe(37);
    const r = estimateReservation(data, available);
    expect(r.heldUsed).toBe(available);
    expect(r.outcome.kind).toBe("payout");
    // más participaciones de las disponibles no pasan del total
    const over = estimateReservation(data, available + 5);
    expect(over.outcome.kind).toBe("payout");
  });

  it("más participaciones colocadas aumentan lo que va a los externos (mismo motor)", async () => {
    const data = await open();
    const one = estimateReservation(data, 1);
    const full = estimateReservation(data, data.listing.participations.available);
    if (one.outcome.kind !== "payout" || full.outcome.kind !== "payout") throw new Error("se esperaba reparto");
    expect(full.outcome.distribution.toExternal.cents).toBeGreaterThan(one.outcome.distribution.toExternal.cents);
  });

  it("sin excedente: sin reparto", async () => {
    const data = await open();
    const sinExcedente: ProjectDetailData = {
      ...data,
      economics: { ...data.economics, targetSalePrice: usd(1_000_000) },
    };
    const r = estimateReservation(sinExcedente, 1);
    expect(r.outcome.kind).toBe("no_distribution");
  });
});
