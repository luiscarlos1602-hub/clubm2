import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmptyState } from "@/shared/ui/brand";
import type { TestIdProp } from "@/shared/ui/brand/types";
import { PageHeader, Section } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import { cn } from "@/shared/lib/utils";
import { SHELL_COPY } from "./shell-copy";
import { routeCopy } from "./route-copy";
import { ROUTE_ICONS } from "./route-icons";
import { ROUTES, routeHref, type RouteId } from "./route-map";

export type RoutePlaceholderProps = TestIdProp & { routeId: RouteId };

/** Pantalla provisional con el lenguaje de la portada (ADR-010): cabecera oscura + banda clara. */
export function RoutePlaceholder({ routeId, className, "data-testid": testId }: RoutePlaceholderProps) {
  const copy = routeCopy(routeId);
  const headingId = `titulo-${routeId}`;
  return (
    <div data-testid={testId ?? `pagina-${routeId}`} data-route-id={routeId} className={cn("flex flex-col", className)}>
      <PageHeader id={headingId} eyebrow={copy.navLabel} title={copy.title} description={copy.phrase} />
      <Section spacing="md" label={copy.emptyTitle}>
        <EmptyState
          title={copy.emptyTitle}
          description={`${copy.emptyDescription} ${SHELL_COPY.exampleScreen}`}
          icon={ROUTE_ICONS[routeId]}
          action={
            <Button asChild size="lg">
              <Link href={routeHref(ROUTES[routeId].next)} data-testid="siguiente-paso">
                {copy.nextLabel}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          }
        />
      </Section>
    </div>
  );
}
