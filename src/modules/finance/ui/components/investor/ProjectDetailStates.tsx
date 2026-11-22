import { EmptyState, ErrorState, TextSkeleton } from "@/shared/ui/brand";
import { PageHeader, Section } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import Link from "next/link";
import { routeHref } from "@/shared/ui/app-shell";
import { PROJECT_DETAIL_COPY } from "./copy";

const C = PROJECT_DETAIL_COPY.states;

export function ProjectDetailLoading({ testId = "ficha-cargando" }: { testId?: string }) {
  return (
    <div data-testid={testId}>
      <PageHeader id="titulo-p4" title={C.loadingTitle} />
      <Section tone="light" spacing="md">
        <TextSkeleton lines={4} />
      </Section>
    </div>
  );
}

export function ProjectDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <div data-testid="ficha-error">
      <PageHeader id="titulo-p4" title={C.errorTitle} />
      <Section tone="light" spacing="md">
        <ErrorState
          title={C.errorTitle}
          description={C.errorDescription}
          action={<Button type="button" variant="outline" onClick={onRetry}>{C.retry}</Button>}
        />
      </Section>
    </div>
  );
}

export function ProjectDetailMissing() {
  return (
    <div data-testid="ficha-no-encontrada">
      <PageHeader id="titulo-p4" title={C.notFoundTitle} />
      <Section tone="light" spacing="md">
        <EmptyState
          title={C.notFoundTitle}
          description={C.notFoundDescription}
          action={
            <Button asChild variant="outline">
              <Link href={routeHref("p3")}>{PROJECT_DETAIL_COPY.header.backToProjects}</Link>
            </Button>
          }
        />
      </Section>
    </div>
  );
}
