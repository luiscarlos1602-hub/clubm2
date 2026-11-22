import { SHOWCASE_COPY as C } from "./showcase-copy";
import { SystemSection } from "./SystemSection";

export function SystemTypography() {
  return (
    <SystemSection id="tipografia-titulo" testId="sistema-tipografia" {...C.tipografia}>
      <div className="flex flex-col divide-y divide-border">
        {C.tipografia.families.map((f) => (
          <div key={f.id} data-testid={`tipo-${f.id}`} className="flex flex-col gap-3 py-8 first:pt-0">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              {f.name} · {f.role}
            </p>
            <p className={`${f.className} text-balance break-words`}>{f.sample}</p>
          </div>
        ))}
        <div className="flex flex-col gap-3 py-8 pb-0">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{C.tipografia.figuresLabel}</p>
          <p className="text-3xl font-medium tabular-nums">{C.tipografia.figuresSample}</p>
        </div>
      </div>
    </SystemSection>
  );
}
