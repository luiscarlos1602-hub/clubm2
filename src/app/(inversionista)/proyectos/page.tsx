import { ProjectMarketplace } from "@/modules/participations";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("p3");

export default function ProjectsPage() {
  return <ProjectMarketplace />;
}
