import type { ProjectId } from "./project";

/**
 * Riesgos del proyecto (maestro §15). Solo claves: el texto vive en `finance/ui/copy`.
 * Sin niveles ni puntuaciones. Los 3 primeros son comunes a todos los proyectos.
 */
export const PROJECT_RISK_KINDS = [
  "sale_below_target",
  "works_overrun",
  "slow_sale",
  "narrow_buyer_pool",
  "local_market",
  "hidden_works_issues",
  "incomplete_placement",
] as const;
export type ProjectRiskKind = (typeof PROJECT_RISK_KINDS)[number];

export type ProjectRisks = {
  readonly projectId: ProjectId;
  readonly kinds: readonly ProjectRiskKind[];
};

/** Sin duplicados, en el orden de PROJECT_RISK_KINDS. No muta. */
export function normalizeRiskKinds(kinds: readonly ProjectRiskKind[]): readonly ProjectRiskKind[] {
  const present = new Set(kinds);
  return PROJECT_RISK_KINDS.filter((k) => present.has(k));
}
