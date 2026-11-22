"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useContainer } from "@/composition/providers";
import type { ReferenceImageOption } from "@/modules/projects";
import type { ProjectSheet } from "../../domain/project-sheet";
import { sheetFigures, type SheetFigures } from "../components/admin/project-sheet/sheet-form-convert";
import type { SheetFormValues } from "../components/admin/project-sheet/sheet-form-schema";

export const projectSheetQueryKey = (slug: string) => ["finance", "project-sheet", slug] as const;
export const REFERENCE_LIBRARY_KEY = ["projects", "reference-library"] as const;

/** Ficha editable por slug (cualquier etapa). null = no existe. Solo cliente: el demo-store vive en localStorage. */
export function useProjectSheet(slug: string): UseQueryResult<ProjectSheet | null, Error> {
  const container = useContainer();
  return useQuery<ProjectSheet | null, Error>({
    queryKey: projectSheetQueryKey(slug),
    retry: false,
    queryFn: () => container.finance.getProjectSheet(slug),
  });
}

/** Ilustraciones de referencia que se pueden elegir (mock: `public/images/proyectos/`). */
export function useReferenceLibrary(): UseQueryResult<readonly ReferenceImageOption[], Error> {
  const container = useContainer();
  return useQuery<readonly ReferenceImageOption[], Error>({
    queryKey: REFERENCE_LIBRARY_KEY,
    retry: false,
    queryFn: () => container.projects.mediaRepository.referenceLibrary(),
  });
}

/** Σ rubros, F esperada (total × precio) y montos del formulario, calculados por el dominio. */
export function useSheetFigures(values: SheetFormValues): SheetFigures {
  return sheetFigures(values);
}
