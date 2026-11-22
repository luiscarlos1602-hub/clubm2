import { DemoBanner, LegalNotice } from "@/shared/ui/brand";
import { SHOWCASE_COPY as C } from "./showcase-copy";
import { SystemSection } from "./SystemSection";

export function SystemLegal() {
  return (
    <SystemSection id="avisos-titulo" testId="sistema-avisos" {...C.avisos}>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{C.avisos.barLabel}</p>
          <DemoBanner variant="bar" />
        </div>
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{C.avisos.inlineLabel}</p>
          <DemoBanner variant="inline" data-testid="demo-banner-inline" className="max-w-md" />
        </div>
        <div className="flex flex-col gap-5">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{C.avisos.textLabel}</p>
          <LegalNotice notice="demoBanner" />
          <LegalNotice notice="simulatorDisclaimer" />
          <LegalNotice notice="riskNotice" />
          <LegalNotice notice="legalPlaceholder" />
        </div>
      </div>
    </SystemSection>
  );
}
