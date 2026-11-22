import { IndexLabel, Section } from "@/shared/ui/layout";
import { LANDING_COPY } from "../../copy";

const C = LANDING_COPY.pillars;

export function LandingPillars() {
  return (
    <Section label={C.label} spacing="sm" data-testid="portada-pilares" className="border-b border-line">
      <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
        {C.items.map((item, i) => (
          <li key={item.title} className="flex flex-col gap-3 border-t border-line pt-5">
            <IndexLabel n={i + 1} />
            <p className="font-heading text-lg font-semibold">{item.title}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
