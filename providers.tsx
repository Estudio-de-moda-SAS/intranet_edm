"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { SettingsInitializer } from "@/app/components/SettingsInitializer";

interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";
const STORAGE_KEY = "edm_intranet_settings";

function getAnimationsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    return JSON.parse(raw)?.appearance?.animations ?? true;
  } catch {
    return true;
  }
}

export default function Providers({ children, session }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    setAnimationsEnabled(getAnimationsEnabled());

    const handleCustom = (e: Event) => {
      const enabled = (e as CustomEvent<{ enabled: boolean }>).detail.enabled;
      setAnimationsEnabled(enabled);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setAnimationsEnabled(getAnimationsEnabled());
    };

    window.addEventListener("edm:animations", handleCustom);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("edm:animations", handleCustom);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const content = (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion={animationsEnabled ? "never" : "always"}>
        {/* ✅ Aplica settings (dark mode, densidad, font, etc.) en CADA página */}
        <SettingsInitializer />
        {children}
      </MotionConfig>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );

  if (isBypass) return content;

  return (
    <SessionProvider session={session ?? null}>
      {content}
    </SessionProvider>
  );
}