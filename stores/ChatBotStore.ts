/**
 * @module stores/chatbot
 * Store de Zustand para el estado global del chatbot de la intranet EDM.
 *
 * @remarks
 * Gestiona la visibilidad del panel del chatbot y el mensaje inicial
 * de una conversación. Al ser un store global, cualquier componente
 * puede abrir el chatbot con un mensaje predefinido sin necesidad de
 * prop drilling.
 *
 * **Casos de uso principales:**
 * - Botón flotante del chatbot → `openChat()`
 * - Quick action "Consultar al asistente" → `startConversation(mensaje)`
 * - Cerrar el panel → `closeChat()`
 *
 * @example
 * ```tsx
 * // Abrir el chatbot con un mensaje predefinido desde cualquier componente:
 * const { startConversation } = useChatbotStore();
 *
 * <button onClick={() => startConversation("¿Cómo solicito vacaciones?")}>
 *   Consultar asistente
 * </button>
 * ```
 */

import { create } from "zustand";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Estado y acciones del store del chatbot.
 */
interface ChatbotState {
  /**
   * `true` si el panel del chatbot está actualmente visible.
   * Controlado por {@link ChatbotState.openChat} y
   * {@link ChatbotState.closeChat}.
   */
  open: boolean;

  /**
   * Mensaje inicial con el que se abre una conversación nueva.
   * `null` cuando no hay mensaje predefinido — el chatbot abre
   * con el prompt vacío por defecto.
   *
   * @remarks
   * Debe limpiarse con {@link ChatbotState.clearFirstMessage} una vez
   * que el componente del chatbot lo haya consumido para evitar que
   * se reenvíe en aperturas posteriores.
   */
  firstMessage: string | null;

  /**
   * Abre el panel del chatbot sin mensaje inicial predefinido.
   *
   * @remarks
   * Equivalente a `startConversation("")` pero semánticamente más
   * claro cuando no se quiere precargar ningún mensaje.
   */
  openChat: () => void;

  /**
   * Cierra el panel del chatbot.
   *
   * @remarks
   * No limpia `firstMessage` — si el colaborador vuelve a abrir el
   * chatbot mediante `openChat()`, el mensaje anterior no se reenvía
   * porque el componente solo lo consume una vez.
   */
  closeChat: () => void;

  /**
   * Abre el panel del chatbot con un mensaje inicial predefinido.
   *
   * @remarks
   * El componente del chatbot debe llamar a
   * {@link ChatbotState.clearFirstMessage} después de enviar el
   * mensaje inicial para evitar que se reenvíe si el panel se cierra
   * y vuelve a abrirse.
   *
   * @param message - Mensaje con el que iniciar la conversación.
   *   Se envía automáticamente al chatbot al abrirse el panel.
   *
   * @example
   * ```tsx
   * startConversation("¿Cuál es el proceso para solicitar un permiso?");
   * ```
   */
  startConversation: (message: string) => void;

  /**
   * Limpia el mensaje inicial después de que el componente del chatbot
   * lo haya consumido.
   *
   * @remarks
   * Debe llamarse desde el componente del chatbot inmediatamente
   * después de enviar `firstMessage` al hilo de conversación, para
   * que la próxima apertura del panel comience con el prompt vacío.
   */
  clearFirstMessage: () => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * Store global del chatbot de la intranet EDM.
 *
 * @remarks
 * Implementado con Zustand para minimizar re-renders — solo los
 * componentes suscritos a los campos que cambian se vuelven a renderizar.
 *
 * Para abrir el chatbot desde cualquier parte de la app sin re-renderizar
 * el componente padre, usar el selector de acción directamente:
 *
 * ```tsx
 * // ✅ Solo suscribe a la acción — no re-renderiza cuando cambia `open`
 * const startConversation = useChatbotStore(s => s.startConversation);
 *
 * // ⚠️ Suscribe a todo el estado — re-renderiza en cualquier cambio
 * const { startConversation } = useChatbotStore();
 * ```
 */
export const useChatbotStore = create<ChatbotState>((set) => ({
  open:         false,
  firstMessage: null,

  openChat: () => set({ open: true }),

  closeChat: () => set({ open: false }),

  startConversation: (message) =>
    set({
      open:         true,
      firstMessage: message,
    }),

  clearFirstMessage: () => set({ firstMessage: null }),
}));