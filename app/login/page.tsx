import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Login"
      title="Login"
      description="Trackea mejor el rendimiento de tus ofertas de affiliate marketing para testear, optimizar y escalar sin perder el control."
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
