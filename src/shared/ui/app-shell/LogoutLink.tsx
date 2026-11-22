"use client";

import Link from "next/link";
import { useDemoRoleStore } from "./role-store";
import { routeHref } from "./route-map";
import { SHELL_COPY } from "./shell-copy";

/** "Salir" en las zonas con sesión: vuelve a visitante y a la portada (el rol lo fija /ingresar). */
export function LogoutLink() {
  const setRole = useDemoRoleStore((s) => s.setRole);
  return (
    <Link
      href={routeHref("p1")}
      data-testid="salir"
      onClick={() => setRole("visitor")}
      className="rounded-md px-2 py-1 text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {SHELL_COPY.logout}
    </Link>
  );
}
