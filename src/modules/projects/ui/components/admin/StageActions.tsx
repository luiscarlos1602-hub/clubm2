"use client";

import Link from "next/link";
import { useState } from "react";
import { projectEditHref } from "@/shared/ui/app-shell";
import { Button } from "@/shared/ui/primitives/button";
import type { ChangeProjectStageErrorCode } from "../../../application/change-project-stage";
import type { Project } from "../../../domain/project";
import { manualNextStages, type ProjectStatus } from "../../../domain/project-status";
import { useChangeProjectStage } from "../../hooks/use-change-project-stage";
import { STAGE_ACTIONS_COPY as C, STAGE_LABEL } from "./copy";

type ActionStage = keyof typeof C.actions;
type Feedback = { readonly kind: "done"; readonly stage: ProjectStatus } | { readonly kind: "error"; readonly code: ChangeProjectStageErrorCode };

function errorText(code: ChangeProjectStageErrorCode): string {
  if (code === "NOT_READY_TO_PUBLISH") return C.errors.NOT_READY_TO_PUBLISH;
  if (code === "DATE_OUT_OF_ORDER" || code === "INCONSISTENT_TIMELINE") return C.errors.dates;
  if (code === "INVALID_TRANSITION") return C.errors.INVALID_TRANSITION;
  return C.errors.generic;
}

const LINK = "rounded-sm text-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * W-3 · botones de cambio de etapa (siguientes etapas manuales de `PROJECT_TRANSITIONS`). Descartar pide confirmación.
 * El resultado se anuncia con role="status" y la etapa nueva llega releyendo el repositorio. `testId` prefija cada control.
 * `onDone`: para pantallas que desmontan este componente al cambiar la etapa (B2); el padre anuncia el éxito y mueve el foco.
 */
export function StageActions({ project, testId, onDone }: { project: Project; testId: string; onDone?: (stage: ProjectStatus) => void }) {
  const { change, pending } = useChangeProjectStage();
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const targets = manualNextStages(project.status).filter((s): s is ActionStage => s in C.actions);
  const showsSaleNote = project.status === "on_sale" || project.status === "stalled";

  async function run(to: ProjectStatus) {
    setConfirming(false);
    const result = await change(project.id, to);
    if (result.ok && onDone) {
      setFeedback(null);
      onDone(to);
      return;
    }
    setFeedback(result.ok ? { kind: "done", stage: to } : { kind: "error", code: result.error.code });
  }

  return (
    <div className="flex flex-col gap-4" data-testid={testId} data-status={project.status}>
      {targets.length === 0 && !showsSaleNote ? <p className="text-sm text-muted-foreground">{C.noMoves}</p> : null}
      {targets.length > 0 ? (
        <div className="flex flex-wrap items-start gap-4">
          {targets.map((to) => {
            const discard = to === "discarded";
            const hint = to === "acquired" || to === "funding" ? C.hints[to] : null;
            return (
              <div key={to} className="flex max-w-xs flex-col gap-1.5">
                <Button
                  type="button"
                  variant={discard ? "outline" : "default"}
                  disabled={pending !== null}
                  aria-expanded={discard ? confirming : undefined}
                  data-testid={`${testId}-${to}`}
                  onClick={() => (discard ? setConfirming(true) : void run(to))}
                >
                  {pending === to ? C.saving : C.actions[to]}
                </Button>
                {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
              </div>
            );
          })}
        </div>
      ) : null}
      {confirming ? (
        <div className="flex flex-wrap items-center gap-3" data-testid={`${testId}-confirmar`}>
          <p className="text-sm">{C.confirmDiscardNote}</p>
          <Button type="button" variant="destructive" disabled={pending !== null} data-testid={`${testId}-confirmar-descarte`} onClick={() => void run("discarded")}>
            {pending === "discarded" ? C.saving : C.confirmDiscard}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>{C.cancel}</Button>
        </div>
      ) : null}
      {showsSaleNote ? <p className="text-sm text-muted-foreground">{C.saleNote}</p> : null}
      <div role="status" aria-live="polite" className="text-sm" data-testid={`${testId}-estado`}>
        {feedback?.kind === "done" ? <p>{C.done(STAGE_LABEL[feedback.stage])}</p> : null}
        {feedback?.kind === "error" ? (
          <p className="flex flex-col gap-1">
            <span>{errorText(feedback.code)}</span>
            {feedback.code === "NOT_READY_TO_PUBLISH" ? (
              <Link href={projectEditHref(project.slug)} className={LINK} data-testid={`${testId}-completar`}>{C.completeSheet}</Link>
            ) : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}
