import { AppPage } from "@/components/app/app-page";
import { AccountPanel } from "@/components/app/account-panel";

export default function MyAccountPage() {
  return (
    <AppPage
      title="Mi cuenta"
      description="Administra tu perfil personal dentro de OMNI Scale y completa la información que faltó durante el registro."
    >
      <AccountPanel />
    </AppPage>
  );
}
