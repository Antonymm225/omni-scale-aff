import { AppShell } from "@/components/app/app-shell";
import { SectionPlaceholder } from "@/components/app/section-placeholder";

export default function TiktokPage() {
  return (
    <AppShell
      title="Tiktok Ads"
      description="Ruta base para la parte de Tiktok Ads, con la misma estructura del panel principal."
    >
      <SectionPlaceholder
        title="Módulo de Tiktok Ads"
        description="La interfaz ya queda lista para enchufar cuentas, campañas, métricas y automatizaciones específicas de Tiktok."
      />
    </AppShell>
  );
}
