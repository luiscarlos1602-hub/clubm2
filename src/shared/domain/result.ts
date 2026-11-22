/** Errores de negocio como valores, nunca excepciones (docs/01 §5). */
export type DomainError<C extends string = string> = {
  readonly code: C;
  readonly detail?: string;
};
export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = DomainError> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<C extends string>(code: C, detail?: string): Err<DomainError<C>> {
  return { ok: false, error: detail === undefined ? { code } : { code, detail } };
}

export function map<T, U, E>(r: Result<T, E>, f: (v: T) => U): Result<U, E> {
  return r.ok ? ok(f(r.value)) : r;
}

export function flatMap<T, U, E, F>(r: Result<T, E>, f: (v: T) => Result<U, F>): Result<U, E | F> {
  return r.ok ? f(r.value) : r;
}

/** Mismo nombre que el tipo: permite `Result.err("INVALID_TRANSITION")` como en docs/02 §2. */
export const Result: {
  readonly ok: typeof ok;
  readonly err: typeof err;
  readonly map: typeof map;
  readonly flatMap: typeof flatMap;
} = Object.freeze({ ok, err, map, flatMap });
