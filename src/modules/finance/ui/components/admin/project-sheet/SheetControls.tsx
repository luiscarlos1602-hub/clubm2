"use client";

import type { ReactNode } from "react";
import type { FieldError, UseFormRegisterReturn, UseFormReturn } from "react-hook-form";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/primitives/input";
import { Label } from "@/shared/ui/primitives/label";
import type { ProjectSheetField, ProjectSheetIssue } from "../../../../domain/project-sheet";
import { SHEET_COPY } from "./copy";
import type { SheetFormValues } from "./sheet-form-schema";

export type StepProps = {
  readonly form: UseFormReturn<SheetFormValues>;
  /** Errores de negocio de `buildProjectSheet` del paso actual. */
  readonly issues: readonly ProjectSheetIssue[];
};

/** Error de negocio pegado a su campo (`ficha-error-<field>`). */
export function FieldIssues({ field, issues }: { field: ProjectSheetField; issues: readonly ProjectSheetIssue[] }) {
  const mine = issues.filter((i) => i.field === field);
  if (mine.length === 0) return null;
  return (
    <p role="alert" id={`issue-${field}`} className="text-sm font-medium text-destructive" data-testid={`ficha-error-${field}`}>
      {mine.map((i) => SHEET_COPY.issues[i.code]).join(" ")}
    </p>
  );
}

/** Error de forma de RHF + Zod (texto, enteros, fecha). */
export function FormError({ name, error }: { name: string; error?: FieldError }) {
  if (!error?.message) return null;
  return (
    <p role="alert" className="text-sm font-medium text-destructive" data-testid={`ficha-error-forma-${name}`}>
      {error.message}
    </p>
  );
}

const CONTROL = "h-11 bg-card px-3.5";

type TextFieldProps = {
  label: string;
  registration: UseFormRegisterReturn;
  hint?: string;
  formError?: FieldError;
  issueField?: ProjectSheetField;
  issues: readonly ProjectSheetIssue[];
  placeholder?: string;
  inputMode?: "numeric" | "text";
  type?: "text" | "date";
  disabled?: boolean;
  suffix?: ReactNode;
};

export function TextField({ label, registration, hint, formError, issueField, issues, placeholder, inputMode, type = "text", disabled, suffix }: TextFieldProps) {
  const id = `ficha-${registration.name}`;
  const invalid = Boolean(formError) || (issueField !== undefined && issues.some((i) => i.field === issueField));
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input id={id} type={type} inputMode={inputMode} placeholder={placeholder} disabled={disabled} aria-invalid={invalid} className={CONTROL} data-testid={id} {...registration} />
        {suffix}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <FormError name={registration.name} error={formError} />
      {issueField ? <FieldIssues field={issueField} issues={issues} /> : null}
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  registration: UseFormRegisterReturn;
  options: readonly { value: string; label: string }[];
  hint?: string;
  issueField?: ProjectSheetField;
  issues: readonly ProjectSheetIssue[];
  disabled?: boolean;
};

export function SelectField({ label, registration, options, hint, issueField, issues, disabled }: SelectFieldProps) {
  const id = `ficha-${registration.name}`;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        disabled={disabled}
        data-testid={id}
        className={cn("w-full rounded-lg border border-input text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 md:text-sm", CONTROL)}
        {...registration}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {issueField ? <FieldIssues field={issueField} issues={issues} /> : null}
    </div>
  );
}
