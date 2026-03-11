"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

function getAuthCopy(mode: AuthMode) {
  if (mode === "login") {
    return {
      title: "Inicia sesion",
      subtitle: "Accede a tu espacio de trabajo en OmniScale con tu correo y contrasena.",
      button: "Entrar",
      alternateCta: "Crear cuenta",
      alternateHref: "/signup",
      alternateText: "Aun no tienes cuenta?",
    };
  }

  return {
    title: "Crea tu cuenta",
    subtitle: "Registrate con email en Supabase y deja lista la base para tus siguientes modulos.",
    button: "Registrarme",
    alternateCta: "Ir a login",
    alternateHref: "/login",
    alternateText: "Ya tienes una cuenta?",
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

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const copy = getAuthCopy(mode);
  const isConfigured = hasSupabaseConfig();
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

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) {
        router.replace("/workspace");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/workspace");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isConfigured, mode, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isConfigured) {
      setError("Faltan las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
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

        router.push("/workspace");
        router.refresh();
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
        router.push("/workspace");
        router.refresh();
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
    <div className="w-full rounded-[2rem] border border-brand-primary/10 bg-white/90 p-8 shadow-[0_30px_80px_rgba(7,19,37,0.08)] backdrop-blur sm:p-10">
      <div className="mb-8 space-y-3">
        <span className="inline-flex rounded-full bg-brand-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary">
          {mode === "login" ? "Acceso" : "Registro"}
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-brand-primary sm:text-4xl">{copy.title}</h1>
          <p className="max-w-lg text-sm leading-6 text-brand-support sm:text-base">{copy.subtitle}</p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-brand-primary">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@empresa.com"
            className="w-full rounded-2xl border border-surface-muted bg-white px-4 py-3 text-base text-brand-primary outline-none transition focus:border-brand-secondary focus:ring-4 focus:ring-brand-secondary/10"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-brand-primary">Contrasena</span>
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimo 6 caracteres"
            className="w-full rounded-2xl border border-surface-muted bg-white px-4 py-3 text-base text-brand-primary outline-none transition focus:border-brand-secondary focus:ring-4 focus:ring-brand-secondary/10"
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
          className="w-full rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:bg-brand-primary/45"
        >
          {isPending ? "Procesando..." : copy.button}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-surface-muted pt-5 text-sm text-brand-support">
        <span>{copy.alternateText}</span>
        <Link href={copy.alternateHref} className="font-semibold text-brand-secondary transition hover:text-brand-primary">
          {copy.alternateCta}
        </Link>
      </div>
    </div>
  );
}
