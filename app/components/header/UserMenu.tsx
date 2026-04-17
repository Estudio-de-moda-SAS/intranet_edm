/**
 * @module UserMenu
 * Componente cliente encargado de renderizar el menú de usuario en la interfaz
 * y gestionar accesos rápidos a perfil, notificaciones, privacidad y cierre
 * de sesión.
 *
 * @remarks
 * Este archivo implementa un menú desplegable anclado al avatar del usuario,
 * junto con la integración de paneles secundarios como notificaciones y
 * configuración de privacidad.
 *
 * Su responsabilidad incluye:
 *
 * - Mostrar la identidad visual del usuario.
 * - Renderizar un menú contextual con acciones de navegación, panel y modal.
 * - Posicionar dinámicamente el dropdown respecto al botón activador.
 * - Mostrar el conteo de notificaciones no leídas.
 * - Abrir y cerrar el panel de notificaciones.
 * - Abrir y cerrar el modal de privacidad.
 * - Cerrar el menú al detectar clics externos.
 *
 * Este componente se ejecuta del lado del cliente porque utiliza estado local,
 * referencias al DOM, efectos, portales y observadores del navegador.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import {
  User, Settings, LogOut, ChevronDown,
  Bell, Shield, HelpCircle,
} from 'lucide-react';

import { NotificationsPanel } from './NotificationsModal';
import { PrivacyModal } from './PrivacyModal';

/**
 * Representa la información mínima requerida del usuario para el menú.
 */
export interface UserMenuUser {
  /**
   * Nombre completo del usuario.
   */
  name: string;

  /**
   * Rol o cargo visible del usuario.
   */
  role: string;

  /**
   * Correo electrónico del usuario.
   */
  email: string;

  /**
   * URL opcional del avatar del usuario.
   *
   * @remarks
   * Si no se proporciona, se mostrarán iniciales generadas dinámicamente.
   */
  avatarUrl?: string;

  /**
   * Departamento o área del usuario.
   */
  department?: string;
}

/**
 * Props del componente {@link UserMenu}.
 */
interface Props {
  /**
   * Información del usuario autenticado que alimenta el menú.
   */
  user: UserMenuUser;
}

/**
 * Tipos de acción soportados por los elementos del menú.
 *
 * @remarks
 * Valores posibles:
 * - `"navigate"`: redirige a una ruta.
 * - `"panel"`: abre o cierra un panel contextual.
 * - `"modal"`: abre un modal.
 */
type MenuAction = 'navigate' | 'panel' | 'modal';

/**
 * Representa un ítem individual del menú de usuario.
 */
interface MenuItem {
  /**
   * Identificador único del ítem.
   */
  id: string;

  /**
   * Texto visible del ítem.
   */
  label: string;

  /**
   * Icono representativo del ítem.
   */
  icon: React.ElementType;

  /**
   * Ruta de navegación asociada al ítem.
   *
   * @remarks
   * Solo aplica cuando `action` es `"navigate"`.
   */
  href?: string;

  /**
   * Tipo de acción ejecutada por el ítem.
   */
  action: MenuAction;
}

/**
 * Configuración estática de las opciones visibles en el menú.
 *
 * @remarks
 * Define accesos rápidos a:
 * - perfil,
 * - notificaciones,
 * - configuración,
 * - privacidad,
 * - ayuda.
 */
const MENU_ITEMS: MenuItem[] = [
  { id: 'profile',       label: 'Mi perfil',      icon: User,       href: '/profile',   action: 'navigate' },
  { id: 'notifications', label: 'Notificaciones', icon: Bell,                           action: 'panel'    },
  { id: 'settings',      label: 'Configuración',  icon: Settings,   href: '/settings',  action: 'navigate' },
  { id: 'privacy',       label: 'Privacidad',     icon: Shield,                         action: 'modal'    },
  { id: 'help',          label: 'Ayuda',          icon: HelpCircle, href: '/help',      action: 'navigate' },
];

/**
 * Genera las iniciales del usuario a partir de su nombre.
 *
 * @param name Nombre completo del usuario.
 * @returns Iniciales en mayúsculas, limitadas a dos caracteres.
 *
 * @remarks
 * Esta función se usa como fallback visual cuando no existe `avatarUrl`.
 */
function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

/**
 * Genera un matiz de color estable basado en el nombre del usuario.
 *
 * @param name Nombre completo del usuario.
 * @returns Valor numérico de matiz (hue) para construir un gradiente.
 *
 * @remarks
 * Esta utilidad permite asignar un color consistente por usuario
 * cuando se renderiza un avatar con iniciales.
 */
function nameToHue(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 60 + 240;
}

