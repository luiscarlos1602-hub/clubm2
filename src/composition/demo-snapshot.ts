import { z } from "zod";
import type { IsoDate } from "@/shared/domain/calendar-date";
import type { Clock } from "@/shared/domain/clock";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import { isoDateSchema } from "@/shared/infrastructure/zod-schemas";
import { buildFinanceSeed, financeSliceSchema, type FinanceSlice } from "@/modules/finance/infrastructure/seed";
import {
  buildParticipationsSeed,
  participationsSliceSchema,
  type ParticipationsSlice,
} from "@/modules/participations/infrastructure/seed";
import { buildProjectsSeed, projectsSliceSchema, type ProjectsSlice } from "@/modules/projects/infrastructure/seed";

export type DemoSnapshot = {
  readonly version: 2;
  readonly seededOn: IsoDate;
  readonly projects: ProjectsSlice;
  readonly participations: ParticipationsSlice;
  readonly finance: FinanceSlice;
};

export const demoSnapshotSchema: z.ZodType<DemoSnapshot> = z.object({
  version: z.literal(2),
  seededOn: isoDateSchema,
  projects: projectsSliceSchema,
  participations: participationsSliceSchema,
  finance: financeSliceSchema,
});

export function parseDemoSnapshot(raw: unknown): Result<DemoSnapshot, DomainError<"INVALID_SNAPSHOT">> {
  const parsed = demoSnapshotSchema.safeParse(raw);
  return parsed.success
    ? ok(parsed.data)
    : err("INVALID_SNAPSHOT", parsed.error.issues[0]?.message ?? "snapshot inválido");
}

/** 1) projects 2) participations (fechas de compra) 3) finance (liquidados con los términos de su clase). */
export function buildDemoSnapshot(clock: Clock): DemoSnapshot {
  const projects = buildProjectsSeed(clock);

  const acquiredOn = new Map<ProjectsSlice["projects"][number]["id"], IsoDate>();
  for (const p of projects.projects) {
    if (p.timeline.acquiredOn !== null) acquiredOn.set(p.id, p.timeline.acquiredOn);
  }
  const participations = buildParticipationsSeed({ acquiredOn });

  const settled = projects.projects.flatMap((p) => {
    if (p.status !== "settled" || p.timeline.settledOn === null) return [];
    const cls = participations.classes.find((c) => c.projectId === p.id);
    if (cls === undefined) throw new Error(`snapshot: el liquidado ${p.code} no tiene clase`);
    return [
      {
        projectId: p.id,
        settledOn: p.timeline.settledOn,
        terms: { total: cls.total, placed: cls.placed, unitPrice: cls.unitPrice },
      },
    ];
  });
  const finance = buildFinanceSeed({ settled });

  return { version: 2, seededOn: clock.today(), projects, participations, finance };
}
