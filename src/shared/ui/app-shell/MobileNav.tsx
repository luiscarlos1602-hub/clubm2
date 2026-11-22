"use client";

import { Suspense, useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "@/shared/ui/brand/types";
import { Button } from "@/shared/ui/primitives/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/primitives/sheet";
import type { Zone } from "./demo-role";
import { ActiveNavLinks } from "./ActiveNavLinks";
import { NavLinks } from "./NavLinks";
import { SHELL_COPY } from "./shell-copy";

export type MobileNavProps = TestIdProp & { zone: Zone };

export function MobileNav({ zone, className, "data-testid": testId = "nav-movil" }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={SHELL_COPY.menuOpen}
          data-testid="nav-movil-abrir"
          className={cn(zone === "admin" ? "lg:hidden" : "md:hidden", className)}
        >
          <Menu aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" data-testid={testId} aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>{SHELL_COPY.menuTitle}</SheetTitle>
        </SheetHeader>
        <nav aria-label={SHELL_COPY.navLabel[zone]} className="px-4">
          <Suspense fallback={<NavLinks zone={zone} orientation="vertical" activeId={null} onNavigate={close} showIcons={zone === "admin"} />}>
            <ActiveNavLinks zone={zone} orientation="vertical" onNavigate={close} showIcons={zone === "admin"} />
          </Suspense>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
