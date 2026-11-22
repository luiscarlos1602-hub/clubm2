"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/primitives/button";
import type { TestIdProp } from "@/shared/ui/brand/types";

export type MockActionProps = TestIdProp & {
  label: string;
  /** Texto de confirmación de la maqueta: dice que no se guardó nada. */
  doneMessage: string;
  variant?: "default" | "outline";
};

/** Botón de maqueta: muestra un estado de confirmación y no guarda nada. */
export function MockAction({ label, doneMessage, variant = "default", className, "data-testid": testId = "accion-maqueta" }: MockActionProps) {
  const [done, setDone] = useState(false);
  return (
    <div className={className}>
      <Button type="button" variant={variant} data-testid={testId} onClick={() => setDone(true)}>
        {label}
      </Button>
      {done ? (
        <p role="status" data-testid={`${testId}-confirmacion`} className="mt-2 text-sm text-muted-foreground">
          {doneMessage}
        </p>
      ) : null}
    </div>
  );
}
