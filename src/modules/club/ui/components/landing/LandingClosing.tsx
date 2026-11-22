import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brand } from "@/shared/config/brand";
import { ROUTES, routeHref } from "@/shared/ui/app-shell";
import { Wordmark } from "@/shared/ui/brand";
import { Eyebrow, Section } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import { LANDING_COPY } from "../../copy";

const C = LANDING_COPY.closing;
const H = LANDING_COPY.hero;

export function LandingClosing() {
  return (
    <Section tone="dark" labelledBy="cierre-titulo" data-testid="portada-cierre" innerClassName="flex flex-col items-center gap-8 text-center">
      <Wordmark size="lg" />
      <span aria-hidden className="h-px w-24 bg-line" />
      <h2 id="cierre-titulo" className="font-heading text-3xl font-light text-balance md:text-5xl">
        {brand.tagline}
      </h2>
      <p className="max-w-[48ch] text-lg text-foreground/80">{C.lead}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href={routeHref(ROUTES.p1.next)} data-testid="cta-registro-cierre">
            {H.primaryCta}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="#como-funciona">{LANDING_COPY.how.eyebrow}</Link>
        </Button>
      </div>
      <ul aria-hidden className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2">
        {C.pillars.map((p) => (
          <li key={p}>
            <Eyebrow as="span">{p}</Eyebrow>
          </li>
        ))}
      </ul>
    </Section>
  );
}
