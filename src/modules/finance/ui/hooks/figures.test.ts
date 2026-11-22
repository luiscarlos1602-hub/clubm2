import { describe, expect, it } from "vitest";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { usd, usdUnits } from "@/shared/domain/money";
import { createContainer } from "@/composition/container";
import { fixedClock } from "@/shared/domain/clock";
import { PROJECT_EXAMPLES, PUBLISHED_PROJECT_SLUGS } from "../components/investor/examples";
import { processStagesFor, toProcessStages } from "./process-stages";
import { profitRateLabel } from "./profit-rate";

describe("profitRateLabel", () => {
  it("formatea el % del motor con un solo texto", () => {
    expect(profitRateLabel(usdUnits(25), usdUnits(100))).toBe("25 % sobre el capital");
    expect(profitRateLabel(usd(2_250), usd(10_000))).toBe("22,5 % sobre el capital");
  });
  it("sin ganancia no hay texto", () => {
    expect(profitRateLabel(null, usdUnits(100))).toBeNull();
  });
  it("si el % no puede calcularse (capital 0, ganancia negativa) dice «% por definir»; nunca omite ni sale negativo", () => {
    expect(profitRateLabel(usdUnits(25), usd(0))).toBe("% por definir");
    expect(profitRateLabel(usd(-1), usdUnits(100))).toBe("% por definir");
  });
});

describe("toProcessStages", () => {
  it.each(PUBLISHED_PROJECT_SLUGS)("%s: seis etapas, fechas no decrecientes y estado coherente", (slug) => {
    const stages = toProcessStages("2026-01-01" as IsoDate, PROJECT_EXAMPLES[slug].process);
    expect(stages).toHaveLength(6);
    const dates = stages.map((s) => s.date);
    expect([...dates].sort()).toEqual(dates);
    const order = stages.map((s) => s.status);
    expect(order.indexOf("current")).toBeLessThanOrEqual(order.lastIndexOf("current"));
    const firstNotDone = order.findIndex((s) => s !== "done");
    expect(order.slice(firstNotDone === -1 ? order.length : firstNotDone).every((s) => s !== "done")).toBe(true);
    for (const s of stages) if (s.status === "done") expect(s.estimated).toBe(false);
  });
});

describe("processStagesFor (única fuente del tablero)", () => {
  it("ninguna etapa de ningún proyecto tiene fecha anterior a la compra, con el reloj del demo", async () => {
    const container = createContainer({ clock: fixedClock("2026-11-22" as IsoDate), storage: null });
    const listings = await container.participations.listMarketplace();
    expect(listings.length).toBe(PUBLISHED_PROJECT_SLUGS.length);
    for (const l of listings) {
      const stages = processStagesFor({ code: l.code, acquiredOn: l.acquiredOn });
      expect(stages, l.code).not.toBeNull();
      for (const s of stages ?? []) expect(s.date >= l.acquiredOn, `${l.code} ${s.id}`).toBe(true);
    }
  });
  it("código sin ficha (M2-007) no tiene proceso", () => {
    expect(processStagesFor({ code: "M2-007", acquiredOn: "2026-01-01" as IsoDate })).toBeNull();
  });
});
