import { RoutePlaceholder, routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("p1");

export default function HomePage() {
  return <RoutePlaceholder routeId="p1" />;
}
