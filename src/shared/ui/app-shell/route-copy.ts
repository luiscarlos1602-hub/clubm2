import { ADMIN_ROUTES_COPY } from "./admin-routes-copy";
import { PUBLIC_ROUTES_COPY } from "./public-routes-copy";
import type { RouteCopy } from "./route-copy-types";
import type { RouteId } from "./route-map";

const ALL = { ...PUBLIC_ROUTES_COPY, ...ADMIN_ROUTES_COPY } satisfies Record<RouteId, RouteCopy>;

export function routeCopy(id: RouteId): RouteCopy {
  return ALL[id];
}
