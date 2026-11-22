import { cn } from "@/shared/lib/utils";
import type { TestIdProp } from "./types";

export type SectionHeadingProps = TestIdProp & {
  eyebrow?: string;
  title: string;
  description?: string;
  level?: 1 | 2 | 3;
  align?: "start" | "center";
  id?: string;
};

const TITLE_SIZE = { 1: "text-4xl md:text-5xl", 2: "text-3xl md:text-4xl", 3: "text-xl md:text-2xl" } as const;

export function SectionHeading({
  eyebrow,
  title,
  description,
  level = 2,
  align = "start",
  id,
  className,
  "data-testid": testId = "section-heading",
}: SectionHeadingProps) {
  const Heading = `h${level}` as const;
  return (
    <div
      data-testid={testId}
      className={cn("flex max-w-[72ch] flex-col gap-3", align === "center" && "mx-auto items-center text-center", className)}
    >
      {eyebrow ? <p className="text-xs font-medium tracking-[0.28em] text-muted-foreground uppercase">{eyebrow}</p> : null}
      <Heading id={id} className={cn("font-heading font-semibold tracking-tight text-balance text-foreground", TITLE_SIZE[level])}>
        {title}
      </Heading>
      {description ? <p className="text-base text-muted-foreground">{description}</p> : null}
    </div>
  );
}
