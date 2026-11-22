import { cn } from "@/shared/lib/utils";
import { LEGAL_COPY } from "./legal-copy";
import type { TestIdProp } from "./types";

export type DemoBannerProps = TestIdProp & {
  /** bar = franja Verde Ávila a todo el ancho; inline = recuadro. */
  variant?: "bar" | "inline";
};

export function DemoBanner({ variant = "bar", className, "data-testid": testId = "demo-banner" }: DemoBannerProps) {
  return (
    <div
      role="note"
      data-testid={testId}
      className={cn(
        variant === "bar"
          ? "w-full bg-secondary px-4 py-2 text-center text-sm text-secondary-foreground"
          : "rounded-md border border-laton px-4 py-3 text-sm text-foreground",
        className,
      )}
    >
      {LEGAL_COPY.demoBanner}
    </div>
  );
}
