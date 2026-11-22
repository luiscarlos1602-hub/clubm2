import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type BulletMarker = "check" | "dash" | "dot";

/** Lista con marcador de marca: check = lo que tienes, dash = riesgos y matices, dot = notas. */
export function BulletList({
  items,
  marker = "dot",
  className,
}: {
  items: readonly ReactNode[];
  marker?: BulletMarker;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-4 text-base leading-relaxed", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          {marker === "check" ? <Check aria-hidden className="mt-1 size-4 shrink-0" /> : null}
          {marker === "dash" ? <span aria-hidden className="mt-3 h-px w-4 shrink-0 bg-line" /> : null}
          {marker === "dot" ? <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-foreground" /> : null}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
