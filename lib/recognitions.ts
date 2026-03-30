// lib/recognitions.ts

export type RecognitionCategory =
  | "destacado"
  | "innovacion"
  | "trabajo_equipo"
  | "liderazgo"
  | "cliente";

export type Recognition = {
  id: string;
  title: string;
  /** Nombre de quien ENVIÓ el reconocimiento al usuario logueado */
  from: string;
  fromAvatar: string;   // iniciales del remitente
  fromPhoto?: string;   // URL foto Graph /users/{senderId}/photo/$value
  category: RecognitionCategory;
  date: string;         // ISO 8601
  message: string;
};

// ─── Mock ─────────────────────────────────────────────────────────────────────
// Simula exactamente lo que devuelve Graph:
// reconocimientos donde DestinatarioId === usuario logueado.
// "from" es el compañero que lo envió — nunca el propio usuario.

export const MOCK_RECOGNITIONS: Recognition[] = [
  {
    id: "1",
    title: "Excelente gestión del proyecto",
    from: "María Torres",
    fromAvatar: "MT",
    category: "destacado",
    date: "2025-06-10",
    message: "Tu dedicación en el cierre del proyecto Q2 fue fundamental para el éxito del equipo.",
  },
  {
    id: "2",
    title: "Idea innovadora implementada",
    from: "Carlos Ruiz",
    fromAvatar: "CR",
    category: "innovacion",
    date: "2025-05-28",
    message: "La automatización que propusiste redujo el tiempo de proceso en un 40%. ¡Increíble aporte!",
  },
  {
    id: "3",
    title: "Apoyo excepcional al equipo",
    from: "Laura Gómez",
    fromAvatar: "LG",
    category: "trabajo_equipo",
    date: "2025-05-15",
    message: "Siempre dispuesto a colaborar, tu actitud hace la diferencia en el día a día.",
  },
  {
    id: "4",
    title: "Liderazgo en momentos críticos",
    from: "Andrés Mora",
    fromAvatar: "AM",
    category: "liderazgo",
    date: "2025-04-22",
    message: "Tu calma y dirección durante la contingencia fueron clave para resolverla.",
  },
];

// ─── Microsoft Graph fetcher ───────────────────────────────────────────────────
// SharePoint List "Reconocimientos" con columnas:
//   Title           → título
//   Categoria       → choice: destacado | innovacion | trabajo_equipo | liderazgo | cliente
//   Mensaje         → texto del reconocimiento
//   DestinatarioId  → AAD userId del receptor  ← filtro principal (solo el logueado)
//   RemitenteId     → AAD userId del emisor
//   RemitenteNombre → nombre display del emisor

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const SITE_ID    = process.env.SHAREPOINT_SITE_ID!;
const LIST_ID    = process.env.SHAREPOINT_RECOGNITIONS_LIST_ID!;

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function mapGraphItem(item: any): Recognition {
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

/**
 * Devuelve SOLO los reconocimientos donde el receptor es el usuario logueado.
 * El filtro `DestinatarioId eq '{userId}'` se aplica en SharePoint —
 * nunca llegan datos de otros usuarios al cliente.
 *
 * @param accessToken  Token con scope Sites.Read.All
 * @param userId       AAD Object ID del usuario logueado
 * @param useMock      true en desarrollo para no depender de Graph
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
