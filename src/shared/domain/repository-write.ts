import type { DomainError, Result } from "./result";

/**
 * Errores de un `save` de repositorio (W-1). Los mismos códigos sirven al mock y a Supabase (DB-4):
 * - INVALID_RECORD: el registro no pasa el esquema (zod en local; check constraints en BD).
 * - DUPLICATE: choca con una clave única (código, slug, una fila por proyecto…).
 * - REFERENCE_NOT_FOUND: apunta a un registro que no existe (FK).
 */
export const REPOSITORY_WRITE_ERROR_CODES = ["INVALID_RECORD", "DUPLICATE", "REFERENCE_NOT_FOUND"] as const;
export type RepositoryWriteErrorCode = (typeof REPOSITORY_WRITE_ERROR_CODES)[number];
export type RepositoryWriteError = DomainError<RepositoryWriteErrorCode>;
export type SaveResult<T> = Promise<Result<T, RepositoryWriteError>>;
