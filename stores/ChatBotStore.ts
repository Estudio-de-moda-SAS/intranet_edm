import { create } from "zustand";

interface ChatbotState {
  open: boolean;
  firstMessage: string | null;

  openChat: () => void;
  closeChat: () => void;

  startConversation: (message: string) => void;
  clearFirstMessage: () => void;
}

export const useChatbotStore = create<ChatbotState>((set) => ({
  open: false,
  firstMessage: null,

  openChat: () => set({ open: true }),

  closeChat: () => set({ open: false }),

  startConversation: (message) =>
    set({
      open: true,
      firstMessage: message,
    }),

  clearFirstMessage: () => set({ firstMessage: null }),
}));