"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAppShell } from "@/components/app/app-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AccountPanel() {
  const { session, profile, refreshProfile, setProfile } = useAppShell();
  const initialName =
    profile?.full_name ||
    (typeof session.user.user_metadata?.full_name === "string"
      ? session.user.user_metadata.full_name
      : "");

  const [fullName, setFullName] = useState(initialName);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setFullName(initialName);
  }, [initialName]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!fullName.trim()) {
      setError("Escribe tu nombre y apellido.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("No se pudo inicializar Supabase.");
      return;
    }

    setIsPending(true);

    try {
      const trimmedName = fullName.trim();

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: trimmedName,
        },
      });

      if (metadataError) {
        throw metadataError;
      }

      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: trimmedName })
        .eq("id", session.user.id)
        .select("id,email,full_name,role,created_at,updated_at")
        .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(updatedProfile);
      await refreshProfile();
      setMessage("Tu cuenta fue actualizada correctamente.");
    } catch {
      setError("No se pudo actualizar tu información.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-brand-primary/10 bg-white p-7 shadow-[0_16px_48px_rgba(7,19,37,0.06)]">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-xl font-bold text-white">
          {(fullName || session.user.email || "U")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("")}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-brand-primary">Mi cuenta</h2>
          <p className="mt-1 text-sm text-[#5d728e]">
            Completa o edita tu nombre para reflejarlo en el sidebar y en la gestión interna.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-[1.25rem] border border-[#d9e1ec] bg-[#f7f9fc] p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#6c7f99]">Correo</p>
          <p className="mt-2 text-sm font-medium text-brand-primary">{session.user.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#6c7f99]">Rol</p>
          <p className="mt-2 text-sm font-medium text-brand-primary">
            {profile?.role === "owner" ? "Owner" : "Media Buyer"}
          </p>
        </div>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-brand-primary">Nombre y apellido</span>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Tu nombre y apellido"
            className="w-full rounded-[12px] border border-[#cbd5e1] bg-white px-4 py-3 text-[14px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#1e3a8a]"
            required
          />
        </label>

        {error ? <p className="text-sm text-brand-secondary">{error}</p> : null}
        {message ? <p className="text-sm text-[#2f6f4f]">{message}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-[12px] bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
