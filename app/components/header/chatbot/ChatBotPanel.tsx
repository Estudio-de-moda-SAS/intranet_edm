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

  const [message, setMessage]     = useState("");
  const [messages, setMessages]   = useState<Message[]>([]);
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
      className="fixed right-0 top-0 h-screen w-[420px] z-[999] flex flex-col bg-white border-l border-slate-200 shadow-2xl shadow-slate-200/50"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 border border-violet-100">
            <Sparkles className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 leading-none">Stilo</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Asistente interno · EDM</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Cerrar chat"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Messages ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 text-sm bg-slate-50/50">

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 border border-violet-100">
              <Bot className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">¡Hola! Soy Stilo 👋</p>
              <p className="text-xs text-slate-400 mt-1">Tu asistente EDM. ¿En qué te puedo ayudar hoy?</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 mt-0.5">
                <Sparkles className="h-3 w-3 text-violet-600" />
              </div>
            )}

            <div
              className={`rounded-2xl px-4 py-2.5 max-w-[78%] leading-relaxed ${
                msg.role === "user"
                  ? "bg-violet-600 text-white rounded-br-sm"
                  : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
              }`}
            >
              {msg.role === "assistant" && msg.text === "" && isLoading ? (
                <span className="flex items-center gap-1.5 text-slate-400">
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
      <div className="border-t border-slate-100 bg-white p-4">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all focus-within:border-violet-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-500/10">
          <input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
            placeholder="Pregúntale algo a Stilo..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || isLoading}
            className="
              flex h-7 w-7 shrink-0 items-center justify-center rounded-lg
              bg-violet-600 text-white
              transition-all duration-200
              hover:bg-violet-700 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
            "
            aria-label="Enviar mensaje"
          >
            {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-300">
          Stilo · Asistente experimental de EDM
        </p>
      </div>

    </div>
  );
}
