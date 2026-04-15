/**
 * @module HelpPlatformSection
 * Sección del asistente conversacional "Stilo" dentro del módulo de ayuda.
 *
 * @remarks
 * Este componente integra un asistente basado en inteligencia artificial
 * que permite a los usuarios resolver dudas de manera inmediata sin necesidad
 * de crear tickets.
 *
 * Funcionalidades principales:
 *
 * - mostrar estado del asistente (activo 24/7)
 * - ofrecer sugerencias rápidas de preguntas frecuentes
 * - renderizar el componente {@link CorporateBot}
 *
 * Es un **Client Component** debido a la interacción con el chatbot.
 */

"use client";

// app/(protected)/(intranet)/help/components/HelpStiloSection.tsx

import CorporateBot from "@/app/components/header/chatbot/ChatBot";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Lista de sugerencias disponibles para el usuario.
 *
 * @remarks
 * Representa preguntas frecuentes que pueden servir como punto de entrada
 * para interactuar con el asistente.
 */
type Suggestion = string;

/* -------------------------------------------------------------------------- */
/* Datos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Sugerencias rápidas mostradas en la interfaz.
 *
 * @remarks
 * Estas sugerencias no están conectadas directamente al chatbot aún,
 * pero sirven como guía visual para el usuario.
 *
 * En el futuro podrían:
 *
 * - enviar automáticamente mensajes al bot
 * - ser dinámicas desde backend
 * - variar según contexto o rol
 */
const suggestions: readonly Suggestion[] = [
  "¿Cómo reseteo mi contraseña?",
  "Estado de mi ticket",
  "Conectar impresora de red",
  "Solicitar instalación de software",
  "Configurar VPN desde casa",
  "Reportar un incidente",
];

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Sección del asistente Stilo.
 *
 * @returns Bloque de UI con chatbot + sugerencias rápidas.
 *
 * @remarks
 * Este componente combina:
 *
 * - una capa informativa (estado del asistente)
 * - una capa de sugerencias (quick prompts)
 * - una capa interactiva (chatbot)
 *
 * Flujo esperado:
 *
 * 1. El usuario visualiza sugerencias
 * 2. Interactúa con el chatbot
 * 3. Resuelve su duda sin necesidad de soporte humano
 *
 * @example
 * ```tsx
 * <HelpStiloSection />
 * ```
 */
export default function HelpStiloSection() {
  return (
    <div className="w-full">

      {/* ============================================================ */}
      {/* Header                                                       */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Asistente Stilo
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Resuelve dudas al instante con inteligencia artificial · Disponible 24/7
          </p>
        </div>

        {/* Estado del asistente */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-[11px] font-semibold text-violet-700">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block animate-pulse" />
          Activo
        </span>
      </div>

      {/* ============================================================ */}
      {/* Sugerencias rápidas                                          */}
      {/* ============================================================ */}
      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2.5">
          Preguntas frecuentes
        </p>

        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <span
              key={suggestion}
              className="text-[11px] bg-violet-50 border border-violet-200 text-violet-700 px-3 py-1.5 rounded-full cursor-pointer hover:bg-violet-100 hover:border-violet-300 transition-colors"
            >
              {suggestion}
            </span>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* Chatbot                                                      */}
      {/* ============================================================ */}
      <div className="w-full [&>div]:max-w-none [&>div]:w-full">
        <CorporateBot variant="expanded" />
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-300 text-center mt-4">
        Stilo es un asistente experimental · Las respuestas pueden no ser 100% precisas
      </p>

    </div>
  );
}