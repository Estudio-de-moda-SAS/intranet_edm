/**
 * @module GlobalHeader
 * Componente cliente que renderiza el encabezado global de la intranet.
 *
 * @remarks
 * Este archivo gestiona la experiencia principal de navegacion, incluyendo:
 * - Branding corporativo.
 * - Navegacion por departamentos.
 * - Busqueda global.
 * - Menu de usuario.
 * - Acceso al chatbot.
 * - Adaptacion entre vista movil y escritorio.
 */

'use client';

import { useGlobalSearch }   from '@/app/hooks/useGlobalSearch';
import GlobalSearchResults   from '../ui/search/GlobalSearchResults';
import type { AccessLevel }  from '@/lib/roles';

import { useEffect, useRef, useState } from 'react';
import Image       from 'next/image';
import Link        from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Menu } from 'lucide-react';

import { DEPARTMENTS, BRAND, Department } from '@/config/config';
import { useAppSession }  from '@/lib/useAppSession';
import UserMenu           from './UserMenu';

// -- Constantes ----------------------------------------------------------------

const SHRINK_AT  = 140;
const EXPAND_AT  = 60;
const TRANSITION = { duration: 0.3, ease: 'easeInOut' } as const;
const EMPTY_USER = { name: '', role: '', email: '' };

// -- Componente ----------------------------------------------------------------

/**
 * Componente principal del encabezado global.
 *
 * @returns Encabezado responsive con navegacion, busqueda y acciones de usuario.
 */
