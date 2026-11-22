import type { ReactNode } from "react";
import type { Zone } from "./demo-role";
import { RoleSwitcher } from "./RoleSwitcher";
import { SHELL_COPY } from "./shell-copy";

export type DemoToolbarProps = { zone: Zone; demoTools?: ReactNode };

/** Barra de herramientas de simulación, bajo el banner. */
export function DemoToolbar({ zone, demoTools }: DemoToolbarProps) {
  const tag = SHELL_COPY.zoneTag[zone];
  return (
    <div data-testid="barra-simulacion" className="border-b border-laton/40 bg-muted">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-1.5 md:px-10">
        <RoleSwitcher zone={zone} />
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {tag ? <span className="font-mono text-xs tracking-widest uppercase">{tag}</span> : null}
          {demoTools}
        </div>
      </div>
    </div>
  );
}
