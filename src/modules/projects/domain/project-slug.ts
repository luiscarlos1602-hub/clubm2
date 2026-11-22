/** Forma de un slug de proyecto (kebab-case en minúsculas). Es el mismo patrón que valida la semilla. */
export const PROJECT_SLUG_PATTERN: RegExp = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** D4: el servidor solo rechaza formatos inválidos; si el slug existe lo decide el cliente. Nunca lanza. */
export function isProjectSlug(raw: unknown): raw is string {
  return typeof raw === "string" && PROJECT_SLUG_PATTERN.test(raw);
}
