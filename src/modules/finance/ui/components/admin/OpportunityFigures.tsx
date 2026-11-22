"use client";

import Link from "next/link";
import { MoneyDisplay, TextSkeleton } from "@/shared/ui/brand";
import { projectEditHref } from "@/shared/ui/app-shell";
import { Section, Surface } from "@/shared/ui/layout";
import { useProjectSheet } from "../../hooks/use-project-sheet";
import { OPPORTUNITY_FIGURES_COPY as C } from "./copy";

const PRE_PURCHASE = new Set(["opportunity", "due_diligence", "discarded"]);
const LINK = "self-start rounded-sm text-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/** W-3 · C, F, P y O de la ficha guardada para el detalle de B2 (lo inyecta app/admin). P y O son proyección. */
export function OpportunityFigures({ slug, "data-testid": testId = "oportunidad-cifras" }: { slug: string; "data-testid"?: string }) {
  const query = useProjectSheet(slug);
  const sheet = query.data ?? null;
  const prePurchase = sheet !== null && PRE_PURCHASE.has(sheet.project.status);
  return (
    <Section tone="light" spacing="md" labelledBy="adq-cifras-h" innerClassName="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id="adq-cifras-h" className="font-heading text-2xl font-semibold">{C.heading}</h2>
        <p className="max-w-[62ch] text-muted-foreground">{C.description}</p>
      </div>
      {query.isPending ? <TextSkeleton lines={2} /> : null}
      {!query.isPending && sheet === null ? <p className="text-sm text-muted-foreground">{C.unavailable}</p> : null}
      {sheet ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid={testId}>
            <Surface padding="sm">
              <MoneyDisplay value={sheet.economics.acquisitionCost} kind="amount" label={prePurchase ? C.offer : C.bought} size="lg" />
            </Surface>
            <Surface padding="sm">
              <MoneyDisplay value={sheet.economics.recoveryBudget} kind="amount" label={C.reform} size="lg" />
              <p className="text-xs text-muted-foreground">{C.reformNote}</p>
            </Surface>
            <Surface padding="sm"><MoneyDisplay value={sheet.economics.targetSalePrice} kind="projection" label={C.sale} size="lg" /></Surface>
            <Surface padding="sm"><MoneyDisplay value={sheet.economics.estimatedSaleCosts} kind="projection" label={C.saleCosts} size="lg" /></Surface>
          </div>
          {prePurchase ? <p className="text-sm text-muted-foreground">{C.notBought}</p> : null}
          <Link href={projectEditHref(slug)} className={LINK} data-testid="adq-detalle-editar-ficha">{C.editSheet}</Link>
        </>
      ) : null}
    </Section>
  );
}
