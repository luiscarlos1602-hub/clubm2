import type { DomainError, Result } from "@/shared/domain/result";
import type { KeyValueStorage } from "./browser-storage";

export type SliceReader<T> = { read(): T };

export type DemoStore<S> = {
  readonly key: string;
  /** Caché en memoria. Si falta la clave o no pasa `parse`: buildSeed(), persiste y lo devuelve. */
  read(): S;
  /** Actualiza la caché y persiste; si setItem falla (cuota), avisa y sigue en memoria. */
  write(next: S): void;
  update(change: (current: S) => S): S;
  /** "Reiniciar datos simulados": removeItem(key) → buildSeed() → persiste → devuelve. */
  reset(): S;
};

export type DemoStoreOptions<S> = {
  readonly key: string;
  /** null = solo memoria. */
  readonly storage: KeyValueStorage | null;
  readonly buildSeed: () => S;
  readonly parse: (raw: unknown) => Result<S, DomainError<"INVALID_SNAPSHOT">>;
};

export function createDemoStore<S>(options: DemoStoreOptions<S>): DemoStore<S> {
  const { key, storage, buildSeed, parse } = options;
  let cache: S | undefined;

  function persist(value: S): void {
    if (storage === null) return;
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`demo-store: no se pudo persistir "${key}"; se sigue en memoria.`, error);
    }
  }

  function seed(): S {
    const fresh = buildSeed();
    cache = fresh;
    persist(fresh);
    return fresh;
  }

  function load(): S {
    if (storage === null) return seed();
    let raw: string | null;
    try {
      raw = storage.getItem(key);
    } catch {
      return seed();
    }
    if (raw === null) return seed();
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return seed();
    }
    const parsed = parse(json);
    if (!parsed.ok) return seed();
    cache = parsed.value;
    return parsed.value;
  }

  return {
    key,
    read: () => (cache === undefined ? load() : cache),
    write(next) {
      cache = next;
      persist(next);
    },
    update(change) {
      const next = change(cache === undefined ? load() : cache);
      cache = next;
      persist(next);
      return next;
    },
    reset() {
      if (storage !== null) {
        try {
          storage.removeItem(key);
        } catch {
          // sin acceso al almacenamiento: se reinicia solo la memoria
        }
      }
      return seed();
    },
  };
}
