'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Send, Sparkles } from 'lucide-react';
import ChatBotButton from './ChatBotButton';
import ChatBotPanel from './ChatBotPanel';
import { useChatbotStore } from '@/stores/ChatBotStore';

interface Props {
  variant?: 'default' | 'expanded';
  iconOnly?: boolean;
}

export default function CorporateBot({ variant = 'default', iconOnly = false }: Props) {
  const { open, closeChat, startConversation } = useChatbotStore();
  const [input, setInput] = useState("");

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    startConversation(text);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {variant === 'expanded' ? (
        <div className="
          w-full max-w-2xl relative overflow-hidden rounded-xl
          bg-gradient-to-r from-violet-600 via-violet-500 to-purple-600
          px-5 py-4 shadow-lg shadow-violet-200
          transition-all duration-300 cursor-pointer
          hover:shadow-xl hover:shadow-violet-300/50
          hover:scale-[1.015] hover:brightness-110
        ">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all duration-300 group-hover:bg-white/20" />
          <div className="pointer-events-none absolute -bottom-4 left-1/3 h-16 w-16 rounded-full bg-fuchsia-400/20 blur-lg" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-white/75 leading-none mb-2">
                Hola, soy <span className="font-semibold text-white">Stilo</span> · ¿En qué te ayudo?
              </p>
              <div className="flex items-center rounded-lg bg-white/95 px-3 py-2 gap-2 shadow-inner transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-white/40">
                <input
                  id="chatbot-input" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Haz tu pregunta aquí..."
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="flex items-center justify-center rounded-md p-1.5 text-violet-400 transition-colors hover:text-violet-600 hover:bg-violet-50"
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