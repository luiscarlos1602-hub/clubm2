import { describe, expect, it, vi } from "vitest";
import { err, ok } from "@/shared/domain/result";
import { memoryStorage, type KeyValueStorage } from "./browser-storage";
import { createDemoStore } from "./demo-store";

type S = { readonly n: number };
const KEY = "club-demo:v1";

const parse = (raw: unknown) =>
  typeof raw === "object" && raw !== null && typeof (raw as { n?: unknown }).n === "number"
    ? ok(raw as S)
    : err("INVALID_SNAPSHOT" as const);

function make(storage: KeyValueStorage | null, seed = 1) {
  const buildSeed = vi.fn(() => ({ n: seed }));
  return { store: createDemoStore<S>({ key: KEY, storage, buildSeed, parse }), buildSeed };
}

describe("Demo-store", () => {
  it("primera lectura siembra y persiste en club-demo:v1", () => {
    const storage = memoryStorage();
    const { store } = make(storage);
    expect(store.read()).toEqual({ n: 1 });
    expect(JSON.parse(storage.getItem(KEY) ?? "null")).toEqual({ n: 1 });
  });

  it("segunda instancia lee lo persistido", () => {
    const storage = memoryStorage();
    make(storage, 1).store.write({ n: 7 });
    const second = make(storage, 1);
    expect(second.store.read()).toEqual({ n: 7 });
    expect(second.buildSeed).not.toHaveBeenCalled();
  });

  it("JSON corrupto se descarta y se vuelve a sembrar", () => {
    const storage = memoryStorage({ [KEY]: "{no es json" });
    const { store } = make(storage, 3);
    expect(store.read()).toEqual({ n: 3 });
    expect(JSON.parse(storage.getItem(KEY) ?? "null")).toEqual({ n: 3 });
  });

  it("snapshot que no pasa parse se vuelve a sembrar", () => {
    const storage = memoryStorage({ [KEY]: JSON.stringify({ x: 1 }) });
    expect(make(storage, 4).store.read()).toEqual({ n: 4 });
  });

  it("reset borra la clave y devuelve las semillas", () => {
    const storage = memoryStorage();
    const { store } = make(storage, 1);
    store.write({ n: 99 });
    expect(store.reset()).toEqual({ n: 1 });
    expect(store.read()).toEqual({ n: 1 });
    expect(JSON.parse(storage.getItem(KEY) ?? "null")).toEqual({ n: 1 });
  });

  it("update aplica el cambio y persiste", () => {
    const storage = memoryStorage();
    const { store } = make(storage);
    expect(store.update((c) => ({ n: c.n + 1 }))).toEqual({ n: 2 });
    expect(JSON.parse(storage.getItem(KEY) ?? "null")).toEqual({ n: 2 });
  });

  it("sin storage funciona en memoria", () => {
    const { store } = make(null);
    expect(store.read()).toEqual({ n: 1 });
    store.write({ n: 5 });
    expect(store.read()).toEqual({ n: 5 });
    expect(store.reset()).toEqual({ n: 1 });
  });

  it("setItem que falla no rompe la lectura", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const broken: KeyValueStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => undefined,
    };
    const { store } = make(broken);
    expect(store.read()).toEqual({ n: 1 });
    store.write({ n: 2 });
    expect(store.read()).toEqual({ n: 2 });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
