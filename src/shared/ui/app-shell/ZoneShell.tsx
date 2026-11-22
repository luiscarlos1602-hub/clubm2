import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { brand } from "@/shared/config/brand";
import { cn } from "@/shared/lib/utils";
import { DemoBanner, LegalNotice, Wordmark } from "@/shared/ui/brand";
import type { TestIdProp } from "@/shared/ui/brand/types";
import { ActiveNavLinks } from "./ActiveNavLinks";
import { DemoToolbar } from "./DemoToolbar";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";
import { SkipLink } from "./SkipLink";
import { ROLE_HOME, ZONE_DEFAULT_ROLE, type Zone } from "./demo-role";
import { SHELL_COPY } from "./shell-copy";

export type ZoneShellProps = TestIdProp & {
  zone: Zone;
  children: ReactNode;
  /** Hueco para herramientas de simulación en la barra bajo el banner. */
  demoTools?: ReactNode;
};

const CONTAINER = "mx-auto w-full max-w-7xl px-5 md:px-10";

function ZoneNav({ zone, orientation }: { zone: Zone; orientation: "horizontal" | "vertical" }) {
  return (
    <Suspense fallback={<NavLinks zone={zone} orientation={orientation} activeId={null} />}>
      <ActiveNavLinks zone={zone} orientation={orientation} />
    </Suspense>
  );
}

export function ZoneShell({ zone, children, demoTools, className, "data-testid": testId }: ZoneShellProps) {
  const admin = zone === "admin";
  const home = ROLE_HOME[ZONE_DEFAULT_ROLE[zone]];
  return (
    <div
      data-testid={testId ?? `zona-${zone}`}
      data-zone={zone}
      className={cn("flex min-h-full flex-1 flex-col", className)}
    >
      <SkipLink />
      <DemoBanner variant="bar" className="sticky top-0 z-50" />
      <DemoToolbar zone={zone} demoTools={demoTools} />
      <header className="border-b border-laton/40 bg-background">
        <div className={cn(CONTAINER, "flex h-16 items-center justify-between gap-4")}>
          <Link
            href={home}
            data-testid="inicio-zona"
            aria-label={brand.name}
            className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Wordmark size="sm" />
          </Link>
          {!admin ? (
            <nav
              aria-label={SHELL_COPY.navLabel[zone]}
              data-testid="nav-principal"
              className="hidden md:flex"
            >
              <ZoneNav zone={zone} orientation="horizontal" />
            </nav>
          ) : null}
          <MobileNav zone={zone} />
        </div>
      </header>
      <div className={cn("flex flex-1", admin && "lg:flex-row")}>
        {admin ? (
          <aside className="hidden w-64 shrink-0 border-r border-laton/40 bg-card lg:block">
            <nav
              aria-label={SHELL_COPY.navLabel[zone]}
              data-testid="nav-principal"
              className="sticky top-12 p-4"
            >
              <ZoneNav zone={zone} orientation="vertical" />
            </nav>
          </aside>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <main
            id="contenido"
            tabIndex={-1}
            className={cn(CONTAINER, "flex-1 py-16 outline-none md:py-24")}
          >
            {children}
          </main>
          <footer data-testid="pie-zona" className="border-t border-laton/40 bg-card">
            <div className={cn(CONTAINER, "flex flex-col gap-3 py-8")}>
              <p className="font-heading text-lg text-foreground">{brand.tagline}</p>
              <LegalNotice notice="riskNotice" variant="block" />
              <p className="text-sm text-muted-foreground">{SHELL_COPY.footerNote}</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
