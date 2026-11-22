"use client";

import { useState, type FormEvent } from "react";
import { formatIsoDate } from "@/shared/lib/format-date";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { Label } from "@/shared/ui/primitives/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/primitives/sheet";
import { PANEL_COPY } from "./copy";
import { useToday } from "./use-today";

const C = PANEL_COPY.visit;

/** Diálogo para pedir una visita a obra (ADR-013). No guarda ni envía nada: solo confirma que el equipo contactará. */
export function VisitDialog({ code, name }: { code: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<string>(C.slots[0].value);
  const [sent, setSent] = useState<{ date: string; slot: string } | null>(null);
  const [dateError, setDateError] = useState<"required" | "past" | null>(null);
  const today = useToday();
  const key = code.toLowerCase();

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSent(null);
      setDate("");
      setDateError(null);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date) return setDateError("required");
    if (date < today) return setDateError("past");
    setSent({ date: formatIsoDate(date, "short"), slot: C.slots.find((s) => s.value === slot)?.label ?? "" });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm" aria-label={C.openFor(name)} data-testid={`visita-abrir-${key}`}>
          {C.open}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" data-testid={`visita-dialogo-${key}`}>
        <SheetHeader>
          <SheetTitle>{C.title}</SheetTitle>
          <SheetDescription>{C.description(name)}</SheetDescription>
        </SheetHeader>
        {sent ? (
          <div className="flex flex-col gap-3 px-4" role="status" data-testid={`visita-confirmacion-${key}`}>
            <p className="font-medium">{C.confirmed}</p>
            <p className="text-sm text-muted-foreground">{C.confirmedDetail(sent.date, sent.slot)}</p>
            <p className="text-sm text-muted-foreground">{C.demoNote}</p>
            <Button type="button" onClick={() => onOpenChange(false)} data-testid={`visita-cerrar-${key}`}>
              {C.close}
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 px-4" data-testid={`visita-formulario-${key}`}>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`visita-fecha-${key}`}>{C.date}</Label>
              <Input id={`visita-fecha-${key}`} type="date" min={today} value={date} onChange={(e) => { setDate(e.target.value); setDateError(null); }} aria-invalid={dateError !== null} aria-describedby={dateError ? `visita-fecha-error-${key}` : undefined} className="h-11 bg-card px-3.5" data-testid={`visita-fecha-${key}`} />
              {dateError ? <p id={`visita-fecha-error-${key}`} role="alert" className="text-sm text-destructive" data-testid={`visita-fecha-error-${key}`}>{dateError === "past" ? C.datePast : C.dateRequired}</p> : null}
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium">{C.slot}</legend>
              {C.slots.map((s) => (
                <label key={s.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3.5 text-sm has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
                  <input type="radio" name={`franja-${key}`} value={s.value} checked={slot === s.value} onChange={() => setSlot(s.value)} className="size-4 accent-primary" data-testid={`visita-franja-${key}-${s.value}`} />
                  {s.label}
                </label>
              ))}
            </fieldset>
            <p className="text-sm text-muted-foreground">{C.demoNote}</p>
            <Button type="submit" className="h-11" data-testid={`visita-enviar-${key}`}>
              {C.submit}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
