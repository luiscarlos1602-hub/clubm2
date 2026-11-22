import { LoginForm } from "@/modules/investors/ui";
import { routeMetadata } from "@/shared/ui/app-shell";

export const metadata = routeMetadata("login");

export default function LoginPage() {
  return <LoginForm />;
}
