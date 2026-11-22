import { describe, expect, it } from "vitest";
import type { ProjectId } from "@/modules/projects";
import { asId } from "@/shared/domain/id";
import { usd, usdUnits } from "@/shared/domain/money";
import type { IsoDate } from "@/shared/domain/calendar-date";
import {
  HOLDING_LIMITS,
  PARTICIPATION_STATUSES,
  type Participation,
  type ParticipationClass,
  type ParticipationStatus,
} from "./participation";
import { checkHoldings, checkParticipationClass } from "./participation-consistency";

const PROJECT = asId<"Project">("prj_chacao_02") as ProjectId;

function cls(overrides: Partial<ParticipationClass> = {}): ParticipationClass {
  return {
    id: asId("pcl_chacao_02"),
    projectId: PROJECT,
    total: 100,
    placed: 63,
    unitPrice: usdUnits(100),
    ...overrides,
  };
}

let seq = 0;
function holding(
  quantity: number,
  status: ParticipationStatus = "confirmed",
  overrides: Partial<Participation> = {},
): Participation {
  seq += 1;
  return {
    id: asId(`par_test_${seq}`),
    classId: asId("pcl_chacao_02"),
    projectId: PROJECT,
    holderId: asId(`inv_test_${seq}`),
    quantity,
    status,
    subscribedOn: "2026-11-10" as IsoDate,
    ...overrides,
  };
}

function errorCode(r: { ok: boolean; error?: { code: string } }): string | undefined {
  return r.ok ? undefined : r.error?.code;
}

describe("participations · constantes", () => {
  it("D4 · límites 1–20 y estados D5", () => {
    expect(HOLDING_LIMITS).toEqual({ min: 1, max: 20 });
    expect(Object.isFrozen(HOLDING_LIMITS)).toBe(true);
    expect(PARTICIPATION_STATUSES).toEqual(["pending_confirmation", "confirmed"]);
  });
});

describe("participations · checkParticipationClass", () => {
  it("clase válida 100/63/USD 100", () => {
    const c = cls();
    expect(checkParticipationClass(c)).toEqual({ ok: true, value: c });
  });

  it("clase con 0 colocadas y con todas colocadas es válida", () => {
    expect(checkParticipationClass(cls({ placed: 0 })).ok).toBe(true);
    expect(checkParticipationClass(cls({ placed: 100 })).ok).toBe(true);
  });

  it.each([
    ["total 0", { total: 0, placed: 0 }],
    ["total 1,5", { total: 1.5, placed: 0 }],
    ["placed 101", { placed: 101 }],
    ["placed −1", { placed: -1 }],
    ["placed 2,5", { placed: 2.5 }],
    ["precio 0", { unitPrice: usd(0) }],
    ["precio negativo", { unitPrice: usd(-100) }],
  ])("inválida: %s → INVALID_PARTICIPATION_CLASS", (_label, overrides) => {
    expect(errorCode(checkParticipationClass(cls(overrides)))).toBe("INVALID_PARTICIPATION_CLASS");
  });
});

describe("participations · checkHoldings", () => {
  it("D4 · 20 participaciones es el máximo", () => {
    const c = cls();
    const twenty = [holding(20)];
    expect(checkHoldings(c, twenty)).toEqual({ ok: true, value: twenty });
    expect(errorCode(checkHoldings(c, [holding(21)]))).toBe("HOLDING_OUT_OF_LIMITS");
    expect(errorCode(checkHoldings(c, [holding(0)]))).toBe("HOLDING_OUT_OF_LIMITS");
    expect(errorCode(checkHoldings(c, [holding(1.5)]))).toBe("HOLDING_OUT_OF_LIMITS");
  });

  it("D4 · 1 participación es el mínimo", () => {
    expect(checkHoldings(cls(), [holding(1)]).ok).toBe(true);
  });

  it("sin tenencias es válido", () => {
    expect(checkHoldings(cls(), []).ok).toBe(true);
  });

  it("suma confirmada 64 con placed 63 → HOLDINGS_EXCEED_PLACED", () => {
    const holdings = [holding(20), holding(20), holding(20), holding(4)];
    expect(errorCode(checkHoldings(cls(), holdings))).toBe("HOLDINGS_EXCEED_PLACED");
  });

  it("suma confirmada igual a placed es válida", () => {
    const holdings = [holding(20), holding(20), holding(20), holding(3)];
    expect(checkHoldings(cls(), holdings).ok).toBe(true);
  });

  it("una pending_confirmation no cuenta para el tope de colocadas", () => {
    const holdings = [
      holding(20),
      holding(20),
      holding(20),
      holding(3),
      holding(5, "pending_confirmation"),
    ];
    expect(checkHoldings(cls(), holdings).ok).toBe(true);
  });

  it("una pending_confirmation también respeta D4", () => {
    expect(errorCode(checkHoldings(cls(), [holding(21, "pending_confirmation")]))).toBe(
      "HOLDING_OUT_OF_LIMITS",
    );
  });

  it("classId ajeno → HOLDING_CLASS_MISMATCH", () => {
    const foreign = holding(2, "confirmed", { classId: asId("pcl_otro_01") });
    expect(errorCode(checkHoldings(cls(), [foreign]))).toBe("HOLDING_CLASS_MISMATCH");
  });

  it("projectId ajeno → HOLDING_CLASS_MISMATCH", () => {
    const foreign = holding(2, "confirmed", { projectId: asId("prj_otro_01") });
    expect(errorCode(checkHoldings(cls(), [foreign]))).toBe("HOLDING_CLASS_MISMATCH");
  });
});
