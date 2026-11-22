import { Hammer, KeyRound, Scale, Signpost, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/shared/ui/brand";
import { IconTile, IndexLabel, Section, Surface } from "@/shared/ui/layout";
import { LANDING_COPY } from "../../copy";

const C = LANDING_COPY.how;
const ICONS: readonly LucideIcon[] = [KeyRound, Hammer, Signpost, Scale];

/** Ancla #como-funciona (docs/08 M3: sección de P1, no ruta propia). */
export function LandingHowItWorks() {
  return (
    <Section id="como-funciona" labelledBy="como-funciona-titulo" data-testid="portada-como-funciona" innerClassName="flex flex-col gap-12">
      <SectionHeading id="como-funciona-titulo" eyebrow={C.eyebrow} title={C.title} description={C.description} />
      <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {C.steps.map((step, i) => (
          <Surface key={step.title} as="li">
            <div className="flex items-center justify-between">
              <IconTile icon={ICONS[i] ?? KeyRound} />
              <IndexLabel n={i + 1} className="text-sm" />
            </div>
            <h3 className="font-heading text-2xl font-semibold">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </Surface>
        ))}
      </ol>
    </Section>
  );
}
