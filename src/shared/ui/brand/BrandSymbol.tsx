import { useId } from "react";
import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "./types";

export type BrandSymbolProps = TestIdProp & {
  /** Etiqueta accesible. Sin ella el símbolo es decorativo (aria-hidden). */
  title?: string;
};

/**
 * Símbolo de la marca (ADR-009): una casa con su cara lateral y dos vanos que suben,
 * metros que se suman. Toma el color de `currentColor`; la cara lateral va al 72 %.
 * Trazado provisional a partir de la imagen de marca: se reemplaza por el SVG oficial sin cambiar la API.
 */
export function BrandSymbol({ title, className, "data-testid": testId = "brand-symbol" }: BrandSymbolProps) {
  const maskId = `m2-vanos-${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 48 48"
      data-testid={testId}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("size-10 shrink-0", className)}
      fill="currentColor"
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
        <rect width="48" height="48" fill="white" />
        <rect x="11" y="31" width="5.5" height="13" fill="black" />
        <rect x="19.5" y="24" width="5.5" height="20" fill="black" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path d="M4 44V18.5L29 5v39H4Z" />
        <path d="M29 5l15 9.5V44H29V5Z" opacity="0.72" />
      </g>
    </svg>
  );
}
