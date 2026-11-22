import type { ProjectId, ProjectRepository } from "@/modules/projects";
import { changeProjectStatus, checkProjectConsistency } from "@/modules/projects";
import type { IsoDate } from "@/shared/domain/calendar-date";
import type { Clock } from "@/shared/domain/clock";
import type { Money } from "@/shared/domain/money";
import type { RepositoryWriteErrorCode } from "@/shared/domain/repository-write";
import { err, type DomainError, type Result } from "@/shared/domain/result";
import { checkProjectSale, type ProjectSale, type ProjectSaleErrorCode } from "../domain/project-sale";
import type { ProjectSaleWriter } from "./ports";

export type RecordProjectSaleInput = {
  readonly projectId: ProjectId;
  readonly salePrice: Money;
  readonly saleCosts: Money;
  readonly signedOn: IsoDate;
};

export type RecordProjectSaleErrorCode =
  | "PROJECT_NOT_FOUND"
  | ProjectSaleErrorCode
  | "INVALID_TRANSITION"
  | "DATE_OUT_OF_ORDER"
  | "INCONSISTENT_TIMELINE"
  | RepositoryWriteErrorCode;

export type RecordProjectSale = (
  input: RecordProjectSaleInput,
) => Promise<Result<ProjectSale, DomainError<RecordProjectSaleErrorCode>>>;

/**
 * W-5. Registra la venta real y pasa el proyecto a `sold` (on_sale | stalled → sold) en un solo guardado atómico.
 * La fecha de firma sella `saleSignedOn`; no puede ser futura ni anterior a la compra. Nunca lanza.
 */
export function createRecordProjectSale(deps: {
  readonly projects: Pick<ProjectRepository, "findById">;
  readonly sales: ProjectSaleWriter;
  readonly clock: Clock;
}): RecordProjectSale {
  return async (input) => {
    const project = await deps.projects.findById(input.projectId);
    if (project === null) return err("PROJECT_NOT_FOUND", `no existe el proyecto ${input.projectId}`);

    const sale: ProjectSale = {
      projectId: input.projectId,
      salePrice: input.salePrice,
      saleCosts: input.saleCosts,
      signedOn: input.signedOn,
    };
    const checked = checkProjectSale(sale, deps.clock.today());
    if (!checked.ok) return checked;

    const changed = changeProjectStatus(project, "sold", input.signedOn);
    if (!changed.ok) return changed;
    const consistent = checkProjectConsistency(changed.value);
    if (!consistent.ok) return consistent;

    return deps.sales.record({ project: changed.value, sale: checked.value });
  };
}
