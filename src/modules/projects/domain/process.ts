import { addDays, type IsoDate } from "@/shared/domain/calendar-date";
import { err, ok, type DomainError, type Result } from "@/shared/domain/result";
import type { ProjectId } from "./project";

/** Las 6 etapas del tablero de proceso (ADR-013 §5), en orden. Los ids visuales viven en finance/ui. */
export const PROCESS_STAGE_KINDS = [
  "works_start",
  "works_50",
  "works_80",
  "sale_start",
  "on_sale",
  "sold",
] as const;
export type ProcessStageKind = (typeof PROCESS_STAGE_KINDS)[number];

export const PROCESS_STEP_STATUSES = ["done", "current", "upcoming"] as const;
export type ProcessStepStatus = (typeof PROCESS_STEP_STATUSES)[number];

/** offsetDays: días tras la compra. started: la etapa en curso ya empezó (fecha cierta); si no, fecha estimada. */
export type ProcessStep = {
  readonly status: ProcessStepStatus;
  readonly offsetDays: number;
  readonly started: boolean;
};
export type ProjectProcess = {
  readonly projectId: ProjectId;
  readonly steps: Readonly<Record<ProcessStageKind, ProcessStep>>;
};
export type ProcessStageTimeline = {
  readonly stage: ProcessStageKind;
  readonly status: ProcessStepStatus;
  /** addDays(acquiredOn, offsetDays). */
  readonly date: IsoDate;
  /** true = proyección: upcoming, o current sin empezar. */
  readonly estimated: boolean;
};

export type ProcessErrorCode =
  | "NEGATIVE_OFFSET"
  | "DECREASING_OFFSETS"
  | "STATUS_ORDER"
  | "DONE_NOT_STARTED"
  | "UPCOMING_STARTED";

type ProcessError = DomainError<ProcessErrorCode>;

const STATUS_RANK: Readonly<Record<ProcessStepStatus, number>> = {
  done: 0,
  current: 1,
  upcoming: 2,
};

function checkOffsets(steps: readonly ProcessStep[]): ProcessError | null {
  if (steps.some((s) => !Number.isSafeInteger(s.offsetDays) || s.offsetDays < 0)) {
    return {
      code: "NEGATIVE_OFFSET",
      detail: "cada etapa debe ser un entero de días ≥ 0 tras la compra",
    };
  }
  for (let i = 1; i < steps.length; i += 1) {
    if (steps[i]!.offsetDays < steps[i - 1]!.offsetDays) {
      return {
        code: "DECREASING_OFFSETS",
        detail: `la etapa ${PROCESS_STAGE_KINDS[i]} retrocede en días`,
      };
    }
  }
  return null;
}

/** done* current? upcoming*: el rango no baja y hay como máximo un current. */
function checkStatusOrder(steps: readonly ProcessStep[]): ProcessError | null {
  const currents = steps.filter((s) => s.status === "current").length;
  const monotonic = steps.every(
    (s, i) => i === 0 || STATUS_RANK[s.status] >= STATUS_RANK[steps[i - 1]!.status],
  );
  if (currents > 1 || !monotonic) {
    return {
      code: "STATUS_ORDER",
      detail: "orden esperado: hechas, una en curso como máximo, próximas",
    };
  }
  return null;
}

function checkStarted(steps: readonly ProcessStep[]): ProcessError | null {
  if (steps.some((s) => s.status === "done" && !s.started)) {
    return { code: "DONE_NOT_STARTED", detail: "una etapa hecha ya empezó" };
  }
  if (steps.some((s) => s.status === "upcoming" && s.started)) {
    return { code: "UPCOMING_STARTED", detail: "una etapa próxima no puede haber empezado" };
  }
  return null;
}

/** Valida un proceso publicado. Nunca lanza. */
export function checkProjectProcess(p: ProjectProcess): Result<ProjectProcess, ProcessError> {
  const steps = PROCESS_STAGE_KINDS.map((k) => p.steps[k]);
  const error = checkOffsets(steps) ?? checkStatusOrder(steps) ?? checkStarted(steps);
  return error === null ? ok(p) : err(error.code, error.detail);
}

/** En el orden de PROCESS_STAGE_KINDS. Pura; no valida (eso lo hace checkProjectProcess). */
export function toProcessTimeline(
  acquiredOn: IsoDate,
  p: ProjectProcess,
): readonly ProcessStageTimeline[] {
  return PROCESS_STAGE_KINDS.map((stage) => {
    const step = p.steps[stage];
    return {
      stage,
      status: step.status,
      date: addDays(acquiredOn, step.offsetDays),
      estimated: step.status === "upcoming" || (step.status === "current" && !step.started),
    };
  });
}
