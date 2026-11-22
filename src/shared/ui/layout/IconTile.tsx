import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/** Ícono en cuadro de marca. Se invierte solo: Verde Profundo sobre claro, Crema sobre dark. */
export function IconTile({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background", className)}>
      <Icon aria-hidden className="size-5" />
    </span>
  );
}
