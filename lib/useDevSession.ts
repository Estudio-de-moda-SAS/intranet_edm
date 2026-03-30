// lib/useDevSession.ts
'use client';

import { DEV_SESSION } from '@/lib/devSession';

export function useDevSession() {
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true') {
    return DEV_SESSION;
  }
  return null;
}

export { DEV_SESSION };