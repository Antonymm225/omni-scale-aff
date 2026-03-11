"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState, type FormEvent } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

function getAuthCopy(mode: AuthMode) {
  if (mode === "login") {
    return {
      title: "Iniciar sesion",
      subtitle: "",
      button: "Continuar con email",
      alternateCta: "Crear cuenta",
      alternateHref: "/signup",
      alternateText: "Olvide mi contrasena",
    };
  }

  return {
    title: "Crear cuenta",
    subtitle: "",
    button: "Crear cuenta con email",
    alternateCta: "Iniciar sesion",
    alternateHref: "/login",
    alternateText: "Ya tienes cuenta?",
  };
}

function translateSupabaseError(message: string) {
  const lowered = message.toLowerCase();

  if (lowered.includes("invalid login credentials")) {
    return "Correo o contrasena incorrectos.";
  }

  if (lowered.includes("email not confirmed")) {
    return "Tu correo aun no esta confirmado. Revisa la bandeja de entrada.";
  }

  if (lowered.includes("password should be at least")) {
    return "La contrasena debe tener al menos 6 caracteres.";
  }

  if (lowered.includes("user already registered")) {
    return "Ese correo ya esta registrado. Prueba iniciar sesion.";
  }

  return "No se pudo completar la operacion. Revisa los datos e intentalo otra vez.";
}

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return Boolean(
    value &&
      ["signup", "invite", "magiclink", "recovery", "email_change", "email"].includes(value),
  );
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const copy = getAuthCopy(mode);
  const isConfigured = hasSupabaseConfig();
  const hasNavigatedRef = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (mode !== "login" || !isConfigured) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    const supabaseClient = supabase;
    let active = true;

    async function handleEmailConfirmationCallback() {
      const url = new URL(window.location.href);
      const searchParams = url.searchParams;
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      const authCode = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const otpType = searchParams.get("type");
      const redirectError = searchParams.get("error_description") || hashParams.get("error_description");

      if (redirectError) {
        setError(decodeURIComponent(redirectError));
        window.history.replaceState(window.history.state, "", "/login");
        return;
      }

      if (authCode) {
        const { data, error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(authCode);

        if (exchangeError) {
          setError(translateSupabaseError(exchangeError.message));
        } else if (data.session) {
          await supabaseClient.auth.signOut();
          setMessage("Cuenta verificada correctamente. Ya puedes iniciar sesion.");
        }

        window.history.replaceState(window.history.state, "", "/login");
        return;
      }

      if (tokenHash && isEmailOtpType(otpType)) {
        const { data, error: verifyError } = await supabaseClient.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType,
        });

        if (verifyError) {
          setError(translateSupabaseError(verifyError.message));
        } else if (data.session || otpType === "signup" || otpType === "email") {
          await supabaseClient.auth.signOut();
          setMessage("Cuenta verificada correctamente. Ya puedes iniciar sesion.");
        }

        window.history.replaceState(window.history.state, "", "/login");
        return;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashType = hashParams.get("type");

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabaseClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError(translateSupabaseError(sessionError.message));
        } else if (hashType === "signup" || hashType === "email") {
          await supabaseClient.auth.signOut();
          setMessage("Cuenta verificada correctamente. Ya puedes iniciar sesion.");
        }

        window.history.replaceState(window.history.state, "", "/login");
      }
    }

    handleEmailConfirmationCallback().then(() => {
      if (!active) {
        return;
      }

      router.prefetch("/dashboard");

      supabaseClient.auth.getSession().then(({ data }) => {
        if (active && data.session && !hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          startTransition(() => {
            router.replace("/dashboard");
          });
        }
      });
    });

    return () => {
      active = false;
    };
  }, [isConfigured, mode, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isConfigured) {
      setError(
        "Faltan las variables NEXT_PUBLIC_SUPABASE_URL y una clave publica de Supabase.",
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
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          startTransition(() => {
            router.replace("/dashboard");
          });
        }
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          startTransition(() => {
            router.replace("/dashboard");
          });
        }
        return;
      }

      setMessage("Cuenta creada. Revisa tu correo para confirmar el acceso antes de iniciar sesion.");
      setPassword("");
    } catch (authError) {
      const friendlyMessage =
        authError instanceof Error
          ? translateSupabaseError(authError.message)
          : "Ocurrio un error inesperado.";

      setError(friendlyMessage);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="w-full text-brand-primary">
      <div className="mb-5">
        <h1 className="text-[22px] font-semibold text-[#1e293b]">{copy.title}</h1>
        {copy.subtitle ? (
          <p className="mt-2 text-sm leading-6 text-[#475569]">{copy.subtitle}</p>
        ) : null}
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Correo electronico"
            className="w-full rounded-[10px] border border-[#cbd5e1] bg-white px-4 py-3 text-[14px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#1e3a8a]"
            required
          />
        </label>

        <label className="block space-y-2">
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Contrasena"
            className="w-full rounded-[10px] border border-[#cbd5e1] bg-white px-4 py-3 text-[14px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#1e3a8a]"
            minLength={6}
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
            Falta configurar `.env.local` con las variables publicas de Supabase.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending || !isConfigured}
          className="w-full rounded-[10px] bg-[#0f172a] px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isPending ? "Procesando..." : copy.button}
        </button>
      </form>

      {!isConfigured ? (
        <p className="mt-5 rounded-[10px] border border-dashed border-brand-primary/15 bg-brand-primary/4 px-4 py-3 text-sm text-brand-support">
          Falta configurar `.env.local` con las variables publicas de Supabase.
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-between text-[13px]">
        {mode === "login" ? (
          <button type="button" className="text-[#1e3a8a] transition hover:text-[#0f172a]">
            {copy.alternateText}
          </button>
        ) : (
          <span className="text-[#64748b]">{copy.alternateText}</span>
        )}
        <Link href={copy.alternateHref} className="font-medium text-[#1e3a8a] transition hover:text-[#0f172a]">
          {copy.alternateCta}
        </Link>
      </div>

      {mode === "signup" ? (
        <p className="mt-5 text-center text-xs text-[#94a3b8]">
          Te enviaremos un correo para confirmar tu cuenta antes del primer acceso.
        </p>
      ) : null}
    </div>
  );
}
