import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/primitives/button";
import type { TestIdProp } from "@/shared/ui/brand/types";
import type { Zone } from "./demo-role";
import { routeCopy } from "./route-copy";
import { NAV_ITEMS, PUBLIC_NAV_CTA, routeHref, type RouteId } from "./route-map";

export type NavLinksProps = TestIdProp & {
  zone: Zone;
  orientation: "horizontal" | "vertical";
  /** aria-current="page" en ese enlace. */
  activeId: RouteId | null;
  /** MobileNav lo usa para cerrar el Sheet. */
  onNavigate?: () => void;
};

export function NavLinks({ zone, orientation, activeId, onNavigate, className, "data-testid": testId }: NavLinksProps) {
  const vertical = orientation === "vertical";
  return (
    <ul data-testid={testId} className={cn("flex gap-1", vertical ? "flex-col" : "flex-row items-center gap-2", className)}>
      {NAV_ITEMS[zone].map((id) => {
        const active = id === activeId;
        const label = routeCopy(id).navLabel;
        const isCta = zone === "public" && id === PUBLIC_NAV_CTA;
        return (
          <li key={id} className={cn(isCta && (vertical ? "mt-3" : "ml-2"))}>
            {isCta ? (
              <Button asChild size={vertical ? "lg" : "sm"} className={cn(vertical && "w-full")}>
                <Link
                  href={routeHref(id)}
                  aria-current={active ? "page" : undefined}
                  data-testid={`nav-link-${id}`}
                  onClick={onNavigate}
                >
                  {label}
                </Link>
              </Button>
            ) : (
              <Link
                href={routeHref(id)}
                aria-current={active ? "page" : undefined}
                data-testid={`nav-link-${id}`}
                onClick={onNavigate}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-md px-3 text-[15px] text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                  vertical && "w-full border-l-2 border-transparent rounded-l-none",
                  !vertical && "border-b-2 border-transparent rounded-b-none",
                  active && "font-medium aria-[current=page]:border-foreground",
                )}
              >
                {label}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
