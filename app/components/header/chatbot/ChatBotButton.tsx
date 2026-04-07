'use client';

import { MessageCircle } from 'lucide-react';

interface Props {
  onClick: () => void;
  iconOnly?: boolean;
}

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
      <span className="pointer-events-none absolute inset-0 rounded-lg bg-white/0 hover:bg-white/10 transition-colors duration-200 dark:hidden" />
      <MessageCircle className="h-4 w-4 relative" />
      {!iconOnly && <span className="relative">Stilo</span>}
    </button>
  );
}