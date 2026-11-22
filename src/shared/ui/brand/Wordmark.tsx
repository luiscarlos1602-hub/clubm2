import { brand } from "@/shared/config/brand";
import { cn } from "@/shared/lib/utils";
import { BrandSymbol } from "./BrandSymbol";
import type { TestIdProp } from "./types";

export type WordmarkProps = TestIdProp & {
  size?: "sm" | "md" | "lg";
  /** Eslogan debajo (móvil) o a la derecha (≥ md). */
  withTagline?: boolean;
  /** Símbolo de la casa a la izquierda, separado por un filete (imagen de marca). */
  withSymbol?: boolean;
};

const TEXT = { sm: "text-xl", md: "text-3xl", lg: "text-5xl md:text-6xl" } as const;
const SYMBOL = { sm: "size-7", md: "size-10", lg: "size-14 md:size-16" } as const;
const RULE = { sm: "h-6", md: "h-9", lg: "h-12 md:h-14" } as const;

/** Logotipo. Hereda el color del contenedor (`currentColor`): Verde Profundo sobre Crema, Crema sobre Verde Profundo. */
export function Wordmark({
  size = "md",
  withTagline = false,
  withSymbol = true,
  className,
  "data-testid": testId = "wordmark",
}: WordmarkProps) {
  return (
    <div
      data-testid={testId}
      aria-label={withTagline ? `${brand.name}. ${brand.tagline}` : brand.name}
      role="img"
      className={cn("inline-flex flex-col gap-1 md:flex-row md:items-center md:gap-4", className)}
    >
      <span aria-hidden className="inline-flex items-center gap-3">
        {withSymbol ? (
          <>
            <BrandSymbol className={SYMBOL[size]} />
            <span className={cn("w-px bg-current opacity-40", RULE[size])} />
          </>
        ) : null}
        <span className={cn("font-heading font-medium tracking-tight", TEXT[size])}>
          {brand.wordmark.base}
          <sup className="relative -top-[0.1em] ml-[0.02em] align-super text-[0.55em] leading-none">{brand.wordmark.mark}</sup>
        </span>
      </span>
      {withTagline ? (
        <span aria-hidden className="font-sans text-sm opacity-80">
          {brand.tagline}
        </span>
      ) : null}
    </div>
  );
}
