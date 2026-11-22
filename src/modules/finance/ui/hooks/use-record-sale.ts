"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useContainer } from "@/composition/providers";
import type { DomainError, Result } from "@/shared/domain/result";
import type { IsoDate } from "@/shared/domain/calendar-date";
import type { RecordProjectSaleErrorCode, RecordProjectSaleInput } from "../../application/record-project-sale";
import type { ProjectSale } from "../../domain/project-sale";

export type RecordSaleResult = Result<ProjectSale, DomainError<RecordProjectSaleErrorCode>>;

/**
 * W-5 · registra la venta real con el caso de uso (atómico: venta + proyecto en `sold`) y, si se guardó,
 * invalida TanStack Query (como `use-change-project-stage.ts`). `today` = hoy del reloj de la aplicación.
 */
export function useRecordSale() {
  const container = useContainer();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const record = useCallback(
    async (input: RecordProjectSaleInput): Promise<RecordSaleResult> => {
      setIsPending(true);
      try {
        const result = await container.finance.recordProjectSale(input);
        if (result.ok) await queryClient.invalidateQueries();
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [container, queryClient],
  );

  /** Hoy del reloj de la aplicación; se lee al usarse (no al renderizar), para no fijar la hora en el prerender. */
  const today = useCallback((): IsoDate => container.clock.today(), [container]);
  return { record, isPending, today };
}
