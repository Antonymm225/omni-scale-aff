import { AppShell } from "@/components/app/app-shell";
import { SectionPlaceholder } from "@/components/app/section-placeholder";

export default function FacebookPage() {
  return (
    <AppShell
      title="Facebook Ads"
      description="Espacio preparado para la conexión de cuentas, campañas y lectura operativa desde Meta."
    >
      <SectionPlaceholder
        title="Módulo de Facebook Ads"
        description="Aquí conectaremos luego métricas, cuentas publicitarias y sincronizaciones enfocadas en la operación de owner y media buyers."
      />
    </AppShell>
  );
}
