"use client";

/**
 * @module PowerBIViewer
 * @remarks
 * Renders a single Power BI report inside an iframe.
 *
 * Handles four states:
 * - **loading** — skeleton placeholder while the iframe initialises
 * - **no-access** — Power BI blocked the load due to missing permissions;
 *   shows a "Solicitar acceso" CTA that opens Power BI's native request-access flow
 * - **loaded** — iframe visible and interactive
 * - **error** — generic load failure with retry button
 *
 * Load detection strategy (in priority order):
 * 1. `onLoad` event — fires when the iframe document finishes loading;
 *    used as the primary signal since Power BI postMessage is unreliable
 *    across tenants and embed modes
 * 2. `window.addEventListener("message")` — Power BI SDK postMessage events
 *    as a secondary confirmation
 * 3. Fallback timeout — safety net if neither fires within {@link LOAD_TIMEOUT_MS}
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Lock, RefreshCw, AlertTriangle } from "lucide-react";
import type { PowerBIDashboard } from "@/config/powerbi.catalog";
import { toEmbedUrl } from "@/config/powerbi.catalog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ViewerState = "loading" | "loaded" | "no-access" | "error";

interface PowerBIViewerProps {
  dashboard: PowerBIDashboard;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** URL substrings that indicate Power BI redirected to an access-denied page. */
const ACCESS_DENIED_PATTERNS = [
  "requestaccess",
  "request-access",
  "noPermissions",
  "accessDenied",
];

/** Safety net timeout in ms — resolves loading state if no other signal fires. */
const LOAD_TIMEOUT_MS = 8_000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PowerBIViewer({ dashboard }: PowerBIViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<ViewerState>("loading");

  const embedUrl = toEmbedUrl(dashboard.reportUrl);

  const clearFallback = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // -- Primary: onLoad fires when iframe document finishes loading
  const handleIframeLoad = useCallback(() => {
    clearFallback();

    // Try to inspect the iframe URL — only works if same-origin, which
    // app.powerbi.com is not, so this will throw. We catch and proceed.
    try {
      const iframeUrl =
        iframeRef.current?.contentWindow?.location?.href ?? "";
      const denied = ACCESS_DENIED_PATTERNS.some((p) =>
        iframeUrl.toLowerCase().includes(p)
      );
      if (denied) {
        setState("no-access");
        return;
      }
    } catch {
      // Cross-origin — can't read location, that's expected and fine
    }

    // onLoad fired without a denial signal → report is showing
    setState("loaded");
  }, []);

  // -- Secondary: Power BI SDK postMessage events
  const handleMessage = useCallback((event: MessageEvent) => {
    if (!event.origin.includes("powerbi.com")) return;
    try {
      const data =
        typeof event.data === "string" ? JSON.parse(event.data) : event.data;

      if (data?.type === "error") {
        clearFallback();
        const msg: string = JSON.stringify(data).toLowerCase();
        if (
          msg.includes("unauthorized") ||
          msg.includes("forbidden") ||
          msg.includes("access") ||
          msg.includes("permission")
        ) {
          setState("no-access");
        } else {
          setState("error");
        }
      } else if (data?.type === "loaded") {
        clearFallback();
        setState("loaded");
      }
    } catch {
      // Non-JSON postMessage — ignore
    }
  }, []);

  // -- Safety net timeout
  useEffect(() => {
    window.addEventListener("message", handleMessage);
    timeoutRef.current = setTimeout(() => {
      setState((prev) => (prev === "loading" ? "loaded" : prev));
    }, LOAD_TIMEOUT_MS);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearFallback();
    };
  }, [handleMessage, dashboard.id]);

  const handleRetry = () => {
    setState("loading");
    // Reset timeout
    clearFallback();
    timeoutRef.current = setTimeout(() => {
      setState((prev) => (prev === "loading" ? "loaded" : prev));
    }, LOAD_TIMEOUT_MS);

    if (iframeRef.current) iframeRef.current.src = embedUrl;
  };

  /** Power BI native request-access URL */
  const requestAccessUrl = `${dashboard.reportUrl.split("?")[0]}?action=requestAccess`;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200 dark:border-slate-700/60">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {dashboard.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {dashboard.description}
          </p>
          {dashboard.tags && dashboard.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {dashboard.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {state === "error" && (
            <button
              onClick={handleRetry}
              title="Reintentar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <a
            href={dashboard.reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir en Power BI"
            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* ── Viewer body ─────────────────────────────────────────────────── */}
      <div
        className="relative w-full bg-slate-50 dark:bg-slate-950"
        style={{ aspectRatio: dashboard.aspectRatio ?? "16/9" }}
      >
        {/* Loading skeleton */}
        <AnimatePresence>
          {state === "loading" && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10 flex flex-col gap-3 p-6"
            >
              <div className="h-8 w-2/5 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 flex-1 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No access */}
        <AnimatePresence>
          {state === "no-access" && (
            <motion.div
              key="no-access"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 p-8"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-center max-w-xs">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Sin acceso a este tablero
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  No tienes permisos para ver{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {dashboard.title}
                  </span>
                  . Puedes solicitar acceso al administrador del workspace.
                </p>
              </div>
              <a
                href={requestAccessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Solicitar acceso
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generic error */}
        <AnimatePresence>
          {state === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-8"
            >
              <AlertTriangle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                No se pudo cargar el tablero. Verifica tu conexión e intenta de
                nuevo.
              </p>
              <button
                onClick={handleRetry}
                className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
              >
                Reintentar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Iframe — always mounted so events fire */}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={dashboard.title}
          onLoad={handleIframeLoad}
          allow="fullscreen; clipboard-write"
          allowFullScreen
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
            state === "loaded" ? "opacity-100" : "opacity-0"
          }`}
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}