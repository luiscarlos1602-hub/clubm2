import { ProjectionLabel } from "@/shared/ui/brand";

/** "34,5 % sobre el capital" junto a una ganancia. Si es proyección, lleva el mismo rótulo que su cifra. */
export function ProfitRateLine({ text, projection = false, "data-testid": testId }: { text: string | null; projection?: boolean; "data-testid"?: string }) {
  if (!text) return null;
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm tabular-nums" data-testid={testId}>
      <span className="font-medium">{text}</span>
      {projection ? <ProjectionLabel /> : null}
    </p>
  );
}
