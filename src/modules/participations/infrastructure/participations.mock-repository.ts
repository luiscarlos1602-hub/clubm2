import type { SliceReader } from "@/shared/infrastructure/demo-store";
import type {
  ParticipationClassRepository,
  ParticipationRepository,
} from "../application/ports";
import type { ParticipationsSlice } from "./seed";

export function createParticipationClassMockRepository(
  source: SliceReader<ParticipationsSlice>,
): ParticipationClassRepository {
  return {
    list: () => Promise.resolve([...source.read().classes]),
    findByProject: (projectId) =>
      Promise.resolve(source.read().classes.find((c) => c.projectId === projectId) ?? null),
  };
}

export function createParticipationMockRepository(
  source: SliceReader<ParticipationsSlice>,
): ParticipationRepository {
  return {
    listByHolder: (holderId) =>
      Promise.resolve(
        source
          .read()
          .participations.filter((p) => p.holderId === holderId)
          .sort((a, b) => (a.subscribedOn < b.subscribedOn ? -1 : a.subscribedOn > b.subscribedOn ? 1 : 0)),
      ),
  };
}
