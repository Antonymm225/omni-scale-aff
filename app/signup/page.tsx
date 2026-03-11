import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Signup"
      title="Crea la cuenta y deja lista la capa de usuarios."
      description="Registro por email conectado a Supabase, con una interfaz alineada a la marca y lista para el siguiente paso de datos por usuario."
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
