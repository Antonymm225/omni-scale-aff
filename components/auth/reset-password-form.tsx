"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return Boolean(
    value &&
      ["signup", "invite", "magiclink", "recovery", "email_change", "email"].includes(value),
  );
}

function translateResetError(message: string) {
  const lowered = message.toLowerCase();

  if (lowered.includes("same password")) {
    return "Elige una contraseña distinta a la anterior.";
  }

  if (lowered.includes("password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }

  if (lowered.includes("expired")) {
    return "El enlace expiró. Solicita uno nuevo desde login.";
  }

  return "No se pudo validar el enlace de recuperación. Solicita uno nuevo desde login.";
}

export function ResetPasswordForm() {
  const router = useRouter();
  const isConfigured = hasSupabaseConfig();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isConfigured) {
      setError("Faltan las variables públicas de Supabase.");
      setIsInitializing(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("No se pudo inicializar Supabase.");
      setIsInitializing(false);
      return;
    }

    const supabaseClient = supabase;
    let active = true;

    async function initializeRecoverySession() {
      const url = new URL(window.location.href);
      const searchParams = url.searchParams;
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      const redirectError =
        searchParams.get("error_description") || hashParams.get("error_description");

      if (redirectError) {
        setError(decodeURIComponent(redirectError));
        return;
      }

      const authCode = searchParams.get("code");

      if (authCode) {
        const { error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(authCode);

        if (exchangeError) {
          setError(translateResetError(exchangeError.message));
          return;
        }

        window.history.replaceState(window.history.state, "", "/reset-password");
        return;
      }

      const tokenHash = searchParams.get("token_hash");
      const otpType = searchParams.get("type");

      if (tokenHash && isEmailOtpType(otpType)) {
        const { error: verifyError } = await supabaseClient.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType,
        });

        if (verifyError) {
          setError(translateResetError(verifyError.message));
          return;
        }

        window.history.replaceState(window.history.state, "", "/reset-password");
        return;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabaseClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError(translateResetError(sessionError.message));
          return;
        }

        window.history.replaceState(window.history.state, "", "/reset-password");
      }
    }

    initializeRecoverySession()
      .then(() => supabaseClient.auth.getSession())
      .then((result) => {
        if (!active) {
          return;
        }

        if (result?.data.session) {
          setIsReady(true);
        } else {
          setError("El enlace no es válido o ya expiró. Solicita uno nuevo desde login.");
        }
      })
      .finally(() => {
        if (active) {
          setIsInitializing(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isConfigured]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("No se pudo inicializar Supabase.");
      return;
    }

    setIsPending(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setMessage("Contraseña actualizada correctamente. Redirigiendo a login...");
      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace("/login?reset=password-updated");
      }, 600);
    } catch (resetError) {
      const friendlyMessage =
        resetError instanceof Error
          ? translateResetError(resetError.message)
          : "No se pudo actualizar la contraseña.";

      setError(friendlyMessage);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="w-full text-brand-primary">
      <div className="mb-5">
        <h1 className="text-[22px] font-semibold text-[#1e293b]">Restablecer contraseña</h1>
      </div>

      {isInitializing ? (
        <p className="rounded-[10px] border border-[#cbd5e1] bg-white px-4 py-3 text-sm text-[#475569]">
          Validando enlace de recuperación...
        </p>
      ) : null}

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

      {isReady ? (
        <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nueva contraseña"
              className="w-full rounded-[10px] border border-[#cbd5e1] bg-white px-4 py-3 text-[14px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#1e3a8a]"
              minLength={6}
              required
            />
          </label>

          <label className="block space-y-2">
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirmar contraseña"
              className="w-full rounded-[10px] border border-[#cbd5e1] bg-white px-4 py-3 text-[14px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#1e3a8a]"
              minLength={6}
              required
            />
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-[10px] bg-[#0f172a] px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isPending ? "Actualizando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
