"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";

type AppRouteShellProps = {
  children: ReactNode;
};

const appRoutePrefixes = ["/dashboard", "/offers", "/facebook", "/tiktok", "/users", "/my-account", "/workspace"];

export function AppRouteShell({ children }: AppRouteShellProps) {
  const pathname = usePathname();
  const isAppRoute = appRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isAppRoute) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
