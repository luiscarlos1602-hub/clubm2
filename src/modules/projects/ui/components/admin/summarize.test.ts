import { describe, expect, it } from "vitest";
import { countActive, countByStatus, wheelShares } from "./summarize";
import type { ProjectRow } from "./use-admin-projects";

const row = (status: string, wheel: string | null) =>
  ({ project: { status }, property: null, wheel: wheel === null ? null : { wheel } }) as unknown as ProjectRow;

describe("summarize", () => {
  const rows = [row("settled", "good"), row("on_sale", "bad"), row("renovation", "in_progress"), row("due_diligence", null)];

  it("cuenta por etapa y activos", () => {
    expect(countByStatus(rows).on_sale).toBe(1);
    expect(countActive(rows)).toBe(3);
  });

  it("reparte ruedas solo entre proyectos con compra", () => {
    const shares = wheelShares(rows);
    expect(shares.find((s) => s.wheel === "good")).toEqual({ wheel: "good", count: 1, percent: 33 });
    expect(wheelShares([]).every((s) => s.percent === 0)).toBe(true);
  });
});