/**
 * Componente cliente que renderiza el menú contextual del usuario.
 *
 * @param props Propiedades del componente.
 * @param props.user Información del usuario actual.
 * @returns Botón de usuario, dropdown contextual, panel de notificaciones y modal de privacidad.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Inicializa estados para controlar:
 *    - apertura del menú,
 *    - apertura del panel de notificaciones,
 *    - apertura del modal de privacidad,
 *    - posición del dropdown,
 *    - conteo de notificaciones no leídas.
 * 2. Calcula un color estable para el avatar del usuario.
 * 3. Actualiza dinámicamente la posición del menú según el botón activador.
 * 4. Observa cambios de tamaño en el `header` para reposicionar el dropdown.
 * 5. Detecta clics fuera del menú, botón y panel para cerrarlos.
 * 6. Renderiza el botón principal del usuario.
 * 7. Si el menú está abierto:
 *    - monta el dropdown mediante `createPortal`.
 * 8. Renderiza el panel de notificaciones y el modal de privacidad.
 *
 * Este componente funciona como centro de interacción para acciones rápidas
 * relacionadas con la cuenta del usuario.
 */
export default function UserMenu({ user }: Props) {
  /**
   * Estado que indica si el dropdown principal está abierto.
   */
  const [open, setOpen] = useState(false);

  /**
   * Estado que indica si el panel de notificaciones está abierto.
   */
  const [notifOpen, setNotifOpen] = useState(false);

  /**
   * Estado que indica si el modal de privacidad está abierto.
   */
  const [privacyOpen, setPrivacyOpen] = useState(false);

  /**
   * Posición calculada del dropdown principal.
   *
   * @remarks
   * Se utiliza con `position: fixed` para anclar el panel al botón.
   */
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  /**
   * Cantidad actual de notificaciones no leídas.
   */
  const [unreadCount, setUnreadCount] = useState(3);

  /**
   * Referencia al botón principal que activa el menú.
   */
  const buttonRef = useRef<HTMLButtonElement>(null);

  /**
   * Referencia al contenedor del dropdown principal.
   */
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Referencia al panel de notificaciones.
   *
   * @remarks
   * Se utiliza principalmente para detección de clics externos.
   */
  const panelRef = useRef<HTMLDivElement>(null);

  /**
   * Matiz calculado para generar el gradiente del avatar.
   */
  const hue = nameToHue(user.name);

  /**
   * Recalcula la posición del dropdown a partir del botón activador.
   *
   * @returns No retorna valor.
   *
   * @remarks
   * Usa `getBoundingClientRect()` para obtener la posición actual
   * del botón y derivar el `top` y `right` del menú.
   */
  const updatePos = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
  }, []);

  /**
   * Efecto que recalcula la posición cuando se abre el menú
   * o el panel de notificaciones.
   */
  useEffect(() => {
    if (open || notifOpen) updatePos();
  }, [open, notifOpen, updatePos]);

  /**
   * Efecto que observa cambios de tamaño en el `header`
   * para mantener el menú alineado visualmente.
   *
   * @remarks
   * Utiliza `ResizeObserver` mientras el menú o el panel
   * de notificaciones estén abiertos.
   */
  useEffect(() => {
    if (!open && !notifOpen) return;
    const header = document.querySelector('header');
    if (!header) return;

    const observer = new ResizeObserver(() => updatePos());
    observer.observe(header);

    return () => observer.disconnect();
  }, [open, notifOpen, updatePos]);

  /**
   * Efecto que detecta clics fuera del botón, dropdown y panel
   * de notificaciones para cerrar los elementos abiertos.
   */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const outsideButton = !buttonRef.current?.contains(target);
      const outsideDropdown = !dropdownRef.current?.contains(target);
      const outsidePanel = !panelRef.current?.contains(target);

      if (outsideButton && outsideDropdown && outsidePanel) {
        setOpen(false);
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /**
   * Maneja la acción asociada a un ítem del menú.
   *
   * @param item Ítem seleccionado por el usuario.
   * @returns No retorna valor.
   *
   * @remarks
   * Reglas actuales:
   *
   * - Si la acción es `"panel"`, alterna el panel de notificaciones.
   * - Si la acción es `"modal"`, abre el modal de privacidad.
   * - En acciones distintas de panel, cierra el dropdown principal.
   */
  const handleItemClick = (item: MenuItem) => {
    if (item.action === 'panel') {
      setNotifOpen((prev) => !prev);
      return;
    }

    setOpen(false);

    if (item.action === 'modal') setPrivacyOpen(true);
  };

  /**
   * Callback que actualiza el conteo de notificaciones no leídas.
   *
   * @param remaining Cantidad restante de notificaciones no leídas.
   * @returns No retorna valor.
   */
  const handleNotificationsRead = useCallback((remaining: number) => {
    setUnreadCount(remaining);
  }, []);

  /**
   * Contenido visual del dropdown principal del usuario.
   *
   * @remarks
   * Se define como variable para montarlo posteriormente
   * mediante `createPortal`.
   */
  const dropdown = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{   opacity: 0, scale: 0.96, y: -6  }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right }}
          className="w-[calc(100vw-2rem)] max-w-[18rem] rounded-2xl overflow-hidden z-[9999]
                     border shadow-xl
                     border-slate-200 bg-white shadow-slate-200/60
                     dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-black/40"
        >
          {/* Profile header */}
          <div className="relative overflow-hidden px-5 py-4
                          border-b border-slate-100 dark:border-[#21262d]">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10"
              style={{ background: `hsl(${hue}, 70%, 55%)` }}
            />
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-12 w-12 rounded-xl object-cover ring-2 ring-violet-100 dark:ring-violet-500/20"
                />
              ) : (
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-base font-bold text-white shadow-md shrink-0"
                  style={{ background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${hue + 20},65%,45%))` }}
                >
                  {getInitials(user.name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-slate-900 dark:text-[#e6edf3]">
                  {user.name}
                </p>
                <p className="text-[11px] truncate text-slate-400 dark:text-[#545d68]">
                  {user.email}
                </p>
                {user.department && (
                  <span className="mt-1 inline-block rounded-full px-2 py-px text-[10px] font-semibold
                                   bg-violet-50 border border-violet-100 text-violet-600
                                   dark:bg-violet-500/[0.12] dark:border-violet-500/20 dark:text-violet-400">
                    {user.department}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="px-2 py-2">
            {MENU_ITEMS.map((item) =>
              item.action === 'navigate' ? (
                <Link
                  key={item.id}
                  href={item.href!}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors group
                             text-slate-600 hover:bg-slate-50 hover:text-slate-900
                             dark:text-[#adbac7] dark:hover:bg-[#21262d] dark:hover:text-[#e6edf3]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0 transition-colors
                                   bg-slate-100 group-hover:bg-violet-50 group-hover:text-violet-600
                                   dark:bg-[#21262d] dark:group-hover:bg-violet-500/[0.12] dark:group-hover:text-violet-400">
                    <item.icon className="h-3.5 w-3.5" />
                  </span>
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors group ${
                    item.id === 'notifications' && notifOpen
                      ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/[0.10] dark:text-violet-400'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-[#adbac7] dark:hover:bg-[#21262d] dark:hover:text-[#e6edf3]'
                  }`}
                >
                  <span className={`relative flex h-7 w-7 items-center justify-center rounded-lg shrink-0 transition-colors ${
                    item.id === 'notifications' && notifOpen
                      ? 'bg-violet-100 text-violet-600 dark:bg-violet-500/[0.15] dark:text-violet-400'
                      : 'bg-slate-100 group-hover:bg-violet-50 group-hover:text-violet-600 dark:bg-[#21262d] dark:group-hover:bg-violet-500/[0.12] dark:group-hover:text-violet-400'
                  }`}>
                    <item.icon className="h-3.5 w-3.5" />
                    {item.id === 'notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-1 ring-white dark:ring-[#161b22]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <span className="rounded-full px-1.5 py-px text-[10px] font-bold
                                     bg-rose-50 border border-rose-100 text-rose-500
                                     dark:bg-rose-500/[0.10] dark:border-rose-500/20 dark:text-rose-400">
                      {unreadCount}
                    </span>
                  )}
                  {item.id === 'notifications' && notifOpen && (
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
                  )}
                </button>
              )
            )}
          </div>

          {/* Sign out */}
          <div className="px-2 py-2 border-t border-slate-100 dark:border-[#21262d]">
            <Link
              href="/api/auth/signout"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors group
                         text-rose-500 hover:bg-rose-50
                         dark:text-rose-400 dark:hover:bg-rose-500/[0.08]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0 transition-colors
                               bg-rose-50 group-hover:bg-rose-100
                               dark:bg-rose-500/[0.10] dark:group-hover:bg-rose-500/[0.18]">
                <LogOut className="h-3.5 w-3.5" />
              </span>
              Cerrar sesión
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => {
            setOpen((prev) => {
              if (prev) setNotifOpen(false);
              return !prev;
            });
          }}
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all duration-200
                     hover:bg-slate-100 dark:hover:bg-[#21262d]
                     focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        >
          <div className="relative">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-violet-100 dark:ring-violet-500/20"
              />
            ) : (
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white ring-2 ring-white dark:ring-[#161b22] shadow-sm"
                style={{ background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${hue + 20},65%,45%))` }}
              >
                {getInitials(user.name)}
              </div>
            )}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#161b22] shadow-sm pointer-events-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          <div className="hidden md:flex flex-col items-start text-left leading-none gap-0.5">
            <span className="text-[13px] font-semibold text-slate-800 dark:text-[#e6edf3]">
              {user.name}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-[#545d68]">
              {user.role}
            </span>
          </div>

          <ChevronDown className={`hidden md:block h-3.5 w-3.5 transition-transform duration-200
                                   text-slate-400 dark:text-[#545d68] ${open ? 'rotate-180' : ''}`} />
        </button>

        {typeof window !== 'undefined' && createPortal(dropdown, document.body)}
      </div>

      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onUnreadChange={handleNotificationsRead}
        panelRef={panelRef}
        anchorPos={{
          top: dropdownPos.top,
          right: dropdownPos.right + 288 + 8,
        }}
      />

      <PrivacyModal
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />
    </>
  );
}