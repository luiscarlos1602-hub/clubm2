import type { TestIdProp } from "@/shared/ui/brand/types";
import { cn } from "@/shared/lib/utils";
import { LandingClosing } from "./LandingClosing";
import { LandingCommunity } from "./LandingCommunity";
import { LandingDistribution } from "./LandingDistribution";
import { LandingFaq } from "./LandingFaq";
import { LandingHero } from "./LandingHero";
import { LandingHowItWorks } from "./LandingHowItWorks";
import { LandingParticipationAndRisks } from "./LandingParticipationAndRisks";
import { LandingPillars } from "./LandingPillars";

export type ClubLandingProps = TestIdProp;

const HEADING_ID = "titulo-p1";

/** Portada P1 (docs/00 §3.1): propuesta, cómo funciona, reparto, riesgos y CTA a la vista previa del registro. */
export function ClubLanding({ className, "data-testid": testId = "pagina-p1" }: ClubLandingProps) {
  return (
    <div data-testid={testId} data-route-id="p1" className={cn("flex flex-col", className)}>
      <LandingHero headingId={HEADING_ID} />
      <LandingPillars />
      <LandingHowItWorks />
      <LandingDistribution />
      <LandingParticipationAndRisks />
      <LandingCommunity />
      <LandingFaq />
      <LandingClosing />
    </div>
  );
}
