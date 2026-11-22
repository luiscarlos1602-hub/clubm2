import { describe, expect, it } from "vitest";
import { Result, err, flatMap, map, ok } from "./result";

describe("result", () => {
  it("ok envuelve el valor", () => {
    const r = Result.ok(5);
    expect(r.ok).toBe(true);
    expect(r.value).toBe(5);
  });

  it("err expone el código y el detalle", () => {
    const r = Result.err("X", "detalle");
    expect(r.ok).toBe(false);
    expect(r.error.code).toBe("X");
    expect(r.error.detail).toBe("detalle");
  });

  it("err sin detalle no añade la propiedad", () => {
    expect(err("X").error).toEqual({ code: "X" });
  });

  it("map transforma solo el caso ok", () => {
    const doubled = map(ok(2) as Result<number>, (v) => v * 2);
    expect(doubled).toEqual({ ok: true, value: 4 });
    const failed = map(err("E") as Result<number>, (v) => v * 2);
    expect(failed).toEqual({ ok: false, error: { code: "E" } });
  });

  it("flatMap encadena y propaga el primer error", () => {
    const half = (v: number): Result<number> => (v % 2 === 0 ? ok(v / 2) : err("ODD"));
    expect(flatMap(ok(4) as Result<number>, half)).toEqual({ ok: true, value: 2 });
    expect(flatMap(ok(3) as Result<number>, half)).toEqual({ ok: false, error: { code: "ODD" } });
    expect(flatMap(err("FIRST") as Result<number>, half)).toEqual({ ok: false, error: { code: "FIRST" } });
  });

  it("el objeto Result expone las mismas funciones", () => {
    expect(Result.map).toBe(map);
    expect(Result.flatMap).toBe(flatMap);
  });
});
