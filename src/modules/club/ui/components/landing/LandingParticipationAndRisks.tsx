import { LegalNotice } from "@/shared/ui/brand";
import { BulletList, Eyebrow, Section, Surface } from "@/shared/ui/layout";
import { LANDING_COPY } from "../../copy";

const P = LANDING_COPY.participation;
const R = LANDING_COPY.risks;

/** Qué es la participación y qué puede salir mal, lado a lado: el riesgo nunca va escondido. */
export function LandingParticipationAndRisks() {
  return (
    <Section label={`${P.title}. ${R.title}`} data-testid="portada-participacion-riesgos" innerClassName="grid gap-6 lg:grid-cols-2">
      <Surface as="article" padding="lg" labelledBy="participacion-titulo" className="gap-6">
        <Eyebrow>{P.eyebrow}</Eyebrow>
        <h2 id="participacion-titulo" className="font-heading text-3xl font-semibold text-balance md:text-4xl">
          {P.title}
        </h2>
        <BulletList items={P.items} marker="check" />
      </Surface>
      <Surface as="article" variant="dark" padding="lg" labelledBy="riesgos-titulo" data-testid="portada-riesgos" className="gap-6">
        <Eyebrow>{R.eyebrow}</Eyebrow>
        <h2 id="riesgos-titulo" className="font-heading text-3xl font-semibold text-balance md:text-4xl">
          {R.title}
        </h2>
        <BulletList items={R.items} marker="dash" />
        <LegalNotice notice="riskNotice" className="mt-auto" />
      </Surface>
    </Section>
  );
}
