"use client";

import { useMemo, useState } from "react";

export function useSearchFilter<T>(
  items: T[],
  predicate: (item: T, search: string) => boolean
) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return items;

    return items.filter((item) =>
      predicate(item, search.toLowerCase())
    );
  }, [items, search, predicate]);

  return {
    search,
    setSearch,
    filtered,
  };
}
