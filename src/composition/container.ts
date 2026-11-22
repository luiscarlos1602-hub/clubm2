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
  // La v1 se reinicia sin migración (D6): se borran las claves antiguas.
  if (storage !== null) {
    for (const legacyKey of demoConfig.legacyStorageKeys) {
      try {
        storage.removeItem(legacyKey);
      } catch {
        // sin acceso al almacenamiento: se sigue en memoria
      }
    }
  }
  const store = createDemoStore({
    key: demoConfig.storageKey,
    storage,
    buildSeed: () => buildDemoSnapshot(clock),
    parse: parseDemoSnapshot,
  });

  // finance se registra después (depende de projects): la guarda de publicación la resuelve al usarse.
  let finance: FinanceModule | null = null;
  const projects = registerProjects(store, {
    clock,
    publishGuard: (next) => {
      if (finance === null) throw new Error("composition: finance aún no está registrado");
      return finance.checkPublishReadiness(next);
    },
  });
  const participations = registerParticipations(store, projects);
  const ids = options.ids ?? randomIdGenerator();
  finance = registerFinance(store, { projects, participations, clock, ids });

  return {
    clock,
    ids,
    demo: {
      storageKey: store.key,
      holderId: DEMO_HOLDER_ID,
      seededOn: () => store.read().seededOn,
      reset: () => {
        store.reset();
      },
    },
    projects,
    participations,
    finance,
  };
}
