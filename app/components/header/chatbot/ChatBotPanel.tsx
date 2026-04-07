'use client';

import { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, Bot, Loader2 } from "lucide-react";
import { useChatbotStore } from "@/stores/ChatBotStore";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChatBotPanel({ open, onClose }: Props) {
  const { firstMessage, clearFirstMessage } = useChatbotStore();

  const [message,   setMessage]   = useState("");
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!firstMessage) return;
    const userMsg: Message = { role: "user", text: firstMessage };
    setMessages([userMsg]);
    clearFirstMessage();
    fetchBotResponse([userMsg]);
  }, [firstMessage, clearFirstMessage]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (!last) return prev;
          copy[copy.length - 1] = { role: "assistant", text: last.text + chunk };
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

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    const userMsg: Message = { role: "user", text: message.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setMessage("");
    await fetchBotResponse(updated);
  };

  if (!open) return null;

  return (
    <div
      className="fixed right-0 top-0 h-screen w-[420px] z-[999] flex flex-col
                 border-l shadow-2xl
                 bg-white border-slate-200 shadow-slate-200/50
                 dark:bg-[#161b22] dark:border-[#30363d] dark:shadow-black/40"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4
                      border-b
                      bg-white border-slate-100
                      dark:bg-[#161b22] dark:border-[#21262d]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl
                          border
                          bg-violet-50 border-violet-100
                          dark:bg-violet-500/[0.12] dark:border-violet-500/20">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-none
                           text-slate-800 dark:text-[#e6edf3]">
              Stilo
            </h3>
            <p className="text-[11px] mt-0.5 text-slate-400 dark:text-[#545d68]">
              Asistente interno · EDM
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition
                     text-slate-400 hover:text-slate-700 hover:bg-slate-100
                     dark:text-[#545d68] dark:hover:text-[#adbac7] dark:hover:bg-[#21262d]"
          aria-label="Cerrar chat"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Messages ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 text-sm
                      bg-slate-50/50 dark:bg-[#0d1117]">

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl
                            border
                            bg-violet-50 border-violet-100
                            dark:bg-violet-500/[0.10] dark:border-violet-500/20">
              <Bot className="h-6 w-6 text-violet-400 dark:text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-[#cdd9e5]">
                ¡Hola! Soy Stilo 👋
              </p>
              <p className="text-xs mt-1 text-slate-400 dark:text-[#545d68]">
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
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5
                              bg-violet-100 dark:bg-violet-500/[0.15]">
                <Sparkles className="h-3 w-3 text-violet-600 dark:text-violet-400" />
              </div>
            )}

            <div
              className={`rounded-2xl px-4 py-2.5 max-w-[78%] leading-relaxed ${
                msg.role === "user"
                  /* Usuario: violeta en light, sólido apagado en dark */
                  ? "bg-violet-600 text-white rounded-br-sm dark:bg-violet-600/80"
                  /* Asistente: blanco en light, surface oscura en dark */
                  : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm dark:bg-[#1c2128] dark:border-[#30363d] dark:text-[#cdd9e5] dark:shadow-none"
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
                      bg-white border-slate-100
                      dark:bg-[#161b22] dark:border-[#21262d]">
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
                       transition-all duration-200 active:scale-95
                       bg-violet-600 text-white hover:bg-violet-700
                       disabled:opacity-40 disabled:cursor-not-allowed
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