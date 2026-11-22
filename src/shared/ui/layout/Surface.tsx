import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "@/shared/ui/brand/types";

export type SurfaceProps = TestIdProp & {
  children: ReactNode;
  /** card = tarjeta del tono actual; dark = bloque Verde Profundo dentro de una banda clara (riesgos, reparto). */
  variant?: "card" | "dark";
  padding?: "sm" | "md" | "lg";
  as?: "div" | "article" | "li" | "aside";
  labelledBy?: string;
};

const PAD = { sm: "p-5", md: "p-6 md:p-7", lg: "p-7 md:p-10" } as const;

/** Tarjeta de la portada: radio 2xl, borde suave, mucho aire. */
export function Surface({
  children,
  variant = "card",
  padding = "md",
  as: Tag = "div",
  labelledBy,
  className,
  "data-testid": testId,
}: SurfaceProps) {
  return (
    <Tag
      data-tone={variant === "dark" ? "dark" : undefined}
      data-testid={testId}
      aria-labelledby={labelledBy}
      className={cn(
        "flex flex-col gap-5 rounded-2xl",
        variant === "card" && "border border-border bg-card text-card-foreground",
        PAD[padding],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
