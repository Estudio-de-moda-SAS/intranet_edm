/**
 * @module HelpFAQ
 * Sección de preguntas frecuentes del Help Center.
 *
 * @remarks
 * Este componente renderiza una lista de preguntas frecuentes en formato
 * acordeón, permitiendo expandir y contraer respuestas de forma interactiva.
 *
 * Su objetivo es reducir la fricción del usuario al ofrecer respuestas
 * inmediatas a dudas comunes sin necesidad de abrir un ticket.
 *
 * Es un **Client Component** porque maneja estado local para controlar
 * qué elemento del acordeón se encuentra abierto.
 */

"use client";

// app/(protected)/(intranet)/help/components/HelpFAQ.tsx

import { useState } from "react";
import { ChevronRight } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Estructura de una pregunta frecuente.
 *
 * @property q Texto de la pregunta.
 * @property a Texto de la respuesta.
 */
interface FAQItem {
  q: string;
  a: string;
}

/* -------------------------------------------------------------------------- */
/* Datos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Lista de preguntas frecuentes del módulo de ayuda.
 *
 * @remarks
 * Actualmente es una configuración estática. En el futuro podría migrarse a:
 *
 * - un CMS
 * - una base de conocimiento
 * - una API de contenido
 */
const faqs: readonly FAQItem[] = [
  {
    q: "¿Cuánto tiempo tarda en resolverse un ticket normal?",
    a: "Los tickets de prioridad normal se atienden en un máximo de 4 horas hábiles. Si no recibes respuesta, puedes escalar desde el portal o escribir al correo de soporte.",
  },
  {
    q: "¿Cómo instalo software en mi equipo corporativo?",
    a: "Todo software debe ser aprobado por IT. Abre un ticket con la categoría «Instalación de software» adjuntando la justificación. No instales programas sin autorización; podría bloquear tu equipo.",
  },
  {
    q: "¿Qué hago si olvido mi contraseña y no puedo ingresar?",
    a: "Llama a la extensión 1200 o pide ayuda a recepción. Un agente IT puede darte acceso temporal mientras restableces tu contraseña de forma segura.",
  },
  {
    q: "¿Puedo conectarme desde un dispositivo personal?",
    a: "Sí, usando VPN y autenticación de doble factor (MFA). Consulta la guía «Acceso VPN desde casa» en la sección de guías de autoservicio.",
  },
  {
    q: "¿Qué hago si recibo un correo sospechoso o phishing?",
    a: "No hagas clic en ningún enlace. Reenvía el correo a seguridad@empresa.com y elimínalo de tu bandeja. Si ya hiciste clic, reporta un ticket con prioridad alta inmediatamente.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Sección interactiva de preguntas frecuentes.
 *
 * @returns Acordeón de FAQs con apertura individual.
 *
 * @remarks
 * Este componente permite expandir una sola respuesta a la vez.
 *
 * Flujo de interacción:
 *
 * 1. El usuario hace clic en una pregunta
 * 2. Si la pregunta ya está abierta, se cierra
 * 3. Si no está abierta, se expande y muestra su respuesta
 *
 * Esto permite una navegación compacta y clara dentro de la sección
 * de autoservicio del Help Center.
 *
 * @example
 * ```tsx
 * <HelpFAQ />
 * ```
 */
export default function HelpFAQ() {
  /**
   * Índice de la pregunta actualmente abierta.
   *
   * @remarks
   * Si el valor es `null`, no hay ninguna respuesta expandida.
   */
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">
          Preguntas frecuentes
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Las consultas más comunes resueltas al instante
        </p>
      </div>

      {/* FAQ items */}
      <div className="divide-y divide-slate-100">
        {faqs.map(({ q, a }, index) => (
          <div key={index}>
            <button
              onClick={() => setOpen(open === index ? null : index)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-[13px] font-medium text-slate-800">
                {q}
              </span>

              <ChevronRight
                className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                  open === index ? "rotate-90" : ""
                }`}
              />
            </button>

            {open === index && (
              <p className="px-5 pb-4 text-[13px] text-slate-500 leading-relaxed">
                {a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}