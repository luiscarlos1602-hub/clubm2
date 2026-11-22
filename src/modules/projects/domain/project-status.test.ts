import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { isoDate, type IsoDate } from "@/shared/domain/calendar-date";
import { asId } from "@/shared/domain/id";
import type { Project, ProjectCode } from "./project";
import {
  CREATABLE_STATUSES,
  PROJECT_STATUSES,
  canTransition,
  changeProjectStatus,
  isTerminalStatus,
  transitionStatus,
  type ProjectStatus,
} from "./project-status";

// Tabla esperada escrita a mano desde el plan 002 §3.9 (independiente de PROJECT_TRANSITIONS).
const EXPECTED_EDGES: ReadonlySet<string> = new Set([
  "opportunity>due_diligence",
  "due_diligence>acquired",
  "due_diligence>discarded",
  "acquired>funding",
  "funding>renovation",
  "renovation>on_sale",
  "on_sale>sold",
  "on_sale>stalled",
  "stalled>on_sale",
  "stalled>sold",
  "sold>settled",
]);

const ALL_PAIRS = PROJECT_STATUSES.flatMap((from) =>
  PROJECT_STATUSES.map((to) => [from, to] as const),
);

function makeProject(status: ProjectStatus, timeline: Partial<Project["timeline"]> = {}): Project {
  return {
    id: asId<"Project">("prj_chacao_01"),
    code: "M2-001" as ProjectCode,
    slug: "apartamento-chacao",
    name: "Apartamento en Chacao",
    propertyId: asId<"Property">("prp_chacao_01"),
    status,
    timeline: { acquiredOn: null, saleSignedOn: null, settledOn: null, ...timeline },
  };
}

describe("project-status", () => {
  it("hay exactamente 10 estados", () => {
    expect(PROJECT_STATUSES).toHaveLength(10);
  });

  it.each(ALL_PAIRS)("Transiciones · tabla exhaustiva 10 × 10: %s → %s", (from, to) => {
    const expected = EXPECTED_EDGES.has(`${from}>${to}`);
    expect(canTransition(from, to)).toBe(expected);
    const result = transitionStatus(from, to);
    if (expected) {
      expect(result).toEqual({ ok: true, value: to });
    } else {
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("INVALID_TRANSITION");
    }
  });

  it("Transiciones · settled y discarded son terminales", () => {
    const terminals = PROJECT_STATUSES.filter(isTerminalStatus);
    expect([...terminals].sort()).toEqual(["discarded", "settled"]);
    for (const from of terminals) {
      for (const to of PROJECT_STATUSES) expect(canTransition(from, to)).toBe(false);
    }
  });

  it("Transiciones · todo estado es alcanzable desde opportunity", () => {
    const visited = new Set<ProjectStatus>(["opportunity"]);
    const queue: ProjectStatus[] = ["opportunity"];
    while (queue.length > 0) {
      const current = queue.shift() as ProjectStatus;
      for (const next of PROJECT_STATUSES) {
        if (canTransition(current, next) && !visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
    expect(visited.size).toBe(PROJECT_STATUSES.length);
  });

  it("Transiciones · secuencias aleatorias solo avanzan por aristas de la tabla", () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom(...PROJECT_STATUSES), { maxLength: 30 }), (targets) => {
        let current: ProjectStatus = "opportunity";
        for (const target of targets) {
          const result = transitionStatus(current, target);
          if (result.ok) {
            expect(EXPECTED_EDGES.has(`${current}>${target}`)).toBe(true);
            current = result.value;
          } else {
            expect(EXPECTED_EDGES.has(`${current}>${target}`)).toBe(false);
          }
        }
      }),
      { numRuns: 1000 },
    );
  });
});

describe("changeProjectStatus", () => {
  const d = (raw: string): IsoDate => isoDate(raw);

  it("→ acquired fija acquiredOn", () => {
    const result = changeProjectStatus(makeProject("due_diligence"), "acquired", d("2026-01-15"));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("acquired");
      expect(result.value.timeline).toEqual({
        acquiredOn: "2026-01-15",
        saleSignedOn: null,
        settledOn: null,
      });
    }
  });

  it("→ sold fija saleSignedOn", () => {
    const project = makeProject("on_sale", { acquiredOn: d("2026-01-15") });
    const result = changeProjectStatus(project, "sold", d("2026-04-10"));
    expect(result.ok && result.value.timeline).toEqual({
      acquiredOn: "2026-01-15",
      saleSignedOn: "2026-04-10",
      settledOn: null,
    });
  });

  it("→ sold desde stalled también fija saleSignedOn", () => {
    const project = makeProject("stalled", { acquiredOn: d("2026-01-15") });
    const result = changeProjectStatus(project, "sold", d("2026-09-01"));
    expect(result.ok && result.value.timeline.saleSignedOn).toBe("2026-09-01");
  });

  it("→ settled fija settledOn", () => {
    const project = makeProject("sold", {
      acquiredOn: d("2026-01-15"),
      saleSignedOn: d("2026-04-10"),
    });
    const result = changeProjectStatus(project, "settled", d("2026-05-02"));
    expect(result.ok && result.value.status).toBe("settled");
    expect(result.ok && result.value.timeline.settledOn).toBe("2026-05-02");
  });

  it("transiciones sin fecha asociada no tocan el timeline", () => {
    const project = makeProject("acquired", { acquiredOn: d("2026-01-15") });
    const result = changeProjectStatus(project, "funding", d("2026-01-20"));
    expect(result.ok && result.value.timeline).toEqual(project.timeline);
  });

  it("no muta el proyecto original", () => {
    const project = makeProject("due_diligence");
    changeProjectStatus(project, "acquired", d("2026-01-15"));
    expect(project.status).toBe("due_diligence");
    expect(project.timeline.acquiredOn).toBeNull();
  });

  it("la misma fecha que la ya registrada es válida", () => {
    const project = makeProject("on_sale", { acquiredOn: d("2026-01-15") });
    expect(changeProjectStatus(project, "sold", d("2026-01-15")).ok).toBe(true);
  });

  it("fecha anterior a una registrada → DATE_OUT_OF_ORDER", () => {
    const project = makeProject("on_sale", { acquiredOn: d("2026-01-15") });
    const result = changeProjectStatus(project, "sold", d("2026-01-14"));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("DATE_OUT_OF_ORDER");
  });

  it("fecha anterior a la venta al liquidar → DATE_OUT_OF_ORDER", () => {
    const project = makeProject("sold", {
      acquiredOn: d("2026-01-15"),
      saleSignedOn: d("2026-04-10"),
    });
    const result = changeProjectStatus(project, "settled", d("2026-04-09"));
    expect(!result.ok && result.error.code).toBe("DATE_OUT_OF_ORDER");
  });

  it("transición inválida → INVALID_TRANSITION (se evalúa antes que la fecha)", () => {
    const project = makeProject("opportunity");
    const result = changeProjectStatus(project, "sold", d("2026-01-15"));
    expect(!result.ok && result.error.code).toBe("INVALID_TRANSITION");
  });
});

describe("CREATABLE_STATUSES (W2-1)", () => {
  it("se crea en oportunidad, due diligence, comprado o en colocación", () => {
    expect(CREATABLE_STATUSES).toEqual(["opportunity", "due_diligence", "acquired", "funding"]);
  });

  it("todas son etapas existentes y ninguna es terminal", () => {
    for (const s of CREATABLE_STATUSES) {
      expect(PROJECT_STATUSES).toContain(s);
      expect(isTerminalStatus(s)).toBe(false);
    }
  });
});
