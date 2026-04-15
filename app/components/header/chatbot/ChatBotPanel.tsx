/**
 * @module ChatBotPanel
 * Componente cliente encargado de renderizar el panel conversacional del
 * chatbot corporativo y gestionar el flujo completo de interacción.
 *
 * @remarks
 * Este archivo implementa la interfaz principal del asistente conversacional,
 * incluyendo:
 *
 * - Visualización del historial de mensajes.
 * - Envío de mensajes del usuario.
 * - Consumo de respuestas desde el endpoint `/api/chatbot`.
 * - Renderizado progresivo de la respuesta del asistente.
 * - Control de foco automático y desplazamiento al último mensaje.
 *
 * Su responsabilidad principal es servir como contenedor interactivo del chat,
 * coordinando estado local, comunicación con la API y representación visual
 * de la conversación.
 *
 * Este componente se ejecuta del lado del cliente porque utiliza estado local,
 * efectos, referencias al DOM y llamadas a `fetch`.
 */

'use client';

import { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, Bot, Loader2 } from "lucide-react";
import { useChatbotStore } from "@/stores/ChatBotStore";

/**
 * Representa un mensaje dentro de la conversación.
 */
interface Message {
  /**
   * Rol del emisor del mensaje.
   *
   * @remarks
   * Valores soportados:
   * - `"user"`: mensaje enviado por el usuario.
   * - `"assistant"`: mensaje generado por el asistente.
   */
  role: "user" | "assistant";

  /**
   * Contenido textual del mensaje.
   */
  text: string;
}

/**
 * Props del componente {@link ChatBotPanel}.
 */
interface Props {
  /**
   * Indica si el panel del chatbot debe mostrarse.
   */
  open: boolean;

  /**
   * Función que se ejecuta al cerrar el panel.
   */
  onClose: () => void;
}

/**
 * Componente cliente que renderiza el panel principal del chatbot.
 *
 * @param props Propiedades del componente.
 * @param props.open Indica si el panel está visible.
 * @param props.onClose Función para cerrar el panel.
 * @returns Panel lateral del chatbot o `null` si no está abierto.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Obtiene desde {@link useChatbotStore} el primer mensaje pendiente.
 * 2. Inicializa el estado local del input, historial y carga.
 * 3. Si existe un primer mensaje:
 *    - Lo agrega al historial.
 *    - Limpia el mensaje inicial del store.
 *    - Solicita la respuesta del asistente.
 * 4. Cuando el panel se abre:
 *    - Intenta enfocar automáticamente el input.
 * 5. Cuando cambian los mensajes o el estado de carga:
 *    - Hace scroll hasta el final de la conversación.
 * 6. Permite enviar mensajes manualmente desde el input.
 * 7. Consume la respuesta del backend por streaming y actualiza
 *    progresivamente el último mensaje del asistente.
 *
 * Este componente centraliza toda la experiencia conversacional del chatbot.
 */
