/**
 * @module LoginPage
 * Página de inicio de sesión de la intranet corporativa.
 *
 * @remarks
 * Este componente representa la experiencia de acceso principal
 * para los usuarios de la plataforma, utilizando autenticación
 * corporativa con Microsoft 365 mediante NextAuth.
 *
 * La vista se divide en dos paneles principales:
 *
 * - panel izquierdo: branding e identidad corporativa
 * - panel derecho: tarjeta de autenticación
 *
 * Es un **Client Component** porque:
 *
 * - maneja estado local de carga
 * - utiliza `useSearchParams`
 * - ejecuta `signIn` en cliente
 * - incorpora animaciones con `framer-motion`
 */

"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import Image from "next/image";

// ── Microsoft logo SVG ────────────────────────────────────────────

/**
 * Logo simplificado de Microsoft en formato SVG.
 *
 * @param props Propiedades del componente.
 * @param props.size Tamaño del ícono en píxeles.
 * @returns SVG del logotipo de Microsoft.
 *
 * @remarks
 * Se utiliza como elemento visual dentro del botón de acceso SSO.
 */
function MicrosoftLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1"  y="1"  width="9" height="9" fill="#F25022" />
      <rect x="11" y="1"  width="9" height="9" fill="#7FBA00" />
      <rect x="1"  y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

// ── Background blobs ──────────────────────────────────────────────

/**
 * Fondo decorativo animado para la página de login.
 *
 * @returns Elementos visuales de fondo con blobs y patrón de puntos.
 *
 * @remarks
 * Este componente no tiene funcionalidad interactiva.
 * Su objetivo es enriquecer la estética del login mediante:
 *
 * - blobs animados
 * - degradados suaves
 * - patrón de puntos decorativo
 */
function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-violet-200/70 blur-[120px]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-fuchsia-200/50 blur-[100px]"
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 h-[300px] w-[300px] rounded-full bg-indigo-200/40 blur-[80px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.055]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="login-dots" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#7c3aed" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-dots)" />
      </svg>
    </div>
  );
}

// ── Department pills ──────────────────────────────────────────────

/**
 * Lista de áreas o módulos destacados de la plataforma.
 *
 * @remarks
 * Se utiliza en el panel izquierdo como refuerzo visual del alcance
 * funcional de la intranet.
 */
const FEATURES = [
  { label: "Recursos Humanos",  delay: 0    },
  { label: "Finanzas",          delay: 0.12 },
  { label: "Área Comercial",    delay: 0.24 },
  { label: "E-Commerce",        delay: 0.36 },
  { label: "Tecnología",        delay: 0.48 },
  { label: "Operaciones",       delay: 0.60 },
];

// ── Page ──────────────────────────────────────────────────────────

/**
 * Página principal de inicio de sesión.
 *
 * @returns Interfaz de login con branding corporativo y autenticación Microsoft.
 *
 * @remarks
 * Flujo principal:
 *
 * 1. El usuario pulsa el botón de acceso.
 * 2. Se activa el estado local `loading`.
 * 3. Se lee `callbackUrl` desde query params.
 * 4. Se valida que la ruta sea interna para evitar open redirects.
 * 5. Se inicia autenticación con `signIn("microsoft-entra-id")`.
 *
 * Este componente combina:
 *
 * - branding corporativo
 * - navegación segura hacia SSO
 * - animaciones de entrada y microinteracciones
 *
 * @example
 * ```tsx
 * <LoginPage />
 * ```
 */
