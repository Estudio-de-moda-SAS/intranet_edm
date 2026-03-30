'use client';

import { useState, useEffect } from 'react';
import { createPortal }                from 'react-dom';
import { AnimatePresence, motion }     from 'framer-motion';
import {
  Bell, CheckCheck, Trash2, AlertCircle,
  CheckCircle2, Info, Clock, X,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────

type NotifType = 'info' | 'success' | 'warning' | 'system';

interface Notification {
  id:    string;
  type:  NotifType;
  title: string;
  body:  string;
  time:  string;
  read:  boolean;
}

const INITIAL: Notification[] = [
  { id: '1', type: 'success', title: 'Solicitud aprobada',       body: 'Tu solicitud de vacaciones del 14–21 de julio fue aprobada por Recursos Humanos.', time: 'Hace 5 min', read: false },
  { id: '2', type: 'warning', title: 'Documento por vencer',     body: 'El contrato de proveedor #4821 vence en 3 días. Revísalo antes de que expire.',    time: 'Hace 1 h',   read: false },
  { id: '3', type: 'info',    title: 'Reunión reagendada',        body: 'La reunión de Q3 Planning se movió al jueves 18 jul a las 10:00 AM.',               time: 'Hace 3 h',   read: false },
  { id: '4', type: 'system',  title: 'Actualización del sistema', body: 'La intranet tendrá mantenimiento el sábado 20 jul de 02:00 a 04:00 AM.',            time: 'Ayer',        read: true  },
  { id: '5', type: 'success', title: 'Informe generado',          body: 'El reporte mensual de mayo ya está disponible en la sección Reportes.',             time: 'Hace 2 días', read: true  },
];

const TYPE_CONFIG: Record<NotifType, {
  Icon: React.ElementType; bg: string; iconColor: string; dot: string;
}> = {
  success: { Icon: CheckCircle2, bg: 'bg-emerald-50', iconColor: 'text-emerald-500', dot: 'bg-emerald-400' },
  warning: { Icon: AlertCircle,  bg: 'bg-amber-50',   iconColor: 'text-amber-500',   dot: 'bg-amber-400'   },
  info:    { Icon: Info,         bg: 'bg-blue-50',    iconColor: 'text-blue-500',     dot: 'bg-blue-400'    },
  system:  { Icon: Clock,        bg: 'bg-slate-100',  iconColor: 'text-slate-500',    dot: 'bg-slate-400'   },
};

// ── Props ─────────────────────────────────────────────────────────

interface Props {
  open:            boolean;
  onClose:         () => void;
  onUnreadChange?: (count: number) => void;
  anchorPos:       { top: number; right: number };
  panelRef:        React.RefObject<HTMLDivElement | null>; // controlado desde UserMenu
}

// ── Component ─────────────────────────────────────────────────────

export function NotificationsPanel({ open, onClose, onUnreadChange, anchorPos, panelRef }: Props) {
  const [items,    setItems]    = useState<Notification[]>(INITIAL);
  const [filter,   setFilter]   = useState<'all' | 'unread'>('all');
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const unreadCount = items.filter((n) => !n.read).length;
  const visible     = filter === 'unread' ? items.filter((n) => !n.read) : items;

  useEffect(() => { onUnreadChange?.(unreadCount); }, [unreadCount, onUnreadChange]);

  // Escape — el click fuera lo maneja UserMenu via panelRef
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead    = (id: string) => setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const remove      = (id: string) => setItems((prev) => prev.filter((n) => n.id !== id));

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
          className="w-[calc(100vw-2rem)] max-w-[22rem] rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden z-[9999]"
        >
          {/* Header del panel */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <p className="text-[13px] font-bold text-slate-800">Notificaciones</p>
              <p className="text-[11px] text-slate-400">
                {unreadCount > 0
                  ? `${unreadCount} sin leer`
                  : 'Todo al día'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  title="Marcar todas como leídas"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-1 px-3 pt-2 pb-1">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  filter === f
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-slate-400 hover:text-slate-700'
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
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Bell className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[12px] text-slate-400">Sin notificaciones pendientes</p>
              </div>
            ) : (
              visible.map((notif) => {
                const { Icon, bg, iconColor, dot } = TYPE_CONFIG[notif.type];
                return (
                  <div
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className={`group relative flex items-start gap-2.5 rounded-xl p-2.5 cursor-pointer transition-colors ${
                      notif.read ? 'hover:bg-slate-50' : 'bg-violet-50/40 hover:bg-violet-50/70'
                    }`}
                  >
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[12px] font-semibold leading-tight ${notif.read ? 'text-slate-500' : 'text-slate-900'}`}>
                          {notif.title}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); remove(notif.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 rounded p-0.5 hover:bg-slate-200 text-slate-400"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400 line-clamp-2">{notif.body}</p>
                      <p className="mt-0.5 text-[10px] text-slate-300">{notif.time}</p>
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
          <div className="border-t border-slate-100 px-4 py-2.5">
            <a
              href="/notificaciones"
              onClick={onClose}
              className="text-[11px] font-medium text-violet-600 hover:underline"
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