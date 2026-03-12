"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

type AppRole = "owner" | "media_buyer";

type AppProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  created_at?: string;
  updated_at?: string;
};

type AppShellContextValue = {
  session: Session;
  profile: AppProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: AppProfile | null) => void;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

type AppShellProps = {
  children: ReactNode;
};

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/offers", label: "Ofertas", icon: "offers" },
  { href: "/facebook", label: "Facebook Ads", icon: "facebook" },
  { href: "/tiktok", label: "Tiktok Ads", icon: "tiktok" },
  { href: "/revenue", label: "Revenue", icon: "revenue" },
  { href: "/users", label: "Usuarios", icon: "users" },
] as const;

function iconFor(name: (typeof navigationItems)[number]["icon"] | "logout") {
  const base = "h-5 w-5";

  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base} stroke="currentColor" strokeWidth="1.8">
          <path d="M4 13.5h6.5V20H4zM13.5 4H20v7.5h-6.5zM13.5 13.5H20V20h-6.5zM4 4h6.5v6.5H4z" />
        </svg>
      );
    case "offers":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base} stroke="currentColor" strokeWidth="1.8">
          <path d="M5 7h14M5 12h10M5 17h7" strokeLinecap="round" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base} stroke="currentColor" strokeWidth="1.8">
          <path d="M13 20v-7h2.5l.5-3H13V8.5c0-.9.3-1.5 1.7-1.5H16V4.2c-.3 0-1.2-.2-2.3-.2-2.3 0-3.9 1.4-3.9 4V10H7v3h2.8v7H13Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base} stroke="currentColor" strokeWidth="1.8">
          <path
            d="M14 4c.4 1.7 1.6 3.2 3.5 4v2.5c-1.3 0-2.4-.3-3.5-1V15a5 5 0 1 1-5-5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base} stroke="currentColor" strokeWidth="1.8">
          <path
            d="M16 19a4 4 0 0 0-8 0M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 19a3 3 0 0 0-3-3M17.5 12a2.5 2.5 0 1 0 0-5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "revenue":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base} stroke="currentColor" strokeWidth="1.8">
          <path d="M4 16l4-4 3 3 7-7M18 8h-4V4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "logout":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={base} stroke="currentColor" strokeWidth="1.8">
          <path
            d="M15 7l5 5-5 5M20 12H9M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getDisplayName(profile: AppProfile | null, session: Session | null) {
  const profileName = profile?.full_name?.trim();
  const metadataName =
    typeof session?.user.user_metadata?.full_name === "string"
      ? session.user.user_metadata.full_name.trim()
      : "";

  if (profileName) {
    return profileName;
  }

  if (metadataName) {
    return metadataName;
  }

  return session?.user.email?.split("@")[0] ?? "Usuario";
}

function AppShellSkeleton() {
  return (
    <main className="min-h-screen bg-[#eef3f8] text-brand-primary">
      <aside className="hidden border-r border-[#d9e1ec] bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-[284px]">
        <div className="flex h-full flex-col">
          <div className="border-b border-[#d9e1ec] px-6 py-6">
            <div className="h-8 w-32 animate-pulse rounded-lg bg-[#e6edf5]" />
          </div>
          <div className="flex-1 space-y-2 px-3 py-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-xl bg-[#eef3f8]" />
            ))}
          </div>
          <div className="border-t border-[#d9e1ec] p-3">
            <div className="h-[74px] animate-pulse rounded-2xl bg-[#eef3f8]" />
          </div>
        </div>
      </aside>

      <section className="min-h-screen px-4 py-6 sm:px-6 lg:ml-[284px] lg:px-10">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-12 w-56 animate-pulse rounded-xl bg-[#dfe7f1]" />
            <div className="h-6 w-[30rem] max-w-full animate-pulse rounded-xl bg-[#e8eef6]" />
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-[1.5rem] bg-white shadow-[0_16px_48px_rgba(7,19,37,0.04)]"
              />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-[1.75rem] bg-white shadow-[0_16px_48px_rgba(7,19,37,0.04)]" />
        </div>
      </section>
    </main>
  );
}

