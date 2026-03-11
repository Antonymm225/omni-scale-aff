import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Signup"
      title="Signup"
      description="Crea tu acceso a OMNI SCALE y empieza a organizar el rendimiento de tus ofertas, tests y decisiones de escalado desde un solo lugar."
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
