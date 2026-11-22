import type { StatusTone } from "@/shared/ui/brand";
import type { ListingPhase } from "../../../domain/marketplace-listing";
import { MARKETPLACE_COPY } from "../../copy";

/** Fase de la tarjeta → rótulo y tono. Ningún tono de atención. */
export const PHASE_PRESENTATION: Readonly<Record<ListingPhase, { readonly label: string; readonly tone: StatusTone }>> = {
  open: { label: MARKETPLACE_COPY.phase.open, tone: "positive" },
  placement_complete: { label: MARKETPLACE_COPY.phase.placement_complete, tone: "neutral" },
  renovation: { label: MARKETPLACE_COPY.phase.renovation, tone: "in-progress" },
  on_sale: { label: MARKETPLACE_COPY.phase.on_sale, tone: "in-progress" },
  sold: { label: MARKETPLACE_COPY.phase.sold, tone: "neutral" },
  finished: { label: MARKETPLACE_COPY.phase.finished, tone: "neutral" },
};
