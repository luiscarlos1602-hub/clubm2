import { Suspense } from "react";
import { TextSkeleton } from "@/shared/ui/brand";
import { OpportunityDetailScreen } from "./OpportunityDetailScreen";

async function Resolved({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OpportunityDetailScreen id={id} />;
}

/** Resuelve `params` (Next 16) dentro de Suspense y entrega el detalle de la oportunidad. */
export function AdminOpportunityRoute({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-7xl p-10"><TextSkeleton lines={3} /></div>}>
      <Resolved params={params} />
    </Suspense>
  );
}
