/**
 * @module hrApps
 * Configuración de aplicaciones internas del módulo de Recursos Humanos.
 *
 * @remarks
 * Este archivo define el listado de aplicaciones y herramientas disponibles
 * dentro del ecosistema de RRHH.
 *
 * Se utiliza para:
 * - Renderizar dashboards de accesos a aplicaciones
 * - Centralizar la navegación interna del módulo
 * - Configurar UI dinámica basada en catálogo
 *
 * Cada aplicación incluye información visual y de navegación.
 */

// /departments/human-resources/config/hrApps.ts

import type { HRAppItem } from "@/types/hr.types";

/**
 * Lista de aplicaciones disponibles en el módulo de RRHH.
 *
 * @remarks
 * Cada elemento contiene:
 * - `label`: Nombre de la aplicación
 * - `description`: Breve descripción funcional
 * - `href`: Ruta de acceso
 * - `icon`: Identificador del ícono
 * - `color`: Color temático de la tarjeta/app
 *
 * Consideraciones:
 * - Este archivo actúa como fuente de configuración (no lógica)
 * - Las rutas deben corresponder a módulos existentes
 * - Los iconos deben mapearse correctamente en la UI
 */
 
export const hrApps: HRAppItem[] = [
  {
    label: "YOU V2",
    description: "Autogestión del colaborador",
    href: "/rrhh/autogestion",
    icon: "users",
    color: "purple",
  },
  {
    label: "Portal de Vacaciones",
    description: "Gestión de solicitudes",
    href: "/rrhh/vacaciones",
    icon: "calendarDays",
    color: "teal",
  },
  {
    label: "Head Talent",
    description: "Gestión de talento",
    href: "/rrhh/head-talent",
    icon: "fileText",
    color: "blue",
  },
  {
    label: "Beneficios",
    description: "Programas y bienestar",
    href: "/rrhh/beneficios",
    icon: "heartHandshake",
    color: "green",
  },
  {
    label: "Incapacidades",
    description: "Gestión médica",
    href: "/rrhh/incapacidades",
    icon: "award",
    color: "amber",
  },
  {
    label: "360 Talent",
    description: "Evaluación de desempeño",
    href: "/rrhh/360-talent",
    icon: "barChart3",
    color: "purple",
  },
  {
    label: "App Novedades",
    description: "Gestión de cambios",
    href: "/rrhh/novedades",
    icon: "graduationCap",
    color: "blue",
  },
  {
    label: "Gobierno de Datos",
    description: "Gestión y control",
    href: "/rrhh/gobierno-datos",
    icon: "briefcase",
    color: "teal",
  },
  {
    label: "Nomina Web",
    description: "Gestión de pagos",
    href: "/rrhh/nomina-web",
    icon: "clipboardList",
    color: "amber",
  },
  {
    label: "Autogestión",
    description: "Servicios del colaborador",
    href: "/rrhh/appautogestion",
    icon: "userPlus",
    color: "green",
  },
  {
    label: "Networking",
    description: "Conexión entre equipos",
    href: "/rrhh/networking",
    icon: "clock",
    color: "coral",
  },
  {
    label: "Requisiciones",
    description: "Gestión de vacantes",
    href: "/rrhh/requisiciones",
    icon: "shieldCheck",
    color: "purple",
  },
  {
    label: "Requisiciones",
    description: "Gestión de vacantes",
    href: "/rrhh/requisiciones",
    icon: "shieldCheck",
    color: "purple",
  },
];