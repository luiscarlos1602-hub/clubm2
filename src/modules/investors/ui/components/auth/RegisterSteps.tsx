import Link from "next/link";
import { routeHref } from "@/shared/ui/app-shell";
import { AUTH_COPY } from "./copy";

const E = AUTH_COPY.register.experience;
const R = AUTH_COPY.register.risks;
const REQUIRED_IDS: readonly string[] = [...R.items.map((i) => i.id), R.terms.id];

function RadioGroup({ legend, name, options }: { legend: string; name: string; options: readonly { value: string; label: string }[] }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      {options.map((o) => (
        <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3.5 text-sm has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
          <input type="radio" name={name} value={o.value} className="size-4 accent-primary" />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}

type Props = { step: number; accepted: readonly string[]; onToggle: (id: string, checked: boolean) => void };

/** Pasos 2 (experiencia) y 3 (lectura de riesgos con casillas). */
export function RegisterSteps({ step, accepted, onToggle }: Props) {
  if (step === 1) {
    return (
      <div className="flex flex-col gap-6" data-testid="registro-paso-experiencia">
        <RadioGroup legend={E.legend} name="experience" options={E.options} />
        <RadioGroup legend={E.horizon} name="horizon" options={E.horizonOptions} />
      </div>
    );
  }
  return (
    <fieldset className="flex flex-col gap-3" data-testid="registro-paso-riesgos">
      <legend className="mb-1 text-sm text-muted-foreground">{R.intro}</legend>
      {R.items.map((item) => (
        <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3.5 text-sm has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
          <input
            type="checkbox"
            checked={accepted.includes(item.id)}
            onChange={(e) => onToggle(item.id, e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-primary"
            data-testid={`registro-riesgo-${item.id}`}
          />
          {item.label}
        </label>
      ))}
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3.5 text-sm has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
        <input
          type="checkbox"
          checked={accepted.includes(R.terms.id)}
          onChange={(e) => onToggle(R.terms.id, e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
          data-testid="registro-terminos"
        />
        <span>
          {R.terms.before}{" "}
          <Link href={routeHref("terminos")} target="_blank" rel="noopener" className="font-medium underline underline-offset-4" data-testid="registro-terminos-enlace">
            {R.terms.link}
          </Link>{" "}
          {R.terms.after}
        </span>
      </label>
      {REQUIRED_IDS.some((id) => !accepted.includes(id)) && <p className="text-sm text-muted-foreground">{R.pending}</p>}
    </fieldset>
  );
}
