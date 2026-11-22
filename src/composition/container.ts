import { demoConfig } from "@/shared/config/demo";
import type { IsoDate } from "@/shared/domain/calendar-date";
import type { Clock } from "@/shared/domain/clock";
import type { IdGenerator } from "@/shared/domain/id";
import { browserStorage, type KeyValueStorage } from "@/shared/infrastructure/browser-storage";
import { createDemoStore } from "@/shared/infrastructure/demo-store";
import { randomIdGenerator } from "@/shared/infrastructure/id-generator";
import { demoClock } from "@/shared/infrastructure/system-clock";
import { DEMO_HOLDER_ID } from "@/modules/participations/infrastructure/seed";
import type { HolderId } from "@/modules/participations";
import { buildDemoSnapshot, parseDemoSnapshot } from "./demo-snapshot";
import { registerFinance, type FinanceModule } from "./modules/finance";
import { registerParticipations, type ParticipationsModule } from "./modules/participations";
import { registerProjects, type ProjectsModule } from "./modules/projects";

export type Container = {
  readonly clock: Clock;
  readonly ids: IdGenerator;
  readonly demo: {
    readonly storageKey: string;
    /** inv_demo: el "yo" del rol Inversionista. */
    readonly holderId: HolderId;
    seededOn(): IsoDate;
    reset(): void;
  };
  readonly projects: ProjectsModule;
  readonly participations: ParticipationsModule;
  readonly finance: FinanceModule;
};

export type ContainerOptions = {
  readonly clock?: Clock;
  readonly storage?: KeyValueStorage | null;
  readonly ids?: IdGenerator;
};

/** Composition root. Por defecto: demoClock(), browserStorage(), randomIdGenerator(). */
export function createContainer(options: ContainerOptions = {}): Container {
  const clock = options.clock ?? demoClock();
  const storage = options.storage === undefined ? browserStorage() : options.storage;
  const store = createDemoStore({
    key: demoConfig.storageKey,
    storage,
    buildSeed: () => buildDemoSnapshot(clock),
    parse: parseDemoSnapshot,
  });

  return {
    clock,
    ids: options.ids ?? randomIdGenerator(),
    demo: {
      storageKey: store.key,
      holderId: DEMO_HOLDER_ID,
      seededOn: () => store.read().seededOn,
      reset: () => {
        store.reset();
      },
    },
    projects: registerProjects(store),
    participations: registerParticipations(store),
    finance: registerFinance(store),
  };
}
