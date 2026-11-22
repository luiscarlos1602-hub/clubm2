import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import { parseProjectCode, type ProjectCode } from "./project";
import { PROJECT_SLUG_PATTERN } from "./project-slug";

const PREFIX_PATTERN = /^[A-Z0-9]{1,4}$/;
const MAX_SEQUENCE = 999;

/**
 * Siguiente código libre: max(n) + 1 con el prefijo dado (brand.shortName, inyectado).
 * ["M2-001","M2-007"] → "M2-008". No rellena huecos; ignora códigos de otro prefijo. Nunca lanza.
 */
export function nextProjectCode(
  existing: readonly ProjectCode[],
  prefix: string,
): Result<ProjectCode, DomainError<"INVALID_PROJECT_CODE" | "CODE_SPACE_EXHAUSTED">> {
  if (!PREFIX_PATTERN.test(prefix)) {
    return err("INVALID_PROJECT_CODE", "el prefijo debe tener 1–4 mayúsculas o dígitos");
  }
  const own = new RegExp(`^${prefix}-(\\d{3})$`);
  const max = existing.reduce((acc, code) => {
    const match = own.exec(code);
    return match === null ? acc : Math.max(acc, Number(match[1]));
  }, 0);
  if (max >= MAX_SEQUENCE) {
    return err("CODE_SPACE_EXHAUSTED", `no quedan códigos libres con el prefijo ${prefix}`);
  }
  return parseProjectCode(`${prefix}-${String(max + 1).padStart(3, "0")}`);
}

/** Zona → kebab-case ASCII: sin tildes (la ñ pasa a n), minúsculas, un solo guion entre palabras. */
function kebabZone(zone: string): string {
  return zone
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** `${code.toLowerCase()}-${kebab(zona)}`; "M2-008" + "Los Palos Grandes" → "m2-008-los-palos-grandes". Nunca lanza. */
export function buildProjectSlug(
  code: ProjectCode,
  zone: string,
): Result<string, DomainError<"INVALID_SLUG">> {
  const zonePart = kebabZone(zone);
  if (zonePart === "") return err("INVALID_SLUG", "la zona no produce un slug válido");
  const slug = `${code.toLowerCase()}-${zonePart}`;
  return PROJECT_SLUG_PATTERN.test(slug) ? ok(slug) : err("INVALID_SLUG", `slug inválido: ${slug}`);
}