export default function ChatBotPanel({ open, onClose }: Props) {
  /**
   * Estado global inicial del chatbot.
   *
   * @remarks
   * `firstMessage` permite iniciar una conversación desde otro punto
   * de la interfaz antes de abrir el panel.
   */
  const { firstMessage, clearFirstMessage } = useChatbotStore();

  /**
   * Estado local del texto actual escrito por el usuario.
   */
  const [message, setMessage] = useState("");

  /**
   * Historial local de mensajes de la conversación.
   */
  const [messages, setMessages] = useState<Message[]>([]);

  /**
   * Indica si el asistente se encuentra procesando una respuesta.
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Referencia al campo de entrada del mensaje.
   */
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Referencia al final del contenedor de mensajes.
   *
   * @remarks
   * Se usa para desplazar automáticamente la vista al último mensaje.
   */
  const bottomRef = useRef<HTMLDivElement>(null);

  /**
   * Efecto encargado de iniciar automáticamente la conversación cuando
   * existe un mensaje inicial en el store.
   *
   * @remarks
   * Flujo:
   *
   * 1. Verifica si `firstMessage` existe.
   * 2. Lo agrega como mensaje del usuario.
   * 3. Limpia el valor almacenado en el store.
   * 4. Solicita la respuesta del asistente.
   */
  useEffect(() => {
    if (!firstMessage) return;

    const userMsg: Message = { role: "user", text: firstMessage };
    setMessages([userMsg]);
    clearFirstMessage();
    fetchBotResponse([userMsg]);
  }, [firstMessage, clearFirstMessage]);

  /**
   * Efecto encargado de enfocar el input cuando el panel se abre.
   *
   * @remarks
   * Se aplica un pequeño retraso para asegurar que el elemento ya
   * se encuentre montado en el DOM.
   */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  /**
   * Efecto encargado de desplazar automáticamente la vista hacia
   * el último mensaje.
   *
   * @remarks
   * Se ejecuta cuando cambia el historial o el estado de carga.
   */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /**
   * Solicita la respuesta del asistente a partir del historial enviado.
   *
   * @param history Historial actual de mensajes que será enviado al backend.
   * @returns No retorna valor.
   *
   * @remarks
   * Flujo de ejecución:
   *
   * 1. Activa el estado de carga.
   * 2. Agrega un mensaje vacío del asistente al historial.
   * 3. Realiza una petición `POST` al endpoint `/api/chatbot`.
   * 4. Envía los mensajes adaptados al formato esperado por la API.
   * 5. Si la respuesta llega por streaming:
   *    - Lee cada fragmento recibido.
   *    - Lo concatena sobre el último mensaje del asistente.
   * 6. Si ocurre un error:
   *    - Reemplaza el mensaje del asistente con un mensaje de error.
   * 7. Finalmente:
   *    - Desactiva el estado de carga.
   *    - Vuelve a enfocar el input.
   */
  const fetchBotResponse = async (history: Message[]) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.text })),
        }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (!last) return prev;

          copy[copy.length - 1] = {
            role: "assistant",
            text: last.text + chunk,
          };

          return copy;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          text: "Lo siento, ocurrió un error al procesar tu consulta. Por favor intenta de nuevo.",
        };
        return copy;
      });

      console.error("[Stilo]", err);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  /**
   * Envía manualmente el mensaje escrito por el usuario.
   *
   * @returns No retorna valor.
   *
   * @remarks
   * Flujo de ejecución:
   *
   * 1. Verifica que exista contenido y que no haya una carga en curso.
   * 2. Construye el mensaje del usuario.
   * 3. Lo agrega al historial local.
   * 4. Limpia el input.
   * 5. Solicita la respuesta del asistente con el historial actualizado.
   */
  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMsg: Message = { role: "user", text: message.trim() };
    const updated = [...messages, userMsg];

    setMessages(updated);
    setMessage("");
    await fetchBotResponse(updated);
  };

  /**
   * Evita renderizar el panel cuando está cerrado.
   */
  if (!open) return null;

  return (
    <div
      className="fixed right-0 top-0 z-[999] flex h-screen w-[420px] flex-col
                 border-l shadow-2xl
                 border-slate-200 bg-white shadow-slate-200/50
                 dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-black/40"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4
                      border-b
                      border-slate-100 bg-white
                      dark:border-[#21262d] dark:bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl
                          border
                          border-violet-100 bg-violet-50
                          dark:border-violet-500/20 dark:bg-violet-500/[0.12]">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-none
                           text-slate-800 dark:text-[#e6edf3]">
              Stilo
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-[#545d68]">
              Asistente interno · EDM
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition
                     text-slate-400 hover:bg-slate-100 hover:text-slate-700
                     dark:text-[#545d68] dark:hover:bg-[#21262d] dark:hover:text-[#adbac7]"
          aria-label="Cerrar chat"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Messages ────────────────────────────────────────────── */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 text-sm
                      bg-slate-50/50 dark:bg-[#0d1117]">

        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl
                            border
                            border-violet-100 bg-violet-50
                            dark:border-violet-500/20 dark:bg-violet-500/[0.10]">
              <Bot className="h-6 w-6 text-violet-400 dark:text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-[#cdd9e5]">
                ¡Hola! Soy Stilo 👋
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-[#545d68]">
                Tu asistente EDM. ¿En qué te puedo ayudar hoy?
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                              bg-violet-100 dark:bg-violet-500/[0.15]">
                <Sparkles className="h-3 w-3 text-violet-600 dark:text-violet-400" />
              </div>
            )}

            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 leading-relaxed ${
                msg.role === "user"
                  ? "rounded-br-sm bg-violet-600 text-white dark:bg-violet-600/80"
                  : "rounded-bl-sm border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#cdd9e5] dark:shadow-none"
              }`}
            >
              {msg.role === "assistant" && msg.text === "" && isLoading ? (
                <span className="flex items-center gap-1.5 text-slate-400 dark:text-[#545d68]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Stilo está escribiendo...</span>
                </span>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ───────────────────────────────────────────────── */}
      <div className="border-t p-4
                      border-slate-100 bg-white
                      dark:border-[#21262d] dark:bg-[#161b22]">
        <div className="flex items-center gap-2 rounded-xl border px-4 py-2.5 transition-all
                        border-slate-200 bg-slate-50
                        focus-within:border-violet-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-500/10
                        dark:border-[#30363d] dark:bg-[#1c2128]
                        dark:focus-within:border-violet-500/50 dark:focus-within:bg-[#1c2128] dark:focus-within:ring-violet-500/15">
          <input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
            placeholder="Pregúntale algo a Stilo..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm focus:outline-none disabled:opacity-50
                       text-slate-700 placeholder:text-slate-400
                       dark:text-[#cdd9e5] dark:placeholder:text-[#545d68]"
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || isLoading}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg
                       bg-violet-600 text-white
                       transition-all duration-200 active:scale-95 hover:bg-violet-700
                       disabled:cursor-not-allowed disabled:opacity-40
                       dark:bg-violet-600/80 dark:hover:bg-violet-600"
            aria-label="Enviar mensaje"
          >
            {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-300 dark:text-[#444c56]">
          Stilo · Asistente experimental de EDM
        </p>
      </div>

    </div>
  );
}