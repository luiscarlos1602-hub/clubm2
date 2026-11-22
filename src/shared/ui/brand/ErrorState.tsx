import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { BRAND_COPY } from "./brand-copy";
import type { TestIdProp } from "./types";

export type ErrorStateProps = TestIdProp & {
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function ErrorState({
  title = BRAND_COPY.errorDefaultTitle,
  description,
  action,
  className,
  "data-testid": testId = "error-state",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      data-testid={testId}
      className={cn("flex flex-col items-start gap-2 rounded-md border border-destructive px-5 py-4 text-destructive", className)}
    >
      <p className="font-heading text-lg font-medium">{title}</p>
      {description ? <p className="text-sm text-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
