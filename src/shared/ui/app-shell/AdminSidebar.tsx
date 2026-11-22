"use client";

import { Suspense, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ActiveNavLinks } from "./ActiveNavLinks";
import { NavLinks } from "./NavLinks";
import { SHELL_COPY } from "./shell-copy";

const NAV_ID = "admin-nav";

/** Menú lateral del backoffice (escritorio): con iconos y plegable a solo iconos. En móvil lo reemplaza el Sheet. */
export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const Toggle = collapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <aside
      data-testid="admin-sidebar"
      data-collapsed={collapsed}
      className={cn(
        "hidden shrink-0 border-r border-line/40 bg-card transition-[width] duration-200 motion-reduce:transition-none lg:block",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="sticky top-4 flex flex-col gap-2 p-2 pt-4">
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-controls={NAV_ID}
          aria-label={collapsed ? SHELL_COPY.sidebarExpand : SHELL_COPY.sidebarCollapse}
          data-testid="admin-sidebar-toggle"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "inline-flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
            collapsed ? "justify-center px-0" : "justify-start",
          )}
        >
          <Toggle aria-hidden className="size-5 shrink-0" />
          {collapsed ? null : <span>{SHELL_COPY.sidebarCollapse}</span>}
        </button>
        <nav id={NAV_ID} aria-label={SHELL_COPY.navLabel.admin} data-testid="nav-principal">
          <Suspense fallback={<NavLinks zone="admin" orientation="vertical" activeId={null} showIcons collapsed={collapsed} />}>
            <ActiveNavLinks zone="admin" orientation="vertical" showIcons collapsed={collapsed} />
          </Suspense>
        </nav>
      </div>
    </aside>
  );
}
