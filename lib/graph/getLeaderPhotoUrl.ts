/**
 * @module graph/getLeaderPhotoUrl
 * Helper para obtener la foto de perfil de un colaborador desde Microsoft
 * Graph y convertirla a un data URL base64 listo para usar en `<img />`.
 *
 * @remarks
 * Encapsula la lógica específica de obtención y conversión de fotos de
 * perfil, separándola de {@link callGraphBlob} (transporte) y de los
 * services de departamento (datos de negocio). Esta separación permite
 * reutilizar el helper en cualquier contexto que necesite mostrar la foto
 * de un colaborador a partir de su correo corporativo.
 *
 * Cuando no hay foto disponible — usuario sin foto en Entra ID, permiso
 * insuficiente, o modo bypass activo — retorna `null` para que el
 * componente consumidor muestre un fallback de iniciales.
 *
 * @example
 * ```tsx
 * const photoUrl = await getLeaderPhotoUrl("juan@empresa.com");
 *
 * return photoUrl
 *   ? <img src={photoUrl} alt="Foto de perfil" />
 *   : <AvatarInitials name="Juan" />;
 * ```
 */

import { callGraphBlob } from "@/lib/graph/graphClient";
import { getToken }      from "@/lib/graph/shared.service";

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Obtiene la foto de perfil de un colaborador desde Microsoft Graph y la
 * retorna como data URL en formato base64.
 *
 * @remarks
 * El flujo de obtención es el siguiente:
 * 1. En modo bypass retorna `null` inmediatamente — en desarrollo se
 *    muestran iniciales como avatar, sin depender de Graph.
 * 2. Obtiene el token de acceso mediante {@link getToken}.
 * 3. Llama a {@link callGraphBlob} con el endpoint
 *    `/users/{email}/photo/$value`.
 * 4. Convierte el `Blob` a `Buffer` y lo serializa como
 *    `data:image/jpeg;base64,{...}`.
 *
 * Cualquier error en los pasos 2–4 es capturado silenciosamente y resulta
 * en `null`, evitando que un fallo de foto interrumpa el renderizado de
 * la página. Los casos más comunes de fallo son:
 * - El usuario no tiene foto configurada en Entra ID (Graph devuelve 404).
 * - El token no tiene el scope `User.ReadBasic.All` o `User.Read.All`.
 * - El correo no corresponde a ningún usuario del tenant.
 *
 * @param email - Correo corporativo del colaborador cuya foto se solicita
 *   (ej. `"juan@empresa.com"`). Se usa directamente como identificador
 *   en el endpoint `/users/{email}/photo/$value` de Graph.
 * @returns Data URL con la foto en formato JPEG codificada en base64
 *   (ej. `"data:image/jpeg;base64,/9j/4AAQ..."`), o `null` si no hay
 *   foto disponible o si ocurre cualquier error.
 *
 * @example
 * ```ts
 * // Uso en un Server Component
 * const photoUrl = await getLeaderPhotoUrl("maria.torres@empresa.com");
 *
 * // photoUrl → "data:image/jpeg;base64,/9j/4AAQ..." si tiene foto
 * // photoUrl → null si no tiene foto o falla el permiso
 * ```
 */
export async function getLeaderPhotoUrl(email: string): Promise<string | null> {
  if (IS_BYPASS) return null;

  try {
    const token = await getToken();
    const blob  = await callGraphBlob(`/users/${email}/photo/$value`, token);
    if (!blob) return null;

    const buffer = Buffer.from(await blob.arrayBuffer());
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}