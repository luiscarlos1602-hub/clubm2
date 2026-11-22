"use client";

import { BUDGET_ITEMS } from "../../../../domain/budget";
import { MoneyDisplay } from "@/shared/ui/brand";
import { Surface } from "@/shared/ui/layout";
import { FieldIssues, TextField, type StepProps } from "./SheetControls";
import { SHEET_COPY } from "./copy";
import type { SheetFigures } from "./sheet-form-convert";

const C = SHEET_COPY.budget;

/** Paso 3 · rubros del presupuesto de reforma. La suma y F salen del dominio (`figures`). */
export function StepBudget({ form, issues, figures }: StepProps & { figures: SheetFigures }) {
  const { register, formState } = form;
  const errors = formState.errors.budget;
  return (
    <Surface padding="md" className="gap-5">
      <p className="text-sm text-muted-foreground">{C.intro}</p>
      <div className="grid gap-5 md:grid-cols-2">
        {BUDGET_ITEMS.map((item) => (
          <TextField key={item} label={C.items[item]} registration={register(`budget.${item}`)} inputMode="numeric" formError={errors?.[item]} issues={issues} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{SHEET_COPY.usdHint}</p>
      <div className="grid gap-4 sm:grid-cols-2" data-testid="ficha-presupuesto-cifras">
        <MoneyDisplay value={figures.budgetTotal} kind="amount" label={C.sum} size="md" data-testid="ficha-suma-rubros" />
        <MoneyDisplay value={figures.recoveryBudget} kind="amount" label={C.target} size="md" data-testid="ficha-f-objetivo" />
      </div>
      <FieldIssues field="budgetLines" issues={issues} />
    </Surface>
  );
}
