"use client";

import Link from "next/link";
import { Store } from "lucide-react";
import { formatIsoDate } from "@/shared/lib/format-date";
import { EmptyState, MoneyDisplay } from "@/shared/ui/brand";
import { PageHeader, Section, Surface } from "@/shared/ui/layout";
import { ADMIN_COMMON, COMMERCIAL_COPY as C } from "./copy";
import { LISTING_BY_CODE, OFFERS, UPCOMING_VISITS } from "./examples";
import { AdminQueryState } from "@/shared/ui/admin";
import { MockAction } from "@/shared/ui/admin";
import { TableScroll } from "@/shared/ui/admin";
import { StageBadge, WheelBadge } from "./badges";
import { useAdminProjects } from "./use-admin-projects";

/** B4 · Comercialización de los inmuebles en venta. Publicación, visitas y ofertas son ejemplos. */
export function CommercializationScreen() {
  const query = useAdminProjects();
  const onSale = (query.data ?? []).filter((r) => ["on_sale", "stalled", "sold"].includes(r.project.status));
  return (
    <div data-testid="pagina-b4" data-route-id="b4" className="flex flex-col">
      <PageHeader id="admin-com-titulo" eyebrow={C.eyebrow} title={C.title} description={C.description} data-testid="admin-com-cabecera" />
      <Section tone="paper" spacing="md" labelledBy="admin-com-tabla-h" innerClassName="flex flex-col gap-6">
        <h2 id="admin-com-tabla-h" className="font-heading text-2xl font-semibold">{C.table.heading}</h2>
        <AdminQueryState isPending={query.isPending} isError={query.isError} isEmpty={false} onRetry={() => void query.refetch()} testId="admin-com">
          {onSale.length === 0 ? (
            <EmptyState icon={Store} data-testid="admin-com-vacio" title={C.empty.title} description={C.empty.description} />
          ) : (
            <>
              <TableScroll label={C.table.heading} data-testid="admin-com-tabla">
                <thead><tr>
                  <th scope="col">{ADMIN_COMMON.project}</th><th scope="col">{ADMIN_COMMON.stage}</th><th scope="col">{ADMIN_COMMON.wheel}</th>
                  <th scope="col">{C.table.listed}</th><th scope="col">{C.table.days}</th><th scope="col">{C.table.visits}</th>
                  <th scope="col">{C.table.offers}</th><th scope="col">{C.table.published}</th>
                </tr></thead>
                <tbody>
                  {onSale.map(({ project, wheel }) => {
                    const l = LISTING_BY_CODE[project.code];
                    return (
                      <tr key={project.id} data-testid={`admin-com-fila-${project.code}`}>
                        <td>
                          <Link href={`/admin/proyectos/${project.slug}`} className="font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring">{project.code}</Link>
                          <span className="block text-xs text-muted-foreground">{project.name}</span>
                        </td>
                        <td><StageBadge status={project.status} /></td>
                        <td><WheelBadge wheel={wheel?.wheel ?? null} /></td>
                        <td>{l ? <MoneyDisplay value={l.listed} kind="amount" size="sm" /> : "—"}</td>
                        <td className="tabular-nums">{l?.daysOnSale ?? "—"}</td>
                        <td className="tabular-nums">{l?.visits ?? "—"}</td>
                        <td className="tabular-nums">{l?.offers ?? "—"}</td>
                        <td>{l?.published ? C.table.yes : C.table.no}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </TableScroll>
              {onSale.some((r) => r.project.status === "stalled" || r.wheel?.wheel === "bad") ? (
                <p className="text-sm text-destructive" data-testid="admin-com-aviso-estancado">{C.stalledNote}</p>
              ) : null}
            </>
          )}
        </AdminQueryState>
      </Section>
      <Section tone="sand" spacing="md" innerClassName="grid gap-8 lg:grid-cols-12" label={C.offersHeading}>
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
          <h2 className="font-heading text-2xl font-semibold">{C.offersHeading}</h2>
          <TableScroll label={C.offersHeading} data-testid="admin-com-ofertas">
            <thead><tr>
              <th scope="col">{C.offerColumns.project}</th><th scope="col">{C.offerColumns.date}</th>
              <th scope="col">{C.offerColumns.amount}</th><th scope="col">{C.offerColumns.status}</th>
            </tr></thead>
            <tbody>
              {OFFERS.map((o) => (
                <tr key={`${o.code}-${o.date}`}>
                  <td className="font-mono">{o.code}</td><td>{formatIsoDate(o.date, "short")}</td>
                  <td><MoneyDisplay value={o.amount} kind="amount" size="sm" /></td><td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </TableScroll>
        </div>
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-5">
          <Surface data-testid="admin-com-visitas">
            <h2 className="font-heading text-xl font-semibold">{C.visitsHeading}</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {UPCOMING_VISITS.map((v) => (
                <li key={`${v.code}-${v.when}`} className="flex justify-between gap-3">
                  <span><span className="font-mono">{v.code}</span> · {v.who}</span>
                  <span className="text-muted-foreground">{formatIsoDate(v.when, "short")}</span>
                </li>
              ))}
            </ul>
          </Surface>
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <MockAction label={C.actions.publish} doneMessage={C.actions.publishDone} data-testid="com-publicar" />
            <MockAction label={C.actions.offer} doneMessage={C.actions.offerDone} variant="outline" data-testid="com-oferta" />
          </div>
        </div>
      </Section>
    </div>
  );
}
