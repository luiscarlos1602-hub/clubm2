import { BulletList, Section, Surface } from "@/shared/ui/layout";
import type { ProjectDetailData } from "../../hooks/use-project-detail";
import { PROJECT_DETAIL_COPY } from "./copy";

const C = PROJECT_DETAIL_COPY.property;

/** El inmueble: tipo, superficie y zona (sin dirección exacta, D6). */
export function PropertySection({ data }: { data: ProjectDetailData }) {
  const { property, example, listing } = data;
  const facts = [
    { label: C.typeLabel, value: C.kind[property.kind] },
    { label: C.areaLabel, value: C.area(property.areaM2) },
    { label: C.zoneLabel, value: `${listing.city} · ${property.zone}` },
  ];
  return (
    <Section tone="light" spacing="md" labelledBy="titulo-inmueble" innerClassName="grid gap-8 lg:grid-cols-2" data-testid="seccion-inmueble">
      <div className="flex flex-col gap-4">
        <h2 id="titulo-inmueble" className="font-heading text-3xl font-medium">
          {C.title}
        </h2>
        <p className="max-w-[60ch] text-muted-foreground">{example.description}</p>
        <BulletList items={example.highlights} marker="check" />
      </div>
      <Surface>
        <dl className="flex flex-col divide-y divide-border">
          {facts.map((fact) => (
            <div key={fact.label} className="flex justify-between gap-4 py-3 first:pt-0">
              <dt className="text-muted-foreground">{fact.label}</dt>
              <dd className="font-medium">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-muted-foreground">{C.zoneNote}</p>
      </Surface>
    </Section>
  );
}
