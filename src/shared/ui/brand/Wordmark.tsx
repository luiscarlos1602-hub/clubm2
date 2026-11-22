import { brand } from "@/shared/config/brand";
import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "./types";

export type WordmarkProps = TestIdProp & {
  size?: "sm" | "md" | "lg";
  /** Eslogan en Inter debajo (móvil) o a la derecha (≥ md). */
  withTagline?: boolean;
};

const SIZE = { sm: "text-xl", md: "text-3xl", lg: "text-5xl md:text-6xl" } as const;

export function Wordmark({ size = "md", withTagline = false, className, "data-testid": testId = "wordmark" }: WordmarkProps) {
  return (
    <div
      data-testid={testId}
      aria-label={withTagline ? `${brand.name}. ${brand.tagline}` : brand.name}
      role="img"
      className={cn("inline-flex flex-col gap-1 md:flex-row md:items-baseline md:gap-4", className)}
    >
      <span aria-hidden className={cn("font-heading font-medium tracking-tight text-foreground", SIZE[size])}>
        {brand.wordmark.base}
        <span className="text-laton">{brand.wordmark.mark}</span>
      </span>
      {withTagline ? (
        <span aria-hidden className="font-sans text-sm text-muted-foreground">
          {brand.tagline}
        </span>
      ) : null}
    </div>
  );
}
