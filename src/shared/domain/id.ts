import { err, ok, type DomainError, type Result } from "./result";

export type Id<Tag extends string> = string & { readonly __brand: Tag };

const ID_PATTERN = /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/;

/** Sin validación: ids de semilla legibles (`prj_chacao_01`) y tests. */
export function asId<Tag extends string>(raw: string): Id<Tag> {
  return raw as Id<Tag>;
}

/** Frontera. Formato: prefijo en minúsculas y al menos un segmento `_xxx`. */
export function parseId<Tag extends string>(raw: unknown): Result<Id<Tag>, DomainError<"INVALID_ID">> {
  if (typeof raw !== "string" || !ID_PATTERN.test(raw)) {
    return err("INVALID_ID", "formato esperado: prefijo_segmento (minúsculas, dígitos y _)");
  }
  return ok(asId<Tag>(raw));
}

/** Puerto: la implementación vive en infrastructure (F1-4). */
export interface IdGenerator {
  next<Tag extends string>(prefix: string): Id<Tag>;
}
