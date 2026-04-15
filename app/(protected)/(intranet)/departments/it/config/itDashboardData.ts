/**
 * @module itDashboardData
 * Dataset mock para el dashboard del módulo de Tecnología (TI).
 *
 * @remarks
 * Este archivo centraliza todos los datos necesarios para renderizar el panel
 * de monitoreo de TI, incluyendo:
 * - KPIs superiores
 * - Estado de tiendas (sucursales)
 * - Métricas de servidores
 * - Datos para gráficos
 * - Actividad reciente
 *
 * ⚠️ Actualmente es un mock estático.
 * En producción debería ser reemplazado por datos provenientes de:
 * - APIs internas
 * - Herramientas de monitoreo
 * - Sistemas de tickets 
 */

import { TicketCheck, AlertTriangle, Bot, Users } from "lucide-react";

/**
 * Estructura principal del dashboard de TI.
 *
 * @remarks
 * Organiza la información en bloques independientes que pueden ser consumidos
 * por distintos componentes visuales.
 */
export const itDashboardData = {

  /**
   * KPIs principales del área de TI.
   *
   * @remarks
   * Métricas rápidas para visualizar el estado operativo actual:
   * - Tickets generados hoy
   * - Incidentes críticos
   * - Automatización (chatbot)
   * - Satisfacción de usuarios
   */
  kpis: [
    {
      title: "Tickets hoy",
      value: 25,
      icon: TicketCheck,
      trend: "+5 hoy"
    },
    {
      title: "Tickets escalados",
      value: 6,
      icon: AlertTriangle,
      trend: "requieren atención"
    },
    {
      title: "Tickets chatbot",
      value: 200,
      icon: Bot,
      trend: "automatizados"
    },
    {
      title: "Satisfacción promedio",
      value: "65%",
      icon: Users,
      trend: "usuarios internos"
    }
  ],

  /**
   * Estado de tiendas o sedes monitoreadas.
   *
   * @remarks
   * Representa la salud de cada punto físico o sistema distribuido.
   *
   * Campos:
   * - `estado`: estado general (`online`, `offline`, `warning`)
   * - `uptime`: disponibilidad histórica
   * - `latency`: latencia promedio
   * - `health`: indicador numérico de salud (0–100)
   */
  tiendas: [
    { id: 1, nombre: "Tienda 1", estado: "online",   uptime: "95.55%", latency: "64ms",  health: 96 },
    { id: 2, nombre: "Tienda 2", estado: "offline",  uptime: "0%",     latency: "0ms",   health: 0  },
    { id: 3, nombre: "Tienda 3", estado: "warning",  uptime: "35%",    latency: "450ms", health: 35 },
  ],

  /**
   * Métricas de servidores para visualización tipo gauge/acelerómetro.
   *
   * @remarks
   * Permite mostrar consumo de recursos en tiempo real:
   * - CPU (%)
   * - RAM (%)
   */
  servidores: [
    { nombre: "CPU Server", cpu: 67, ram: 72 },
    { nombre: "Network",    cpu: 45, ram: 40 },
  ],

  /**
   * Datos de rendimiento por área.
   *
   * @remarks
   * Usados para gráficos comparativos (ej: barras o áreas).
   *
   * Campos:
   * - `tickets`: solicitudes registradas
   * - `incidentes`: problemas críticos detectados
   */
  rendimiento: [
    { mes: "RRHH",      tickets: 82, incidentes: 18 },
    { mes: "Ventas",    tickets: 56, incidentes: 44 },
    { mes: "Logística", tickets: 34, incidentes: 66 },
    { mes: "Marketing", tickets: 88, incidentes: 12 },
  ],

  /**
   * Actividad reciente del sistema.
   *
   * @remarks
   * Lista de eventos recientes relevantes para el equipo de TI:
   * - Acciones del sistema
   * - Alertas
   * - Cambios operativos
   */
  actividad: [
    { id: 1, label: "Servidor reiniciado",       time: "Hace 15 min" },
    { id: 2, label: "Actualización completada",  time: "Hace 2 h"    },
    { id: 3, label: "Alerta de CPU detectada",   time: "Hace 5 h"    },
  ],
};