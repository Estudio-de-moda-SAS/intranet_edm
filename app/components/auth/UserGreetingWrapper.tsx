"use client"

import { useDevSession } from "@/lib/useDevSession"
import { GreetingCard } from "../home/GreetingCard"

export default function UserGreetingWrapper({ fallbackUser }: any) {
  const devSession = useDevSession()

  // Lee la variable en cada render, no como constante de módulo
  if (devSession) {
    return <GreetingCard user={devSession.user ?? fallbackUser} />
  }

  return <GreetingCard user={fallbackUser} />
}