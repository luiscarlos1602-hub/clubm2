import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "@/shared/ui/brand/types";
import { PAGE_CONTAINER, SECTION_SPACING, type SectionSpacing, type SurfaceTone } from "./layout-tokens";

export type SectionProps = TestIdProp & {
  children: ReactNode;
  /** Tono de la banda (ADR-010). Todo lo de dentro se adapta por variables CSS. */
  tone?: SurfaceTone;
  spacing?: SectionSpacing;
  /** id del título visible; si no hay título, usa `label`. */
  labelledBy?: string;
  label?: string;
  id?: string;
  /** Filete Arena arriba (separa dos bandas del mismo tono). */
  ruled?: boolean;
  /** Clases del contenedor interno (grid, gap…). */
  innerClassName?: string;
};

/** Banda a todo el ancho con el contenedor de página dentro. Unidad básica de cualquier pantalla. */
export function Section({
  children,
  tone = "light",
  spacing = "lg",
  labelledBy,
  label,
  id,
  ruled = false,
  className,
  innerClassName,
  "data-testid": testId,
}: SectionProps) {
  return (
    <section
      id={id}
      data-tone={tone}
      data-testid={testId}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      className={cn("relative scroll-mt-28", ruled && "border-t border-line", className)}
    >
      <div className={cn(PAGE_CONTAINER, SECTION_SPACING[spacing], "relative", innerClassName)}>{children}</div>
    </section>
  );
}
