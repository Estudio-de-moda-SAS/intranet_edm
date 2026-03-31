'use client';
import { useGlobalSearch } from '@/app/hooks/useGlobalSearch';
import GlobalSearchResults from '../ui/search/GlobalSearchResults';
import type { AccessLevel } from '@/lib/roles';


import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Menu } from 'lucide-react';

import { DEPARTMENTS, BRAND, Department } from '@/config/config';
import { useDevSession } from '@/lib/useDevSession';
import UserMenu from './UserMenu';
import CorporateBot from './chatbot/ChatBot';

const SHRINK_AT  = 140;
const EXPAND_AT  = 60;
const TRANSITION = { duration: 0.3, ease: 'easeInOut' } as const;

const EMPTY_USER = { name: '', role: '', email: '' };

export default function GlobalHeader() {
  const hasLogo  = Boolean((BRAND as any).logoUrl);
  const pathname = usePathname();

  const [isScrolled, setIsScrolled]   = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const ticking     = useRef(false);
  const scrolledRef = useRef(false);
  const stateRef    = useRef(false);
  const lockRef     = useRef(false);

  const devSession  = useDevSession();
  const sessionUser = devSession?.user ?? null;

const user = sessionUser
  ? {
      name:    sessionUser.name  ?? 'Usuario',
      role:    (sessionUser as any).role  ?? '',
      email:   sessionUser.email ?? '',
      ...(sessionUser.image      && { avatarUrl:   sessionUser.image }),
      ...((sessionUser as any).department && { department: (sessionUser as any).department }),
    }
  : EMPTY_USER;
// PASO 2
const accessLevel: AccessLevel =
  (sessionUser as any)?.accessLevel ?? 'public';

const { query, setQuery, results } = useGlobalSearch(accessLevel);

  useEffect(() => { stateRef.current = isScrolled; }, [isScrolled]);
  useEffect(() => {
    if (!isScrolled) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isScrolled]);
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  // Cierra menú móvil al cambiar de ruta
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
      if (!ticking.current) { ticking.current = true; requestAnimationFrame(update); }
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
      setQuery(''); // esto cierra el dropdown
    }
  };

  document.addEventListener('mousedown', handleClickOutside);

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [setQuery]);
  
