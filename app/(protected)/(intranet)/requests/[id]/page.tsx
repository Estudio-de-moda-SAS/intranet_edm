/**
 * @module TicketPage
 * Página dinámica de detalle de solicitudes (tickets) dentro del módulo de intranet.
 *
 * @remarks
 * Este archivo define la ruta dinámica `/requests/[id]`, encargada de:
 *
 * - recibir el identificador del ticket desde la URL
 * - resolver los parámetros de navegación
 * - delegar el renderizado al componente {@link TicketDetailPage}
 *
 * Actúa como capa de integración entre el sistema de routing de Next.js
 * y la capa de presentación del detalle de solicitudes.
 */

// app/(protected)/(intranet)/requests/[id]/page.tsx

import { TicketDetailPage } from "@/app/(protected)/(intranet)/requests/[id]/components/TicketDetailPage";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Props de la página dinámica de ticket.
 *
 * @property params Parámetros dinámicos de la ruta, incluyendo el `id` del ticket.
 *
 * @remarks
 * En el contexto de App Router de Next.js, `params` contiene los valores
 * definidos en la ruta dinámica `[id]`.
 */
interface TicketPageProps {
  params: {
    id: string;
  };
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Página de detalle de ticket.
 *
 * @param props Propiedades de la página.
 * @returns Componente {@link TicketDetailPage} con el identificador del ticket.
 *
 * @remarks
 * Este componente:
 *
 * - extrae el `id` del ticket desde los parámetros de la URL
 * - pasa dicho identificador al componente de detalle
 * - no contiene lógica de negocio directa
 *
 * Su responsabilidad es actuar como adaptador entre:
 *
 * - el sistema de rutas dinámicas de Next.js
 * - el componente de presentación del ticket
 *
 * @example
 * ```tsx
 * // Ruta: /requests/123
 * <TicketPage params={{ id: "123" }} />
 * ```
 */
export default async function TicketPage({ params }: TicketPageProps) {
  const { id } = params;

  return <TicketDetailPage ticketId={id} />;
}