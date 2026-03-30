// lib/graph/shared.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// Datos compartidos entre todos los services de departamento:
// usuario autenticado y token de Graph.
//
// Cambios respecto al original:
//   - Eliminado (session as any) — ahora session.accessToken está tipado
//     gracias a types/next-auth.d.ts
//   - callGraph es ahora genérico, sin 'any' implícito
// ─────────────────────────────────────────────────────────────────────────────

import type { Session } from "next-auth"
import { callGraph }    from "@/lib/graph/graphClient"

// ── Tipos ─────────────────────────────────────────────────────────────────────

type GraphProfileBasic = {
  displayName?:    string | null
  jobTitle?:       string | null
  department?:     string | null
  mail?:           string | null
  id?:             string | null
  officeLocation?: string | null
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_USER = {
  name:     "Juan Esteban Avendaño Gomez",
  role:     "Aprendiz TI 2",
  location: "Medellín",
  email:    "juanesteban@empresa.com",
  id:       "mock-user-id",
}

// ── Token ─────────────────────────────────────────────────────────────────────

export async function getToken(): Promise<string> {
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return "mock-token"
  }

  // import dinámico para evitar que auth() se ejecute en el cliente
  const { auth } = await import("@/auth")
  const session  = await auth() as Session | null

  // session.accessToken está tipado por types/next-auth.d.ts — sin 'as any'
  const token = session?.accessToken
  if (!token) throw new Error("No access token — usuario no autenticado")

  return token
}

// ── Datos compartidos ─────────────────────────────────────────────────────────

export async function getSharedData() {
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return { user: MOCK_USER }
  }

  const token   = await getToken()
  const profile = await callGraph<GraphProfileBasic>(
    "/me?$select=displayName,jobTitle,department,mail,id,officeLocation",
    token,
  )

  return {
    user: {
      name:     profile.displayName    ?? "Usuario",
      role:     profile.jobTitle       ?? "",
      location: profile.officeLocation ?? "",
      email:    profile.mail           ?? "",
      id:       profile.id             ?? "",
    },
  }
}

export type SharedData = Awaited<ReturnType<typeof getSharedData>>