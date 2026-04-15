/**
 * @module recognitions
 * Tipos, datos mock y cliente de Microsoft Graph para el sistema de
 * reconocimientos entre colaboradores de la intranet EDM.
 *
 * @remarks
 * Los reconocimientos se almacenan en una lista de SharePoint
 * ("Reconocimientos") y se consultan a través de Microsoft Graph.
 * El filtro `DestinatarioId eq '{userId}'` se aplica en SharePoint,
 * garantizando que cada usuario solo reciba sus propios reconocimientos.
 *
 * En desarrollo, {@link getRecognitionsByUser} puede operar con
 * {@link MOCK_RECOGNITIONS} sin depender de Graph ni de SharePoint.
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Categorías disponibles para clasificar un reconocimiento.
 *
 * Corresponden al campo `Categoria` (tipo `choice`) de la lista de
 * SharePoint. Si se agregan nuevas categorías en SharePoint, deben
 * reflejarse aquí también.
 *
 * | Valor            | Descripción                           |
 * |------------------|---------------------------------------|
 * | `destacado`      | Desempeño sobresaliente en general    |
 * | `innovacion`     | Aporte creativo o mejora de procesos  |
 * | `trabajo_equipo` | Colaboración y apoyo al equipo        |
 * | `liderazgo`      | Gestión y dirección en momentos clave |
 * | `cliente`        | Atención y servicio al cliente        |
 */
export type RecognitionCategory =
  | "destacado"
  | "innovacion"
  | "trabajo_equipo"
  | "liderazgo"
  | "cliente";

/**
 * Representa un reconocimiento recibido por el usuario autenticado.
 *
 * @remarks
 * El campo `from` corresponde al compañero que **envió** el reconocimiento,
 * nunca al propio usuario receptor. `fromPhoto` es opcional porque no todos
 * los usuarios de Entra ID tienen foto de perfil configurada en Azure AD.
 */
export type Recognition = {
  /** Identificador único del ítem en la lista de SharePoint. */
  id: string;

  /** Título del reconocimiento (campo `Title` en SharePoint). */
  title: string;

  /** Nombre display del colaborador que envió el reconocimiento. */
  from: string;

  /** Iniciales del remitente, usadas como avatar de respaldo cuando no hay foto. */
  fromAvatar: string;

  /**
   * URL de la foto de perfil del remitente obtenida desde Graph
   * (`/users/{senderId}/photo/$value`).
   * `undefined` si el usuario no tiene foto configurada en Entra ID.
   */
  fromPhoto?: string;

  /** Categoría del reconocimiento según {@link RecognitionCategory}. */
  category: RecognitionCategory;

  /** Fecha de creación en formato ISO 8601 (ej. `"2025-06-10"`). */
  date: string;

  /** Mensaje personalizado escrito por el remitente. */
  message: string;
};

// ── Mock ──────────────────────────────────────────────────────────────────────

/**
 * Datos de prueba que simulan la respuesta de Microsoft Graph para
 * reconocimientos recibidos por el usuario autenticado.
 *
 * @remarks
 * Cada entrada representa un reconocimiento donde `DestinatarioId`
 * corresponde al usuario logueado. El campo `from` es siempre un compañero
 * distinto al usuario receptor, replicando el comportamiento real de la
 * lista de SharePoint.
 *
 * Se usa como fallback en {@link getRecognitionsByUser} cuando
 * `useMock = true` o cuando Graph devuelve un error en entorno de desarrollo.
 */
export const MOCK_RECOGNITIONS: Recognition[] = [
  {
    id: "1",
    title: "Excelente gestión del proyecto",
    from: "María Torres",
    fromAvatar: "MT",
    category: "destacado",
    date: "2025-06-10",
    message:
      "Tu dedicación en el cierre del proyecto Q2 fue fundamental para el éxito del equipo.",
  },
  {
    id: "2",
    title: "Idea innovadora implementada",
    from: "Carlos Ruiz",
    fromAvatar: "CR",
    category: "innovacion",
    date: "2025-05-28",
    message:
      "La automatización que propusiste redujo el tiempo de proceso en un 40%. ¡Increíble aporte!",
  },
  {
    id: "3",
    title: "Apoyo excepcional al equipo",
    from: "Laura Gómez",
    fromAvatar: "LG",
    category: "trabajo_equipo",
    date: "2025-05-15",
    message:
      "Siempre dispuesto a colaborar, tu actitud hace la diferencia en el día a día.",
  },
  {
    id: "4",
    title: "Liderazgo en momentos críticos",
    from: "Andrés Mora",
    fromAvatar: "AM",
    category: "liderazgo",
    date: "2025-04-22",
    message:
      "Tu calma y dirección durante la contingencia fueron clave para resolverla.",
  },
];

