import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

/** Rótulo en versalitas espaciadas (imagen de marca). Sobre dark sale en Arena; sobre claro, en Musgo. */
export function Eyebrow({ children, className, as: Tag = "p" }: { children: ReactNode; className?: string; as?: "p" | "span" }) {
  return <Tag className={cn("text-xs font-medium tracking-[0.28em] text-muted-foreground uppercase", className)}>{children}</Tag>;
}
