import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "@/shared/ui/brand/types";

export type TableScrollProps = TestIdProp & { label: string; children: ReactNode };

/** Contiene el desborde horizontal de una tabla dentro de su tarjeta; enfocable con teclado. */
export function TableScroll({ label, children, className, "data-testid": testId = "tabla-admin" }: TableScrollProps) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      data-testid={testId}
      className={cn(
        "relative min-w-0 max-w-full overflow-x-auto rounded-2xl border border-border bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-medium [&_th]:tracking-wide [&_th]:text-muted-foreground [&_th]:uppercase [&_tbody_tr]:border-t [&_tbody_tr]:border-border">
        {children}
      </table>
    </div>
  );
}
