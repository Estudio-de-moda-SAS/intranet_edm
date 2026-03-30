"use client";

import { createContext, useContext, useState } from "react";

export type Ticket = {
  id: string;
  title: string;
  user: string;
  area: string;
  description: string;
  status: "open" | "in-progress" | "closed";
  createdAt: Date;
};

type ContextType = {
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, "id" | "status" | "createdAt">) => void;
};

const HelpTicketsContext = createContext<ContextType | null>(null);

export function HelpTicketsProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  function addTicket(ticket: Omit<Ticket, "id" | "status" | "createdAt">) {
    const newTicket: Ticket = {
      ...ticket,
      id: crypto.randomUUID(),
      status: "open",
      createdAt: new Date(),
    };

    setTickets((prev) => [newTicket, ...prev]);
  }

  return (
    <HelpTicketsContext.Provider value={{ tickets, addTicket }}>
      {children}
    </HelpTicketsContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(HelpTicketsContext);
  if (!ctx) throw new Error("useTickets must be used inside provider");
  return ctx;
}