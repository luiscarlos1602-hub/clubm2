"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { routeHref, useDemoRoleStore } from "@/shared/ui/app-shell";
import { Button } from "@/shared/ui/primitives/button";
import { AuthShell } from "./AuthShell";
import { AUTH_COPY } from "./copy";
import { Field } from "./Field";
import { RegisterSteps } from "./RegisterSteps";

const C = AUTH_COPY.register;
const TOTAL = C.steps.length;
/** Todas las casillas obligatorias de la lectura de riesgos (cada punto y los términos). */
const REQUIRED_RISK_IDS: readonly string[] = [...C.risks.items.map((i) => i.id), C.risks.terms.id];

/** Vista previa del registro en tres pasos. Estado solo local; al terminar fija el rol de la demo y va al panel. */
export function RegisterWizard() {
  const router = useRouter();
  const setRole = useDemoRoleStore((s) => s.setRole);
  const [step, setStep] = useState(0);
  const [accepted, setAccepted] = useState<readonly string[]>([]);
  const last = step === TOTAL - 1;
  const canFinish = REQUIRED_RISK_IDS.every((id) => accepted.includes(id));

  function toggle(id: string, checked: boolean) {
    setAccepted((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!last) return setStep(step + 1);
    if (!canFinish) return;
    setRole("investor");
    router.push(routeHref("panel"));
  }

  return (
    <AuthShell eyebrow={C.eyebrow} title={C.title} lead={C.lead} pageId="p2" data-testid="registro-pantalla">
      <form onSubmit={onSubmit} className="flex flex-col gap-6" data-testid="registro-formulario">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase" data-testid="registro-paso">
            {C.stepLabel(step + 1, TOTAL)} · {C.steps[step].title}
          </p>
          <div aria-hidden className="grid grid-cols-3 gap-2">
            {C.steps.map((s, i) => (
              <span key={s.id} className={`h-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        </div>
        {step === 0 && (
          <div className="flex flex-col gap-5" data-testid="registro-paso-datos">
            <Field id="fullName" autoComplete="name" label={C.data.fullName} placeholder={C.data.fullNamePlaceholder} />
            <Field id="email" type="email" autoComplete="email" label={AUTH_COPY.fields.email} placeholder={AUTH_COPY.fields.emailPlaceholder} />
            <Field id="phone" type="tel" autoComplete="tel" label={C.data.phone} placeholder={C.data.phonePlaceholder} />
            <Field id="city" autoComplete="address-level2" label={C.data.city} placeholder={C.data.cityPlaceholder} />
          </div>
        )}
        {step !== 0 && <RegisterSteps step={step} accepted={accepted} onToggle={toggle} />}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <Button type="button" variant="outline" size="lg" className="h-11" onClick={() => setStep(step - 1)} data-testid="registro-atras">
              {C.back}
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" size="lg" className="h-11" disabled={last && !canFinish} data-testid="registro-continuar">
            {last ? C.finish : C.next}
          </Button>
        </div>
      </form>
      <p className="text-sm text-muted-foreground">
        {C.loginPrompt}{" "}
        <Link href={routeHref("login")} className="font-medium text-foreground underline underline-offset-4">
          {C.loginLink}
        </Link>
      </p>
    </AuthShell>
  );
}
