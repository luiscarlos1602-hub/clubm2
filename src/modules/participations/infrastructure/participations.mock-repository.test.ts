import { describe, expect, it } from "vitest";
import { asId } from "@/shared/domain/id";
import { isoDate } from "@/shared/domain/calendar-date";
import {
  createParticipationClassMockRepository,
  createParticipationMockRepository,
} from "./participations.mock-repository";
import { buildParticipationsSeed, DEMO_HOLDER_ID } from "./seed";

const acquiredOn = new Map([
  [asId<"Project">("prj_chacao_01"), isoDate("2026-01-10")],
  [asId<"Project">("prj_paraiso_01"), isoDate("2026-02-10")],
  [asId<"Project">("prj_chacao_02"), isoDate("2026-03-10")],
] as const);
const slice = buildParticipationsSeed({ acquiredOn });
const source = { read: () => slice };

describe("Repos mock de participations", () => {
  it("clases: list y findByProject", async () => {
    const repo = createParticipationClassMockRepository(source);
    expect(await repo.list()).toHaveLength(slice.classes.length);
    expect((await repo.findByProject(asId<"Project">("prj_chacao_02")))?.placed).toBe(63);
    expect(await repo.findByProject(asId<"Project">("prj_nada_01"))).toBeNull();
  });

  it("tenencias: por titular y ordenadas por fecha", async () => {
    const repo = createParticipationMockRepository(source);
    const mine = await repo.listByHolder(DEMO_HOLDER_ID);
    expect(mine).toHaveLength(3);
    const dates = mine.map((p) => p.subscribedOn);
    expect(dates).toEqual([...dates].sort());
    expect(await repo.listByHolder(asId<"Investor">("inv_otro"))).toEqual([]);
  });
});
