import Image from "next/image";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ description, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#0f172a]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <section className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
          <div className="w-full max-w-[380px]">
            <div className="mb-10 flex justify-center">
              <Image
                src="/omni-scale-logo.png"
                alt="Omni Scale"
                width={170}
                height={84}
                priority
                className="h-auto w-[170px]"
              />
            </div>
            {children}
          </div>
        </section>

        <section className="flex w-full items-center justify-center bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_100%)] px-6 py-12 lg:w-1/2">
          <div className="max-w-[600px] text-center text-white">
            <div className="mb-9 flex justify-center">
              <Image
                src="/facebook-imagen-demo.webp"
                alt="Vista de anuncios y activos conectados"
                width={420}
                height={430}
                className="h-auto w-full max-w-[420px]"
                priority
              />
            </div>
            <div className="space-y-4">
              <p className="text-lg leading-8 text-white/90 sm:text-[1.35rem]">
                {description}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
