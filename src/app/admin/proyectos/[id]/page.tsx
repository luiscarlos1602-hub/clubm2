import { AdminProjectRoute } from "@/modules/projects/backoffice-ui";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("b3");

export default function AdminProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminProjectRoute params={params} />;
}
