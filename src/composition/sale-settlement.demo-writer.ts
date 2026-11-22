import type { ProjectSaleWriter, SettlementWriter } from "@/modules/finance/application/ports";
import { recordSaleInSlice, recordSettlementInSlice } from "@/modules/finance/infrastructure/finance.mock-writer";
import { createProjectMockWriter } from "@/modules/projects/infrastructure/projects.mock-writer";
import { err, ok, type Result } from "@/shared/domain/result";
import type { RepositoryWriteError } from "@/shared/domain/repository-write";
import { memorySlice, type DemoStore } from "@/shared/infrastructure/demo-store";
import type { DemoSnapshot } from "./demo-snapshot";

/**
 * Escritor atómico de venta y liquidación de la demo (plan 012 §3). Aplica el proyecto (slice `projects`) y la venta o
 * la liquidación (slice `finance`) sobre copias en memoria y, solo si ambos aceptan, hace un único `store.write`.
 * Si cualquiera se rechaza, el almacén queda como estaba. Reemplazado en DB-4 por una RPC transaccional.
 */
export function createDemoSaleSettlementWriter(store: DemoStore<DemoSnapshot>): ProjectSaleWriter & SettlementWriter {
  async function apply<T>(
    project: Parameters<ProjectSaleWriter["record"]>[0]["project"],
    recordProjectId: string,
    write: (finance: ReturnType<typeof memorySlice<DemoSnapshot["finance"]>>) => Result<T, RepositoryWriteError>,
  ): Promise<Result<T, RepositoryWriteError>> {
    if (recordProjectId !== project.id) {
      return err("INVALID_RECORD", `el registro es del proyecto ${recordProjectId}, no de ${project.id}`);
    }
    const base = store.read();
    if (!base.projects.projects.some((p) => p.id === project.id)) {
      return err("REFERENCE_NOT_FOUND", `no existe el proyecto ${project.id}`);
    }
    const projects = memorySlice(base.projects);
    const finance = memorySlice(base.finance);
    // La parte de finance va primero: valida esquema, duplicado y referencia a la venta antes de tocar el proyecto.
    const written = write(finance);
    if (!written.ok) return written;
    const saved = await createProjectMockWriter(projects).save(project);
    if (!saved.ok) return saved;
    store.write({ ...store.read(), projects: projects.read(), finance: finance.read() });
    return ok(written.value);
  }

  return {
    record: ({ project, sale }) => apply(project, sale.projectId, (finance) => recordSaleInSlice(finance, sale)),
    settle: ({ project, settlement }) => apply(project, settlement.projectId, (finance) => recordSettlementInSlice(finance, settlement)),
  };
}
