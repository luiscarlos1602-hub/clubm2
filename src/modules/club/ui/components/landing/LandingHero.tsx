import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brand } from "@/shared/config/brand";
import { ROUTES, routeHref } from "@/shared/ui/app-shell";
import { BrandSymbol } from "@/shared/ui/brand";
import { Eyebrow, Section } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import { LANDING_COPY } from "../../copy";

const C = LANDING_COPY.hero;

/** Portada: la versión grande de PageHeader (titular ligera + seminegrita y lámina a la derecha). */
export function LandingHero({ headingId }: { headingId: string }) {
  return (
    <Section
      tone="dark"
      labelledBy={headingId}
      data-testid="portada-hero"
      className="overflow-hidden"
      innerClassName="grid items-center gap-14 lg:grid-cols-12 lg:gap-10"
    >
      <div className="flex flex-col gap-8 lg:col-span-7">
        <Eyebrow>{brand.descriptor}</Eyebrow>
        <h1 id={headingId} className="font-heading text-5xl leading-[1.04] tracking-tight text-balance md:text-7xl">
          <span className="font-light">{C.titleLead}</span> <span className="font-semibold">{C.titleRest}</span>
        </h1>
        <span aria-hidden className="h-px w-12 bg-line" />
        <p className="max-w-[58ch] text-lg leading-relaxed text-foreground/85">{C.lead}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg">
            <Link href={routeHref(ROUTES.p1.next)} data-testid="siguiente-paso">
              {C.primaryCta}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={routeHref("p3")} data-testid="cta-proyectos">
              {C.secondaryCta}
            </Link>
          </Button>
        </div>
        <p className="text-sm text-foreground/70">{C.note}</p>
      </div>
      <HeroVisual />
    </Section>
  );
}

/** Lámina de construcción del símbolo (como en la imagen de marca) con el recorrido de un proyecto. */
function HeroVisual() {
  return (
    <figure aria-label={C.visualLabel} className="lg:col-span-5">
      <div className="relative mx-auto flex aspect-[4/5] max-w-md flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--line)_30%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--line)_30%,transparent)_1px,transparent_1px)] bg-[size:12.5%_10%]"
        />
        <div aria-hidden className="pointer-events-none absolute top-[12%] right-[10%] left-[10%] h-px bg-line/70" />
        <div aria-hidden className="pointer-events-none absolute top-[12%] bottom-[38%] left-[22%] w-px bg-line/50" />
        <div aria-hidden className="pointer-events-none absolute top-[12%] right-[22%] bottom-[38%] w-px bg-line/50" />
        <div className="relative flex flex-1 items-center justify-center pb-4">
          <BrandSymbol className="size-40 md:size-52" />
        </div>
        <ol className="relative flex flex-col divide-y divide-border rounded-xl border border-border bg-background/80 backdrop-blur-sm">
          {C.visualSteps.map((step, i) => (
            <li key={step} className="flex items-center gap-4 px-4 py-3 text-sm">
              <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
