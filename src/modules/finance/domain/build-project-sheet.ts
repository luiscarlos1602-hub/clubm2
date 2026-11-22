import type { ParticipationClass } from "@/modules/participations"; // SOLO import type (D2)
import {
  PROCESS_STAGE_KINDS,
  buildProjectSlug,
  checkProjectProcess,
  checkProperty,
  imagesFromChoices,
  nextProjectCode,
  normalizeRiskKinds,
  type Project,
  type ProjectCode,
  type ProjectProcess,
  type Property,
} from "@/modules/projects";
import { ok, type DomainError, type Result } from "@/shared/domain/result";
import { checkProjectBudget } from "./budget";
import { checkProjectEconomics } from "./project-economics";
import type * as Sheet from "./project-sheet";
import { checkPartRemovals } from "./project-sheet-edit-rules";
import * as rules from "./project-sheet-requirements";

type Collect = (
  field: Sheet.ProjectSheetField,
  e: DomainError<Sheet.ProjectSheetErrorCode> | null,
) => void;

/** Cada campo del inmueble con checkProperty sobre una sonda válida: una sola regla, un error por campo. */
function checkPropertyFields(property: Property, collect: Collect): void {
  const probe: Property = { ...property, city: "x", zone: "x", areaM2: 1 };
  const candidates = [
    ["property.city", { ...probe, city: property.city }],
    ["property.zone", { ...probe, zone: property.zone }],
    ["property.areaM2", { ...probe, areaM2: property.areaM2 }],
  ] as const;
  for (const [field, candidate] of candidates) {
    const r = checkProperty(candidate);
    if (!r.ok) collect(field, r.error);
  }
}

/** Alta: código siguiente y slug por zona. Edición: se conservan (la URL no cambia si cambia la zona). */
function resolveIdentity(
  input: Sheet.ProjectSheetInput,
  ctx: Sheet.ProjectSheetContext,
  collect: Collect,
) {
  if (ctx.existing !== null) {
    const { id, code, slug, propertyId } = ctx.existing.project;
    return { id, propertyId, code, slug };
  }
  const code = nextProjectCode(ctx.existingCodes, ctx.codePrefix);
  if (!code.ok) collect("project.code", code.error);
  const zone = input.property.zone.trim();
  const slug = code.ok && zone !== "" ? buildProjectSlug(code.value, zone) : null;
  if (slug !== null && !slug.ok) collect("property.zone", slug.error);
  return {
    id: ctx.ids.projectId,
    propertyId: ctx.ids.propertyId,
    code: (code.ok ? code.value : "") as ProjectCode,
    slug: slug?.ok ? slug.value : "",
  };
}

/** En edición se conservan estado y `started` de cada etapa: solo se editan los días. */
function buildProcess(
  steps: ProjectProcess["steps"] | null,
  project: Project,
  existing: Sheet.ProjectSheet | null,
  collect: Collect,
) {
  if (steps === null) return null;
  const previous = existing?.process?.steps;
  const merged =
    previous === undefined
      ? steps
      : (Object.fromEntries(
          PROCESS_STAGE_KINDS.map((k) => [k, { ...previous[k], offsetDays: steps[k].offsetDays }]),
        ) as ProjectProcess["steps"]);
  const process: ProjectProcess = { projectId: project.id, steps: merged };
  const r = checkProjectProcess(process);
  if (!r.ok) collect("processSteps", r.error);
  return process;
}

/** `placed` y el id se conservan del existente (W-6 edita las colocadas). */
function buildClass(
  input: Sheet.ProjectSheetInput,
  ctx: Sheet.ProjectSheetContext,
  project: Project,
  collect: Collect,
) {
  const previous = ctx.existing?.participationClass ?? null;
  const next = input.participationClass;
  collect("participationClass", rules.checkClassLock(previous, next));
  if (next === null) return null;
  const cls: ParticipationClass = {
    id: previous?.id ?? ctx.ids.classId,
    projectId: project.id,
    total: next.total,
    placed: previous?.placed ?? 0,
    unitPrice: next.unitPrice,
  };
  const checked = ctx.checkParticipationClass(cls);
  if (checked.ok)
    collect(
      "economics.recoveryBudget",
      rules.checkRecoveryBudget(cls, input.economics.recoveryBudget),
    );
  else
    collect("participationClass", {
      code: "INVALID_PARTICIPATION_CLASS",
      detail: checked.error.detail ?? checked.error.code,
    });
  return cls;
}

/**
 * Comando único del alta/edición de inmueble (plan 011 §3, regla 2b). Pura: reúne TODOS los errores,
 * cada uno con su campo, y nunca lanza. Al editar conserva id, código, slug, etapa, fechas de venta y colocadas.
 */
export function buildProjectSheet(
  input: Sheet.ProjectSheetInput,
  ctx: Sheet.ProjectSheetContext,
): Result<Sheet.ProjectSheet, readonly Sheet.ProjectSheetIssue[]> {
  const existing = ctx.existing;
  const locked = rules.checkSheetLocked(existing?.project.status ?? null);
  if (locked !== null) return { ok: false, error: [locked] };

  const issues: Sheet.ProjectSheetIssue[] = [];
  const collect: Collect = (field, e) => {
    if (e !== null) issues.push({ ...e, field });
  };

  const identity = resolveIdentity(input, ctx, collect);
  const { city, zone, kind, areaM2 } = input.property;
  const property: Property = {
    id: identity.propertyId,
    city: city.trim(),
    zone: zone.trim(),
    kind,
    areaM2,
  };
  checkPropertyFields(property, collect);
  const name = input.project.name.trim();
  if (name === "")
    collect("project.name", { code: "REQUIRED_FIELD", detail: "el nombre es obligatorio" });
  const statusIssue = rules.checkSheetStatus(
    input.project.status,
    existing?.project.status ?? null,
  );
  collect("project.status", statusIssue);

  const project: Project = {
    ...identity,
    name,
    status: existing?.project.status ?? input.project.status,
    timeline: {
      acquiredOn: input.project.acquiredOn,
      saleSignedOn: existing?.project.timeline.saleSignedOn ?? null,
      settledOn: existing?.project.timeline.settledOn ?? null,
    },
  };
  issues.push(...rules.checkAcquisition(project, ctx.today));

  let profile = null;
  if (input.profile !== null) {
    profile = {
      propertyId: property.id,
      description: input.profile.description.trim(),
      highlights: input.profile.highlights.map((h) => h.trim()),
    };
    collect("profile", rules.checkProfileText(profile.description, profile.highlights));
  }
  const process = buildProcess(input.processSteps, project, existing, collect);
  const riskKinds = normalizeRiskKinds(input.riskKinds);
  const participationClass = buildClass(input, ctx, project, collect);
  const economics = { projectId: project.id, ...input.economics };
  const checkedEconomics = checkProjectEconomics(economics);
  if (!checkedEconomics.ok) collect("economics", checkedEconomics.error);
  const budget = { projectId: project.id, lines: input.budgetLines };
  const checkedBudget = checkProjectBudget(budget, economics);
  if (!checkedBudget.ok) collect("budgetLines", checkedBudget.error);
  collect("images", rules.checkImageChoices(input.images));
  issues.push(...checkPartRemovals(input, existing));
  issues.push(...rules.checkPublishRequirements(input, project.status));

  if (issues.length > 0) return { ok: false, error: issues };
  return ok({
    property,
    project,
    profile,
    process,
    risks: riskKinds.length > 0 ? { projectId: project.id, kinds: riskKinds } : null,
    participationClass,
    economics,
    budget,
    images: imagesFromChoices(project.id, input.images),
  });
}
