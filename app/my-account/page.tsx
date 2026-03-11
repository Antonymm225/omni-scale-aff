import { AppShell } from "@/components/app/app-shell";
import { AccountPanel } from "@/components/app/account-panel";

export default function MyAccountPage() {
  return (
    <AppShell
      title="Mi cuenta"
      description="Administra tu perfil personal dentro de OMNI Scale y completa la información que faltó durante el registro."
    >
      <AccountPanel />
    </AppShell>
  );
}
