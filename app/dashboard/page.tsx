import { AppShell } from "@/components/app/app-shell";
import { DashboardOverview } from "@/components/app/dashboard-overview";

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      description="Vista principal de owner para empezar a organizar módulos, usuarios y la operación de tráfico de OMNI Scale."
    >
      <DashboardOverview />
    </AppShell>
  );
}
