import { LegalNotice } from "@/shared/ui/brand";
import { BulletList, Section } from "@/shared/ui/layout";
import { PROJECT_DETAIL_COPY } from "./copy";

const C = PROJECT_DETAIL_COPY.risks;

/** Riesgos del proyecto, en banda oscura con el aviso fijo. */
export function RisksSection({ risks }: { risks: readonly string[] }) {
  return (
    <Section tone="dark" spacing="md" labelledBy="titulo-riesgos" innerClassName="grid gap-8 lg:grid-cols-2" data-testid="seccion-riesgos">
      <div className="flex flex-col gap-4">
        <h2 id="titulo-riesgos" className="font-heading text-3xl font-medium">
          {C.title}
        </h2>
        <p className="max-w-[60ch]">{C.description}</p>
        <LegalNotice notice="riskNotice" className="text-foreground" />
      </div>
      <BulletList items={[...risks, C.capitalNote]} marker="dash" />
    </Section>
  );
}
