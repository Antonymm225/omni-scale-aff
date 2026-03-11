import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(209,7,84,0.18),_transparent_65%)]" />
      <div className="absolute left-[-10%] top-[14%] h-64 w-64 rounded-full bg-brand-secondary/10 blur-3xl" />
      <div className="absolute right-[-8%] top-[36%] h-72 w-72 rounded-full bg-brand-support/12 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-brand-primary/10 bg-white/70 shadow-[0_40px_120px_rgba(7,19,37,0.12)] backdrop-blur xl:grid-cols-[1.05fr_0.95fr]">
        <section className="auth-grid relative hidden overflow-hidden bg-brand-primary px-10 py-12 text-white xl:flex xl:flex-col xl:justify-between">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_45%,rgba(209,7,84,0.2)_100%)]" />
          <div className="relative">
            <span className="font-logo text-3xl tracking-[0.16em] text-white">OMNISCALE</span>
          </div>

          <div className="relative max-w-xl space-y-6">
            <span className="inline-flex rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
              {eyebrow}
            </span>
            <div className="space-y-4">
              <h2 className="max-w-lg text-5xl leading-[1.05] font-bold">{title}</h2>
              <p className="max-w-lg text-lg leading-8 text-white/74">{description}</p>
            </div>
            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-white/55">Base</p>
                <p className="mt-3 text-lg leading-7 text-white/86">
                  Acceso con email y sesiones ligadas a Supabase desde el primer flujo.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-white/55">Escala</p>
                <p className="mt-3 text-lg leading-7 text-white/86">
                  La base queda lista para separar datos por usuario con RLS en el siguiente paso.
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-between rounded-[1.75rem] border border-white/10 bg-white/6 px-6 py-5">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/55">Dominio</p>
              <p className="mt-2 text-xl font-semibold">omniscale.lat</p>
            </div>
            <div className="h-12 w-12 rounded-full border border-white/20 bg-white/8" />
          </div>
        </section>

        <section className="relative flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-xl">
            <div className="mb-8 flex items-center justify-between xl:hidden">
              <span className="font-logo text-2xl tracking-[0.16em] text-brand-primary">OMNISCALE</span>
              <span className="rounded-full bg-brand-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary">
                {eyebrow}
              </span>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
