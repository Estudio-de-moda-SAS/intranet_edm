import { TicketCheck, AlertTriangle, Bot, Users } from "lucide-react";

export const itDashboardData = {

  /* KPIs SUPERIORES */
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

  /* ESTADO DE TIENDAS */
  tiendas: [
    { id: 1, nombre: "Tienda 1", estado: "online",   uptime: "95.55%", latency: "64ms",  health: 96 },
    { id: 2, nombre: "Tienda 2", estado: "offline",  uptime: "0%",     latency: "0ms",   health: 0  },
    { id: 3, nombre: "Tienda 3", estado: "warning",  uptime: "35%",    latency: "450ms", health: 35 },
  ],

  /* SERVIDORES PARA ACELERÓMETROS */
  servidores: [
    { nombre: "CPU Server", cpu: 67, ram: 72 },
    { nombre: "Network",    cpu: 45, ram: 40 },
  ],

  /* GRÁFICOS */
  rendimiento: [
    { mes: "RRHH",      tickets: 82, incidentes: 18 },
    { mes: "Ventas",    tickets: 56, incidentes: 44 },
    { mes: "Logística", tickets: 34, incidentes: 66 },
    { mes: "Marketing", tickets: 88, incidentes: 12 },
  ],

  /* ACTIVIDAD RECIENTE */
  actividad: [
    { id: 1, label: "Servidor reiniciado",       time: "Hace 15 min" },
    { id: 2, label: "Actualización completada",  time: "Hace 2 h"    },
    { id: 3, label: "Alerta de CPU detectada",   time: "Hace 5 h"    },
  ],
};