import { compareIsoDate, type IsoDate } from "@/shared/domain/calendar-date";
import type { Id } from "@/shared/domain/id";
import type { ProjectId } from "./project";

export type ProjectUpdateId = Id<"ProjectUpdate">;

/** Actualización fechada del proyecto (docs/02 §3). Fuente, responsable y evidencia llegan con B3. */
export type ProjectUpdate = {
  readonly id: ProjectUpdateId;
  readonly projectId: ProjectId;
  readonly publishedOn: IsoDate;
  readonly title: string;
  readonly body: string;
};

function compareNewestFirst(a: ProjectUpdate, b: ProjectUpdate): number {
  const byDate = compareIsoDate(b.publishedOn, a.publishedOn);
  if (byDate !== 0) return byDate;
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
}

/** publishedOn descendente; en empate, id ascendente. No muta. */
export function sortUpdatesNewestFirst(us: readonly ProjectUpdate[]): readonly ProjectUpdate[] {
  return [...us].sort(compareNewestFirst);
}
