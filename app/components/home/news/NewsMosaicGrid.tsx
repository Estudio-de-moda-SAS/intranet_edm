'use client';

import { NewsTileSquare } from './NewsTileSquare';
import type { Announcement } from '@/types/announcement';

export function NewsMosaicGrid({ items }: { items: Announcement[] }) {
  return (
    <ul className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-fr">
      {items.map((a) => (
        <NewsTileSquare key={a.id} news={a} />
      ))}
    </ul>
  );
}