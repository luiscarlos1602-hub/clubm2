import { StatusBadge } from "@/shared/ui/brand";
import { SHOWCASE_COPY as C } from "./showcase-copy";
import { SystemSection } from "./SystemSection";

export function SystemBadges() {
  return (
    <SystemSection id="badges-titulo" testId="sistema-badges" {...C.badges}>
      <div className="flex flex-wrap items-center gap-4">
        {C.badges.items.map((b) => (
          <StatusBadge key={b.tone} tone={b.tone} label={b.label} data-testid={`badge-${b.tone}`} />
        ))}
      </div>
    </SystemSection>
  );
}
