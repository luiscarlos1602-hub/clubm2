"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { AdminQueryState, TableScroll } from "@/shared/ui/admin";
import { projectEditHref, routeHref } from "@/shared/ui/app-shell";
import { EmptyState } from "@/shared/ui/brand";
import { PageHeader, Section } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import { isPublishedStatus } from "../../../domain/public-stage";
import { ADMIN_COMMON, PROJECTS_LIST_COPY as C } from "./copy";
import { StageBadge } from "./badges";
import { useAdminProjects } from "./use-admin-projects";

const LINK = "rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/** B7 · listado de todos los inmuebles del almacén, con acceso al alta y a la edición. */
export function ProjectsListScreen() {
  const query = useAdminProjects();
  const rows = query.data ?? [];
  return (
    <div data-testid="pagina-b7" data-route-id="b7" className="flex flex-col">
      <PageHeader
        id="admin-proyectos-titulo"
        eyebrow={C.eyebrow}
        title={C.title}
        description={C.description}
        actions={
          <Button asChild size="lg" className="h-11">
            <Link href={routeHref("b8")} data-testid="admin-proyectos-nuevo">{C.newProperty}</Link>
          </Button>
        }
        data-testid="admin-proyectos-cabecera"
      />
      <Section tone="paper" spacing="md" labelledBy="admin-proyectos-tabla-h" innerClassName="flex flex-col gap-6">
        <h2 id="admin-proyectos-tabla-h" className="font-heading text-2xl font-semibold">{C.table.heading}</h2>
        <AdminQueryState isPending={query.isPending} isError={query.isError} isEmpty={false} onRetry={() => void query.refetch()} testId="admin-proyectos">
          {rows.length === 0 ? (
            <EmptyState icon={Building2} data-testid="admin-proyectos-vacio" title={C.empty.title} description={C.empty.description} />
          ) : (
            <TableScroll label={C.table.heading} data-testid="admin-proyectos-lista">
              <thead>
                <tr>
                  <th scope="col">{ADMIN_COMMON.code}</th>
                  <th scope="col">{ADMIN_COMMON.project}</th>
                  <th scope="col">{ADMIN_COMMON.zone}</th>
                  <th scope="col">{ADMIN_COMMON.stage}</th>
                  <th scope="col">{C.published}</th>
                  <th scope="col"><span className="sr-only">{ADMIN_COMMON.open}</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ project, property }) => {
                  const readOnly = project.status === "sold" || project.status === "settled";
                  return (
                    <tr key={project.id} data-testid={`admin-proyectos-fila-${project.code}`}>
                      <td className="font-mono text-xs">{project.code}</td>
                      <td>{project.name}</td>
                      <td>{property?.zone ?? "—"}</td>
                      <td><StageBadge status={project.status} /></td>
                      <td className="text-xs text-muted-foreground">{isPublishedStatus(project.status) ? C.published : C.internal}</td>
                      <td className="whitespace-nowrap">
                        <Link href={projectEditHref(project.slug)} className={LINK} data-testid={`admin-proyecto-editar-${project.code}`}>
                          {readOnly ? C.table.view : C.table.edit}
                          <span className="sr-only"> {project.code}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </TableScroll>
          )}
        </AdminQueryState>
      </Section>
    </div>
  );
}
