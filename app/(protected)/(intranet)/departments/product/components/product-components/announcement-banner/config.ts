import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Megaphone,
} from "lucide-react";
import type { Announcement } from "./types";

/**
 * @module ProductAnnouncementBanner/config
 * Configuración visual y contenido por defecto del banner de comunicados.
 */

/**
 * Configuración visual por tipo de anuncio.
 *
 * @remarks
 * Este objeto centraliza la semántica visual asociada a cada
 * tipo de anuncio, incluyendo:
 * - fondo y borde
 * - colores de texto
 * - color del indicador
 * - ícono representativo
 *
 * Se utiliza para mantener consistencia visual en todos los anuncios
 * y evitar lógica condicional repetida durante el renderizado.
 */
export const TYPE_CONFIG = {
  info: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    textTitle: "text-amber-900",
    textMsg: "text-amber-700",
    dot: "bg-amber-400",
    Icon: Megaphone,
  },
  warning: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    textTitle: "text-orange-900",
    textMsg: "text-orange-700",
    dot: "bg-orange-400",
    Icon: AlertTriangle,
  },
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    textTitle: "text-emerald-900",
    textMsg: "text-emerald-700",
    dot: "bg-emerald-400",
    Icon: CheckCircle2,
  },
  urgent: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    textTitle: "text-rose-900",
    textMsg: "text-rose-700",
    dot: "bg-rose-500",
    Icon: Bell,
  },
} as const;

/**
 * Anuncios por defecto del módulo de Producto.
 *
 * @remarks
 * Este dataset actúa como contenido predeterminado del banner
 * cuando no se suministra un arreglo de anuncios por props.
 *
 * Incluye ejemplos representativos de escenarios comunes del área:
 * - cierres de fichas técnicas
 * - rechazo de muestras
 * - cierres exitosos de colección
 */
export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "prod-ann-001",
    type: "urgent",
    title: "Cierre de fichas técnicas SS-25 — fecha límite",
    message:
      "El cierre de fichas para la colección SS-25 vence el martes 18 de junio. Quedan 4 fichas incompletas que bloquean el fitting del 20 de junio.",
    date: "14 jun 2025",
    actionLabel: "Ver pendientes",
    actionHref: "/product/techsheets?filter=incomplete",
  },
  {
    id: "prod-ann-002",
    type: "warning",
    title: "Muestra rechazada — CU-2542 requiere ajuste",
    message:
      "La muestra R1 del cubre-bikini kimono fue rechazada por desviación en el corte. El proveedor 'Sedas del Valle' debe reenviar antes del 24 de junio.",
    date: "13 jun 2025",
    actionLabel: "Ver muestra",
    actionHref: "/product/samples/s4",
  },
  {
    id: "prod-ann-003",
    type: "success",
    title: "Colección FW-24 cerrada exitosamente",
    message:
      "Las 112 referencias de Otoño Invierno 2024 fueron aprobadas y distribuidas a todas las tiendas. El cierre oficial quedó registrado el 10 de junio.",
    date: "10 jun 2025",
  },
];

/**
 * Clave de almacenamiento usada para persistir anuncios descartados.
 *
 * @remarks
 * El valor se guarda en `sessionStorage`, por lo que la persistencia
 * se mantiene únicamente durante la sesión activa del navegador.
 */
export const STORAGE_KEY = "product_dismissed_announcements";