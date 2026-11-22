"use client";

import { formatIsoDate } from "@/shared/lib/format-date";
import { MoneyDisplay } from "@/shared/ui/brand";
import { Surface } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import type { ProjectSheetIssue } from "../../../../domain/project-sheet";
import { isOfferStage } from "./StepEconomics";
import { SHEET_COPY } from "./copy";
import type { SheetFigures } from "./sheet-form-convert";
import { stepOfField, type SheetFormValues } from "./sheet-form-schema";

const C = SHEET_COPY.review;

export type StepReviewProps = {
  readonly values: SheetFormValues;
  readonly figures: SheetFigures;
  readonly publishes: boolean;
  /** Errores del último intento de guardar (todos a la vez). */
  readonly issues: readonly ProjectSheetIssue[];
  readonly writeError: string | null;
  readonly onGoToStep: (step: number, field: ProjectSheetIssue["field"]) => void;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/** Paso 7 · resumen y errores juntos; cada error lleva al paso de su campo. */
export function StepReview({ values, figures, publishes, issues, writeError, onGoToStep }: StepReviewProps) {
  const offer = isOfferStage(values.status);
  const chosen = Object.values(values.images).filter((u) => u !== "").length;
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">{C.intro}</p>
      {issues.length > 0 || writeError ? (
        <Surface padding="md" className="gap-3 border-destructive" data-testid="ficha-resumen-errores">
          <h3 className="font-heading text-lg font-semibold text-destructive">{C.errorsTitle}</h3>
          {writeError ? <p role="alert" className="text-sm font-medium text-destructive" data-testid="ficha-error-escritura">{writeError}</p> : null}
          <ul className="flex flex-col gap-2">
            {issues.map((issue, i) => (
              <li key={`${issue.field}-${issue.code}-${i}`} className="flex flex-wrap items-center gap-3">
                <p role="alert" className="text-sm font-medium text-destructive" data-testid={`ficha-error-${issue.field}`}>
                  {SHEET_COPY.issues[issue.code]}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => onGoToStep(stepOfField(issue.field), issue.field)} data-testid={`ficha-ir-paso-${stepOfField(issue.field) + 1}`}>
                  {C.goToStep} {stepOfField(issue.field) + 1}
                </Button>
              </li>
            ))}
          </ul>
        </Surface>
      ) : null}
      <Surface padding="md" className="gap-4">
        <h3 className="font-heading text-lg font-semibold">{C.property}</h3>
        <dl className="grid gap-4 md:grid-cols-3" data-testid="ficha-resumen-inmueble">
          <Row label={SHEET_COPY.property.name}>{values.name || "—"}</Row>
          <Row label={SHEET_COPY.property.zone}>{[values.city, values.zone].filter((t) => t.trim() !== "").join(" · ") || "—"}</Row>
          <Row label={SHEET_COPY.property.kind}>{`${SHEET_COPY.property.kinds[values.kind]} · ${values.areaM2 || "—"} m²`}</Row>
          <Row label={SHEET_COPY.property.status}>{SHEET_COPY.property.stages[values.status]}</Row>
          <Row label={SHEET_COPY.property.acquiredOn}>{values.acquiredOn ? formatIsoDate(values.acquiredOn, "short") : "—"}</Row>
        </dl>
      </Surface>
      <Surface padding="md" className="gap-4">
        <h3 className="font-heading text-lg font-semibold">{C.economics}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MoneyDisplay value={figures.acquisitionCost} kind="capital" label={offer ? SHEET_COPY.economics.acquisitionOffer : SHEET_COPY.economics.acquisitionPurchase} size="sm" />
          <MoneyDisplay value={figures.recoveryBudget} kind="amount" label={SHEET_COPY.economics.recovery} size="sm" />
          <MoneyDisplay value={figures.targetSalePrice} kind="projection" label={SHEET_COPY.economics.targetSale} size="sm" />
          <MoneyDisplay value={figures.estimatedSaleCosts} kind="projection" label={SHEET_COPY.economics.saleCosts} size="sm" />
        </div>
      </Surface>
      <Surface padding="md" className="gap-4">
        <h3 className="font-heading text-lg font-semibold">{C.budget}</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {figures.lines.map((line) => (
            <li key={line.item}>
              <MoneyDisplay value={line.amount} kind="amount" label={SHEET_COPY.budget.items[line.item]} size="sm" />
            </li>
          ))}
        </ul>
        <MoneyDisplay value={figures.budgetTotal} kind="amount" label={SHEET_COPY.budget.sum} size="md" />
      </Surface>
      <Surface padding="md" className="gap-3">
        <h3 className="font-heading text-lg font-semibold">{C.klass}</h3>
        {figures.unitPrice ? (
          <div className="flex flex-wrap items-end gap-3">
            <span className="text-sm">{C.classLine(Number(values.classTotal) || 0)}</span>
            <MoneyDisplay value={figures.unitPrice} kind="amount" size="sm" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{C.noClass}</p>
        )}
        <p className="text-sm text-muted-foreground">{chosen > 0 ? `${C.images}: ${chosen}` : C.noImages}</p>
      </Surface>
      <p className="text-sm text-muted-foreground" data-testid="ficha-nota-publicacion">{publishes ? C.publishNote : C.internalNote}</p>
    </div>
  );
}
