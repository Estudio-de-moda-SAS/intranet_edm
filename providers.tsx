"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

export default function Providers({ children, session }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const content = (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );

  // ✅ Bypass activo → no montar SessionProvider (evita el error de Response object)
  if (isBypass) return content;

  // ✅ Producción → SessionProvider normal con Microsoft
return (
  <SessionProvider session={session ?? null}>
    {content}
  </SessionProvider>
);
}