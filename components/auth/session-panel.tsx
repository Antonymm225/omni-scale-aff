"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

export function SessionPanel() {
  const router = useRouter();
  const isConfigured = hasSupabaseConfig();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isConfigured);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) {
        return;
      }

      if (sessionError) {
        setError("No se pudo recuperar la sesion actual.");
      } else {
        setSession(data.session);
      }

      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return;
      }

      setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      router.replace("/login");
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-brand-primary/10 bg-white p-8 shadow-[0_24px_64px_rgba(7,19,37,0.08)]">
        <p className="text-brand-support">Cargando sesion...</p>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="rounded-[2rem] border border-brand-secondary/20 bg-white p-8 shadow-[0_24px_64px_rgba(7,19,37,0.08)]">
        <p className="text-brand-primary">Falta configurar `.env.local` para usar el area autenticada.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-brand-secondary/20 bg-white p-8 shadow-[0_24px_64px_rgba(7,19,37,0.08)]">
        <p className="text-brand-secondary">{error}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-[2rem] border border-brand-primary/10 bg-white p-8 shadow-[0_24px_64px_rgba(7,19,37,0.08)]">
        <p className="text-lg font-semibold text-brand-primary">No hay una sesion activa.</p>
        <p className="mt-3 text-brand-support">
          El login ya esta listo, pero esta vista todavia no esta protegida por middleware.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-2xl bg-brand-primary px-5 py-3 font-semibold text-white transition hover:bg-brand-secondary"
        >
          Ir a login
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-brand-primary/10 bg-white p-8 shadow-[0_24px_64px_rgba(7,19,37,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-secondary">Sesion activa</p>
      <h1 className="mt-4 text-4xl font-bold text-brand-primary">Workspace temporal</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-brand-support">
        La autenticacion por email ya funciona. Este espacio queda como destino provisional mientras construimos el home real.
      </p>

      <div className="mt-8 rounded-[1.5rem] border border-surface-muted bg-slate-50/70 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-support">Usuario</p>
        <p className="mt-2 text-xl font-semibold text-brand-primary">{session.user.email}</p>
        <p className="mt-2 text-sm text-brand-support">UID: {session.user.id}</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-2xl bg-brand-primary px-5 py-3 font-semibold text-white transition hover:bg-brand-secondary"
        >
          Cerrar sesion
        </button>
        <Link
          href="/login"
          className="rounded-2xl border border-brand-primary/12 px-5 py-3 font-semibold text-brand-primary transition hover:border-brand-secondary hover:text-brand-secondary"
        >
          Volver a login
        </Link>
      </div>
    </div>
  );
}
