import { LEGAL_COPY, LegalNotice, MoneyDisplay, ProjectSeal, StatusBadge } from "@/shared/ui/brand";
import { Button } from "@/shared/ui/primitives/button";
import { SHOWCASE_COPY as C } from "./showcase-copy";
import { SAMPLE_PRICE_PER_PARTICIPATION, SAMPLE_SEAL } from "./showcase-samples";
import { SystemSection } from "./SystemSection";

export function SystemProjectCard() {
  const t = C.tarjeta;
  return (
    <SystemSection id="tarjeta-titulo" testId="sistema-tarjeta-proyecto" {...t}>
      <article className="flex max-w-2xl flex-col gap-6 rounded-md border border-border bg-card p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <ProjectSeal code={SAMPLE_SEAL.code} date={SAMPLE_SEAL.date} />
          <StatusBadge tone="in-progress" label={t.statusLabel} />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-2xl font-medium text-balance md:text-3xl">{t.projectTitle}</h3>
          <p className="text-muted-foreground">{t.zone}</p>
        </div>
        <div className="flex flex-col gap-1 border-t border-laton/70 pt-6">
          <p className="font-medium">{t.available}</p>
          <div className="flex flex-wrap items-baseline gap-x-2 text-muted-foreground">
            <span>{t.priceLead}</span>
            <MoneyDisplay
              value={SAMPLE_PRICE_PER_PARTICIPATION}
              kind="amount"
              size="md"
              data-testid="tarjeta-precio"
              className="inline-flex"
            />
            <span>{t.priceLabel}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t.termLead} · {LEGAL_COPY.targetTermSuffix}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Button size="lg">{t.action}</Button>
          <span className="text-xs text-muted-foreground">{t.example}</span>
        </div>
        <LegalNotice notice="riskNotice" variant="inline" data-testid="tarjeta-aviso-riesgo" />
      </article>
    </SystemSection>
  );
}
