import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { routeHref } from "@/shared/ui/app-shell";
import type { TestIdProp } from "@/shared/ui/brand/types";
import { LegalNotice } from "@/shared/ui/brand";
import { PageHeader, Section } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import { MARKETPLACE_COPY } from "../../copy";
import { MarketplaceBrowser } from "./MarketplaceBrowser";

const C = MARKETPLACE_COPY;

export type ProjectMarketplaceProps = TestIdProp;

/** Pantalla P3 (docs/00 §3): proyectos del club, con filtros. */
export function ProjectMarketplace({ className, "data-testid": testId = "pagina-p3" }: ProjectMarketplaceProps) {
  return (
    <div data-testid={testId} data-route-id="p3" className={cn("flex flex-col", className)}>
      <PageHeader id="titulo-p3" eyebrow={C.header.eyebrow} title={C.header.title} description={C.header.description} />
      <Section tone="light" spacing="md" labelledBy="titulo-lista-proyectos">
        <h2 id="titulo-lista-proyectos" className="sr-only">
          {C.listHeading}
        </h2>
        <MarketplaceBrowser />
      </Section>
      <Section tone="sand" spacing="md" ruled labelledBy="titulo-siguiente-paso" innerClassName="flex flex-col items-start gap-4">
        <h2 id="titulo-siguiente-paso" className="font-heading text-2xl font-medium md:text-3xl">
          {C.nextStep.title}
        </h2>
        <p className="max-w-[60ch] text-muted-foreground">{C.nextStep.description}</p>
        <Button asChild variant="outline">
          <Link href={routeHref("p4")} data-testid="siguiente-paso">
            {C.nextStep.action}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
        <LegalNotice notice="riskNotice" variant="inline" data-testid="marketplace-aviso-riesgo" />
      </Section>
    </div>
  );
}
