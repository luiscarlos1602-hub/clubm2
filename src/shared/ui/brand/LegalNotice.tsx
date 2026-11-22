import { cn } from "@/shared/lib/utils";
import { LEGAL_COPY, type LegalNoticeKey } from "./legal-copy";
import type { TestIdProp } from "./types";

export type LegalNoticeProps = TestIdProp & {
  notice: Exclude<LegalNoticeKey, "projectionTag" | "targetTermSuffix">;
  variant?: "inline" | "block";
};

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export function LegalNotice({ notice, variant = "block", className, "data-testid": testId }: LegalNoticeProps) {
  return (
    <p
      data-testid={testId ?? `aviso-${kebab(notice)}`}
      className={cn(
        variant === "block" ? "max-w-[72ch] border-l-2 border-line pl-4 text-sm text-muted-foreground" : "text-xs text-muted-foreground",
        className,
      )}
    >
      {LEGAL_COPY[notice]}
    </p>
  );
}
