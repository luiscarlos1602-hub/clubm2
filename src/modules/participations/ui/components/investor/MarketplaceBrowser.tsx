"use client";

import { useMemo, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { CardSkeleton, EmptyState, ErrorState } from "@/shared/ui/brand";
import type { TestIdProp } from "@/shared/ui/brand/types";
import { Button } from "@/shared/ui/primitives/button";
import { cn } from "@/shared/lib/utils";
import {
  filterListings,
  listLocationOptions,
  resolveLocation,
  type MarketplaceFilter,
} from "../../../domain/marketplace-filters";
import { MARKETPLACE_COPY } from "../../copy";
import { useMarketplace } from "../../hooks/use-marketplace";
import { MarketplaceFilters } from "./MarketplaceFilters";
import { ProjectCard } from "./ProjectCard";

const C = MARKETPLACE_COPY;
const GRID = "grid gap-6 md:grid-cols-2 xl:grid-cols-3";

export type MarketplaceBrowserProps = TestIdProp;

/** Lista filtrable de proyectos. Solo useQuery lee datos; el render no toca el container. */
export function MarketplaceBrowser({ className, "data-testid": testId = "marketplace" }: MarketplaceBrowserProps) {
  const query = useMarketplace();
  const [stage, setStage] = useState<MarketplaceFilter>("all");
  const [locationKey, setLocationKey] = useState("todas");
  const data = query.data;
  const options = useMemo(() => listLocationOptions(data ?? []), [data]);
  const visible = useMemo(
    () => filterListings(data ?? [], { stage, location: resolveLocation(options, locationKey) }),
    [data, stage, options, locationKey],
  );
  const reset = () => {
    setStage("all");
    setLocationKey("todas");
  };

  return (
    <div data-testid={testId} className={cn("flex flex-col gap-8", className)}>
      <MarketplaceFilters
        stage={stage}
        onStageChange={setStage}
        locationKey={locationKey}
        locationOptions={options}
        onLocationChange={setLocationKey}
        disabled={query.isPending}
      />
      {query.isPending ? (
        <div data-testid="marketplace-cargando" className={GRID}>
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} data-testid={`marketplace-cargando-${i}`} />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          data-testid="marketplace-error"
          title={C.error.title}
          description={C.error.description}
          action={
            <Button type="button" variant="outline" data-testid="marketplace-reintentar" onClick={() => void query.refetch()}>
              {C.error.action}
            </Button>
          }
        />
      ) : !data || data.length === 0 ? (
        <EmptyState data-testid="marketplace-vacio" icon={LayoutGrid} title={C.emptyAll.title} description={C.emptyAll.description} />
      ) : visible.length === 0 ? (
        <EmptyState
          data-testid="marketplace-vacio"
          icon={LayoutGrid}
          title={C.emptyFiltered.title}
          description={C.emptyFiltered.description}
          action={
            <Button type="button" variant="outline" data-testid="marketplace-limpiar-filtros" onClick={reset}>
              {C.emptyFiltered.action}
            </Button>
          }
        />
      ) : (
        <>
          <p role="status" aria-live="polite" data-testid="marketplace-resultados" className="text-sm text-muted-foreground">
            {C.results(visible.length)}
          </p>
          <ul data-testid="marketplace-lista" className={GRID}>
            {visible.map((listing) => (
              <li key={listing.projectId}>
                <ProjectCard listing={listing} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
