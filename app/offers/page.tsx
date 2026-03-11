import { AppShell } from "@/components/app/app-shell";
import { SectionPlaceholder } from "@/components/app/section-placeholder";

export default function OffersPage() {
  return (
    <AppShell
      title="Ofertas"
      description="Aquí construiremos el módulo para concentrar cada offer, su estado, notas operativas y puntos de decisión."
    >
      <SectionPlaceholder
        title="Módulo de ofertas"
        description="La siguiente iteración puede conectar aquí el catálogo de offers, payout, fuente y estado para que owner y media buyers trabajen sobre una misma referencia."
      />
    </AppShell>
  );
}
