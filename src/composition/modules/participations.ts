import type { DemoStore } from "@/shared/infrastructure/demo-store";
import type {
  ParticipationClassRepository,
  ParticipationRepository,
} from "@/modules/participations/application/ports";
import {
  createParticipationClassMockRepository,
  createParticipationMockRepository,
} from "@/modules/participations/infrastructure/participations.mock-repository";
import type { DemoSnapshot } from "../demo-snapshot";

export type ParticipationsModule = {
  readonly classRepository: ParticipationClassRepository;
  readonly participationRepository: ParticipationRepository;
};

export function registerParticipations(store: DemoStore<DemoSnapshot>): ParticipationsModule {
  const source = { read: () => store.read().participations };
  return {
    classRepository: createParticipationClassMockRepository(source),
    participationRepository: createParticipationMockRepository(source),
  };
}
