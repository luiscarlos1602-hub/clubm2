import { DEFAULT_DISTRIBUTION_SHARES } from "@/modules/finance";
import { formatPercentage, percentageToCss } from "@/shared/lib/format-percentage";
import { SectionHeading } from "@/shared/ui/brand";
import { BulletList, Section, Surface } from "@/shared/ui/layout";
import { LANDING_COPY } from "../../copy";

const C = LANDING_COPY.distribution;

/** Reparto 25/75: se lee del motor (defaults del maestro), no se calcula aquí. */
export function LandingDistribution() {
  const { fund, company } = DEFAULT_DISTRIBUTION_SHARES;
  const fundPct = formatPercentage(fund);
  const companyPct = formatPercentage(company);
  return (
    <Section tone="sand" labelledBy="reparto-titulo" data-testid="portada-reparto" innerClassName="grid gap-12 lg:grid-cols-2 lg:items-center">
      <div className="flex flex-col gap-6">
        <SectionHeading id="reparto-titulo" eyebrow={C.eyebrow} title={C.title} description={C.description} />
        <BulletList items={C.notes} className="text-sm" />
        <p className="text-sm text-muted-foreground">{C.simulatorHint}</p>
      </div>
      <Surface variant="dark" padding="lg" className="gap-6">
        <div role="img" aria-label={`${C.barLabel}: ${fundPct} y ${companyPct}`} className="flex h-16 overflow-hidden rounded-xl">
          <div
            className="flex items-center bg-highlight px-4 font-mono text-sm font-medium text-highlight-foreground"
            style={{ flexBasis: percentageToCss(fund) }}
          >
            {fundPct}
          </div>
          <div className="flex flex-1 items-center justify-end bg-accent px-4 font-mono text-sm font-medium">{companyPct}</div>
        </div>
        <dl className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2 border-t border-highlight pt-4">
            <dt className="text-sm text-muted-foreground">{C.fundLabel}</dt>
            <dd className="font-heading text-4xl font-semibold">{fundPct}</dd>
            <dd className="text-sm text-foreground/75">{C.fundText}</dd>
          </div>
          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <dt className="text-sm text-muted-foreground">{C.companyLabel}</dt>
            <dd className="font-heading text-4xl font-semibold">{companyPct}</dd>
            <dd className="text-sm text-foreground/75">{C.companyText}</dd>
          </div>
        </dl>
      </Surface>
    </Section>
  );
}
