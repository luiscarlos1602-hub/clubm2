import { Suspense } from "react";
import { ProjectWorksScreen } from "./ProjectWorksScreen";
import type { ProcessBoardView } from "./ProjectWorksSections";
import { TextSkeleton } from "@/shared/ui/brand";

async function Resolved({ params, ProcessView }: { params: Promise<{ id: string }>; ProcessView?: ProcessBoardView }) {
  const { id } = await params;
  return <ProjectWorksScreen idOrSlug={id} ProcessView={ProcessView} />;
}

/** Resuelve `params` (Next 16) dentro de Suspense y entrega la pantalla de obra. `ProcessView` = tablero de finance, inyectado por app/admin. */
export function AdminProjectRoute({ params, ProcessView }: { params: Promise<{ id: string }>; ProcessView?: ProcessBoardView }) {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-7xl p-10"><TextSkeleton lines={3} /></div>}>
      <Resolved params={params} ProcessView={ProcessView} />
    </Suspense>
  );
}
