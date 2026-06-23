"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "login") {
      const { error } = await signIn.email({ email, password });
      if (error) { setError(error.message ?? "Error al iniciar sesión"); setLoading(false); return; }
    } else {
      const { error } = await signUp.email({ email, password, name });
      if (error) { setError(error.message ?? "Error al crear cuenta"); setLoading(false); return; }
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="px-12 py-6 flex items-center justify-between">
        <Link href="/" className="text-[15px] font-semibold tracking-[-0.01em] text-t1">
          TrainURSelf
        </Link>
        <span className="meta">
          {mode === "login" ? "¿Aún no tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
            className="link-accent bg-transparent border-0 cursor-pointer text-xs"
          >
            {mode === "login" ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center p-12">
        <div className="w-[400px]">
          <h1 className="text-[32px] font-semibold tracking-[-0.025em] mb-2.5 text-t1">
            {mode === "login" ? "Bienvenido de vuelta." : "Crea tu cuenta."}
          </h1>
          <p className="text-[15px] text-t2 mb-9">
            {mode === "login" ? "Inicia sesión para retomar tu rutina." : "14 días gratis, sin tarjeta de crédito."}
          </p>

          {error && (
            <div className="bg-[rgba(224,123,74,0.10)] border border-[rgba(224,123,74,0.3)] rounded-lg px-3.5 py-3 mb-5 text-sm text-warn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <>
                <label className={labelClass}>Nombre</label>
                <input
                  required type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Carlos Mendoza"
                  className={inputClass}
                />
              </>
            )}

            <label className={labelClass}>Correo</label>
            <input
              required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className={inputClass}
            />

            <div className="flex justify-between items-center mb-2">
              <label className="text-[12px] text-t2 tracking-[0.04em] uppercase font-semibold">Contraseña</label>
              {mode === "login" && (
                <a href="#" className="link-accent text-xs">Olvidé mi contraseña</a>
              )}
            </div>
            <input
              required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} mb-7`}
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-[15px]"
            >
              {loading
                ? (mode === "login" ? "Entrando…" : "Creando cuenta…")
                : (mode === "login" ? "Iniciar sesión" : "Crear cuenta")}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

const labelClass = "block text-[12px] text-t2 tracking-[0.04em] uppercase font-semibold mb-2";
const inputClass  = "w-full bg-surface border border-border rounded-lg px-3.5 py-3 text-t1 text-[15px] outline-none mb-4 block transition-colors duration-150 focus:border-accent";
