import { cn } from "@/shared/lib/utils";

/** Numeración de pasos y pilares: 01, 02… en Plex Mono. `n` empieza en 1. */
export function IndexLabel({ n, className }: { n: number; className?: string }) {
  return <span className={cn("font-mono text-xs text-muted-foreground", className)}>{String(n).padStart(2, "0")}</span>;
}
