/**
 * @module NotificationsModal
 * Componente cliente encargado de renderizar el panel modal de notificaciones
 * del sistema.
 *
 * @remarks
 * Este archivo implementa un panel flotante de notificaciones que se monta
 * mediante portal sobre el `document.body`, permitiendo al usuario consultar,
 * filtrar y gestionar alertas recientes.
 *
 * Su responsabilidad incluye:
 *
 * - Renderizar un panel emergente anclado a una posición específica.
 * - Mostrar una lista de notificaciones con estilos según su tipo.
 * - Permitir filtrar entre todas las notificaciones y solo las no leídas.
 * - Marcar notificaciones como leídas de forma individual o masiva.
 * - Eliminar notificaciones de la lista.
 * - Notificar externamente la cantidad de elementos no leídos.
 * - Cerrar el panel mediante botón o tecla `Escape`.
 *
 * Este componente se ejecuta del lado del cliente porque utiliza estado local,
 * efectos, animaciones, eventos del navegador y `createPortal`.
 */

'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell, CheckCheck, Trash2, AlertCircle,
  CheckCircle2, Info, Clock, X,
} from 'lucide-react';

/**
 * Tipos posibles de notificación.
 *
 * @remarks
 * Valores soportados:
 * - `"info"`: mensaje informativo.
 * - `"success"`: evento exitoso o confirmado.
 * - `"warning"`: advertencia o acción requerida.
 * - `"system"`: evento generado por el sistema.
 */
type NotifType = 'info' | 'success' | 'warning' | 'system';

/**
 * Representa una notificación individual dentro del panel.
 */
interface Notification {
  /**
   * Identificador único de la notificación.
   */
  id: string;

  /**
   * Tipo visual y semántico de la notificación.
   */
  type: NotifType;

  /**
   * Título principal de la notificación.
   */
  title: string;

  /**
   * Descripción o cuerpo del mensaje.
   */
  body: string;

  /**
   * Texto temporal asociado a la notificación.
   *
   * @remarks
   * Generalmente contiene una referencia relativa de tiempo
   * como "Hace 5 min" o "Ayer".
   */
  time: string;

  /**
   * Indica si la notificación ya fue leída.
   */
  read: boolean;
}

/**
 * Conjunto inicial de notificaciones utilizado como estado base del panel.
 *
 * @remarks
 * Actualmente se usa como fuente local mock para la interfaz.
 * En una implementación real podría reemplazarse por datos obtenidos
 * desde una API o store global.
 */
const INITIAL: Notification[] = [
  { id: '1', type: 'success', title: 'Solicitud aprobada',       body: 'Tu solicitud de vacaciones del 14–21 de julio fue aprobada por Recursos Humanos.', time: 'Hace 5 min', read: false },
  { id: '2', type: 'warning', title: 'Documento por vencer',     body: 'El contrato de proveedor #4821 vence en 3 días. Revísalo antes de que expire.',    time: 'Hace 1 h',   read: false },
  { id: '3', type: 'info',    title: 'Reunión reagendada',       body: 'La reunión de Q3 Planning se movió al jueves 18 jul a las 10:00 AM.',               time: 'Hace 3 h',   read: false },
  { id: '4', type: 'system',  title: 'Actualización del sistema', body: 'La intranet tendrá mantenimiento el sábado 20 jul de 02:00 a 04:00 AM.',           time: 'Ayer',        read: true  },
  { id: '5', type: 'success', title: 'Informe generado',         body: 'El reporte mensual de mayo ya está disponible en la sección Reportes.',             time: 'Hace 2 días', read: true  },
];

/**
 * Configuración visual asociada a cada tipo de notificación.
 *
 * @remarks
 * Cada entrada define:
 * - El ícono representativo.
 * - El fondo del contenedor del ícono.
 * - El color del ícono.
 * - El color del punto indicador de no leído.
 */
