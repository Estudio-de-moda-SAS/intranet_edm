// lib/supabase/admin.ts
/**
 * Cliente de Supabase para uso EXCLUSIVO en servidor (Route Handlers,
 * Server Components, Server Actions).
 *
 * @remarks
 * Usa la service role key — nunca importar este archivo desde un
 * Client Component ("use client"). Si TypeScript/ESLint permite el import
 * desde cliente, el bundler lo incluiría en el JS público y expondría
 * la key. Por convención, todo lo que se importe desde aquí debe vivir
 * detrás de un Route Handler.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "[supabase/admin] Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno"
  );
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});