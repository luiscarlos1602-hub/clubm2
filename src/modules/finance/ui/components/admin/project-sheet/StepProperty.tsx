"use client";

import { CREATABLE_STATUSES, type ProjectStatus } from "@/modules/projects";
import { Surface } from "@/shared/ui/layout";
import { FieldIssues, FormError, SelectField, TextField, type StepProps } from "./SheetControls";
import { SHEET_COPY } from "./copy";

const C = SHEET_COPY.property;

export type StepPropertyProps = StepProps & {
  /** true = alta (la etapa se elige entre las creables); false = edición (la etapa no cambia). */
  readonly creating: boolean;
};

/** Paso 1 · inmueble, etapa, fecha de compra y perfil (descripción + destacados). */
export function StepProperty({ form, issues, creating }: StepPropertyProps) {
  const { register, formState } = form;
  const errors = formState.errors;
  const statuses: readonly ProjectStatus[] = creating ? CREATABLE_STATUSES : [form.getValues("status")];
  return (
    <Surface padding="md" className="gap-5">
      <TextField label={C.name} registration={register("name")} placeholder={C.namePlaceholder} formError={errors.name} issueField="project.name" issues={issues} />
      <div className="grid gap-5 md:grid-cols-2">
        <TextField label={C.city} registration={register("city")} placeholder={C.cityPlaceholder} formError={errors.city} issueField="property.city" issues={issues} />
        <TextField label={C.zone} registration={register("zone")} placeholder={C.zonePlaceholder} hint={C.zoneHint} formError={errors.zone} issueField="property.zone" issues={issues} />
        <SelectField
          label={C.kind}
          registration={register("kind")}
          options={[
            { value: "apartment", label: C.kinds.apartment },
            { value: "house", label: C.kinds.house },
          ]}
          issueField="property.kind"
          issues={issues}
        />
        <TextField label={C.area} registration={register("areaM2")} inputMode="numeric" formError={errors.areaM2} issueField="property.areaM2" issues={issues} />
        <SelectField
          label={C.status}
          registration={register("status")}
          options={statuses.map((s) => ({ value: s, label: C.stages[s] }))}
          hint={creating ? C.statusHintCreate : C.statusHintEdit}
          disabled={!creating}
          issueField="project.status"
          issues={issues}
        />
        <TextField label={C.acquiredOn} registration={register("acquiredOn")} type="date" hint={C.acquiredOnHint} formError={errors.acquiredOn} issueField="project.acquiredOn" issues={issues} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="ficha-description" className="text-sm font-medium">{C.description}</label>
        <textarea id="ficha-description" rows={4} data-testid="ficha-description" className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm" {...register("description")} />
        <p className="text-xs text-muted-foreground">{C.descriptionHint}</p>
        <FormError name="description" error={errors.description} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="ficha-highlights" className="text-sm font-medium">{C.highlights}</label>
        <textarea id="ficha-highlights" rows={5} data-testid="ficha-highlights" className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm" {...register("highlights")} />
        <p className="text-xs text-muted-foreground">{C.highlightsHint}</p>
        <FormError name="highlights" error={errors.highlights} />
        <FieldIssues field="profile" issues={issues} />
      </div>
      <FieldIssues field="project.code" issues={issues} />
      <FieldIssues field="project.timeline" issues={issues} />
    </Surface>
  );
}
