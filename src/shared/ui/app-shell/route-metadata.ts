import type { Metadata } from "next";
import { routeCopy } from "./route-copy";
import type { RouteId } from "./route-map";

export function routeMetadata(id: RouteId): Metadata {
  return { title: routeCopy(id).title };
}
