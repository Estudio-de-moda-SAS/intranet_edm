"use client";

import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
}: Props) {
  return (
    <div className="relative w-full">

      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs 
        focus:outline-none focus:ring-2 focus:ring-slate-200"
      />

    </div>
  );
}