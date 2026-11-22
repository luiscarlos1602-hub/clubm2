import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { LEGAL_COPY } from "./legal-copy";
import type { TestIdProp } from "./types";

export type ProjectionLabelProps = TestIdProp & {
  /** Cifra o texto futuro al que acompaña; sin children, solo pinta la etiqueta. */
  children?: ReactNode;
  placement?: "inline" | "below";
};

export function ProjectionLabel({
  children,
  placement = "below",
  className,
  "data-testid": testId = "projection-label",
}: ProjectionLabelProps) {
  const tag = (
    <span
      data-testid={testId}
      className="inline-flex items-center gap-1.5 border-l-2 border-line pl-2 font-mono text-xs tracking-wide text-muted-foreground"
    >
      {LEGAL_COPY.projectionTag}
    </span>
  );
  if (children === undefined) return <span className={className}>{tag}</span>;
  return (
    <span className={cn("inline-flex", placement === "below" ? "flex-col items-start gap-1" : "flex-row flex-wrap items-baseline gap-2", className)}>
      {children}
      {tag}
    </span>
  );
}
