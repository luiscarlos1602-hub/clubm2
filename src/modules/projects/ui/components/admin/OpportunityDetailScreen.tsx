"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, SearchX } from "lucide-react";
import { EmptyState, MoneyDisplay, ProjectGallery } from "@/shared/ui/brand";
import { AdminQueryState, MockAction } from "@/shared/ui/admin";
import { Eyebrow, PageHeader, Section, Surface } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import { OPPORTUNITY_COPY as C } from "./copy";
import { StageBadge } from "./badges";
import { DUE_DILIGENCE_ITEMS, OPPORTUNITY_DETAILS, type OpportunityDetail } from "./examples";
import { useAdminProjects } from "./use-admin-projects";

const BOARD = "/admin/adquisiciones";

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

function Detail({ detail }: { detail: OpportunityDetail }) {
  const total = DUE_DILIGENCE_ITEMS.length;
  return (
    <>
      <Section tone="paper" spacing="md" labelledBy="adq-inmueble-h" innerClassName="grid gap-8 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-3 lg:col-span-7">
          <h2 id="adq-inmueble-h" className="font-heading text-2xl font-semibold">{C.property.heading}</h2>
          <ProjectGallery code={detail.imageCode} name={detail.name} data-testid="adq-detalle-galeria" />
          <p className="text-xs text-muted-foreground">{C.property.galleryNote}</p>
        </div>
        <Surface className="min-w-0 lg:col-span-5" data-testid="adq-detalle-inmueble">
          <dl className="flex flex-col">
            <Spec label={C.property.kind}>{C.property.kinds[detail.kind]}</Spec>
            <Spec label={C.property.zone}>{detail.zone}</Spec>
            <Spec label={C.property.area}>{C.property.areaValue(detail.areaM2)}</Spec>
            <Spec label={C.property.rooms}>{detail.rooms}</Spec>
            <Spec label={C.property.bathrooms}>{detail.bathrooms}</Spec>
            <Spec label={C.property.parking}>{detail.parking}</Spec>
            <Spec label={C.property.condition}>{detail.condition}</Spec>
            <Spec label={C.property.source}>{detail.source}</Spec>
          </dl>
        </Surface>
      </Section>

      <Section tone="sand" spacing="md" labelledBy="adq-dd-h" innerClassName="grid gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-5">
          <Eyebrow>{C.dd.heading}</Eyebrow>
          <h2 id="adq-dd-h" className="font-heading text-2xl font-semibold" data-testid="adq-detalle-progreso">
            {C.dd.progress(detail.checklistDone, total)}
          </h2>
          <p className="text-muted-foreground">{C.dd.description}</p>
        </div>
        <Surface className="lg:col-span-7" data-testid="adq-detalle-checklist">
          <ul aria-label={C.dd.listLabel} className="flex flex-col gap-3">
            {DUE_DILIGENCE_ITEMS.map((item, i) => {
              const done = i < detail.checklistDone;
              return (
                <li key={item.label} className="flex items-start gap-3 text-sm" data-done={done}>
                  {done ? <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" /> : <Circle aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
                  <span className="flex-1">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{done ? C.dd.done : C.dd.pending}</span>
                </li>
              );
            })}
          </ul>
        </Surface>
      </Section>

      <Section tone="light" spacing="md" labelledBy="adq-cifras-h" innerClassName="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 id="adq-cifras-h" className="font-heading text-2xl font-semibold">{C.figures.heading}</h2>
          <p className="max-w-[62ch] text-muted-foreground">{C.figures.description}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="adq-detalle-cifras">
          <Surface padding="sm"><MoneyDisplay value={detail.asking} kind="amount" label={C.figures.asking} size="lg" /></Surface>
          <Surface padding="sm">
            {detail.offer ? <MoneyDisplay value={detail.offer} kind="amount" label={C.figures.offer} size="lg" /> : (
              <><span className="text-sm text-muted-foreground">{C.figures.offer}</span><span className="text-sm">{C.figures.noOffer}</span></>
            )}
          </Surface>
          <Surface padding="sm">
            <MoneyDisplay value={detail.reformBudget} kind="amount" label={C.figures.reform} size="lg" />
            <p className="text-xs text-muted-foreground">{C.figures.reformNote}</p>
          </Surface>
          <Surface padding="sm"><MoneyDisplay value={detail.referenceSale} kind="projection" label={C.figures.sale} size="lg" /></Surface>
        </div>
        <p className="text-sm text-muted-foreground">{C.figures.notBought}</p>
      </Section>

      <Section tone="dark" spacing="md" labelledBy="adq-decision-h" innerClassName="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Eyebrow>{C.stageLabel[detail.stage]}</Eyebrow>
          <h2 id="adq-decision-h" className="font-heading text-3xl font-semibold">{C.decision.heading}</h2>
          <p className="max-w-[62ch] text-foreground/85">{C.decision.description}</p>
        </div>
        <div className="flex flex-wrap gap-4" data-testid="adq-detalle-decision">
          <MockAction label={C.decision.advance} doneMessage={C.decision.advanced} data-testid="adq-detalle-avanzar" />
          <MockAction label={C.decision.discard} doneMessage={C.decision.discarded} variant="outline" data-testid="adq-detalle-descartar" />
        </div>
      </Section>
    </>
  );
}

/** B2 · Detalle de una oportunidad (maqueta). `id` = ficha de ejemplo (OP-…) o proyecto por código/slug. */
export function OpportunityDetailScreen({ id }: { id: string }) {
  const query = useAdminProjects();
  const key = id.toUpperCase();
  const row = (query.data ?? []).find((r) => r.project.slug === id || r.project.code === key);
  const example = OPPORTUNITY_DETAILS[key] ?? (row ? OPPORTUNITY_DETAILS[row.project.code] : undefined);
  const known = example !== undefined || row !== undefined;
  const title = example?.name ?? row?.project.name ?? C.titleFallback;

  return (
    <div data-testid="pagina-b2-detalle" data-route-id="b2" className="flex flex-col">
      <PageHeader
        id="admin-adq-detalle-titulo"
        eyebrow={C.eyebrow}
        title={known ? title : C.notFound.title}
        description={known ? (example?.zone ?? `${row?.property?.city} · ${row?.property?.zone}`) : C.notFound.description}
        actions={<BackLink />}
        aside={row ? <StageBadge status={row.project.status} /> : example ? <span className="text-sm">{C.stageLabel[example.stage]}</span> : undefined}
        data-testid="admin-adq-detalle-cabecera"
      />
      <AdminQueryState isPending={query.isPending} isError={query.isError} isEmpty={false} onRetry={() => void query.refetch()} testId="admin-adq-detalle">
        {!known ? (
          <Section tone="light" spacing="md" label={C.notFound.title}>
            <EmptyState icon={SearchX} data-testid="adq-detalle-no-encontrado" title={C.notFound.title} description={C.notFound.description}
              action={<Button asChild variant="outline"><Link href={BOARD}>{C.notFound.action}</Link></Button>} />
          </Section>
        ) : example ? (
          <Detail detail={example} />
        ) : null}
        {known && !example && row ? (
          <Section tone="paper" spacing="md" label={C.decision.heading}>
            <Surface data-testid="adq-detalle-comprado">
              <p>{C.decision.bought}</p>
              <Button asChild className="self-start"><Link href={`/admin/proyectos/${row.project.slug}`}>{C.decision.openProject}</Link></Button>
            </Surface>
          </Section>
        ) : null}
      </AdminQueryState>
    </div>
  );
}
