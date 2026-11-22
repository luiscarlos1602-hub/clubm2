import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProjectListing } from "@/modules/participations";
import { projectHref, routeHref } from "@/shared/ui/app-shell";
import { EmptyState, LegalNotice, MoneyDisplay } from "@/shared/ui/brand";
import { Surface } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import { PANEL_COPY } from "./copy";

const C = PANEL_COPY.open;

export function OpenProjects({ listings }: { listings: readonly ProjectListing[] }) {
  const open = listings.filter((l) => l.phase === "open");
  if (open.length === 0) {
    return <EmptyState data-testid="panel-abiertos-vacio" title={C.empty.title} description={C.empty.description} />;
  }
  return (
    <div className="flex flex-col gap-8">
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="panel-abiertos">
        {open.map((l) => (
          <Surface as="li" key={l.code} padding="md" data-testid={`panel-abierto-${l.code.toLowerCase()}`}>
            <p className="text-muted-foreground font-mono text-xs">{l.code}</p>
            <h3 className="font-heading text-2xl leading-tight font-medium">{l.name}</h3>
            <p className="text-muted-foreground text-sm">{`${l.city} · ${l.zone}`}</p>
            <p className="text-sm font-medium">{C.availability(l.participations.available, l.participations.total)}</p>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm">{C.unitPrice}</span>
              <MoneyDisplay value={l.unitPrice} kind="amount" size="md" />
            </div>
            <Button asChild variant="outline" className="mt-auto">
              <Link href={projectHref(l.slug)}>
                {C.cta}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </Surface>
        ))}
      </ul>
      <Button asChild variant="outline" className="w-fit">
        <Link href={routeHref("p3")}>{C.all}</Link>
      </Button>
      <LegalNotice notice="riskNotice" variant="inline" />
    </div>
  );
}
