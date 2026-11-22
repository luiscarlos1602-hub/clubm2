import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "./types";

export type EmptyStateProps = TestIdProp & {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export function EmptyState({ title, description, icon: Icon, action, className, "data-testid": testId = "empty-state" }: EmptyStateProps) {
  return (
    <div
      data-testid={testId}
      className={cn("flex flex-col items-center gap-3 rounded-md border border-dashed border-laton px-6 py-12 text-center", className)}
    >
      {Icon ? <Icon aria-hidden className="size-8 text-muted-foreground" /> : null}
      <p className="font-heading text-xl font-medium text-foreground">{title}</p>
      {description ? <p className="max-w-[48ch] text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
