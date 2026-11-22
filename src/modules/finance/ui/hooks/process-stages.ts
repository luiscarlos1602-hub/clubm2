import { PROCESS_STAGES, type ProcessStageView } from "@/shared/ui/brand";
import type { IsoDate } from "@/shared/domain/calendar-date";
import { PROJECT_EXAMPLES, PUBLISHED_PROJECT_SLUGS } from "../components/investor/examples";
import type { ProcessSteps } from "../types";
import { dateAfterPurchase } from "./project-figures";

/** Etapas del tablero con fecha ISO; las que aún no ocurrieron son estimadas (proyección). */
export function toProcessStages(acquiredOn: IsoDate, steps: ProcessSteps): readonly ProcessStageView[] {
  return PROCESS_STAGES.map((id) => {
    const step = steps[id];
    return {
      id,
      status: step.status,
      date: dateAfterPurchase(acquiredOn, step.offsetDays),
      estimated: step.status === "upcoming" || (step.status === "current" && !step.started),
    };
  });
}

/** Única fuente del tablero de proceso de un proyecto (ficha, panel, portafolio y backoffice). null = sin proceso publicado. */
export function processStagesFor(project: { readonly code: string; readonly acquiredOn: IsoDate }): readonly ProcessStageView[] | null {
  const prefix = `${project.code.toLowerCase()}-`;
  const slug = PUBLISHED_PROJECT_SLUGS.find((s) => s.startsWith(prefix));
  return slug ? toProcessStages(project.acquiredOn, PROJECT_EXAMPLES[slug].process) : null;
}