/*Cierra con tecla ESC */
useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
    }
  };

  window.addEventListener('keydown', handleEsc);
  return () => window.removeEventListener('keydown', handleEsc);
}, [setQuery]);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
      >

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            MÓVIL — barra fija compacta, siempre igual
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className={`md:hidden w-full border-b transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl border-slate-200 shadow-sm'
            : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center justify-between px-4 py-3 gap-3">

            {/* Logo + nombre */}
            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              {hasLogo ? (
                <div className="relative shrink-0" style={{ width: 36, height: 28 }}>
                  <Image src={(BRAND as any).logoUrl} alt="Logo" fill className="object-contain" priority />
                </div>
              ) : (
                <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 shadow-sm" />
              )}
              <span className="font-bold text-[15px] text-violet-900 truncate leading-none">
                ESTUDIO DE MODA
              </span>
            </Link>

            {/* Acciones derechas */}
            <div className="flex items-center gap-1.5 shrink-0">
              <CorporateBot variant="default" iconOnly />

              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Abrir búsqueda"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-violet-50 hover:text-violet-600"
              >
                <Search className="h-4 w-4" />
              </button>

              {user.name && <UserMenu user={user} />}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menú"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-violet-50 hover:text-violet-600"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Nav móvil desplegable */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden border-t border-slate-100 bg-white"
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
                            ? 'text-violet-700 bg-violet-50'
                            : 'text-slate-600 hover:text-violet-700 hover:bg-slate-50'
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

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            DESKTOP — layout original con animaciones
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className={`hidden md:block w-full border-b relative z-[60] transition-all duration-300 ${
        isScrolled
        ? 'bg-white/95 backdrop-blur-xl border-slate-200 shadow-sm shadow-slate-100'
        : 'bg-white border-slate-100'
        }`}>
          <motion.div
            layout
            animate={{ paddingTop: isScrolled ? 10 : 18, paddingBottom: isScrolled ? 10 : 18 }}
            transition={TRANSITION}
            className="mx-auto max-w-7xl px-6"
          >
            <div className="flex items-center justify-between gap-6">

              {/* Logo + Brand */}
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
                      animate={{ width: isScrolled ? 36 : 64, height: isScrolled ? 36 : 64, borderRadius: isScrolled ? 10 : 16 }}
                      transition={TRANSITION}
                      className="bg-gradient-to-br from-violet-600 to-purple-700 shadow-md shadow-violet-200"
                    />
                  )}
                </Link>

                <div className="flex flex-col justify-center min-w-0">
                  <motion.h1
                    layout
                    animate={{ fontSize: isScrolled ? 20 : 32 }}
                    transition={TRANSITION}
                    className="font-bold tracking-tight text-violet-900 leading-none truncate"
                  >
                    ESTUDIO DE MODA
                  </motion.h1>
                  <motion.p
                    layout
                    animate={{ opacity: isScrolled ? 0 : 1, height: isScrolled ? 0 : 18, marginTop: isScrolled ? 0 : 4 }}
                    transition={TRANSITION}
                    className="text-[13px] text-slate-400 overflow-hidden whitespace-nowrap"
                  >
                    Plataforma interna corporativa
                  </motion.p>
                </div>
              </div>

              {/* Actions */}
              <motion.div
                layout
                transition={TRANSITION}
                className={`flex shrink-0 ${isScrolled ? 'flex-row items-center gap-3' : 'flex-col items-end gap-3'}`}
              >
                <CorporateBot variant={isScrolled ? 'default' : 'expanded'} />

                <div className="flex items-center gap-3">
                  <motion.div 
  ref={searchContainerRef}
  layout
  animate={{ width: isScrolled ? 200 : 240, opacity: 1 }}
  transition={TRANSITION}
  className="relative z-[999]"
>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <input
                      id = 'global-search-input'
                      type="search"
                      placeholder="Buscar en la intranet..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="
                        w-full rounded-lg border border-slate-200 bg-slate-50
                        pl-9 pr-4 py-2 text-[13px] text-slate-700
                        placeholder:text-slate-400
                        transition-all duration-200
                        focus:outline-none focus:border-violet-400
                        focus:bg-white focus:ring-2 focus:ring-violet-500/15
                      "
                    />
                    {query && (
                    <GlobalSearchResults
                    results={results}
                    query={query}
                    onSelect={() => setQuery('')}
                    />
                    )}
                  </motion.div>

                  {user.name && <UserMenu user={user} />}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Nav bar desktop */}
        <div className={`hidden md:block w-full border-b relative z-10 transition-all duration-300 ${
  isScrolled
    ? 'bg-white/95 backdrop-blur-xl border-slate-100'
    : 'bg-slate-50 border-slate-100'
}`}>
          <nav className="mx-auto max-w-7xl px-6 flex items-center gap-1">
            {DEPARTMENTS.map((dept: Department) => {
              const isActive = pathname.startsWith(dept.href);
              return (
                <Link
                  key={dept.id}
                  href={dept.href}
                  className={`group relative px-3 py-3 text-[13px] font-medium transition-colors duration-150 whitespace-nowrap ${
                    isActive ? 'text-violet-700' : 'text-slate-500 hover:text-violet-700'
                  }`}
                >
                  {dept.label}
                  <span
                    aria-hidden
                    className={`absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-violet-600 transition-all duration-250 ease-out ${
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

      </header>

      {/* Mobile search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] bg-white/97 backdrop-blur-xl flex flex-col"
          >
            <div className="flex items-center gap-3 px-5 pt-5">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
             <input
             id='global-search-input'
             ref={searchInputRef}
             type="search"
             placeholder="Buscar en la intranet..."
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             className="flex-1 bg-transparent text-lg text-slate-800 placeholder:text-slate-300 focus:outline-none"
             />
              <button
                onClick={() => setSearchOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 transition"
                aria-label="Cerrar búsqueda"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mx-5 mt-3 h-px bg-slate-100" />
            <div className="px-5 mt-4">
            {query ? (
            <GlobalSearchResults
            query={query}
            results={results}
            onSelect={() => setSearchOpen(false)}
            />
            ) : (
           <p className="mt-6 text-center text-sm text-slate-300">
            Escribe para buscar noticias, personas, documentos…
           </p>
           )}
</div> 
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
