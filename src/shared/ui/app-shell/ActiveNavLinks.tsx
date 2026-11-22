"use client";

import { usePathname } from "next/navigation";
import { NavLinks, type NavLinksProps } from "./NavLinks";
import { activeRouteId } from "./route-map";

export type ActiveNavLinksProps = Omit<NavLinksProps, "activeId">;

/** Siempre dentro de <Suspense> (cacheComponents + rutas dinámicas). */
export function ActiveNavLinks(props: ActiveNavLinksProps) {
  const pathname = usePathname();
  return <NavLinks {...props} activeId={activeRouteId(pathname, props.zone)} />;
}
