import { Suspense } from "react";
import { TextSkeleton } from "@/shared/ui/brand";
import { OpportunityDetailScreen, type OpportunityFiguresView } from "./OpportunityDetailScreen";

async function Resolved({ params, FiguresView }: { params: Promise<{ id: string }>; FiguresView?: OpportunityFiguresView }) {
  const { id } = await params;
  return <OpportunityDetailScreen id={id} FiguresView={FiguresView} />;
}

/** Resuelve `params` (Next 16) dentro de Suspense y entrega el detalle de la oportunidad. `FiguresView` = cifras de finance, inyectadas por app/admin. */
export function AdminOpportunityRoute({ params, FiguresView }: { params: Promise<{ id: string }>; FiguresView?: OpportunityFiguresView }) {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-7xl p-10"><TextSkeleton lines={3} /></div>}>
      <Resolved params={params} FiguresView={FiguresView} />
    </Suspense>
  );
}
