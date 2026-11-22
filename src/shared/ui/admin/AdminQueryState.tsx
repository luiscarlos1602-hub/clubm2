"use client";

import type { ReactNode } from "react";
import { CardSkeleton, EmptyState, ErrorState } from "@/shared/ui/brand";
import { Button } from "@/shared/ui/primitives/button";
import { ADMIN_QUERY_COPY } from "./admin-copy";

export type AdminQueryStateProps = {
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
  children: ReactNode;
  testId: string;
};

/** Carga, error y vacío de cualquier vista del backoffice con datos. */
export function AdminQueryState({ isPending, isError, isEmpty, onRetry, children, testId }: AdminQueryStateProps) {
  if (isPending) {
    return (
      <div data-testid={`${testId}-cargando`} role="status" aria-label={ADMIN_QUERY_COPY.loading} className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <ErrorState
        data-testid={`${testId}-error`}
        title={ADMIN_QUERY_COPY.error.title}
        description={ADMIN_QUERY_COPY.error.description}
        action={
          <Button type="button" variant="outline" data-testid={`${testId}-reintentar`} onClick={onRetry}>
            {ADMIN_QUERY_COPY.error.action}
          </Button>
        }
      />
    );
  }
  if (isEmpty) {
    return <EmptyState data-testid={`${testId}-vacio`} title={ADMIN_QUERY_COPY.empty.title} description={ADMIN_QUERY_COPY.empty.description} />;
  }
  return <>{children}</>;
}
