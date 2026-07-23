// lib/edmNews/authorize.ts
/**
 * @module authorize
 * Autorización de endpoints de gestión de EDM News.
 *
 * @remarks
 * Combina la verificación de identidad (ID Token) con la verificación de
 * permisos (tabla `edm_news_admins` en Supabase). Es independiente del
 * sistema de roles departamental (`lib/roles.ts`) — ver la propuesta
 * técnica, sección de Autenticación y Permisos, para el porqué de esta
 * decisión.
 */

import { NextRequest } from "next/server";
import { verifyIdToken } from "./verifyIdToken";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface AuthorizedEdmNewsUser {
  email: string;
  role: "editor" | "publicador" | "admin";
}

export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}

/**
 * Verifica que el request tenga un ID Token válido y que el usuario
 * esté autorizado a gestionar EDM News.
 *
 * @param req - El `NextRequest` del Route Handler.
 * @returns El email y rol del usuario autorizado.
 * @throws {@link UnauthorizedError} si no hay token válido.
 * @throws {@link ForbiddenError} si el usuario no está en `edm_news_admins`.
 */
export async function requireEdmNewsAdmin(
  req: NextRequest,
): Promise<AuthorizedEdmNewsUser> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    throw new UnauthorizedError("Falta el header Authorization");
  }

  let user;
  try {
    user = await verifyIdToken(token);
  } catch (e) {
    console.error("[requireEdmNewsAdmin] Token inválido:", e);
    throw new UnauthorizedError("Token inválido o expirado");
  }

  const { data, error } = await supabaseAdmin
    .from("edm_news_admins")
    .select("email, role, active")
    .eq("email", user.email)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("[requireEdmNewsAdmin] Error consultando edm_news_admins:", error);
    throw new ForbiddenError("Error verificando permisos");
  }

  if (!data) {
    throw new ForbiddenError(`${user.email} no tiene acceso a EDM News`);
  }

  return { email: data.email, role: data.role };
}