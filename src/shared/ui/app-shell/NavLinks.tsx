import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/primitives/button";
import type { TestIdProp } from "@/shared/ui/brand/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/primitives/tooltip";
import type { Zone } from "./demo-role";
import { ROUTE_ICONS } from "./route-icons";
import { routeCopy } from "./route-copy";
import { NAV_ITEMS, PUBLIC_NAV_CTA, routeHref, type RouteId } from "./route-map";

export type NavLinksProps = TestIdProp & {
  zone: Zone;
  orientation: "horizontal" | "vertical";
  /** aria-current="page" en ese enlace. */
  activeId: RouteId | null;
  /** Muestra el icono de cada ruta delante del texto (menú lateral del admin). */
  showIcons?: boolean;
  /** Solo iconos (menú lateral plegado): el texto pasa a `aria-label` y a un tooltip. */
  collapsed?: boolean;
  /** MobileNav lo usa para cerrar el Sheet. */
  onNavigate?: () => void;
};

export function NavLinks({ zone, orientation, activeId, onNavigate, showIcons = false, collapsed = false, className, "data-testid": testId }: NavLinksProps) {
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
              <NavItem
                id={id}
                label={label}
                active={active}
                vertical={vertical}
                icon={showIcons || collapsed}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

type NavItemProps = {
  id: RouteId;
  label: string;
  active: boolean;
  vertical: boolean;
  icon: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
};

function NavItem({ id, label, active, vertical, icon, collapsed, onNavigate }: NavItemProps) {
  const Icon = ROUTE_ICONS[id];
  const link = (
    <Link
      href={routeHref(id)}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      data-testid={`nav-link-${id}`}
      onClick={onNavigate}
      className={cn(
        "inline-flex min-h-11 items-center gap-3 rounded-md px-3 text-[15px] text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        vertical && "w-full border-l-2 border-transparent rounded-l-none",
        !vertical && "border-b-2 border-transparent rounded-b-none",
        collapsed && "justify-center px-0",
        active && "font-medium aria-[current=page]:border-foreground",
      )}
    >
      {icon ? <Icon aria-hidden className="size-5 shrink-0" /> : null}
      {collapsed ? null : <span>{label}</span>}
    </Link>
  );
  if (!collapsed) return link;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
