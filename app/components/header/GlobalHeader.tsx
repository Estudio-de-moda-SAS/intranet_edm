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

  const [isScrolled, setIsScrolled]         = useState(false);
  const [searchOpen, setSearchOpen]         = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchInputRef      = useRef<HTMLInputElement>(null);
  const searchContainerRef  = useRef<HTMLDivElement>(null);
  const ticking             = useRef(false);
  const scrolledRef         = useRef(false);
  const stateRef            = useRef(false);
  const lockRef             = useRef(false);

  const devSession  = useDevSession();
  const sessionUser = devSession?.user ?? null;

  const user = sessionUser
    ? {
        name:    sessionUser.name  ?? 'Usuario',
        role:    (sessionUser as any).role  ?? '',
        email:   sessionUser.email ?? '',
        ...(sessionUser.image               && { avatarUrl:   sessionUser.image }),
        ...((sessionUser as any).department && { department: (sessionUser as any).department }),
      }
    : EMPTY_USER;

  const accessLevel: AccessLevel = (sessionUser as any)?.accessLevel ?? 'public';
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

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
      >

        {/* ── MÓVIL ─────────────────────────────────────────────── */}
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
              <span className="brand-title font-bold text-[15px] text-violet-900 dark:text-[#e2d9f8] truncate leading-none">
                ESTUDIO DE MODA
              </span>
            </Link>

            <div className="flex items-center gap-1.5 shrink-0">
              <CorporateBot variant="default" iconOnly />
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Abrir búsqueda"
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition
                           border-slate-200 bg-slate-50 text-slate-500
                           dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#768390]
                           hover:bg-violet-50 hover:text-violet-600
                           dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
              >
                <Search className="h-4 w-4" />
              </button>
              {user.name && <UserMenu user={user} />}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menú"
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
                className="overflow-hidden border-t
                           border-slate-100 bg-white
                           dark:border-[#21262d] dark:bg-[#161b22]"
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
                            ? 'text-violet-700 bg-violet-50 dark:text-violet-400 dark:bg-violet-500/10'
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

        {/* ── DESKTOP — top bar ─────────────────────────────────── */}
        <div className={`hidden md:block w-full border-b relative z-[60] transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-xl border-slate-200 dark:border-[#30363d] shadow-sm dark:shadow-none'
            : 'bg-white dark:bg-[#161b22] border-slate-100 dark:border-[#21262d]'
        }`}>
          <motion.div
            layout
            animate={{ paddingTop: isScrolled ? 10 : 18, paddingBottom: isScrolled ? 10 : 18 }}
            transition={TRANSITION}
            className="mx-auto max-w-7xl px-6"
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
                      animate={{ width: isScrolled ? 36 : 64, height: isScrolled ? 36 : 64, borderRadius: isScrolled ? 10 : 16 }}
                      transition={TRANSITION}
                      className="bg-gradient-to-br from-violet-600 to-purple-700 shadow-md shadow-violet-200 dark:shadow-none"
                    />
                  )}
                </Link>

                <div className="flex flex-col justify-center min-w-0">
                  <motion.h1
                    layout
                    animate={{ fontSize: isScrolled ? 20 : 32 }}
                    transition={TRANSITION}
                    className="brand-title font-bold tracking-tight leading-none truncate
                               text-violet-900 dark:text-[#e2d9f8]"
                  >
                    ESTUDIO DE MODA
                  </motion.h1>
                  <motion.p
                    layout
                    animate={{ opacity: isScrolled ? 0 : 1, height: isScrolled ? 0 : 18, marginTop: isScrolled ? 0 : 4 }}
                    transition={TRANSITION}
                    className="text-[13px] overflow-hidden whitespace-nowrap
                               text-slate-400 dark:text-[#545d68]"
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
                <CorporateBot variant={isScrolled ? 'default' : 'expanded'} />

                <div className="flex items-center gap-3">
                  <motion.div
                    ref={searchContainerRef}
                    layout
                    animate={{ width: isScrolled ? 200 : 240, opacity: 1 }}
                    transition={TRANSITION}
                    className="relative z-[999]"
                  >
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none
                                       text-slate-400 dark:text-[#545d68]" />
                    <input
                      id="global-search-input"
                      type="search"
                      placeholder="Buscar en la intranet..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="
                        w-full rounded-lg border py-2 text-[13px]
                        pl-9 pr-4
                        transition-all duration-200
                        border-slate-200  bg-slate-50  text-slate-700  placeholder:text-slate-400
                        dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#cdd9e5] dark:placeholder:text-[#545d68]
                        focus:outline-none focus:border-violet-400 dark:focus:border-violet-500/50
                        focus:bg-white dark:focus:bg-[#1c2128]
                        focus:ring-2 focus:ring-violet-500/15 dark:focus:ring-violet-500/20
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

        {/* ── DESKTOP — nav bar ─────────────────────────────────── */}
        <div className={`hidden md:block w-full border-b relative z-10 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-xl border-slate-100 dark:border-[#21262d]'
            : 'bg-slate-50 dark:bg-[#0d1117] border-slate-100 dark:border-[#21262d]'
        }`}>
          <nav className="mx-auto max-w-7xl px-6 flex items-center gap-1">
            {DEPARTMENTS.map((dept: Department) => {
              const isActive = pathname.startsWith(dept.href);
              return (
                <Link
                  key={dept.id}
                  href={dept.href}
                  className={`group relative px-3 py-3 text-[13px] font-medium transition-colors duration-150 whitespace-nowrap ${
                    isActive
                      ? 'text-violet-700 dark:text-violet-400'
                      : 'text-slate-500 dark:text-[#768390] hover:text-violet-700 dark:hover:text-violet-400'
                  }`}
                >
                  {dept.label}
                  <span
                    aria-hidden
                    className={`absolute bottom-0 left-3 right-3 h-[2px] rounded-full transition-all duration-250 ease-out
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

      {/* Mobile search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] flex flex-col
                       bg-white/97 dark:bg-[#161b22]/97 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 px-5 pt-5">
              <Search className="h-5 w-5 shrink-0
                                 text-slate-400 dark:text-[#545d68]" />
              <input
                id="global-search-input"
                ref={searchInputRef}
                type="search"
                placeholder="Buscar en la intranet..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-lg focus:outline-none
                           text-slate-800 dark:text-[#e6edf3]
                           placeholder:text-slate-300 dark:placeholder:text-[#545d68]"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition
                           text-slate-400 dark:text-[#768390]
                           hover:text-slate-700 dark:hover:text-[#e6edf3]"
                aria-label="Cerrar búsqueda"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mx-5 mt-3 h-px
                            bg-slate-100 dark:bg-[#30363d]" />
            <div className="px-5 mt-4">
              {query ? (
                <GlobalSearchResults
                  query={query}
                  results={results}
                  onSelect={() => setSearchOpen(false)}
                />
              ) : (
                <p className="mt-6 text-center text-sm
                              text-slate-300 dark:text-[#545d68]">
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