import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "./types";

export type StatusTone = "positive" | "in-progress" | "attention" | "neutral";
export type StatusBadgeProps = TestIdProp & {
  tone: StatusTone;
  /** Lo da el copy.ts del módulo que lo usa (p. ej. "En obra"). */
  label: string;
};

const TONE: Record<StatusTone, string> = {
  positive: "border-secondary bg-secondary text-secondary-foreground",
  "in-progress": "border-line bg-transparent text-foreground",
  attention: "border-destructive bg-transparent text-destructive",
  neutral: "border-muted-foreground/40 bg-transparent text-muted-foreground",
};

export function StatusBadge({ tone, label, className, "data-testid": testId = "status-badge" }: StatusBadgeProps) {
  return (
    <span
      data-testid={testId}
      data-tone={tone}
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE[tone],
        className,
      )}
    >
      {tone === "in-progress" ? <span aria-hidden className="size-1.5 rounded-full bg-line" /> : null}
      {label}
    </span>
  );
}
