import { AppShell } from "@/components/app/app-shell";
import { UsersPanel } from "@/components/app/users-panel";

export default function UsersPage() {
  return (
    <AppShell
      title="Usuarios"
      description="Vista owner para revisar quién tiene acceso al workspace y preparar la futura gestión de roles."
    >
      <UsersPanel />
    </AppShell>
  );
}
