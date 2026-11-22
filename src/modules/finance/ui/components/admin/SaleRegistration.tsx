"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProjectId } from "@/modules/projects";
import { Surface } from "@/shared/ui/layout";
import { Button } from "@/shared/ui/primitives/button";
import { Label } from "@/shared/ui/primitives/label";
import { useRecordSale } from "../../hooks/use-record-sale";
import { TextField } from "./project-sheet/SheetControls";
import { SALE_COPY as C } from "./copy";
import { asIsoDate, saleFormSchema, usdOfText, type SaleFormValues } from "./sale-form-schema";
import { useAdminFinance } from "./use-admin-finance";

type FieldKey = "precio" | "costos" | "fecha";

const FIELD_OF_CODE: Readonly<Record<string, FieldKey>> = {
  NON_POSITIVE_SALE_PRICE: "precio",
  AMOUNT_TOO_LARGE: "precio",
  NEGATIVE_AMOUNT: "costos",
  SALE_COSTS_EXCEED_PRICE: "costos",
  SALE_DATE_IN_FUTURE: "fecha",
  DATE_OUT_OF_ORDER: "fecha",
};

function FieldError({ field, message }: { field: FieldKey; message: string | undefined }) {
  if (!message) return null;
  return <p role="alert" className="text-sm font-medium text-destructive" data-testid={`venta-error-${field}`}>{message}</p>;
}

/** B4 · registro de la venta real (W-5). Compuesto en app/admin junto a la pantalla de comercialización. */
export function SaleRegistration() {
  const query = useAdminFinance();
  const { record, isPending, today } = useRecordSale();
  const eligible = (query.data ?? []).filter((r) => r.project.status === "on_sale" || r.project.status === "stalled");
  const [fieldError, setFieldError] = useState<{ field: FieldKey; message: string } | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [doneCode, setDoneCode] = useState<string | null>(null);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: { projectId: "", salePrice: "", saleCosts: "0", signedOn: "" },
  });
  const { register, handleSubmit, formState, control, setValue } = form;
  const e = formState.errors;
  const current = useWatch({ control, name: "projectId" });
  // La fecha de hoy se fija en el cliente (no en el prerender).
  useEffect(() => {
    if (form.getValues("signedOn") === "") setValue("signedOn", today());
  }, [form, setValue, today]);
  const firstId = eligible[0]?.project.id ?? "";
  // Mantiene elegido un proyecto que siga siendo elegible (el primero al cargar y tras registrar una venta).
  useEffect(() => {
    if (firstId !== "" && !eligible.some((r) => r.project.id === current)) setValue("projectId", firstId);
  }, [current, firstId, eligible, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setFieldError(null);
    setGeneralError(null);
    setDoneCode(null);
    const projectId = values.projectId as ProjectId;
    const result = await record({
      projectId,
      salePrice: usdOfText(values.salePrice),
      saleCosts: usdOfText(values.saleCosts),
      signedOn: asIsoDate(values.signedOn),
    });
    if (result.ok) {
      setDoneCode(eligible.find((r) => r.project.id === projectId)?.project.code ?? "");
      form.reset({ projectId: "", salePrice: "", saleCosts: "0", signedOn: today() });
      return;
    }
    const code = result.error.code;
    const message = C.errors[code as keyof typeof C.errors] ?? C.errors.fallback;
    const field = FIELD_OF_CODE[code];
    if (field) setFieldError({ field, message });
    else setGeneralError(message);
  });

  const fe = (field: FieldKey) => (fieldError?.field === field ? fieldError.message : undefined);

  return (
    <Surface data-testid="venta-registro" className="gap-5">
      <div className="flex flex-col gap-2">
        <h2 id="venta-titulo" className="font-heading text-2xl font-semibold">{C.heading}</h2>
        <p className="max-w-[62ch] text-muted-foreground">{C.description}</p>
      </div>
      {query.isError ? (
        <p role="alert" className="text-sm font-medium text-destructive" data-testid="venta-carga-error">{C.loadError}</p>
      ) : query.isPending ? (
        <p className="text-sm text-muted-foreground" role="status" data-testid="venta-cargando">…</p>
      ) : eligible.length === 0 ? (
        <p className="text-sm text-muted-foreground" data-testid="venta-vacio">{C.none}</p>
      ) : (
        <form onSubmit={(ev) => void onSubmit(ev)} noValidate className="grid gap-5 md:grid-cols-2" data-testid="venta-formulario">
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="venta-proyecto">{C.project}</Label>
            <select
              id="venta-proyecto"
              data-testid="venta-proyecto"
              {...register("projectId")}
              className="h-11 w-full rounded-lg border border-input bg-card px-3.5 text-base focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:text-sm"
            >
              {eligible.map((r) => (
                <option key={r.project.id} value={r.project.id}>{r.project.code} · {r.project.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <TextField label={C.price} registration={register("salePrice")} inputMode="numeric" hint={C.priceHint} formError={e.salePrice} issues={[]} testId="venta-precio" />
            <FieldError field="precio" message={fe("precio")} />
          </div>
          <div className="flex flex-col gap-2">
            <TextField label={C.costs} registration={register("saleCosts")} inputMode="numeric" hint={C.costsHint} formError={e.saleCosts} issues={[]} testId="venta-costos" />
            <FieldError field="costos" message={fe("costos")} />
          </div>
          <div className="flex flex-col gap-2">
            <TextField label={C.date} registration={register("signedOn")} type="date" hint={C.dateHint} formError={e.signedOn} issues={[]} testId="venta-fecha" />
            <FieldError field="fecha" message={fe("fecha")} />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            {generalError ? <p role="alert" className="text-sm font-medium text-destructive" data-testid="venta-error">{generalError}</p> : null}
            <Button type="submit" className="self-start" disabled={isPending} data-testid="venta-registrar">
              {isPending ? C.submitting : C.submit}
            </Button>
          </div>
        </form>
      )}
      {doneCode !== null ? (
        <p role="status" className="text-sm font-medium" data-testid="venta-exito">
          {C.done(doneCode)} <Link href="/admin/finanzas" className="underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring">{C.goFinance}</Link>
        </p>
      ) : null}
    </Surface>
  );
}
