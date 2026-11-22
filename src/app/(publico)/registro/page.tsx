import { RegisterWizard } from "@/modules/investors/ui";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("p2");

export default function RegisterPage() {
  return <RegisterWizard />;
}
