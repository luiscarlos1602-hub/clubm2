"use client";

import { useProjectDetail } from "../../hooks/use-project-detail";
import { BudgetSection } from "./BudgetSection";
import { GallerySection } from "./GallerySection";
import { ParticipateCta } from "./ParticipateCta";
import { ProjectDetailError, ProjectDetailLoading, ProjectDetailMissing } from "./ProjectDetailStates";
import { ProjectHeader } from "./ProjectHeader";
import { PropertySection } from "./PropertySection";
import { RealizedResult } from "./RealizedResult";
import { RisksSection } from "./RisksSection";
import { ScenariosSection } from "./ScenariosSection";
import { SimulatorSection } from "./SimulatorSection";
import { TimelineSection } from "./TimelineSection";

/** Pantalla P4. Lee del container; el simulador solo en fase abierta; los finalizados muestran el resultado realizado; el resto, proyección fija. */
export function ProjectDetail({ slug }: { slug: string }) {
  const query = useProjectDetail(slug);
  if (query.isPending) return <ProjectDetailLoading />;
  if (query.isError) return <ProjectDetailError onRetry={() => void query.refetch()} />;
  const data = query.data;
  if (data === null) return <ProjectDetailMissing />;
  return (
    <div data-testid="pagina-p4" data-route-id="p4" data-project-code={data.listing.code} data-phase={data.listing.phase} className="flex flex-col">
      <ProjectHeader data={data} />
      <GallerySection data={data} />
      <PropertySection data={data} />
      <BudgetSection budget={data.budget} />
      {data.mode === "realized" && data.realized && data.settlement ? (
        <RealizedResult realized={data.realized} settlement={data.settlement} />
      ) : (
        <>
          <ScenariosSection rows={data.scenarios} />
          {data.mode === "open" ? <SimulatorSection data={data} /> : null}
        </>
      )}
      <TimelineSection data={data} />
      <RisksSection risks={data.risks} />
      <ParticipateCta listing={data.listing} />
    </div>
  );
}
