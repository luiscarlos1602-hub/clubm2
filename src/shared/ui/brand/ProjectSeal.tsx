import { formatIsoDate } from "@/shared/lib/format-date";
import { cn } from "@/shared/lib/utils";
import { BRAND_COPY } from "./brand-copy";
import type { TestIdProp } from "./types";

export type ProjectCode = `M2-${string}`;
export type ProjectSealProps = TestIdProp & {
  code: ProjectCode;
  /** ISO "YYYY-MM-DD". */
  date: string;
  dateLabel?: string;
  size?: "sm" | "md";
};

export function ProjectSeal({
  code,
  date,
  dateLabel = BRAND_COPY.sealDateLabel,
  size = "md",
  className,
  "data-testid": testId = "project-seal",
}: ProjectSealProps) {
  return (
    <div
      data-testid={testId}
      className={cn("aspect-square shrink-0 border-2 border-laton p-1 font-mono text-foreground", size === "md" ? "w-28" : "w-20", className)}
    >
      <div className="flex size-full flex-col items-center justify-center gap-0.5 border border-laton text-center">
        <span className={cn("font-medium tracking-wider", size === "md" ? "text-base" : "text-xs")}>{code}</span>
        <span className={cn("text-foreground", size === "md" ? "text-[11px]" : "text-[10px]")}>
          {dateLabel} · {formatIsoDate(date, "numeric")}
        </span>
      </div>
    </div>
  );
}
