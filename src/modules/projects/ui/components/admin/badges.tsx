import { StatusBadge, type StatusTone } from "@/shared/ui/brand";
import type { Wheel } from "../../../domain/classify-wheel";
import type { ProjectStatus } from "../../../domain/project-status";
import { STAGE_LABEL, WHEEL_LABEL } from "./copy";

const STAGE_TONE: Record<ProjectStatus, StatusTone> = {
  opportunity: "neutral",
  due_diligence: "neutral",
  acquired: "in-progress",
  funding: "in-progress",
  renovation: "in-progress",
  on_sale: "in-progress",
  sold: "positive",
  settled: "positive",
  discarded: "neutral",
  stalled: "attention",
};

const WHEEL_TONE: Record<Wheel, StatusTone> = {
  good: "positive",
  medium: "in-progress",
  bad: "attention",
  in_progress: "neutral",
};

export function StageBadge({ status }: { status: ProjectStatus }) {
  return <StatusBadge tone={STAGE_TONE[status]} label={STAGE_LABEL[status]} data-testid="admin-etapa" />;
}

/** Rueda interna: solo existe en el backoffice (ADR-004). */
export function WheelBadge({ wheel }: { wheel: Wheel | null }) {
  if (wheel === null) return <span className="text-sm text-muted-foreground">—</span>;
  return <StatusBadge tone={WHEEL_TONE[wheel]} label={WHEEL_LABEL[wheel]} data-testid="admin-rueda" />;
}
