/**
 * @module ChatBot
 * Componente cliente encargado de renderizar el acceso principal al chatbot
 * corporativo y gestionar el inicio de conversaciones desde la interfaz.
 *
 * @remarks
 * Este archivo implementa la entrada visual del asistente conversacional,
 * permitiendo dos modos de presentación:
 *
 * - Un modo compacto mediante {@link ChatBotButton}.
 * - Un modo expandido con campo de entrada integrado.
 *
 * Su responsabilidad incluye:
 *
 * - Renderizar la variante visual correspondiente según las props.
 * - Gestionar el estado local del texto ingresado por el usuario.
 * - Iniciar una conversación mediante {@link useChatbotStore}.
 * - Abrir y cerrar el panel del chatbot.
 * - Montar el panel conversacional en el `document.body` mediante portal.
 *
 * Este componente se ejecuta del lado del cliente porque depende de estado
 * local, eventos de teclado, interacción de usuario y APIs del navegador
 * como `document` y `window`.
 */

'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Send, Sparkles } from 'lucide-react';
import ChatBotButton from './ChatBotButton';
import ChatBotPanel from './ChatBotPanel';
import { useChatbotStore } from '@/stores/ChatBotStore';

/**
 * Props del componente {@link CorporateBot}.
 */
interface Props {
  /**
   * Variante visual del acceso al chatbot.
   *
   * @remarks
   * Valores soportados:
   * - `"default"`: muestra un botón compacto.
   * - `"expanded"`: muestra una tarjeta expandida con input embebido.
   *
   * @defaultValue "default"
   */
  variant?: 'default' | 'expanded';

  /**
   * Indica si el botón compacto debe mostrarse únicamente como icono.
   *
   * @defaultValue false
   */
  iconOnly?: boolean;
}

/**
 * Componente cliente que renderiza la entrada principal al chatbot corporativo.
 *
 * @param props Propiedades del componente.
 * @param props.variant Variante visual del acceso al chatbot.
 * @param props.iconOnly Indica si el botón compacto se renderiza solo como icono.
 * @returns Interfaz de acceso al chatbot junto con el panel montado en portal.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Obtiene desde {@link useChatbotStore} el estado de apertura del chatbot
 *    y las acciones para iniciar o cerrar conversaciones.
 * 2. Gestiona un estado local `input` para almacenar el texto escrito
 *    por el usuario.
 * 3. Si la variante es `"expanded"`:
 *    - Renderiza una tarjeta expandida con ícono, mensaje introductorio
 *      y campo de entrada.
 *    - Permite enviar el mensaje mediante botón o tecla `Enter`.
 * 4. Si la variante es `"default"`:
 *    - Renderiza un acceso compacto mediante {@link ChatBotButton}.
 * 5. Si el entorno es navegador:
 *    - Renderiza {@link ChatBotPanel} mediante `createPortal`
 *      en `document.body`.
 *
 * Este componente funciona como punto de entrada principal para la experiencia
 * conversacional del asistente corporativo.
 */
export default function CorporateBot({ variant = 'default', iconOnly = false }: Props) {
  /**
   * Estado y acciones globales del chatbot.
   *
   * @remarks
   * Se obtienen desde {@link useChatbotStore} para:
   * - conocer si el panel está abierto,
   * - cerrarlo,
   * - e iniciar una nueva conversación.
   */
  const { open, closeChat, startConversation } = useChatbotStore();

  /**
   * Estado local del texto ingresado por el usuario.
   */
  const [input, setInput] = useState("");

  /**
   * Envía el contenido actual del input al flujo de conversación.
   *
   * @returns No retorna valor.
   *
   * @remarks
   * Flujo de ejecución:
   *
   * 1. Elimina espacios sobrantes del texto actual.
   * 2. Si el texto está vacío, no realiza ninguna acción.
   * 3. Si contiene contenido válido:
   *    - inicia la conversación con {@link startConversation},
   *    - limpia el input local.
   */
  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    startConversation(text);
    setInput("");
  };

  /**
   * Maneja la interacción de teclado sobre el campo de entrada.
   *
   * @param e Evento de teclado del input.
   * @returns No retorna valor.
   *
   * @remarks
   * Cuando la tecla presionada es `Enter`, previene el comportamiento
   * por defecto y ejecuta {@link handleSend}.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {variant === 'expanded' ? (
        <div className="
          w-full max-w-2xl relative overflow-hidden rounded-xl
          transition-all duration-300 cursor-pointer
          hover:scale-[1.012]

          /* ── Light: gradiente vivo ── */
          bg-gradient-to-r from-violet-600 via-violet-500 to-purple-600
          shadow-lg shadow-violet-200/70
          hover:shadow-xl hover:shadow-violet-300/50
          hover:brightness-105

          /* ── Dark: tono apagado, sin neon ── */
          dark:bg-none dark:bg-[#1c2128]
          dark:border dark:border-violet-500/20
          dark:shadow-none dark:hover:border-violet-500/35
          dark:hover:brightness-100

          px-5 py-4
        ">
          {/* Decoración light-only */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl dark:hidden" />
          <div className="pointer-events-none absolute -bottom-4 left-1/3 h-16 w-16 rounded-full bg-fuchsia-400/20 blur-lg dark:hidden" />

          {/* Decoración dark-only: acento sutil en esquina */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-500/[0.08] blur-2xl hidden dark:block" />

          <div className="relative flex items-center gap-3">
            {/* Icono */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                            bg-white/15 border border-white/20
                            dark:bg-violet-500/[0.12] dark:border-violet-500/25">
              <Sparkles className="h-4 w-4 text-white dark:text-violet-400" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Label */}
              <p className="text-[12px] leading-none mb-2
                            text-white/80 dark:text-[#768390]">
                Hola, soy{" "}
                <span className="font-semibold text-white dark:text-[#cdd9e5]">Stilo</span>
                {" "}· ¿En qué te ayudo?
              </p>

              {/* Input */}
              <div className="flex items-center rounded-lg px-3 py-2 gap-2 transition-all
                              bg-white/95 focus-within:ring-2 focus-within:ring-white/40
                              dark:bg-[#161b22] dark:border dark:border-[#30363d]
                              dark:focus-within:border-violet-500/50 dark:focus-within:ring-violet-500/15">
                <input
                  id="chatbot-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Haz tu pregunta aquí..."
                  className="flex-1 bg-transparent outline-none text-sm
                             text-slate-700 placeholder:text-slate-400
                             dark:text-[#cdd9e5] dark:placeholder:text-[#545d68]"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="flex items-center justify-center rounded-md p-1.5 transition-colors
                             text-violet-400 hover:text-violet-600 hover:bg-violet-50
                             dark:text-[#545d68] dark:hover:text-violet-400 dark:hover:bg-violet-500/[0.10]"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ChatBotButton onClick={() => startConversation("")} iconOnly={iconOnly} />
      )}

      {typeof window !== 'undefined' &&
        createPortal(
          <ChatBotPanel open={open} onClose={closeChat} />,
          document.body
        )
      }
    </>
  );
}