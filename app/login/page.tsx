import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Login"
      title="Inteligencia financiera con una entrada clara y sobria."
      description="Una pantalla de acceso enfocada en rapidez, confianza y base tecnica para crecer sobre Supabase."
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
