"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { projectHref, routeHref } from "@/shared/ui/app-shell";
import { LegalNotice, MoneyDisplay, StatusBadge } from "@/shared/ui/brand";
import { BulletList, PageHeader, Section, Surface } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import { maxHeldFor, reservationAmount } from "../../hooks/project-figures";
import { useProjectDetail, type ProjectDetailData } from "../../hooks/use-project-detail";
import { PROJECT_DETAIL_COPY } from "./copy";
import { ProjectDetailError, ProjectDetailLoading, ProjectDetailMissing } from "./ProjectDetailStates";
import { RangeField } from "./RangeField";

const C = PROJECT_DETAIL_COPY.participate;

function Confirmation({ data, quantity }: { data: ProjectDetailData; quantity: number }) {
  const K = C.confirmation;
  return (
    <div role="status">
    <Surface variant="dark" padding="lg" data-testid="participar-confirmacion">
      <StatusBadge tone="in-progress" label={K.status} data-testid="participar-estado" />
      <h2 className="font-heading text-3xl font-medium">{K.title}</h2>
      <p className="max-w-[60ch]">{K.description}</p>
      <MoneyDisplay value={reservationAmount(data.listing.unitPrice, quantity)} kind="capital" label={C.amount} size="lg" />
      <Button asChild className="w-fit">
        <Link href={routeHref("p6")} data-testid="participar-portafolio">{K.portfolio}</Link>
      </Button>
    </Surface>
    </div>
  );
}

function ReservationForm({ data }: { data: ProjectDetailData }) {
  const { listing, example } = data;
  const max = maxHeldFor(data);
  const [quantity, setQuantity] = useState(1);
  const [accepted, setAccepted] = useState(false);
  const [reserved, setReserved] = useState(false);
  const checkboxId = useId();
  if (reserved) return <Confirmation data={data} quantity={quantity} />;
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <Surface padding="lg">
        <RangeField
          label={C.quantityLabel}
          value={quantity}
          min={1}
          max={max}
          valueText={String(quantity)}
          onChange={setQuantity}
          testId="participar-cantidad"
        />
        <p className="text-sm text-muted-foreground">{C.quantityHelp(max)}</p>
        <div className="flex flex-col gap-3 border-t border-border pt-5" data-testid="participar-resumen" aria-live="polite">
          <h2 className="font-heading text-xl font-medium">{C.summaryTitle}</h2>
          <MoneyDisplay value={listing.unitPrice} kind="amount" label={C.unitPrice} size="md" />
          <p className="text-sm">{C.quantity}: <span className="font-medium" data-testid="participar-cantidad-resumen">{quantity}</span></p>
          <MoneyDisplay value={reservationAmount(listing.unitPrice, quantity)} kind="capital" label={C.amount} size="lg" data-testid="participar-monto" />
        </div>
      </Surface>
      <Surface variant="dark" padding="lg">
        <h2 className="font-heading text-xl font-medium">{C.risksTitle}</h2>
        <BulletList items={example.risks} marker="dash" />
        <LegalNotice notice="riskNotice" className="text-foreground" />
        <div className="flex items-start gap-3">
          <input
            id={checkboxId}
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            data-testid="participar-aceptar-riesgos"
            className="mt-1 size-5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
          <label htmlFor={checkboxId} className="text-sm">{C.riskCheckbox}</label>
        </div>
        <Button type="button" size="lg" disabled={!accepted} onClick={() => setReserved(true)} data-testid="participar-reservar">
          {C.reserve}
        </Button>
        {accepted ? null : <p className="text-sm">{C.reserveHint}</p>}
      </Surface>
    </div>
  );
}

/** Pantalla P5 (maqueta): elegir cantidad, aceptar riesgos y "Reservar (simulado)". No guarda nada. */
export function ProjectParticipate({ slug }: { slug: string }) {
  const query = useProjectDetail(slug);
  if (query.isPending) return <ProjectDetailLoading testId="participar-cargando" />;
  if (query.isError) return <ProjectDetailError onRetry={() => void query.refetch()} />;
  const data = query.data;
  if (data === null) return <ProjectDetailMissing />;
  const { listing } = data;
  const open = listing.phase === "open";
  const soldOut = open && maxHeldFor(data) < 1;
  return (
    <div data-testid="pagina-p5" data-route-id="p5" className="flex flex-col">
      <PageHeader
        id="titulo-p5"
        eyebrow={C.eyebrow}
        title={soldOut ? C.noSlots : open ? C.title(listing.name) : C.closedTitle}
        description={soldOut ? C.noSlotsDescription : open ? C.description : C.closedDescription}
        actions={
          <Button asChild variant="outline">
            <Link href={projectHref(listing.slug)} data-testid="participar-volver">{C.back}</Link>
          </Button>
        }
      />
      {open && !soldOut ? (
        <Section tone="light" spacing="md" label={C.title(listing.name)}>
          <ReservationForm data={data} />
        </Section>
      ) : null}
    </div>
  );
}
