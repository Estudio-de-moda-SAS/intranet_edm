/**
 * @module NotificationsModal
 * Panel flotante de notificaciones de la intranet EDM.
 *
 * @remarks
 * **Estado actual:**
 * Las notificaciones reales de Microsoft Graph requieren los scopes
 * `Mail.Read` y `Calendars.Read`, que aun no estan habilitados en el
 * tenant. Mientras no se obtenga Admin Consent para esos scopes, el
 * panel muestra un estado vacio honesto con un aviso al colaborador.
 *
 * **Cuando se agreguen los scopes**, este componente se conectara a:
 * - `/me/messages?$filter=isRead eq false` — emails no leidos
 * - `/me/events?$filter=start/dateTime ge '{hoy}'` — proximos eventos
 * - `/me/todo/lists/{id}/tasks?$filter=status ne 'completed'` — tareas
 *
 * La estructura del panel (filtros, acciones, lista) esta lista para
 * recibir datos reales sin cambios visuales.
 */

'use client';

import { useState, useEffect } from 'react';
import { createPortal }        from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X, Info }       from 'lucide-react';

// -- Tipos --------------------------------------------------------------------

type NotifType = 'info' | 'success' | 'warning' | 'system';

interface Notification {
  id:    string;
  type:  NotifType;
  title: string;
  body:  string;
  time:  string;
  read:  boolean;
}

interface Props {
  open:             boolean;
  onClose:          () => void;
  onUnreadChange?:  (count: number) => void;
  anchorPos:        { top: number; right: number };
  panelRef:         React.RefObject<HTMLDivElement | null>;
}

// -- Componente ---------------------------------------------------------------

/**
 * Panel flotante de notificaciones.
 *
 * @remarks
 * Actualmente muestra estado vacio con aviso de scopes pendientes.
 * La logica de filtrado, marcado y eliminacion esta implementada y
 * lista para cuando lleguen datos reales de Graph.
 */
export function NotificationsPanel({
  open,
  onClose,
  onUnreadChange,
  anchorPos,
  panelRef,
}: Props) {
  const [items,   setItems]   = useState<Notification[]>([]);
  const [filter,  setFilter]  = useState<'all' | 'unread'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const unreadCount = items.filter((n) => !n.read).length;
  const visible     = filter === 'unread' ? items.filter((n) => !n.read) : items;

  useEffect(() => { onUnreadChange?.(unreadCount); }, [unreadCount, onUnreadChange]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead    = (id: string) => setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const remove      = (id: string) => setItems((prev) => prev.filter((n) => n.id !== id));

  // Silencia warnings de unused — se usaran cuando lleguen datos reales
  void markAllRead; void markRead; void remove; void visible;

  if (!mounted) return null;

  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{   opacity: 0, scale: 0.96, y: -6  }}
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
                Todo al dia
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors
                         text-slate-400 hover:bg-slate-100 hover:text-slate-700
                         dark:text-[#545d68] dark:hover:bg-[#21262d] dark:hover:text-[#adbac7]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
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
              </button>
            ))}
          </div>

          {/* Estado vacio con aviso honesto */}
          <div className="px-4 py-6 flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full
                            bg-slate-100 dark:bg-[#21262d]">
              <Bell className="h-5 w-5 text-slate-400 dark:text-[#545d68]" />
            </div>

            <div>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-[#e6edf3]">
                Sin notificaciones
              </p>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-[#545d68]">
                No hay alertas pendientes en este momento.
              </p>
            </div>

            {/* Aviso de scopes pendientes */}
            <div className="w-full flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2.5 text-left
                            dark:border-amber-500/20 dark:bg-amber-500/[0.06]">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
              <p className="text-[11px] text-amber-700 leading-relaxed dark:text-amber-400">
                Las notificaciones de correo y calendario estaran disponibles
                cuando se habiliten los permisos{" "}
                <span className="font-semibold">Mail.Read</span> y{" "}
                <span className="font-semibold">Calendars.Read</span> en
                Microsoft 365.
              </p>
            </div>
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