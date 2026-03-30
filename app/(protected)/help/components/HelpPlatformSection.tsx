"use client";

// app/(protected)/(intranet)/help/components/HelpStiloSection.tsx

import CorporateBot from "@/app/components/header/chatbot/ChatBot";

const suggestions = [
  "¿Cómo reseteo mi contraseña?",
  "Estado de mi ticket",
  "Conectar impresora de red",
  "Solicitar instalación de software",
  "Configurar VPN desde casa",
  "Reportar un incidente",
];

export default function HelpStiloSection() {
  return (
    <div className="w-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Asistente Stilo
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Resuelve dudas al instante con inteligencia artificial · Disponible 24/7
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-[11px] font-semibold text-violet-700">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block animate-pulse" />
          Activo
        </span>
      </div>

      {/* ── Sugerencias rápidas ── */}
      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2.5">
          Preguntas frecuentes
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <span
              key={s}
              className="text-[11px] bg-violet-50 border border-violet-200 text-violet-700 px-3 py-1.5 rounded-full cursor-pointer hover:bg-violet-100 hover:border-violet-300 transition-colors"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ── CorporateBot — forzado a ancho completo ── */}
      <div className="w-full [&>div]:max-w-none [&>div]:w-full">
        <CorporateBot variant="expanded" />
      </div>

      <p className="text-[10px] text-slate-300 text-center mt-4">
        Stilo es un asistente experimental · Las respuestas pueden no ser 100% precisas
      </p>

    </div>
  );
}