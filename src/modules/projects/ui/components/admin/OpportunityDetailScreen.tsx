"use client";

import Link from "next/link";
import { useRef, useState, type ComponentType } from "react";
import { ArrowLeft, Circle, SearchX } from "lucide-react";
import { EmptyState, ProjectGallery } from "@/shared/ui/brand";
import { AdminQueryState } from "@/shared/ui/admin";
import { Eyebrow, PageHeader, Section, Surface } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import { OPPORTUNITY_COPY as C, STAGE_ACTIONS_COPY, STAGE_LABEL } from "./copy";
import type { ProjectStatus } from "../../../domain/project-status";
import { StageBadge } from "./badges";
import { StageActions } from "./StageActions";
import { useAdminProjects, type ProjectRow } from "./use-admin-projects";

const BOARD = "/admin/adquisiciones";

/** Cifras de la ficha (C, F, P, O) inyectadas por app/admin: el dinero lo lee y formatea finance. */
export type OpportunityFiguresView = ComponentType<{ slug: string; "data-testid"?: string }>;

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2 last:border-b-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

function BackLink() {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={BOARD} data-testid="adq-detalle-volver"><ArrowLeft aria-hidden />{C.back}</Link>
    </Button>
  );
}

function Decision({ row }: { row: ProjectRow }) {
  const { status, slug } = row.project;
  const open = status === "opportunity" || status === "due_diligence";
  const heading = useRef<HTMLHeadingElement>(null);
  const [changedTo, setChangedTo] = useState<ProjectStatus | null>(null);
  // Comprar o descartar desmonta StageActions: el anuncio y el foco quedan aquí, que no se desmonta.
  const onDone = (stage: ProjectStatus) => {
    setChangedTo(stage);
    heading.current?.focus();
  };
  return (
    <Section tone="dark" spacing="md" labelledBy="adq-decision-h" innerClassName="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Eyebrow>{STAGE_ACTIONS_COPY.heading}</Eyebrow>
        <h2 id="adq-decision-h" ref={heading} tabIndex={-1} className="font-heading text-3xl font-semibold outline-none">{C.decision.heading}</h2>
        <p className="max-w-[62ch] text-foreground/85">{open ? C.decision.description : status === "discarded" ? C.decision.discarded : C.decision.bought}</p>
      </div>
      <div role="status" aria-live="polite" className="text-sm" data-testid="adq-detalle-anuncio">
        {changedTo ? <p>{STAGE_ACTIONS_COPY.done(STAGE_LABEL[changedTo])}</p> : null}
      </div>
      {open ? <StageActions project={row.project} testId="adq-detalle-decision" onDone={onDone} /> : null}
      {!open && status !== "discarded" ? (
        <Button asChild className="self-start"><Link href={`/admin/proyectos/${slug}`} data-testid="adq-detalle-abrir-proyecto">{C.decision.openProject}</Link></Button>
      ) : null}
    </Section>
  );
}

function Detail({ row, FiguresView }: { row: ProjectRow; FiguresView?: OpportunityFiguresView }) {
  const { project, property } = row;
  return (
    <>
      <Section tone="paper" spacing="md" labelledBy="adq-inmueble-h" innerClassName="grid gap-8 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-3 lg:col-span-7">
          <h2 id="adq-inmueble-h" className="font-heading text-2xl font-semibold">{C.property.heading}</h2>
          <ProjectGallery code={project.code} name={project.name} data-testid="adq-detalle-galeria" />
          <p className="text-xs text-muted-foreground">{C.property.galleryNote}</p>
        </div>
        <Surface className="min-w-0 lg:col-span-5" data-testid="adq-detalle-inmueble">
          {property ? (
            <dl className="flex flex-col">
              <Spec label={C.property.kind}>{C.property.kinds[property.kind]}</Spec>
              <Spec label={C.property.zone}>{property.city} · {property.zone}</Spec>
              <Spec label={C.property.area}>{C.property.areaValue(property.areaM2)}</Spec>
            </dl>
          ) : null}
        </Surface>
      </Section>

      <Section tone="sand" spacing="md" labelledBy="adq-dd-h" innerClassName="grid gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-5">
          <Eyebrow>{C.dd.heading}</Eyebrow>
          <h2 id="adq-dd-h" className="font-heading text-2xl font-semibold">{C.dd.title}</h2>
          <p className="text-muted-foreground">{C.dd.description}</p>
        </div>
        <Surface className="lg:col-span-7" data-testid="adq-detalle-checklist">
          <ul aria-label={C.dd.listLabel} className="flex flex-col gap-3">
            {C.dd.items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <Circle aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </Surface>
      </Section>

      {FiguresView ? <FiguresView slug={project.slug} data-testid="adq-detalle-cifras" /> : null}

      <Decision row={row} />
    </>
  );
}

/** B2 · Detalle de una oportunidad (W-3). `id` = slug o código del proyecto. */
export function OpportunityDetailScreen({ id, FiguresView }: { id: string; FiguresView?: OpportunityFiguresView }) {
  const query = useAdminProjects();
  const key = id.toUpperCase();
  const row = (query.data ?? []).find((r) => r.project.slug === id || r.project.code === key);

  return (
    <div data-testid="pagina-b2-detalle" data-route-id="b2" className="flex flex-col">
      <PageHeader
        id="admin-adq-detalle-titulo"
        eyebrow={C.eyebrow}
        title={row ? row.project.name : query.isPending ? C.titleFallback : C.notFound.title}
        description={row ? `${row.property?.city} · ${row.property?.zone}` : query.isPending ? undefined : C.notFound.description}
        actions={<BackLink />}
        aside={row ? <StageBadge status={row.project.status} /> : undefined}
        data-testid="admin-adq-detalle-cabecera"
      />
      <AdminQueryState isPending={query.isPending} isError={query.isError} isEmpty={false} onRetry={() => void query.refetch()} testId="admin-adq-detalle">
        {row ? (
          <Detail row={row} FiguresView={FiguresView} />
        ) : (
          <Section tone="light" spacing="md" label={C.notFound.title}>
            <EmptyState icon={SearchX} data-testid="adq-detalle-no-encontrado" title={C.notFound.title} description={C.notFound.description}
              action={<Button asChild variant="outline"><Link href={BOARD}>{C.notFound.action}</Link></Button>} />
          </Section>
        )}
      </AdminQueryState>
    </div>
  );
}
