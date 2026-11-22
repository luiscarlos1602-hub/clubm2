"use client";

import { Button } from "@/shared/ui/primitives/button";
import { Label } from "@/shared/ui/primitives/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/primitives/select";
import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "@/shared/ui/brand/types";
import { MARKETPLACE_FILTERS, type LocationOption, type MarketplaceFilter } from "../../../domain/marketplace-filters";
import { MARKETPLACE_COPY } from "../../copy";

const C = MARKETPLACE_COPY;

const FILTER_TEST_ID: Readonly<Record<MarketplaceFilter, string>> = {
  all: "filtro-etapa-todas",
  open: "filtro-etapa-abiertos",
  renovation: "filtro-etapa-en-obra",
  on_sale: "filtro-etapa-en-venta",
  finished: "filtro-etapa-finalizados",
};

export type MarketplaceFiltersProps = TestIdProp & {
  stage: MarketplaceFilter;
  onStageChange(next: MarketplaceFilter): void;
  locationKey: string;
  locationOptions: readonly LocationOption[];
  onLocationChange(nextKey: string): void;
  disabled?: boolean;
};

function optionLabel(option: LocationOption): string {
  const f = option.filter;
  if (f.kind === "all") return C.location.all;
  return f.kind === "city" ? C.location.city(f.city) : C.location.zone(f.city, f.zone);
}

/** Filtros controlados: etapa (botones) y ubicación (lista). */
export function MarketplaceFilters({
  stage,
  onStageChange,
  locationKey,
  locationOptions,
  onLocationChange,
  disabled = false,
  className,
  "data-testid": testId = "marketplace-filtros",
}: MarketplaceFiltersProps) {
  return (
    <div data-testid={testId} className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="flex flex-col gap-2">
        <span id="filtro-etapa-etiqueta" className="text-sm font-medium">
          {C.filters.stageLabel}
        </span>
        <div role="group" aria-labelledby="filtro-etapa-etiqueta" className="flex flex-wrap gap-2">
          {MARKETPLACE_FILTERS.map((filter) => (
            <Button
              key={filter}
              type="button"
              size="sm"
              variant={filter === stage ? "default" : "outline"}
              aria-pressed={filter === stage}
              disabled={disabled}
              data-testid={FILTER_TEST_ID[filter]}
              onClick={() => onStageChange(filter)}
            >
              {C.filters.stage[filter]}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-2 md:w-72">
        <Label htmlFor="filtro-ubicacion">{C.filters.locationLabel}</Label>
        <Select value={locationKey} onValueChange={onLocationChange} disabled={disabled}>
          <SelectTrigger id="filtro-ubicacion" className="w-full" data-testid="filtro-ubicacion">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locationOptions.map((option) => (
              <SelectItem key={option.key} value={option.key} data-testid={`filtro-ubicacion-${option.key}`}>
                {optionLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