const TYPE_CONFIG: Record<NotifType, {
  Icon: React.ElementType;
  bg: string;
  iconColor: string;
  dot: string;
}> = {
  success: {
    Icon: CheckCircle2,
    bg: 'bg-emerald-50 dark:bg-emerald-500/[0.12]',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    dot: 'bg-emerald-400',
  },
  warning: {
    Icon: AlertCircle,
    bg: 'bg-amber-50 dark:bg-amber-500/[0.12]',
    iconColor: 'text-amber-500 dark:text-amber-400',
    dot: 'bg-amber-400',
  },
  info: {
    Icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-500/[0.12]',
    iconColor: 'text-blue-500 dark:text-blue-400',
    dot: 'bg-blue-400',
  },
  system: {
    Icon: Clock,
    bg: 'bg-slate-100 dark:bg-[#30363d]',
    iconColor: 'text-slate-500 dark:text-[#768390]',
    dot: 'bg-slate-400 dark:bg-[#545d68]',
  },
};

/**
 * Props del componente {@link NotificationsPanel}.
 */
interface Props {
  /**
   * Indica si el panel debe mostrarse.
   */
  open: boolean;

  /**
   * Función que se ejecuta al cerrar el panel.
   */
  onClose: () => void;

  /**
   * Callback opcional que notifica cambios en la cantidad
   * de notificaciones no leídas.
   */
  onUnreadChange?: (count: number) => void;

  /**
   * Posición de anclaje del panel en pantalla.
   *
   * @remarks
   * Se utiliza para posicionar el contenedor con `position: fixed`.
   */
  anchorPos: { top: number; right: number };

