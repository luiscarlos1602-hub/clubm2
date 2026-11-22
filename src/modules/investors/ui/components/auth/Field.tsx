import type { ComponentProps } from "react";
import { Input } from "@/shared/ui/primitives/input";
import { Label } from "@/shared/ui/primitives/label";

type FieldProps = ComponentProps<"input"> & { id: string; label: string };

/** Etiqueta + campo. Altura cómoda para móvil. */
export function Field({ id, label, ...props }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} className="h-11 bg-card px-3.5" {...props} />
    </div>
  );
}
