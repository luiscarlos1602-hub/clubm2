import { routeHref } from "@/shared/ui/app-shell";
import Link from "next/link";
import type { ProjectRiskKind } from "@/modules/projects";
import { BulletList, Section } from "@/shared/ui/layout";
import { PROJECT_DETAIL_COPY } from "./copy";

const C = PROJECT_DETAIL_COPY.risks;

/** Riesgos del proyecto, en banda oscura; los riesgos completos están en /terminos. El aviso fijo va en los puntos clave, no aquí. */
export function RisksSection({ risks }: { risks: readonly ProjectRiskKind[] }) {
  return (
    <Section tone="dark" spacing="md" labelledBy="titulo-riesgos" innerClassName="grid gap-8 lg:grid-cols-2" data-testid="seccion-riesgos">
      <div className="flex flex-col gap-4">
        <h2 id="titulo-riesgos" className="font-heading text-3xl font-medium">
          {C.title}
        </h2>
        <p className="max-w-[60ch]">{C.description}</p>
        <Link
          href={routeHref("terminos")}
          className="w-fit underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          data-testid="riesgos-terminos"
        >
          {C.termsLink}
        </Link>
      </div>
      <BulletList items={[...risks.map((kind) => C.kinds[kind]), C.capitalNote]} marker="dash" />
    </Section>
  );
}
