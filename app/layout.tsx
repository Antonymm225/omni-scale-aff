import type { Metadata } from "next";
import "./globals.css";
import { AppRouteShell } from "@/components/app/app-route-shell";

export const metadata: Metadata = {
  title: "OmniScale",
  description: "Acceso y registro para la plataforma OmniScale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AppRouteShell>{children}</AppRouteShell>
      </body>
    </html>
  );
}
