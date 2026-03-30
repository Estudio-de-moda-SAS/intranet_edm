// lib/graph/getLeaderPhotoUrl.ts
//
// Obtiene la foto de perfil de un usuario por email usando callGraph + getToken
// — mismos helpers que usa getHomeData y getSharedData.
// Devuelve un data URL base64 o null si el usuario no tiene foto / falla el permiso.

import { callGraphBlob } from "@/lib/graph/graphClient";
import { getToken }                  from "@/lib/graph/shared.service";

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

/**
 * @param email - Correo corporativo del líder (ej. "juan@empresa.com")
 * @returns     - "data:image/jpeg;base64,..." o null
 */
export async function getLeaderPhotoUrl(email: string): Promise<string | null> {
  if (IS_BYPASS) return null; // en dev muestra iniciales

  try {
    const token = await getToken();
    const blob  = await callGraphBlob(`/users/${email}/photo/$value`, token);
    if (!blob) return null;

    const buffer = Buffer.from(await blob.arrayBuffer());
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    return null; // sin foto → fallback iniciales
  }
}