export function useAppShell() {
  const context = useContext(AppShellContext);

  if (!context) {
    throw new Error("useAppShell must be used within AppShell");
  }

  return context;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isConfigured = hasSupabaseConfig();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    if (!currentSession) {
      setSession(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setSession(currentSession);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id,email,full_name,role,created_at,updated_at")
      .eq("id", currentSession.user.id)
      .maybeSingle();

    let nextProfile = (profileData as AppProfile | null) ?? null;
    const metadataFullName =
      typeof currentSession.user.user_metadata?.full_name === "string"
        ? currentSession.user.user_metadata.full_name.trim()
        : "";

    if (nextProfile && !nextProfile.full_name && metadataFullName) {
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .update({ full_name: metadataFullName })
        .eq("id", currentSession.user.id)
        .select("id,email,full_name,role,created_at,updated_at")
        .single();

      nextProfile = (updatedProfile as AppProfile | null) ?? null;
    }

    setProfile(nextProfile);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    let active = true;

    queueMicrotask(() => {
      if (!active) {
        return;
      }

      void refreshProfile();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return;
      }

      if (!nextSession) {
        setSession(null);
        setProfile(null);
        setIsLoading(false);
        router.replace("/login");
        return;
      }

      setSession(nextSession);
      void refreshProfile();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isConfigured, refreshProfile, router]);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      router.replace("/login");
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login");
  }

  const contextValue = useMemo(
    () =>
      session
        ? {
            session,
            profile,
            isLoading,
            refreshProfile,
            setProfile,
          }
        : null,
    [isLoading, profile, refreshProfile, session],
  );

  if (!isConfigured) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] p-6">
        <div className="mx-auto max-w-4xl rounded-[1.8rem] border border-brand-primary/10 bg-white p-8 shadow-[0_20px_60px_rgba(7,19,37,0.08)]">
          <p className="text-brand-primary">Falta configurar las variables públicas de Supabase.</p>
        </div>
      </main>
    );
  }

  if (isLoading || !session || !contextValue) {
    return <AppShellSkeleton />;
  }

  const displayName = getDisplayName(profile, session);
  const roleLabel = profile?.role === "owner" ? "Owner" : "Media Buyer";

  return (
    <AppShellContext.Provider value={contextValue}>
      <main className="min-h-screen bg-[#eef3f8] text-brand-primary">
        <aside className="w-full border-b border-[#d9e1ec] bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-[284px] lg:border-r lg:border-b-0">
          <div className="flex h-full flex-col">
            <div className="border-b border-[#d9e1ec] px-6 py-6">
              <Link href="/dashboard" className="text-2xl font-bold tracking-tight text-brand-primary">
                OMNI Scale
              </Link>
            </div>

            <nav className="flex-1 px-3 py-5">
              <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive ? "bg-[#ebe4ff] text-[#5b21b6]" : "text-[#23395d] hover:bg-[#f4f7fb]"
                      }`}
                    >
                      <span className={isActive ? "text-[#7c3aed]" : "text-[#5d728e]"}>{iconFor(item.icon)}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="border-t border-[#d9e1ec] p-3">
              <div className="flex items-center gap-3 rounded-2xl bg-[#f7f9fc] p-3">
                <Link href="/my-account" className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                    {getInitials(displayName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-primary">{displayName}</p>
                    <p className="truncate text-xs text-[#5d728e]">{roleLabel}</p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-xl p-2 text-[#5d728e] transition hover:bg-white hover:text-brand-primary"
                  aria-label="Cerrar sesión"
                >
                  {iconFor("logout")}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-h-screen px-4 py-6 sm:px-6 lg:ml-[284px] lg:px-10">{children}</section>
      </main>
    </AppShellContext.Provider>
  );
}
