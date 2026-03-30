import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { callGraph } from "@/lib/graph/graphClient";
import type { HomeData } from "@/types/home";

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Datos mock para desarrollo (temporal, reemplazar con APIs) ──
const MOCK_DATA = {
  announcements: [
    { id: "a1", title: "Mantenimiento programado de POS",       summary: "Sábado 9:00–11:00 habrá indisponibilidad parcial.",  publishedAt: new Date().toISOString(), imageUrl: "https://picsum.photos/800/600?1" },
    { id: "a2", title: "Actualización de seguridad en red",     summary: "Se aplicarán nuevas reglas de firewall.",             publishedAt: new Date().toISOString(), imageUrl: "https://picsum.photos/800/600?2" },
    { id: "a3", title: "Nueva política de teletrabajo",         summary: "Cambios en lineamientos para trabajo remoto.",        publishedAt: new Date().toISOString(), imageUrl: "https://picsum.photos/800/600?3" },
    { id: "a4", title: "Implementación de autenticación MFA",   summary: "MFA será obligatorio para todas las cuentas.",        publishedAt: new Date().toISOString(), imageUrl: "https://picsum.photos/800/600?4" },
    { id: "a5", title: "Evento anual corporativo 2026",         summary: "Encuentro presencial con líderes regionales.",        publishedAt: new Date().toISOString(), imageUrl: "https://picsum.photos/800/600?5" },
    { id: "a6", title: "Optimización de infraestructura cloud", summary: "Mejoras en rendimiento y reducción de costos.",       publishedAt: new Date().toISOString(), imageUrl: "https://picsum.photos/800/600?6" },
    { id: "a7", title: "Lanzamiento de nuevo portal interno",   summary: "Nueva experiencia digital para colaboradores.",       publishedAt: new Date().toISOString(), imageUrl: "https://picsum.photos/800/600?7" },
  ],
  events: [
    { id: "e1", title: "Capacitación M365",     date: new Date(Date.now() + 86400000).toISOString(),  location: "Teams"              },
    { id: "e2", title: "Workshop Seguridad TI", date: new Date(Date.now() + 172800000).toISOString(), location: "Auditorio Principal" },
  ],
  tasks: [
    { id: "t1", title: "Aprobar acceso SharePoint",     due: "2026-03-05" },
    { id: "t2", title: "Revisión de permisos en Azure", due: "2026-03-07" },
  ],
  birthdays: [
    { id: "b1", name: "Laura Torres",  date: "2026-03-04", area: "Ecommerce" },
    { id: "b2", name: "Carlos Méndez", date: "2026-03-06", area: "Retail"    },
  ],
};

export async function getHomeData(): Promise<HomeData> {
  const shared = await getSharedData();

  // ── Bypass: devuelve todo mock ──
  if (IS_BYPASS) {
    return {
      user:       shared.user,
      quickLinks: [],
      ...MOCK_DATA,
    };
  }

  // ── Producción: datos reales de Graph ──
  const token = await getToken();

const [eventsRes, tasksRes, membersRes] = await Promise.all([
  callGraph(
    `/me/events?$select=subject,start,location&$orderby=start/dateTime&$top=5&$filter=start/dateTime ge '${new Date().toISOString()}'`,
    token
  ).catch(() => ({ value: [] })) as Promise<{ value: any[] }>,

  callGraph("/me/todo/lists?$top=1", token)
    .then((lists: any) => {
      const listId = lists?.value?.[0]?.id;
      if (!listId) return { value: [] };
      return callGraph(
        `/me/todo/lists/${listId}/tasks?$filter=status ne 'completed'&$top=5&$select=title,dueDateTime`,
        token
      );
    })
    .catch(() => ({ value: [] })) as Promise<{ value: any[] }>,

  callGraph("/users?$select=displayName,department,birthday&$top=10", token)
    .catch(() => ({ value: [] })) as Promise<{ value: any[] }>,
]);

  return {
    user:       shared.user,
    quickLinks: [],
    announcements: MOCK_DATA.announcements, // ⏳ Reemplazar con SharePoint API cuando haya permisos
    events: (eventsRes.value ?? []).map((e: any) => ({
      id:       e.id,
      title:    e.subject,
      date:     e.start?.dateTime ?? new Date().toISOString(),
      location: e.location?.displayName ?? "Sin ubicación",
    })),
    tasks: (tasksRes.value ?? []).map((t: any) => ({
      id:    t.id,
      title: t.title,
      due:   t.dueDateTime?.dateTime?.split("T")[0] ?? "",
    })),
    birthdays: (membersRes.value ?? [])
      .filter((u: any) => u.birthday)
      .map((u: any) => ({
        id:   u.id,
        name: u.displayName,
        date: u.birthday?.split("T")[0] ?? "",
        area: u.department ?? "",
      })),
  };
}