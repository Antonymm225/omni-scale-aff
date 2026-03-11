import Image from "next/image";
import { SessionPanel } from "@/components/auth/session-panel";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f9fc_0%,#eef3f8_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[1.8rem] border border-brand-primary/10 bg-white/86 px-5 py-4 shadow-[0_24px_64px_rgba(7,19,37,0.08)] backdrop-blur sm:px-6">
          <Image
            src="/omni-scale-logo.png"
            alt="Omni Scale"
            width={210}
            height={104}
            priority
            className="h-auto w-[144px] sm:w-[180px]"
          />
          <span className="rounded-full bg-brand-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary">
            Dashboard
          </span>
        </div>
        <SessionPanel />
      </div>
    </main>
  );
}
