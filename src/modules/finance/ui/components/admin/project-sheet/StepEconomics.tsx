"use client";

import { useWatch } from "react-hook-form";
import type { ProjectStatus } from "@/modules/projects";
import { MoneyDisplay } from "@/shared/ui/brand";
import { Surface } from "@/shared/ui/layout";
import { FieldIssues, TextField, type StepProps } from "./SheetControls";
import { SHEET_COPY } from "./copy";
import type { SheetFigures } from "./sheet-form-convert";

const C = SHEET_COPY.economics;

/** Rótulo de compra: "oferta" mientras no se haya comprado (oportunidad y due diligence). */
export function isOfferStage(status: ProjectStatus): boolean {
  return status === "opportunity" || status === "due_diligence";
}

/** Paso 2 · C, F, P y O en USD enteros. */
export function StepEconomics({ form, issues, figures }: StepProps & { figures: SheetFigures }) {
  const { register, formState } = form;
  const e = formState.errors;
  const offer = isOfferStage(useWatch({ control: form.control, name: "status" }));
  const note = SHEET_COPY.usdHint;
  return (
    <Surface padding="md" className="gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <TextField label={offer ? C.acquisitionOffer : C.acquisitionPurchase} registration={register("acquisitionCost")} inputMode="numeric" hint={`${C.acquisitionHint} ${note}`} formError={e.acquisitionCost} issues={issues} />
        <TextField label={C.recovery} registration={register("recoveryBudget")} inputMode="numeric" hint={`${C.recoveryHint} ${note}`} formError={e.recoveryBudget} issues={issues} />
        <TextField label={C.targetSale} registration={register("targetSalePrice")} inputMode="numeric" hint={`${C.targetSaleHint} ${note}`} formError={e.targetSalePrice} issues={issues} />
        <TextField label={C.saleCosts} registration={register("estimatedSaleCosts")} inputMode="numeric" hint={`${C.saleCostsHint} ${note}`} formError={e.estimatedSaleCosts} issues={issues} />
      </div>
      <FieldIssues field="economics" issues={issues} />
      <FieldIssues field="economics.recoveryBudget" issues={issues} />
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyDisplay value={figures.recoveryBudget} kind="amount" label={C.recovery} size="sm" />
        <MoneyDisplay value={figures.targetSalePrice} kind="projection" label={C.targetSale} size="sm" />
      </div>
    </Surface>
  );
}
