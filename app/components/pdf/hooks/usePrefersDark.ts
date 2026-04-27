import { useEffect, useState } from "react";

/**
 * @module PdfViewerModal/hooks/usePrefersDark
 * Hook para detectar preferencia de modo oscuro.
 */

/**
 * Hook para detectar preferencia de modo oscuro.
 *
 * @returns `true` si el sistema o el documento HTML están en dark mode.
 *
 * @remarks
 * Evalúa tanto:
 * - `prefers-color-scheme: dark`
 * - como la presencia de la clase `dark` en `<html>`.
 */
export function usePrefersDark(): boolean {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const htmlDark = () => document.documentElement.classList.contains("dark");
    const update = () => setDark(mq.matches || htmlDark());

    update();

    mq.addEventListener("change", update);

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      mq.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  return dark;
}