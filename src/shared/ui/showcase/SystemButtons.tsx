import { Button } from "@/shared/ui/primitives/button";
import { SHOWCASE_COPY as C } from "./showcase-copy";
import { SystemSection } from "./SystemSection";

export function SystemButtons() {
  return (
    <SystemSection id="botones-titulo" testId="sistema-botones" {...C.botones}>
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap items-center gap-4">
          {C.botones.variants.map((v) => (
            <Button key={v.id} variant={v.id}>
              {v.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{C.botones.sizesLabel}</p>
          <div className="flex flex-wrap items-center gap-4">
            {C.botones.sizes.map((s) => (
              <Button key={s.id} size={s.id}>
                {s.label}
              </Button>
            ))}
            <Button disabled>{C.botones.disabled}</Button>
          </div>
        </div>
      </div>
    </SystemSection>
  );
}
