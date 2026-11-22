"use client";

import { MoneyDisplay } from "@/shared/ui/brand";
import { Surface } from "@/shared/ui/layout";
import { FieldIssues, TextField, type StepProps } from "./SheetControls";
import { SHEET_COPY } from "./copy";
import type { SheetFigures } from "./sheet-form-convert";

const C = SHEET_COPY.klass;

/** Paso 4 · clase de participación: total y precio. F esperada = total × precio viene del dominio. */
export function StepClass({ form, issues, figures, placed }: StepProps & { figures: SheetFigures; placed: number }) {
  const { register, formState } = form;
  const e = formState.errors;
  const locked = placed > 0;
  return (
    <Surface padding="md" className="gap-5">
      <p className="text-sm text-muted-foreground">{C.intro}</p>
      <div className="grid gap-5 md:grid-cols-2">
        <TextField label={C.total} registration={register("classTotal")} inputMode="numeric" hint={C.optionalHint} formError={e.classTotal} disabled={locked} issues={issues} />
        <TextField label={C.unitPrice} registration={register("classUnitPrice")} inputMode="numeric" hint={SHEET_COPY.usdHint} formError={e.classUnitPrice} disabled={locked} issues={issues} />
      </div>
      {locked ? <p className="text-sm text-muted-foreground" data-testid="ficha-clase-bloqueada">{C.placed(placed)}</p> : null}
      <FieldIssues field="participationClass" issues={issues} />
      <div className="grid gap-4 sm:grid-cols-2">
        {figures.expectedRecovery ? (
          <MoneyDisplay value={figures.expectedRecovery} kind="amount" label={C.expected} size="md" data-testid="ficha-f-esperada" />
        ) : (
          <p className="text-sm text-muted-foreground">{C.expectedPending}</p>
        )}
        <MoneyDisplay value={figures.recoveryBudget} kind="amount" label={C.current} size="md" />
      </div>
      <FieldIssues field="economics.recoveryBudget" issues={issues} />
    </Surface>
  );
}