// ── Configuración Graph / SharePoint ──────────────────────────────────────────

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const SITE_ID    = process.env.SHAREPOINT_SITE_ID!;
const LIST_ID    = process.env.SHAREPOINT_RECOGNITIONS_LIST_ID!;

// ── Helpers internos ──────────────────────────────────────────────────────────

/**
 * Extrae las iniciales de un nombre display para usar como avatar de texto.
 *
 * @param name - Nombre completo del colaborador (ej. `"María Torres"`).
 * @returns Hasta dos iniciales en mayúsculas (ej. `"MT"`).
 *
 * @internal
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Transforma un ítem crudo de la API de SharePoint/Graph al tipo
 * {@link Recognition} de la intranet.
 *
 * @remarks
 * Accede a las columnas a través de `item.fields` cuando están expandidas,
 * o directamente desde `item` como fallback. El campo `date` prioriza
 * `Created` sobre `Modified` para reflejar la fecha real del reconocimiento.
 *
 * @param item - Ítem de la lista de SharePoint tal como lo devuelve Graph,
 *   con columnas expandidas mediante `$expand=fields(...)`.
 * @returns Objeto {@link Recognition} normalizado listo para la UI.
 *
 * @internal
 */
export function mapGraphItem(item: any): Recognition {
  const f = item.fields ?? item;
  return {
    id:         item.id,
    title:      f.Title,
    from:       f.RemitenteNombre,
    fromAvatar: getInitials(f.RemitenteNombre),
    category:   (f.Categoria as RecognitionCategory) ?? "destacado",
    date:       f.Created ?? f.Modified,
    message:    f.Mensaje ?? "",
  };
}

// ── Cliente Graph ─────────────────────────────────────────────────────────────

/**
 * Obtiene los reconocimientos recibidos por un colaborador específico
 * desde la lista de SharePoint a través de Microsoft Graph.
 *
 * @remarks
 * El filtro `DestinatarioId eq '{userId}'` se evalúa en SharePoint,
 * por lo que nunca se transfieren al cliente reconocimientos de otros
 * usuarios. Los resultados se ordenan por fecha de creación descendente
 * y se limitan a los 20 más recientes.
 *
 * La respuesta se cachea en el servidor durante 5 minutos
 * (`next: { revalidate: 300 }`), reduciendo el número de llamadas a Graph
 * en rutas de alta frecuencia.
 *
 * En caso de error de Graph en entorno de desarrollo, se retorna
 * {@link MOCK_RECOGNITIONS} como fallback para no interrumpir el flujo
 * de trabajo local. En producción el error se propaga con el código HTTP.
 *
 * **Variables de entorno requeridas:**
 * | Variable                              | Descripción                        |
 * |---------------------------------------|------------------------------------|
 * | `SHAREPOINT_SITE_ID`                  | ID del sitio de SharePoint         |
 * | `SHAREPOINT_RECOGNITIONS_LIST_ID`     | ID de la lista "Reconocimientos"   |
 *
 * @param accessToken - Token de acceso delegado con scope `Sites.Read.All`.
 * @param userId      - Object ID de Azure AD del usuario autenticado.
 *   Se usa como valor del filtro `DestinatarioId` en SharePoint.
 * @param useMock     - Si es `true`, retorna {@link MOCK_RECOGNITIONS} sin
 *   consultar Graph. Útil en desarrollo local. Por defecto `false`.
 * @returns Array de {@link Recognition} del usuario, ordenados de más
 *   reciente a más antiguo, con un máximo de 20 entradas.
 * @throws `Error` con el código HTTP si Graph responde con error en
 *   producción (ej. `"Graph API error: 403"`).
 *
 * @example
 * ```ts
 * // Producción
 * const recognitions = await getRecognitionsByUser(accessToken, userId);
 *
 * // Desarrollo sin Graph
 * const recognitions = await getRecognitionsByUser('', '', true);
 * ```
 */
export async function getRecognitionsByUser(
  accessToken: string,
  userId: string,
  useMock = false,
): Promise<Recognition[]> {
  if (useMock) return MOCK_RECOGNITIONS;

  const filter = encodeURIComponent(`fields/DestinatarioId eq '${userId}'`);
  const url =
    `${GRAPH_BASE}/sites/${SITE_ID}/lists/${LIST_ID}/items` +
    `?expand=fields($select=Title,Categoria,Mensaje,RemitenteNombre,Created)` +
    `&$filter=${filter}` +
    `&$orderby=${encodeURIComponent("fields/Created desc")}` +
    `&$top=20`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.error("[recognitions] Graph error", res.status, await res.text());
    if (process.env.NODE_ENV === "development") return MOCK_RECOGNITIONS;
    throw new Error(`Graph API error: ${res.status}`);
  }

  const json = await res.json();
  return (json.value ?? []).map(mapGraphItem);
}