export default function GlobalHeader() {
  const hasLogo  = Boolean((BRAND as any).logoUrl);
  const pathname = usePathname();

  const [isScrolled,    setIsScrolled]    = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchInputRef      = useRef<HTMLInputElement>(null);
  const searchContainerRef  = useRef<HTMLDivElement>(null);
  const ticking             = useRef(false);
  const scrolledRef         = useRef(false);
  const stateRef            = useRef(false);
  const lockRef             = useRef(false);

  const { user: sessionUser, isLoading } = useAppSession();
console.log('SESSION:', {
  isAuthed: !!sessionUser,
  isLoading,
  level: sessionUser?.accessLevel,
  email: sessionUser?.email,
});
  /**
   * Usuario adaptado al formato esperado por {@link UserMenu}.
   */
  const user = sessionUser
    ? {
        name:  sessionUser.name  ?? 'Usuario',
        role:  sessionUser.role  ?? '',
        email: sessionUser.email ?? '',
        ...(sessionUser.image      && { avatarUrl:   sessionUser.image      }),
        ...(sessionUser.department && { department:  sessionUser.department }),
      }
    : EMPTY_USER;

  const accessLevel: AccessLevel = sessionUser?.accessLevel ?? 'employee';

  const { query, setQuery, results } = useGlobalSearch(accessLevel);

  useEffect(() => { stateRef.current = isScrolled; }, [isScrolled]);

  useEffect(() => {
    if (!isScrolled) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isScrolled]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const update = () => {
      if (lockRef.current) { ticking.current = false; return; }
      const y = window.scrollY;

      if (!scrolledRef.current && y > SHRINK_AT) {
        scrolledRef.current = true;
        if (!stateRef.current) setIsScrolled(true);
        lockRef.current = true;
        setTimeout(() => { lockRef.current = false; }, 320);
      } else if (scrolledRef.current && y < EXPAND_AT) {
        scrolledRef.current = false;
        if (stateRef.current) setIsScrolled(false);
        lockRef.current = true;
        setTimeout(() => { lockRef.current = false; }, 320);
      }

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setQuery]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuery('');
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setQuery]);

  const showUserMenu = !isLoading && Boolean(user.name);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
      >

        {/* Vista movil */}
        <div className={`md:hidden w-full border-b transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-xl border-slate-200 dark:border-[#30363d] shadow-sm dark:shadow-none'
            : 'bg-white dark:bg-[#161b22] border-slate-100 dark:border-[#21262d]'
        }`}>
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              {hasLogo ? (
                <div className="relative shrink-0" style={{ width: 36, height: 28 }}>
                  <Image src={(BRAND as any).logoUrl} alt="Logo" fill className="object-contain" priority />
                </div>
              ) : (
                <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 shadow-sm" />
              )}
              <span className="brand-title font-bold text-[15px] truncate leading-none text-violet-900 dark:text-[#e2d9f8]">
                ESTUDIO DE MODA
              </span>
            </Link>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Abrir busqueda"
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition
                           border-slate-200 bg-slate-50 text-slate-500
                           dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#768390]
                           hover:bg-violet-50 hover:text-violet-600
                           dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
              >
                <Search className="h-4 w-4" />
              </button>
              {showUserMenu && <UserMenu user={user} />}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition
                           border-slate-200 bg-slate-50 text-slate-500
                           dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#768390]
                           hover:bg-violet-50 hover:text-violet-600
                           dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden border-t border-slate-100 bg-white dark:border-[#21262d] dark:bg-[#161b22]"
              >
                <div className="px-3 py-2 flex flex-col">
                  {DEPARTMENTS.map((dept: Department) => {
                    const isActive = pathname.startsWith(dept.href);
                    return (
                      <Link
                        key={dept.id}
                        href={dept.href}
                        className={`flex items-center px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                          isActive
                            ? 'text-violet-700 bg-violet-50 dark:text-violet-400 dark:bg-violet-500/[0.10]'
                            : 'text-slate-600 dark:text-[#adbac7] hover:text-violet-700 dark:hover:text-violet-400 hover:bg-slate-50 dark:hover:bg-[#21262d]'
                        }`}
                      >
                        {dept.label}
                      </Link>
                    );
                  })}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>

        {/* Vista escritorio: barra superior */}
        {/* El div wrapper controla el padding horizontal — fuera del motion.div
            para que Framer Motion no lo sobreescriba con su layout engine */}
        <div className={`hidden md:block w-full border-b relative z-[60] transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-xl border-slate-200 dark:border-[#30363d] shadow-sm dark:shadow-none'
            : 'bg-white dark:bg-[#161b22] border-slate-100 dark:border-[#21262d]'
        }`}>
          <div className="w-full px-20">
            <motion.div
              layout
              animate={{ paddingTop: isScrolled ? 10 : 18, paddingBottom: isScrolled ? 10 : 18 }}
              transition={TRANSITION}
            >
              <div className="flex items-center justify-between gap-6">

                <div className={`flex items-center ${isScrolled ? 'gap-3' : 'gap-5'}`}>
                  <Link href="/" className="flex items-center shrink-0">
                    {hasLogo ? (
                      <motion.div
                        layout
                        animate={{ width: isScrolled ? 50 : 60, height: isScrolled ? 36 : 64 }}
                        transition={TRANSITION}
                        className="relative"
                      >
                        <Image src={(BRAND as any).logoUrl} alt="Logo" fill className="object-contain" priority />
                      </motion.div>
                    ) : (
<motion.div
  layout
  animate={{ paddingTop: isScrolled ? 16 : 32, paddingBottom: isScrolled ? 16 : 32 }}
  transition={TRANSITION}
  style={{ paddingTop: isScrolled ? 16 : 32, paddingBottom: isScrolled ? 16 : 32 }}
/>                    )}
                  </Link>

                  <div className="flex flex-col justify-center min-w-0">
                    <motion.h1
                      layout
                      animate={{ fontSize: isScrolled ? 20 : 32 }}
                      transition={TRANSITION}
                      className="brand-title font-bold tracking-tight leading-none truncate text-violet-900 dark:text-[#e2d9f8]"
                    >
                      ESTUDIO DE MODA
                    </motion.h1>
                    <motion.p
                      layout
                      animate={{ opacity: isScrolled ? 0 : 1, height: isScrolled ? 0 : 18, marginTop: isScrolled ? 0 : 4 }}
                      transition={TRANSITION}
                      className="text-[13px] overflow-hidden whitespace-nowrap text-slate-400 dark:text-[#545d68]"
                    >
                      Plataforma interna corporativa
                    </motion.p>
                  </div>
                </div>

                <motion.div
                  layout
                  transition={TRANSITION}
                  className={`flex shrink-0 ${isScrolled ? 'flex-row items-center gap-3' : 'flex-col items-end gap-3'}`}
                >

                  <div className="flex items-center gap-3">
                    <motion.div
                      ref={searchContainerRef}
                      layout
                      animate={{ width: isScrolled ? 200 : 240, opacity: 1 }}
                      transition={TRANSITION}
                      className="relative z-[999]"
                    >
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-slate-400 dark:text-[#545d68]" />
                      <input
                        id="global-search-input"
                        type="search"
                        placeholder="Buscar en la intranet..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full rounded-lg border py-2 text-[13px] pl-9 pr-4 transition-all duration-200
                                   border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400
                                   dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#cdd9e5] dark:placeholder:text-[#545d68]
                                   focus:outline-none focus:border-violet-400 dark:focus:border-violet-500/50
                                   focus:bg-white dark:focus:bg-[#1c2128]
                                   focus:ring-2 focus:ring-violet-500/15 dark:focus:ring-violet-500/20"
                      />
                      {query && (
                        <GlobalSearchResults
                          results={results}
                          query={query}
                          onSelect={() => setQuery('')}
                        />
                      )}
                    </motion.div>
                    {showUserMenu && <UserMenu user={user} />}
                  </div>
                </motion.div>

              </div>
            </motion.div>
          </div>
        </div>

        {/* Vista escritorio: barra de navegacion */}
        <div className={`hidden md:block w-full border-b relative z-10 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-xl border-slate-100 dark:border-[#21262d]'
            : 'bg-slate-50 dark:bg-[#0d1117] border-slate-100 dark:border-[#21262d]'
        }`}>
          <nav className="w-full px-8 flex items-center gap-0.5">
  {DEPARTMENTS
    .filter((dept: Department) => dept.show)
    .map((dept: Department) => {

      const isActive = pathname.startsWith(dept.href);

      return (
        <Link
          key={dept.id}
          href={dept.href}
                  className={`group relative px-3 py-3 text-[13px] font-medium transition-colors duration-150 whitespace-nowrap rounded-md ${
                    isActive
                      ? 'text-violet-700 dark:text-violet-400'
                      : 'text-slate-500 dark:text-[#768390] hover:text-violet-700 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-[#21262d]'
                  }`}
                >
                  {dept.label}
                  <span
                    aria-hidden
                    className={`absolute bottom-0 left-3 right-3 h-[2px] rounded-full transition-all duration-200 ease-out
                                bg-violet-600 dark:bg-violet-400 ${
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

      </header>

      {/* Overlay de busqueda movil */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] flex flex-col bg-white/97 dark:bg-[#161b22]/97 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 px-5 pt-5">
              <Search className="h-5 w-5 shrink-0 text-slate-400 dark:text-[#545d68]" />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Buscar en la intranet..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-lg focus:outline-none text-slate-800 dark:text-[#e6edf3]
                           placeholder:text-slate-300 dark:placeholder:text-[#545d68]"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition
                           text-slate-400 dark:text-[#768390]
                           hover:text-slate-700 dark:hover:text-[#e6edf3]"
                aria-label="Cerrar busqueda"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mx-5 mt-3 h-px bg-slate-100 dark:bg-[#30363d]" />
            <div className="px-5 mt-4">
              {query ? (
                <GlobalSearchResults
                  query={query}
                  results={results}
                  onSelect={() => setSearchOpen(false)}
                />
              ) : (
                <p className="mt-6 text-center text-sm text-slate-300 dark:text-[#545d68]">
                  Escribe para buscar noticias, personas, documentos...
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// -- AreaSelectHeader ----------------------------------------------------------

import { useRouter } from 'next/navigation';

export type Area = { id: string; label: string; href: string };

export function AreaSelectHeader({ areas }: { areas: Area[] }) {
  const router = useRouter();
  const [val, setVal] = useState('');

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span className="text-xs text-slate-500 dark:text-[#768390]">
        Home de area:
      </span>
      <select
        value={val}
        onChange={(e) => {
          const href = e.target.value;
          setVal('');
          if (href) router.push(href);
        }}
        aria-label="Cambiar a home de area"
        className="rounded-lg border px-2 py-1 text-xs transition-colors
                   border-slate-200 bg-white text-slate-700
                   dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#cdd9e5]
                   focus:outline-none focus:ring-2 focus:ring-violet-500/30
                   focus:border-violet-400 dark:focus:border-violet-500/50"
      >
        <option value="">Selecciona...</option>
        {areas.map((a) => (
          <option key={a.id} value={a.href}>
            {a.label}
          </option>
        ))}
      </select>
    </div>
  );
}