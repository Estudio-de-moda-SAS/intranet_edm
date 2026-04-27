/**
 * @module ChatBotButton
 * Componente cliente que representa el botón de acceso al chatbot corporativo.
 *
 * @remarks
 * Este archivo implementa un botón reutilizable que permite abrir el chatbot,
 * ya sea en formato completo (con texto) o en modo compacto (solo icono).
 *
 * Su responsabilidad incluye:
 *
 * - Ejecutar una acción al hacer clic mediante la prop `onClick`.
 * - Adaptar su presentación visual según el modo `iconOnly`.
 * - Aplicar estilos diferenciados para modo claro y oscuro.
 * - Mostrar un icono representativo del chatbot.
 *
 * Este componente actúa como punto de entrada visual al asistente
 * conversacional dentro de la interfaz.
 */

'use client';

import { MessageCircle } from 'lucide-react';

/**
 * Props del componente {@link ChatBotButton}.
 */
interface Props {
  /**
   * Función que se ejecuta al hacer clic en el botón.
   *
   * @remarks
   * Generalmente se utiliza para abrir el panel del chatbot
   * o iniciar una conversación.
   */
  onClick: () => void;

  /**
   * Indica si el botón debe mostrarse únicamente como icono.
   *
   * @remarks
   * - `true`: botón compacto sin texto.
   * - `false`: botón con texto y icono.
   *
   * @defaultValue false
   */
  iconOnly?: boolean;
}

/**
 * Componente cliente que renderiza un botón estilizado para acceder al chatbot.
 *
 * @param props Propiedades del componente.
 * @param props.onClick Función que se ejecuta al interactuar con el botón.
 * @param props.iconOnly Define si se muestra solo el icono.
 * @returns Botón interactivo con estilos dinámicos.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Renderiza un botón con estilos adaptativos (modo claro y oscuro).
 * 2. Ajusta su tamaño y contenido según la prop `iconOnly`:
 *    - Si es `true`, muestra únicamente el icono.
 *    - Si es `false`, muestra icono y texto.
 * 3. Ejecuta la función `onClick` al hacer interacción del usuario.
 *
 * Este componente está diseñado para integrarse fácilmente en distintas
 * secciones de la aplicación como acceso rápido al chatbot.
 */
export default function ChatBotButton({ onClick, iconOnly = false }: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden flex items-center gap-2 rounded-lg
        text-sm font-medium text-white
        transition-all duration-200
        active:scale-[0.98]

        /* ── Light: gradiente vivo ── */
        bg-gradient-to-r from-violet-600 to-purple-600
        shadow-md shadow-violet-200
        hover:shadow-lg hover:shadow-violet-300/50 hover:scale-[1.03]

        /* ── Dark: sólido apagado ── */
        dark:bg-none dark:bg-[#21262d]
        dark:border dark:border-violet-500/25
        dark:text-violet-400
        dark:shadow-none dark:hover:bg-[#30363d] dark:hover:border-violet-500/40
        dark:hover:text-violet-300 dark:hover:scale-[1.03]

        ${iconOnly ? 'h-8 w-8 justify-center' : 'px-4 py-2'}
      `}
    >
      {/* Capa de overlay para efecto hover en modo claro */}
      <span className="pointer-events-none absolute inset-0 rounded-lg bg-white/0 hover:bg-white/10 transition-colors duration-200 dark:hidden" />

      {/* Icono principal del botón */}
      <MessageCircle className="relative h-4 w-4" />

      {/* Texto del botón (solo si no es modo iconOnly) */}
      {!iconOnly && <span className="relative">Stilo</span>}
    </button>
  );
}