import { AcquisitionsBoard } from "@/modules/projects/backoffice-ui";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("b2");

export default function AdminAcquisitionsPage() {
  return <AcquisitionsBoard />;
}
