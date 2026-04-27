/**
 * @module HelpContactSection
 * Sección de canales de soporte del Help Center.
 *
 * @remarks
 * Este componente permite al usuario acceder rápidamente a los
 * diferentes medios de contacto con el equipo de soporte.
 *
 * Incluye canales como:
 *
 * - chat en vivo (integrado con chatbot interno)
 * - correo electrónico
 * - línea telefónica
 * - portal de tickets
 *
 * Cada canal define su propia acción, lo que desacopla completamente
 * la lógica de interacción de la UI.
 */

"use client";

import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Mail,
  Phone,
  Ticket,
} from "lucide-react";
import { useChatbotStore } from "@/stores/ChatBotStore";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Representa un canal de contacto disponible para soporte.
 *
 * @remarks
 * Cada canal define:
 *
 * - un icono representativo
 * - nombre y descripción
 * - estilos visuales
 * - una acción ejecutable al hacer click
 */
type Channel = {
  icon: React.ElementType;
  name: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  action: () => void;
};

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Sección de canales de soporte del usuario.
 *
 * @returns Grid interactivo con opciones de contacto.
 *
 * @remarks
 * Este componente actúa como un hub de acceso rápido a soporte,
 * permitiendo diferentes formas de interacción según el contexto:
 *
 * - soporte inmediato → chat
 * - solicitudes formales → tickets
 * - incidencias críticas → teléfono
 * - comunicación asincrónica → correo
 *
 * También integra:
 *
 * - navegación con Next.js (`useRouter`)
 * - estado global del chatbot (`useChatbotStore`)
 *
 * @example
 * ```tsx
 * <HelpContactSection />
 * ```
 */
export default function HelpContactSection() {
  const router = useRouter();

  /**
   * Función para abrir el chatbot corporativo.
   */
  const { openChat } = useChatbotStore();

  /**
   * Configuración de canales disponibles.
   *
   * @remarks
   * Cada canal define su comportamiento mediante `action`,
   * permitiendo extender fácilmente nuevas opciones de soporte.
   */
  const channels: Channel[] = [
    {
      icon: MessageSquare,
      name: "Chat en vivo",
      desc: "Respuesta inmediata · lun–vie 8–18 h",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-700",
      action: () => openChat(),
    },
    {
      icon: Mail,
      name: "Correo IT",
      desc: "it-support@empresa.com",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
      action: () => {
        window.location.href =
          "mailto:it-support@empresa.com?subject=Soporte IT&body=Hola equipo, necesito ayuda con:";
      },
    },
    {
      icon: Phone,
      name: "Teléfono urgencias",
      desc: "Ext. 1200 · Solo incidencias críticas",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-700",
      action: () => {
        window.location.href = "tel:1200";
      },
    },
    {
      icon: Ticket,
      name: "Portal de tickets",
      desc: "Seguimiento y historial completo",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-700",
      action: () => {
        router.push("/help/tickets");
      },
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">
          Canales de soporte
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Elige la vía según la urgencia de tu solicitud
        </p>
      </div>

      {/* Grid de canales */}
      <div className="p-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {channels.map(
          ({ icon: Icon, name, desc, iconBg, iconColor, action }) => (
            <button
              key={name}
              onClick={action}
              className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-blue-400 hover:bg-blue-50/40 transition-all group active:scale-[0.98]"
            >
              <span
                className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </span>

              <div>
                <p className="text-[12px] font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                  {name}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {desc}
                </p>
              </div>
            </button>
          )
        )}
      </div>
    </div>
  );
}