import type { PropertyId } from "./project";

/** Texto de ejemplo del inmueble (maqueta → semilla). Sin dirección exacta (D6). */
export type PropertyProfile = {
  readonly propertyId: PropertyId;
  readonly description: string;
  /** 1..5 puntos destacados. */
  readonly highlights: readonly string[];
};
