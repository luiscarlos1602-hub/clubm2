import { SectionHeading } from "@/shared/ui/brand";
import { FaqList, Section } from "@/shared/ui/layout";
import { LANDING_COPY } from "../../copy";

const C = LANDING_COPY.faq;

export function LandingFaq() {
  return (
    <Section tone="paper" labelledBy="preguntas-titulo" data-testid="portada-preguntas" innerClassName="grid gap-12 lg:grid-cols-12">
      <SectionHeading id="preguntas-titulo" eyebrow={C.eyebrow} title={C.title} className="lg:col-span-4" />
      <FaqList items={C.items} className="lg:col-span-8" />
    </Section>
  );
}
