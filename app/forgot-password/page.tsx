import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recovery"
      title="Recovery"
      description="Te enviaremos un enlace para que puedas restablecer tu contraseña y volver a entrar a OMNI SCALE."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
