import { ProjectsListScreen } from "@/modules/projects/backoffice-ui";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("b7");

export default function AdminProjectsPage() {
  return <ProjectsListScreen />;
}
