import type { DomainError, Result } from "@/shared/domain/result";
import type { KeyValueStorage } from "./browser-storage";

export type SliceReader<T> = { read(): T };

/** Lectura y escritura de una parte del snapshot (W-1): lo usan los `save` de los repos mock. */
export type SliceStore<T> = SliceReader<T> & { update(change: (current: T) => T): T };

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

/** La parte `key` del snapshot como SliceStore: escribir en ella persiste el snapshot entero. */
export function sliceOf<S, K extends keyof S>(store: DemoStore<S>, key: K): SliceStore<S[K]> {
  return {
    read: () => store.read()[key],
    update: (change) => store.update((current) => ({ ...current, [key]: change(current[key]) }))[key],
  };
}

/** Slice solo en memoria, para tests y suites de contrato. */
export function memorySlice<T>(initial: T): SliceStore<T> {
  let current = initial;
  return {
    read: () => current,
    update(change) {
      current = change(current);
      return current;
    },
  };
}

/** Reemplaza en su sitio el elemento con la misma clave o lo añade al final. No muta `list`. */
export function upsertBy<T>(list: readonly T[], item: T, sameKey: (a: T, b: T) => boolean): readonly T[] {
  const index = list.findIndex((x) => sameKey(x, item));
  if (index === -1) return [...list, item];
  return list.map((x, i) => (i === index ? item : x));
}
