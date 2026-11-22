import { describe, expect, it } from "vitest";
import { asId } from "@/shared/domain/id";
import { isoDate } from "@/shared/domain/calendar-date";
import type { ProjectId } from "./project";
import { sortUpdatesNewestFirst, type ProjectUpdate } from "./project-update";

const PROJECT_ID = asId<"Project">("prj_chacao_02") as ProjectId;

function update(id: string, publishedOn: string): ProjectUpdate {
  return {
    id: asId<"ProjectUpdate">(id),
    projectId: PROJECT_ID,
    publishedOn: isoDate(publishedOn),
    title: id,
    body: "texto",
  };
}

describe("sortUpdatesNewestFirst", () => {
  it("ordena por fecha descendente y, en empate, por id ascendente", () => {
    const input = [
      update("upd_a_1", "2026-11-04"),
      update("upd_a_3", "2026-11-10"),
      update("upd_a_2", "2026-11-10"),
    ];
    expect(sortUpdatesNewestFirst(input).map((u) => u.id)).toEqual([
      "upd_a_2",
      "upd_a_3",
      "upd_a_1",
    ]);
  });

  it("no muta la entrada", () => {
    const input = [update("upd_a_1", "2026-11-04"), update("upd_a_2", "2026-11-10")];
    const copy = [...input];
    sortUpdatesNewestFirst(input);
    expect(input).toEqual(copy);
  });

  it("lista vacía → vacía", () => {
    expect(sortUpdatesNewestFirst([])).toEqual([]);
  });
});
