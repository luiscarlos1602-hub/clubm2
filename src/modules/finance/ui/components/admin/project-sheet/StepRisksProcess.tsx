"use client";

import { PROCESS_STAGE_KINDS, PROJECT_RISK_KINDS } from "@/modules/projects";
import { Surface } from "@/shared/ui/layout";
import { COMMON_RISK_KINDS } from "../../../../domain/project-sheet-requirements";
import { PROJECT_DETAIL_COPY } from "../../investor/copy";
import { FieldIssues, TextField, type StepProps } from "./SheetControls";
import { SHEET_COPY } from "./copy";

const C = SHEET_COPY.risks;

/** Paso 5 · riesgos (3 comunes + opcionales) y proceso de 6 etapas en días. */
export function StepRisksProcess({ form, issues, editing }: StepProps & { editing: boolean }) {
  const { register, formState } = form;
  const stepErrors = formState.errors.steps;
  return (
    <div className="flex flex-col gap-6">
      <Surface padding="md" className="gap-4">
        <fieldset className="flex flex-col gap-3">
          <legend className="font-heading text-lg font-semibold">{C.title}</legend>
          <p className="text-sm text-muted-foreground">{C.intro}</p>
          {PROJECT_RISK_KINDS.map((kind) => (
            <label key={kind} className="flex items-start gap-3 text-sm">
              <input type="checkbox" value={kind} className="mt-0.5 size-5 accent-primary" data-testid={`ficha-riesgo-${kind}`} {...register("risks")} />
              <span>
                {PROJECT_DETAIL_COPY.risks.kinds[kind]}
                {(COMMON_RISK_KINDS as readonly string[]).includes(kind) ? <span className="ml-2 text-xs text-muted-foreground">({C.common})</span> : null}
              </span>
            </label>
          ))}
        </fieldset>
        <FieldIssues field="riskKinds" issues={issues} />
      </Surface>
      <Surface padding="md" className="gap-4">
        <h3 className="font-heading text-lg font-semibold">{C.processTitle}</h3>
        <p className="text-sm text-muted-foreground">{C.processIntro}</p>
        {editing ? <p className="text-xs text-muted-foreground">{C.processKeepNote}</p> : null}
        <div className="grid gap-5 md:grid-cols-3">
          {PROCESS_STAGE_KINDS.map((kind) => (
            <TextField key={kind} label={`${C.stages[kind]} (${C.days})`} registration={register(`steps.${kind}`)} inputMode="numeric" formError={stepErrors?.[kind]} issues={issues} />
          ))}
        </div>
        <FieldIssues field="processSteps" issues={issues} />
      </Surface>
    </div>
  );
}
