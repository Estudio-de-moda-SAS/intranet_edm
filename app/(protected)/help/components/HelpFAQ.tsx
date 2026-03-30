"use client";

// app/(protected)/(intranet)/help/components/HelpFAQ.tsx

import { useState } from "react";
import { ChevronRight } from "lucide-react";

const faqs = [
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

export default function HelpFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">
          Preguntas frecuentes
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Las consultas más comunes resueltas al instante
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {faqs.map(({ q, a }, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-[13px] font-medium text-slate-800">{q}</span>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                  open === i ? "rotate-90" : ""
                }`}
              />
            </button>
            {open === i && (
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