export default function LoginPage() {
  /**
   * Estado de carga del proceso de autenticación.
   */
  const [loading, setLoading] = useState(false);

  /**
   * Parámetros de búsqueda de la URL actual.
   *
   * @remarks
   * Se utiliza para leer `callbackUrl` enviado por middleware o rutas protegidas.
   */
  const searchParams = useSearchParams();

  /**
   * Inicia el flujo de autenticación con Microsoft Entra ID.
   *
   * @remarks
   * - Lee `callbackUrl` del query string.
   * - Valida que la URL sea interna.
   * - Redirige al proveedor configurado en NextAuth.
   */
  const handleLogin = async () => {
    setLoading(true);

    // Leer callbackUrl del query param que mandó el middleware
    // Validar que sea ruta interna para evitar open redirect
    const raw = searchParams.get("callbackUrl") ?? "/dashboard";
    const callbackUrl =
      raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";

    await signIn("microsoft-entra-id", { callbackUrl });
  };

  return (
    <div
      className="relative flex min-h-screen w-full overflow-hidden bg-slate-50"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      <BackgroundBlobs />

      {/* ── Left panel — branding ─────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[58%] flex-col justify-between px-16 py-14">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <Image
            src="/brand/edmIcon.png"
            alt="Estudio de Moda"
            width={44}
            height={44}
            className="rounded-full"
            priority
          />
          <div>
            <p className="text-[13px] font-bold text-violet-900 leading-none tracking-tight">Estudio de Moda</p>
            <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">S.A.S.</p>
          </div>
        </motion.div>

        {/* Hero copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-violet-600 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
              Intranet Corporativa
            </span>

            <h1 className="text-[52px] font-bold leading-[1.08] tracking-tight text-slate-900">
              Tu espacio de<br />
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 bg-clip-text text-transparent">
                trabajo digital
              </span>
            </h1>

            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-slate-500">
              Accede a todas las herramientas, reportes y recursos de cada área desde un solo lugar seguro y conectado.
            </p>
          </motion.div>

          {/* Department pills */}
          <div className="mt-10 flex flex-wrap gap-2">
            {FEATURES.map((f) => (
              <motion.span
                key={f.label}
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.4 + f.delay }}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-medium text-slate-600 shadow-sm hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 transition-all duration-150 cursor-default"
              >
                {f.label}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex items-center gap-2 text-[12px] text-slate-400"
        >
          <Shield className="h-3.5 w-3.5" />
          Acceso protegido con autenticación Microsoft 365 · SSO Corporativo
        </motion.div>
      </div>

      {/* Vertical divider */}
      <div className="hidden lg:block absolute left-[58%] inset-y-0 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />

      {/* ── Right panel — login card ──────────────────────────── */}
      <div className="relative flex w-full lg:w-[42%] items-center justify-center px-6 py-12 bg-white/50 backdrop-blur-sm">

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/80">

            {/* Welcome */}
            <div className="mb-8">
              <h2 className="text-[21px] font-bold text-slate-900 leading-tight">
                Bienvenido a la Intranet
              </h2>
              <p className="mt-2 text-[13px] text-slate-500 leading-relaxed">
                Usa tu cuenta corporativa de Microsoft para acceder de forma segura.
              </p>
            </div>

            {/* Divider */}
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Acceso SSO · Microsoft 365
                </span>
              </div>
            </div>

            {/* Microsoft button — single CTA */}
            <motion.button
              onClick={handleLogin}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.015 }}
              whileTap={{ scale: loading ? 1 : 0.985 }}
              className="group relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm transition-all duration-200 hover:border-violet-200 hover:shadow-md hover:shadow-violet-100/60 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-violet-50/70 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              <div className="relative flex items-center justify-center gap-3">
                {loading
                  ? <svg className="h-4 w-4 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  : <MicrosoftLogo size={18} />
                }
                <span className="text-[14px] font-semibold text-slate-800">
                  {loading ? "Redirigiendo a Microsoft..." : "Continuar con Microsoft"}
                </span>
                {!loading && (
                  <ArrowRight className="ml-auto h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-violet-500" />
                )}
              </div>
            </motion.button>

            {/* Security note */}
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <Shield className="mt-px h-3.5 w-3.5 shrink-0 text-violet-500" />
              <p className="text-[11px] text-slate-500 leading-snug">
                Tu sesión estará protegida por autenticación multifactor de Microsoft. Solo personal autorizado puede acceder.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-[11px] text-slate-400">
            ¿Problemas para ingresar?{" "}
            <a
              href="mailto:soporte@estudiomoda.com"
              className="font-semibold text-violet-600 hover:text-violet-700 transition-colors"
            >
              Contacta a TI
            </a>
          </p>

        </motion.div>
      </div>
    </div>
  );
}