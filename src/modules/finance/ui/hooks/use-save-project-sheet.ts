"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useContainer } from "@/composition/providers";
import { checkParticipationClass } from "@/modules/participations";
import { brand } from "@/shared/config/brand";
import type { Result } from "@/shared/domain/result";
import { buildProjectSheet } from "../../domain/build-project-sheet";
import type { ProjectSheet, ProjectSheetIssue } from "../../domain/project-sheet";
import type { SaveProjectSheetError } from "../../application/save-project-sheet";
import { formToInput } from "../components/admin/project-sheet/sheet-form-convert";
import type { SheetFormValues } from "../components/admin/project-sheet/sheet-form-schema";

export type SaveSheetResult = Result<ProjectSheet, readonly SaveProjectSheetError[]>;

/**
 * Valida (sin guardar) y guarda la ficha. `existing` = la ficha cargada al editar (null = alta).
 * Guardar invalida TanStack Query, como `use-reset-demo-data.ts`: listados, ficha y marketplace se releen.
 */
export function useSaveProjectSheet(slug: string | null, existing: ProjectSheet | null) {
  const container = useContainer();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  /** Todos los errores de negocio de `buildProjectSheet` con su `field`, sin escribir nada. */
  const validate = useCallback(
    async (values: SheetFormValues): Promise<readonly ProjectSheetIssue[]> => {
      const codes = (await container.projects.projectRepository.list()).map((p) => p.code);
      const built = buildProjectSheet(formToInput(values, existing), {
        existing,
        existingCodes: codes,
        codePrefix: brand.shortName,
        today: container.clock.today(),
        ids: {
          projectId: container.ids.next<"Project">("prj"),
          propertyId: container.ids.next<"Property">("prp"),
          classId: container.ids.next<"ParticipationClass">("cls"),
        },
        checkParticipationClass,
      });
      return built.ok ? [] : built.error;
    },
    [container, existing],
  );

  const save = useCallback(
    async (values: SheetFormValues): Promise<SaveSheetResult> => {
      setIsSaving(true);
      try {
        const result = await container.finance.saveProjectSheet(formToInput(values, existing), slug);
        if (result.ok) await queryClient.invalidateQueries();
        return result;
      } finally {
        setIsSaving(false);
      }
    },
    [container, existing, queryClient, slug],
  );

  return { validate, save, isSaving };
}
