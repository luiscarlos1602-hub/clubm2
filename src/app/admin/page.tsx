import { AdminDashboard } from "@/modules/projects/backoffice-ui";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("b1");

export default function AdminPanelPage() {
  return <AdminDashboard />;
}
