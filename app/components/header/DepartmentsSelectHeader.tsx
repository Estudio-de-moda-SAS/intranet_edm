// app/_components/AreaSelectHeader.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type Area = { id: string; label: string; href: string };

export default function AreaSelectHeader({ areas }: { areas: Area[] }) {
  const router = useRouter();
  const [val, setVal] = useState('');

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span className="text-xs text-gray-600 dark:text-gray-400">Home de área:</span>
      <select
        value={val}
        onChange={(e) => {
          const href = e.target.value;
          setVal('');
          if (href) router.push(href);
        }}
        aria-label="Cambiar a home de área"
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
      >
        <option value="">Selecciona…</option>
        {areas.map((a) => (
          <option key={a.id} value={a.href}>
            {a.label}
          </option>
        ))}
      </select>
    </div>
  );
}