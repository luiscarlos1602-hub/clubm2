"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { MoneyDisplay } from "@/shared/ui/brand";
import { Eyebrow, PageHeader, Section, Surface } from "@/shared/ui/layout";
import { ACQUISITIONS_COPY as C } from "./copy";
import { DUE_DILIGENCE_ITEMS, OFFER_CARDS, OPPORTUNITY_CARDS, type BoardCard } from "./examples";
import { AdminQueryState } from "@/shared/ui/admin";
import { MockAction } from "@/shared/ui/admin";
import { useAdminProjects, type ProjectRow } from "./use-admin-projects";


const LINK = "rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50";

function Card({ card }: { card: BoardCard }) {
  return (
    <li data-testid={`oportunidad-${card.id}`}>
      <Surface padding="sm" className="gap-2">
        <span className="font-mono text-xs text-muted-foreground">{card.id}</span>
        <Link href={`/admin/adquisiciones/${card.id}`} data-testid={`oportunidad-ver-${card.id}`} className={LINK}>
          {card.name}
          <span className="sr-only"> · {C.openDetail}</span>
        </Link>
        <span className="text-xs text-muted-foreground">{card.zone}</span>
        <MoneyDisplay value={card.asking} kind="amount" label={C.asking} size="sm" />
        <span className="text-xs text-muted-foreground">{C.checklistOf(card.checklist.done, card.checklist.total)}</span>
      </Surface>
    </li>
  );
}

function ProjectCard({ row }: { row: ProjectRow }) {
  return (
    <li data-testid={`oportunidad-${row.project.code}`}>
      <Surface padding="sm" className="gap-2">
        <span className="font-mono text-xs text-muted-foreground">{row.project.code}</span>
        <Link href={`/admin/adquisiciones/${row.project.slug}`} data-testid={`oportunidad-ver-${row.project.code}`} className={LINK}>
          {row.project.name}
          <span className="sr-only"> · {C.openDetail}</span>
        </Link>
        <span className="text-xs text-muted-foreground">{row.property?.city} · {row.property?.zone}</span>
      </Surface>
    </li>
  );
}

function Column({ id, title, count, children }: { id: string; title: string; count: number; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`col-${id}`} data-testid={`columna-${id}`} className="flex min-w-0 flex-col gap-3 rounded-2xl bg-line/15 p-3">
      <h3 id={`col-${id}`} className="flex items-baseline justify-between px-1 text-sm font-semibold">
        {title}
        <span className="text-xs font-normal text-muted-foreground tabular-nums">{count}</span>
      </h3>
      {count === 0 ? <p className="px-1 py-4 text-xs text-muted-foreground">{C.emptyColumn}</p> : <ul className="flex flex-col gap-3">{children}</ul>}
    </section>
  );
}

/** B2 · Pipeline de oportunidades. Due diligence y Comprado salen de los proyectos semilla. */
export function AcquisitionsBoard() {
  const query = useAdminProjects();
  const rows = query.data ?? [];
  const dd = rows.filter((r) => r.project.status === "due_diligence");
  const bought = rows.filter((r) => ["acquired", "funding", "renovation"].includes(r.project.status));
  return (
    <div data-testid="pagina-b2" data-route-id="b2" className="flex flex-col">
      <PageHeader id="admin-adq-titulo" eyebrow={C.eyebrow} title={C.title} description={C.description} data-testid="admin-adq-cabecera" />
      <Section tone="paper" spacing="md" label={C.boardLabel} innerClassName="flex flex-col gap-8">
        <AdminQueryState isPending={query.isPending} isError={query.isError} isEmpty={false} onRetry={() => void query.refetch()} testId="admin-adq">
          <div data-testid="admin-kanban" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Column id="oportunidad" title={C.columns.opportunity} count={OPPORTUNITY_CARDS.length}>
              {OPPORTUNITY_CARDS.map((c) => <Card key={c.id} card={c} />)}
            </Column>
            <Column id="due-diligence" title={C.columns.due_diligence} count={dd.length}>
              {dd.map((r) => <ProjectCard key={r.project.id} row={r} />)}
            </Column>
            <Column id="oferta" title={C.columns.offer} count={OFFER_CARDS.length}>
              {OFFER_CARDS.map((c) => <Card key={c.id} card={c} />)}
            </Column>
            <Column id="comprado" title={C.columns.acquired} count={bought.length}>
              {bought.map((r) => <ProjectCard key={r.project.id} row={r} />)}
            </Column>
          </div>
        </AdminQueryState>
      </Section>
      <Section tone="sand" spacing="md" labelledBy="admin-dd" innerClassName="grid gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-5">
          <Eyebrow>{C.checklist}</Eyebrow>
          <h2 id="admin-dd" className="font-heading text-2xl font-semibold">{C.panel.heading}</h2>
          <p className="text-muted-foreground">{C.panel.description}</p>
        </div>
        <Surface className="lg:col-span-7" data-testid="admin-checklist">
          <ul className="flex flex-col gap-3">
            {DUE_DILIGENCE_ITEMS.map((item) => (
              <li key={item.label} className="flex items-start gap-3 text-sm">
                {item.done ? <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" /> : <Circle aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
                <span className="flex-1">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.done ? C.panel.done : C.panel.pending}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-6">
            <MockAction label={C.panel.advance} doneMessage={C.panel.advanced} data-testid="adq-avanzar" />
            <MockAction label={C.panel.discard} doneMessage={C.panel.discarded} variant="outline" data-testid="adq-descartar" />
          </div>
        </Surface>
      </Section>
    </div>
  );
}
