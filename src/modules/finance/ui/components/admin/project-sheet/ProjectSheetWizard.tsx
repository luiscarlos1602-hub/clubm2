"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { isPublishedStatus, type ReferenceImageOption } from "@/modules/projects";
import { Surface } from "@/shared/ui/layout";
import { routeHref } from "@/shared/ui/app-shell";
import { Button } from "@/shared/ui/primitives/button";
import type { ProjectSheet, ProjectSheetField, ProjectSheetIssue } from "../../../../domain/project-sheet";
import { useSheetFigures } from "../../../hooks/use-project-sheet";
import { useSaveProjectSheet } from "../../../hooks/use-save-project-sheet";
import { StepBudget } from "./StepBudget";
import { StepClass } from "./StepClass";
import { StepEconomics } from "./StepEconomics";
import { StepImages } from "./StepImages";
import { StepProperty } from "./StepProperty";
import { StepReview } from "./StepReview";
import { StepRisksProcess } from "./StepRisksProcess";
import { SHEET_COPY } from "./copy";
import {
  STEP_FORM_FIELDS,
  STEP_ISSUE_FIELDS,
  sheetFormSchema,
  type SheetFormValues,
} from "./sheet-form-schema";

const C = SHEET_COPY;
const LAST = C.steps.length - 1;

export type ProjectSheetWizardProps = {
  readonly initial: SheetFormValues;
  /** null = alta. */
  readonly existing: ProjectSheet | null;
  readonly library: readonly ReferenceImageOption[];
};

/** Asistente de 7 pasos (patrón RegisterWizard): RHF + Zod validan la forma; `buildProjectSheet` las reglas de negocio. */
export function ProjectSheetWizard({ initial, existing, library }: ProjectSheetWizardProps) {
  const router = useRouter();
  const slug = existing?.project.slug ?? null;
  const form = useForm<SheetFormValues>({
    resolver: zodResolver(sheetFormSchema),
    defaultValues: initial,
    mode: "onTouched",
  });
  const { validate, save, isSaving } = useSaveProjectSheet(slug, existing);
  const [step, setStep] = useState(0);
  const [issues, setIssues] = useState<readonly ProjectSheetIssue[]>([]);
  const [reviewIssues, setReviewIssues] = useState<readonly ProjectSheetIssue[]>([]);
  const [writeError, setWriteError] = useState<string | null>(null);
  const values = useWatch({ control: form.control }) as SheetFormValues;
  const figures = useSheetFigures(values);
  const creating = existing === null;

  function go(next: number, field?: ProjectSheetField) {
    setStep(next);
    setWriteError(null);
    setIssues(field ? reviewIssues.filter((i) => STEP_ISSUE_FIELDS[next]?.includes(i.field)) : []);
  }

  async function onNext() {
    const formOk = await form.trigger([...STEP_FORM_FIELDS[step]]);
    if (!formOk) return;
    const all = await validate(form.getValues());
    const here = all.filter((i) => STEP_ISSUE_FIELDS[step]!.includes(i.field));
    setIssues(here);
    if (here.length === 0) setStep(step + 1);
  }

  async function onSave() {
    setWriteError(null);
    if (!(await form.trigger())) {
      const bad = STEP_FORM_FIELDS.findIndex((fields) => fields.some((f) => f in form.formState.errors));
      return go(bad < 0 ? 0 : bad);
    }
    const result = await save(form.getValues());
    if (result.ok) {
      // Next conserva la página anterior en memoria: se deja el asistente limpio para la próxima vez.
      if (creating) form.reset(initial);
      setStep(0);
      setIssues([]);
      setReviewIssues([]);
      router.push(routeHref("b7"));
      return;
    }
    const business = result.error.filter((e): e is ProjectSheetIssue => "field" in e);
    setReviewIssues(business);
    setIssues(business);
    if (business.length === 0) {
      setWriteError(result.error.some((e) => e.code === "DUPLICATE") ? C.review.duplicate : C.review.writeError);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    void (step === LAST ? onSave() : onNext());
  }

  const publishes = isPublishedStatus(values.status);
  const placed = existing?.participationClass?.placed ?? 0;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6" data-testid="ficha-formulario">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase" data-testid="ficha-paso-etiqueta" aria-live="polite">
          {C.stepLabel(step + 1, C.steps.length)} · {C.steps[step]!.title}
        </p>
        <div aria-hidden className="grid grid-cols-7 gap-2">
          {C.steps.map((s, i) => (
            <span key={s.id} className={`h-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
      </div>
      <div data-testid={`ficha-paso-${step + 1}`} className="flex flex-col gap-6">
        {step === 0 && <StepProperty form={form} issues={issues} creating={creating} />}
        {step === 1 && <StepEconomics form={form} issues={issues} figures={figures} />}
        {step === 2 && <StepBudget form={form} issues={issues} figures={figures} />}
        {step === 3 && <StepClass form={form} issues={issues} figures={figures} placed={placed} />}
        {step === 4 && <StepRisksProcess form={form} issues={issues} editing={!creating} />}
        {step === 5 && <StepImages form={form} issues={issues} library={library} />}
        {step === 6 && (
          <StepReview values={values} figures={figures} publishes={publishes} issues={reviewIssues} writeError={writeError} onGoToStep={(n, f) => go(n, f)} />
        )}
      </div>
      <Surface padding="sm" className="flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {step > 0 ? (
          <Button type="button" variant="outline" size="lg" className="h-11" onClick={() => go(step - 1)} data-testid="ficha-atras">
            {C.back}
          </Button>
        ) : (
          <span />
        )}
        {step < LAST ? (
          <Button type="submit" size="lg" className="h-11" data-testid="ficha-siguiente">
            {C.next}
          </Button>
        ) : (
          <Button type="submit" size="lg" className="h-11" disabled={isSaving} data-testid="ficha-guardar">
            {isSaving ? C.saving : publishes ? C.savePublish : C.save}
          </Button>
        )}
      </Surface>
    </form>
  );
}
