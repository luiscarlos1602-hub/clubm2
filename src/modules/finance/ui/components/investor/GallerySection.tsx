import { ProjectGallery, type ProjectImageVariant } from "@/shared/ui/brand";
import { Section } from "@/shared/ui/layout";
import type { ListingPhase } from "@/modules/participations";
import type { ProjectDetail } from "../../../domain/project-detail";
import { PROJECT_DETAIL_COPY } from "./copy";

const C = PROJECT_DETAIL_COPY.gallery;
/** Imagen con la que abre la galería según la fase: antes de la obra, o el resultado una vez en venta. */
const DEFAULT_VARIANT: Record<ListingPhase, ProjectImageVariant> = {
  open: "antes",
  placement_complete: "antes",
  renovation: "antes",
  on_sale: "despues",
  sold: "despues",
  finished: "despues",
};

/** Galería antes · después · proyección (imágenes de referencia). */
export function GallerySection({ data }: { data: ProjectDetail }) {
  const { listing } = data;
  return (
    <Section tone="paper" spacing="md" label={C.title} innerClassName="flex flex-col gap-5" data-testid="seccion-galeria">
      <p className="max-w-[60ch] text-sm text-muted-foreground">{C.description}</p>
      <ProjectGallery code={listing.code} name={listing.name} defaultVariant={DEFAULT_VARIANT[listing.phase]} data-testid="ficha-galeria" />
    </Section>
  );
}
