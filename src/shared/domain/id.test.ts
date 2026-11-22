import { describe, expect, it } from "vitest";
import { asId, parseId, type Id } from "./id";

describe("id", () => {
  it("asId conserva el texto", () => {
    const id: Id<"Project"> = asId<"Project">("prj_chacao_01");
    expect(id).toBe("prj_chacao_01");
  });

  it("parseId acepta prj_chacao_01", () => {
    expect(parseId<"Project">("prj_chacao_01")).toEqual({ ok: true, value: "prj_chacao_01" });
  });

  it.each(["Prj-1", "prj", "prj_", "_prj_1", "1prj_a", "prj__a", "prj_A", "", 42, null])(
    "parseId rechaza %s",
    (raw) => {
      const r = parseId(raw);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("INVALID_ID");
    },
  );
});