  /**
   * Referencia externa al contenedor principal del panel.
   *
   * @remarks
   * Puede utilizarse para detección de clics externos o control
   * desde componentes padres.
   */
  panelRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Componente cliente que renderiza el panel flotante de notificaciones.
 *
 * @param props Propiedades del componente.
 * @param props.open Indica si el panel está visible.
 * @param props.onClose Función para cerrar el panel.
 * @param props.onUnreadChange Callback opcional para informar cambios en el conteo de no leídas.
 * @param props.anchorPos Posición fija donde se ancla el panel.
 * @param props.panelRef Referencia al nodo principal del panel.
 * @returns Panel de notificaciones renderizado mediante portal.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Inicializa el estado local con notificaciones mock.
 * 2. Mantiene un filtro activo entre `"all"` y `"unread"`.
 * 3. Detecta cuando el componente ya está montado para evitar problemas
 *    con el portal durante el render inicial.
 * 4. Calcula:
 *    - La cantidad de notificaciones no leídas.
 *    - La colección visible según el filtro seleccionado.
 * 5. Notifica al componente padre el número de no leídas cuando cambia.
 * 6. Escucha la tecla `Escape` para cerrar el panel mientras está abierto.
 * 7. Permite acciones sobre las notificaciones:
 *    - Marcar todas como leídas.
 *    - Marcar una como leída.
 *    - Eliminar una notificación.
 * 8. Renderiza el panel con animación mediante `framer-motion`.
 * 9. Monta el panel usando `createPortal` sobre `document.body`.
 *
 * Este componente concentra la lógica de visualización y gestión
 * de notificaciones en una única unidad reutilizable.
 */
export function NotificationsPanel({ open, onClose, onUnreadChange, anchorPos, panelRef }: Props) {
  /**
   * Estado local de notificaciones visibles en el panel.
   */
  const [items, setItems] = useState<Notification[]>(INITIAL);

  /**
   * Estado local del filtro activo.
   *
   * @remarks
   * Valores posibles:
   * - `"all"`: muestra todas las notificaciones.
   * - `"unread"`: muestra solo las no leídas.
   */
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  /**
   * Indica si el componente ya fue montado en el cliente.
   *
   * @remarks
   * Se utiliza para evitar renderizar el portal antes de tener acceso
   * al DOM.
   */
  const [mounted, setMounted] = useState(false);

  /**
   * Efecto que marca el componente como montado.
   */
  useEffect(() => { setMounted(true); }, []);

  /**
   * Cantidad actual de notificaciones no leídas.
   */
  const unreadCount = items.filter((n) => !n.read).length;

  /**
   * Lista de notificaciones visibles según el filtro seleccionado.
   */
  const visible = filter === 'unread' ? items.filter((n) => !n.read) : items;

  /**
   * Efecto que informa al componente padre la cantidad actual
   * de notificaciones no leídas.
   */
  useEffect(() => { onUnreadChange?.(unreadCount); }, [unreadCount, onUnreadChange]);

  /**
   * Efecto que permite cerrar el panel mediante la tecla `Escape`
   * cuando está abierto.
   *
   * @remarks
   * Registra y elimina el listener según el ciclo de vida del panel.
   */
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  /**
   * Marca todas las notificaciones como leídas.
   *
   * @returns No retorna valor.
   */
  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  /**
   * Marca una notificación específica como leída.
   *
   * @param id Identificador de la notificación.
   * @returns No retorna valor.
   */
  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  /**
   * Elimina una notificación de la lista actual.
   *
   * @param id Identificador de la notificación a eliminar.
   * @returns No retorna valor.
   */
  const remove = (id: string) =>
    setItems((prev) => prev.filter((n) => n.id !== id));

  /**
   * Evita renderizar el panel antes de que el componente esté montado.
   */
  if (!mounted) return null;

  /**
   * Contenido visual principal del panel.
   *
   * @remarks
   * Se define como variable para luego ser montado mediante portal.
   */
  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -6 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{ position: 'fixed', top: anchorPos.top, right: anchorPos.right }}
          className="z-[9999] w-[calc(100vw-2rem)] max-w-[22rem] overflow-hidden rounded-2xl
                     border shadow-xl
                     border-slate-200 bg-white shadow-slate-200/60
                     dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-black/40"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-slate-100 dark:border-[#21262d]">
            <div>
              <p className="text-[13px] font-bold text-slate-800 dark:text-[#e6edf3]">
                Notificaciones
              </p>
              <p className="text-[11px] text-slate-400 dark:text-[#545d68]">
                {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  title="Marcar todas como leídas"
                  className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors
                             text-slate-400 hover:bg-slate-100 hover:text-slate-700
                             dark:text-[#545d68] dark:hover:bg-[#21262d] dark:hover:text-[#adbac7]"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors
                           text-slate-400 hover:bg-slate-100 hover:text-slate-700
                           dark:text-[#545d68] dark:hover:bg-[#21262d] dark:hover:text-[#adbac7]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-1 px-3 pb-1 pt-2">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  filter === f
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/[0.12] dark:text-violet-400'
                    : 'text-slate-400 hover:text-slate-700 dark:text-[#545d68] dark:hover:text-[#adbac7]'
                }`}
              >
                {f === 'all' ? 'Todas' : 'Sin leer'}
                {f === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 rounded-full bg-violet-600 px-1.5 py-px text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Lista */}
          <div className="max-h-[360px] overflow-y-auto px-2 pb-2">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full
                                bg-slate-100 dark:bg-[#21262d]">
                  <Bell className="h-4 w-4 text-slate-400 dark:text-[#545d68]" />
                </div>
                <p className="text-[12px] text-slate-400 dark:text-[#545d68]">
                  Sin notificaciones pendientes
                </p>
              </div>
            ) : (
              visible.map((notif) => {
                /**
                 * Configuración visual correspondiente al tipo
                 * de la notificación actual.
                 */
                const { Icon, bg, iconColor, dot } = TYPE_CONFIG[notif.type];

                return (
                  <div
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className={`group relative flex cursor-pointer items-start gap-2.5 rounded-xl p-2.5 transition-colors ${
                      notif.read
                        ? 'hover:bg-slate-50 dark:hover:bg-[#1c2128]'
                        : 'bg-violet-50/40 hover:bg-violet-50/70 dark:bg-violet-500/[0.06] dark:hover:bg-violet-500/[0.10]'
                    }`}
                  >
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[12px] font-semibold leading-tight ${
                          notif.read
                            ? 'text-slate-500 dark:text-[#768390]'
                            : 'text-slate-900 dark:text-[#e6edf3]'
                        }`}>
                          {notif.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            remove(notif.id);
                          }}
                          className="shrink-0 rounded p-0.5 opacity-0 transition-opacity
                                     text-slate-400 hover:bg-slate-200
                                     group-hover:opacity-100
                                     dark:text-[#545d68] dark:hover:bg-[#30363d]"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed
                                    text-slate-400 dark:text-[#768390]">
                        {notif.body}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-300 dark:text-[#444c56]">
                        {notif.time}
                      </p>
                    </div>

                    {!notif.read && (
                      <span className={`absolute right-2.5 top-3 h-1.5 w-1.5 rounded-full ${dot}`} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-2.5 dark:border-[#21262d]">
            <a
              href="/notificaciones"
              onClick={onClose}
              className="text-[11px] font-medium text-violet-600 hover:underline dark:text-violet-400"
            >
              Ver todas las notificaciones →
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(panel, document.body);
}