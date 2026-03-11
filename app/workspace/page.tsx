import { SessionPanel } from "@/components/auth/session-panel";

export default function WorkspacePage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <span className="font-logo text-2xl tracking-[0.16em] text-brand-primary">OMNISCALE</span>
          <span className="rounded-full bg-brand-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary">
            Area privada
          </span>
        </div>
        <SessionPanel />
      </div>
    </main>
  );
}
