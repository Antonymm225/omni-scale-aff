"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

function translateResetError(message: string) {
  const lowered = message.toLowerCase();

  if (lowered.includes("email rate limit exceeded")) {
    return "Ya se envió un correo hace poco. Espera un momento e inténtalo de nuevo.";
  }

  return "No se pudo enviar el correo de recuperación. Inténtalo otra vez.";
}

export function ForgotPasswordForm() {
  const isConfigured = hasSupabaseConfig();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Escribe tu correo electrónico para enviarte el enlace de recuperación.");
      return;
    }

    if (!isConfigured) {
      setError(
        "Faltan las variables NEXT_PUBLIC_SUPABASE_URL y una clave pública de Supabase.",
      );
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("No se pudo inicializar Supabase.");
      return;
    }

    setIsPending(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setMessage("Te enviamos un correo para restablecer tu contraseña.");
    } catch (authError) {
      const friendlyMessage =
        authError instanceof Error
          ? translateResetError(authError.message)
          : "No se pudo enviar el correo de recuperación.";

      setError(friendlyMessage);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="w-full text-brand-primary">
      <div className="mb-5">
        <h1 className="text-[22px] font-semibold text-[#1e293b]">Recuperar contraseña</h1>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Correo electrónico"
            className="w-full rounded-[10px] border border-[#cbd5e1] bg-white px-4 py-3 text-[14px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#1e3a8a]"
            required
          />
        </label>

        {error ? (
          <p className="rounded-2xl border border-brand-secondary/20 bg-surface-tint px-4 py-3 text-sm text-brand-secondary">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-2xl border border-brand-support/15 bg-brand-support/8 px-4 py-3 text-sm text-brand-support">
            {message}
          </p>
        ) : null}

        {!isConfigured ? (
          <p className="rounded-2xl border border-dashed border-brand-primary/15 bg-brand-primary/4 px-4 py-3 text-sm text-brand-support">
            Falta configurar `.env.local` con las variables públicas de Supabase.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending || !isConfigured}
          className="w-full rounded-[10px] bg-[#0f172a] px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isPending ? "Enviando..." : "Enviar correo de recuperación"}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-end text-[13px]">
        <Link href="/login" className="font-medium text-[#1e3a8a] transition hover:text-[#0f172a]">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
