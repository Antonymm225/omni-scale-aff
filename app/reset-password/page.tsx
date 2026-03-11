import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recovery"
      title="Recovery"
      description="Define una nueva contraseña para volver a entrar a OMNI SCALE y retomar el control de tus ofertas y su rendimiento."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
