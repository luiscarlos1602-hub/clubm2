"use client";

import Link from "next/link";
import { Suspense, use } from "react";
import { Building2 } from "lucide-react";
import { AdminQueryState } from "@/shared/ui/admin";
import { EmptyState, TextSkeleton } from "@/shared/ui/brand";
import { PageHeader, Section } from "@/shared/ui/layout";
import { routeHref } from "@/shared/ui/app-shell";
import { Button } from "@/shared/ui/primitives/button";
import { LOCKED_SHEET_STATUSES } from "../../../../domain/project-sheet-requirements";
import { useProjectSheet, useReferenceLibrary } from "../../../hooks/use-project-sheet";
import { ProjectSheetWizard } from "./ProjectSheetWizard";
import { SHEET_COPY } from "./copy";
import { sheetToForm } from "./sheet-form-convert";
import { emptySheetValues } from "./sheet-form-schema";

const BackLink = () => (
  <Button asChild variant="outline" size="lg" className="h-11">
    <Link href={routeHref("b7")} data-testid="ficha-volver">{SHEET_COPY.backToList}</Link>
  </Button>
);

/** B8 · alta de inmueble. */
export function ProjectSheetNewScreen() {
  const library = useReferenceLibrary();
  const C = SHEET_COPY.new;
  return (
    <div data-testid="pagina-b8" data-route-id="b8" className="flex flex-col">
      <PageHeader id="admin-ficha-nuevo-titulo" eyebrow={C.eyebrow} title={C.title} description={C.description} actions={<BackLink />} data-testid="admin-ficha-cabecera" />
      <Section tone="paper" spacing="md" label={C.title} innerClassName="flex flex-col gap-6">
        <div data-testid="admin-proyectos-nuevo-formulario">
          <AdminQueryState isPending={library.isPending} isError={library.isError} isEmpty={false} onRetry={() => void library.refetch()} testId="admin-ficha">
            <ProjectSheetWizard initial={emptySheetValues()} existing={null} library={library.data ?? []} />
          </AdminQueryState>
        </div>
      </Section>
    </div>
  );
}

/** B9 · edición de un inmueble por slug. sold y settled se abren en solo lectura (W2-3). */
export function ProjectSheetEditScreen({ slug }: { slug: string }) {
  const sheet = useProjectSheet(slug);
  const library = useReferenceLibrary();
  const C = SHEET_COPY.edit;
  const data = sheet.data;
  const locked = data ? LOCKED_SHEET_STATUSES.includes(data.project.status) : false;
  return (
    <div data-testid="pagina-b9" data-route-id="b9" className="flex flex-col">
      <PageHeader id="admin-ficha-editar-titulo" eyebrow={C.eyebrow} title={data ? data.project.name : C.title} description={C.description} actions={<BackLink />} data-testid="admin-ficha-cabecera" />
      <Section tone="paper" spacing="md" label={C.title} innerClassName="flex flex-col gap-6">
        <AdminQueryState
          isPending={sheet.isPending || library.isPending}
          isError={sheet.isError || library.isError}
          isEmpty={false}
          onRetry={() => {
            void sheet.refetch();
            void library.refetch();
          }}
          testId="admin-ficha"
        >
          {data === null || data === undefined ? (
            <EmptyState icon={Building2} data-testid="admin-ficha-no-encontrada" title={C.notFoundTitle} description={C.notFoundDescription} action={<BackLink />} />
          ) : locked ? (
            <EmptyState icon={Building2} data-testid="admin-ficha-bloqueada" title={C.lockedTitle} description={C.lockedDescription} action={<BackLink />} />
          ) : (
            <ProjectSheetWizard key={`${data.project.id}-${sheet.dataUpdatedAt}`} initial={sheetToForm(data)} existing={data} library={library.data ?? []} />
          )}
        </AdminQueryState>
      </Section>
    </div>
  );
}

function Resolved({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProjectSheetEditScreen slug={id} />;
}

/** Resuelve `params` (Next 16) dentro de Suspense y entrega la pantalla de edición. */
export function ProjectSheetEditRoute({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-7xl p-10"><TextSkeleton lines={3} /></div>}>
      <Resolved params={params} />
    </Suspense>
  );
}
