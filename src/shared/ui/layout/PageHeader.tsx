import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "@/shared/ui/brand/types";
import { Eyebrow } from "./Eyebrow";
import { Section } from "./Section";

export type PageHeaderProps = TestIdProp & {
  /** id del h1 (para aria-labelledby). */
  id: string;
  title: ReactNode;
  eyebrow?: string;
  description?: string;
  /** Botones o enlaces (el principal primero). */
  actions?: ReactNode;
  /** Columna derecha opcional (ilustración, resumen, sello). */
  aside?: ReactNode;
  tone?: "dark" | "light";
  size?: "md" | "lg";
};

/** Cabecera de pantalla: la portada en pequeño. Un solo h1 por pantalla. */
export function PageHeader({
  id,
  title,
  eyebrow,
  description,
  actions,
  aside,
  tone = "dark",
  size = "md",
  className,
  "data-testid": testId = "page-header",
}: PageHeaderProps) {
  return (
    <Section
      tone={tone}
      spacing={size === "lg" ? "lg" : "md"}
      labelledBy={id}
      data-testid={testId}
      className={className}
      innerClassName={cn("grid items-center gap-12", aside && "lg:grid-cols-12 lg:gap-10")}
    >
      <div className={cn("flex flex-col gap-6", aside && "lg:col-span-7")}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1
          id={id}
          className={cn(
            "font-heading leading-[1.05] font-semibold tracking-tight text-balance",
            size === "lg" ? "text-5xl md:text-7xl" : "text-4xl md:text-5xl",
          )}
        >
          {title}
        </h1>
        <span aria-hidden className="h-px w-12 bg-line" />
        {description ? <p className="max-w-[60ch] text-lg leading-relaxed text-foreground/85">{description}</p> : null}
        {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
      </div>
      {aside ? <div className="lg:col-span-5">{aside}</div> : null}
    </Section>
  );
}
