import { asId } from "@/shared/domain/id";
import { isoDate } from "@/shared/domain/calendar-date";
import { memorySlice, type SliceStore } from "@/shared/infrastructure/demo-store";
import { describeParticipationsRepositoryContract } from "../application/participations-repository.contract";
import { createParticipationClassMockRepository } from "./participations.mock-repository";
import { createParticipationClassMockWriter } from "./participations.mock-writer";
import { buildParticipationsSeed, type ParticipationsSlice } from "./seed";

const subject = (slice: SliceStore<ParticipationsSlice>) => ({
  classes: { ...createParticipationClassMockRepository(slice), ...createParticipationClassMockWriter(slice) },
});

describeParticipationsRepositoryContract("mock vacío", () => subject(memorySlice({ classes: [], participations: [] })));
const acquiredOn = new Map([
  [asId<"Project">("prj_chacao_01"), isoDate("2026-01-10")],
  [asId<"Project">("prj_paraiso_01"), isoDate("2026-02-10")],
  [asId<"Project">("prj_chacao_02"), isoDate("2026-03-10")],
] as const);
describeParticipationsRepositoryContract("mock con semillas", () =>
  subject(memorySlice(buildParticipationsSeed({ acquiredOn }))),
);
