import { formatMoney } from "@/shared/lib/format-money";
import { TableScroll } from "@/shared/ui/admin";
import { ProjectionLabel, StatusBadge, type StatusTone } from "@/shared/ui/brand";
import type { HoldingStatus } from "./examples";
import type { HoldingRow } from "./holding-rows";
import { PANEL_COPY } from "./copy";

const C = PANEL_COPY;
const TONE: Record<HoldingStatus, StatusTone> = { settled: "neutral", renovation: "in-progress", funding: "positive" };
const TD = "align-top tabular-nums";
/** La celda de fila anula el estilo de encabezado que TableScroll da a los th. */
const ROW_HEAD = "align-top text-left text-sm! font-normal! tracking-normal! text-foreground! normal-case!";

/** Tabla por proyecto: tres columnas de dinero separadas y rotuladas. */
export function PortfolioTable({ rows }: { rows: readonly HoldingRow[] }) {
  return (
    <TableScroll label={C.portfolio.tableCaption} data-testid="portafolio-tabla">
        <caption className="sr-only">{C.portfolio.tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{C.portfolio.project}</th>
            <th scope="col">{C.portfolio.stage}</th>
            <th scope="col">{C.holdings.quantity}</th>
            <th scope="col">{C.holdings.capital}</th>
            <th scope="col">{C.holdings.realized}</th>
            <th scope="col">{C.holdings.projection}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ holding, listing, projection }) => (
            <tr key={holding.code} data-testid={`portafolio-fila-${holding.code.toLowerCase()}`}>
              <th scope="row" className={ROW_HEAD}>
                <span className="font-medium">{listing?.name ?? holding.code}</span>
                <span className="text-muted-foreground block font-mono text-xs">{holding.code}</span>
              </th>
              <td className={TD}><StatusBadge tone={TONE[holding.status]} label={C.status[holding.status]} /></td>
              <td className={TD}>{holding.quantity}</td>
              <td className={TD}>{formatMoney(holding.capital)}</td>
              <td className={TD}>{holding.realized ? formatMoney(holding.realized) : <span className="text-muted-foreground">{C.holdings.noRealized}</span>}</td>
              <td className={TD}>
                {projection ? (
                  <div className="flex flex-col gap-1">
                    <span>{formatMoney(projection)}</span>
                    <ProjectionLabel />
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
    </TableScroll>
  );
}
