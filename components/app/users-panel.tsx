"use client";

import { useEffect, useState } from "react";
import { useAppShell } from "@/components/app/app-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "owner" | "media_buyer";
  created_at?: string;
};

export function UsersPanel() {
  const { profile } = useAppShell();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile?.role !== "owner") {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    let active = true;

    supabase
      .from("profiles")
      .select("id,email,full_name,role,created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (!active) {
          return;
        }

        if (fetchError) {
          setError("No se pudo cargar la lista de usuarios.");
        } else {
          setRows((data as ProfileRow[]) ?? []);
        }

        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [profile?.role]);

  if (profile?.role !== "owner") {
    return (
      <div className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-7 shadow-[0_16px_48px_rgba(7,19,37,0.06)]">
        <h2 className="text-2xl font-bold text-brand-primary">Usuarios</h2>
        <p className="mt-4 text-[#4b6283]">Solo un owner puede ver y gestionar esta vista.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-7 shadow-[0_16px_48px_rgba(7,19,37,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-primary">Usuarios</h2>
          <p className="mt-2 text-sm text-[#5d728e]">
            Por ahora esta vista se enfoca en owner. Luego conectamos aquí el cambio de roles.
          </p>
        </div>
        <span className="rounded-full bg-[#ebe4ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#6d28d9]">
          Owner
        </span>
      </div>

      {loading ? <p className="mt-6 text-[#4b6283]">Cargando usuarios...</p> : null}
      {error ? <p className="mt-6 text-brand-secondary">{error}</p> : null}

      {!loading && !error ? (
        <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-[#d9e1ec]">
          <table className="min-w-full divide-y divide-[#d9e1ec]">
            <thead className="bg-[#f7f9fc]">
              <tr className="text-left text-xs uppercase tracking-[0.22em] text-[#6c7f99]">
                <th className="px-5 py-4">Usuario</th>
                <th className="px-5 py-4">Correo</th>
                <th className="px-5 py-4">Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef3f8] bg-white text-sm text-brand-primary">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 font-medium">
                    {row.full_name || row.email?.split("@")[0] || "Sin nombre"}
                  </td>
                  <td className="px-5 py-4 text-[#4b6283]">{row.email || "Sin correo"}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[#eef3f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#415a77]">
                      {row.role === "owner" ? "Owner" : "Media Buyer"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
