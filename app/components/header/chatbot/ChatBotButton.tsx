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
        relative overflow-hidden
        flex items-center gap-2 rounded-lg
        bg-gradient-to-r from-violet-600 to-purple-600
        ${iconOnly ? 'h-8 w-8 justify-center' : 'px-4 py-2'}
        text-sm font-medium text-white
        shadow-md shadow-violet-200
        transition-all duration-200
        hover:shadow-lg hover:shadow-violet-300 hover:scale-[1.03]
        active:scale-[0.98]
      `}
    >
      <span className="pointer-events-none absolute inset-0 rounded-lg bg-white/0 hover:bg-white/10 transition-colors duration-200" />
      <MessageCircle className="h-4 w-4 relative" />
      {!iconOnly && <span className="relative">Stilo</span>}
    </button>
  );
}