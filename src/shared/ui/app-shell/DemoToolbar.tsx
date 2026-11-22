import type { ReactNode } from "react";

export type DemoToolbarProps = { demoTools?: ReactNode };

/** Herramientas de la demo (p. ej. "Reiniciar datos simulados"), en el pie de cada zona. El rol lo fija el inicio de sesión. */
export function DemoToolbar({ demoTools }: DemoToolbarProps) {
  if (!demoTools) return null;
  return (
    <div data-testid="herramientas-demo" className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      {demoTools}
    </div>
  );
}
