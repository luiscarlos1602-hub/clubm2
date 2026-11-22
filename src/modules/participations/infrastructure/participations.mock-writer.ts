import { err, ok } from "@/shared/domain/result";
import { upsertBy, type SliceStore } from "@/shared/infrastructure/demo-store";
import { parseRecord } from "@/shared/infrastructure/zod-schemas";
import type { ParticipationClassWriter } from "../application/ports";
import type { ParticipationClass } from "../domain/participation";
import { classSchema, type ParticipationsSlice } from "./seed";

/** W-1. Escribe en el slice `participations` del snapshot local; mismas reglas que el contrato del puerto. */
export function createParticipationClassMockWriter(source: SliceStore<ParticipationsSlice>): ParticipationClassWriter {
  return {
    save(cls) {
      const parsed = parseRecord<ParticipationClass>(classSchema, cls);
      if (!parsed.ok) return Promise.resolve(parsed);
      const next = parsed.value;
      if (source.read().classes.some((c) => c.id !== next.id && c.projectId === next.projectId)) {
        return Promise.resolve(err("DUPLICATE", `el proyecto ${next.projectId} ya tiene clase de participación`));
      }
      source.update((s) => ({ ...s, classes: upsertBy(s.classes, next, (a, b) => a.id === b.id) }));
      return Promise.resolve(ok(next));
    },
  };
}
