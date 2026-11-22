import { Suspense } from "react";
import { ProjectWorksScreen } from "./ProjectWorksScreen";
import { TextSkeleton } from "@/shared/ui/brand";

async function Resolved({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectWorksScreen idOrSlug={id} />;
}

/** Resuelve `params` (Next 16) dentro de Suspense y entrega la pantalla de obra. */
export function AdminProjectRoute({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-7xl p-10"><TextSkeleton lines={3} /></div>}>
      <Resolved params={params} />
    </Suspense>
  );
}
