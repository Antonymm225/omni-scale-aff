import { AppPage } from "@/components/app/app-page";
import { UsersPanel } from "@/components/app/users-panel";

export default function UsersPage() {
  return (
    <AppPage
      title="Usuarios"
      description="Vista owner para revisar quién tiene acceso al workspace y preparar la futura gestión de roles."
    >
      <UsersPanel />
    </AppPage>
  );
}
