import { AppPage } from "@/components/app/app-page";
import { DashboardOverview } from "@/components/app/dashboard-overview";

export default function DashboardPage() {
  return (
    <AppPage
      title="Dashboard"
      description="Vista principal de owner para empezar a organizar módulos, usuarios y la operación de tráfico de OMNI Scale."
    >
      <DashboardOverview />
    </AppPage>
  );
}
