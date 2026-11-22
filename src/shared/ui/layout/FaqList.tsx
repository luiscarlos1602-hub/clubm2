import { Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "@/shared/ui/brand/types";

export type FaqItem = { readonly q: string; readonly a: string };

/** Acordeón nativo (<details>): sin JavaScript, con teclado, separado por filetes Arena. */
export function FaqList({ items, className, "data-testid": testId = "faq-list" }: TestIdProp & { items: readonly FaqItem[] }) {
  return (
    <div data-testid={testId} className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-5 font-heading text-lg font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
            {item.q}
            <Plus aria-hidden className="size-5 shrink-0 transition-transform group-open:rotate-45" />
          </summary>
          <p className="max-w-[64ch] pb-6 text-base leading-relaxed text-muted-foreground">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
