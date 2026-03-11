"use client";

import { useAppShell } from "@/components/app/app-shell";

const cards = [
  {
    title: "Rol activo",
    value: "Owner",
    description: "Tienes acceso para gestionar usuarios y permisos del workspace.",
  },
  {
    title: "Módulos listos",
    value: "5",
    description: "Dashboard, offers, Facebook Ads, Tiktok Ads y usuarios.",
  },
  {
    title: "Estado",
    value: "Online",
    description: "La autenticación y la lectura de perfil están conectadas con Supabase.",
  },
] as const;

export function DashboardOverview() {
  const { profile, session } = useAppShell();
  const name =
    profile?.full_name ||
    (typeof session.user.user_metadata?.full_name === "string"
      ? session.user.user_metadata.full_name
      : "") ||
    session.user.email;

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-6 shadow-[0_16px_48px_rgba(7,19,37,0.07)]">
        <p className="text-sm uppercase tracking-[0.28em] text-[#7c3aed]">Owner view</p>
        <h2 className="mt-3 text-3xl font-bold text-brand-primary">Bienvenido, {name}</h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#4b6283]">
          Esta base ya está preparada para crecer hacia una operación con offers, fuentes de tráfico
          y gestión de usuarios desde un mismo panel.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-[1.5rem] border border-brand-primary/10 bg-white p-6 shadow-[0_16px_48px_rgba(7,19,37,0.05)]"
          >
            <p className="text-sm text-[#4b6283]">{card.title}</p>
            <p className="mt-4 text-4xl font-bold text-brand-primary">
              {card.title === "Rol activo" ? (profile?.role === "owner" ? "Owner" : "Media Buyer") : card.value}
            </p>
            <p className="mt-3 text-sm leading-6 text-[#5d728e]">{card.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
