import type { ReactNode } from "react";
import { SectionHeading } from "@/shared/ui/brand";

type Props = {
  id: string;
  testId: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

/** Marco común de cada bloque: filete de Arena, mucho aire, titular a la izquierda y muestra a la derecha (≥ md). */
export function SystemSection({ id, testId, eyebrow, title, description, children }: Props) {
  return (
    <section
      data-testid={testId}
      aria-labelledby={id}
      className="border-t border-line/70 py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-12 md:gap-x-10 md:px-10">
        <SectionHeading
          id={id}
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="md:col-span-4"
        />
        <div className="min-w-0 md:col-span-8">{children}</div>
      </div>
    </section>
  );
}
