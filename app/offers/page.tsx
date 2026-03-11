import { AppShell } from "@/components/app/app-shell";
import { OffersPanel } from "@/components/app/offers-panel";

export default function OffersPage() {
  return (
    <AppShell
      title="Ofertas"
      description="Gestiona tus ofertas, crea nuevas entradas desde la interfaz y revisa rápidamente cuáles son las mejores y peores según el período seleccionado."
    >
      <OffersPanel />
    </AppShell>
  );
}
