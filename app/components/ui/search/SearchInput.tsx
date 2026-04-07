"use client";

import { Search } from "lucide-react";

type SearchInputProps = {
  value:        string;
  onChange:     (value: string) => void;
  placeholder?: string;
};

export default function SearchInput({ value, onChange, placeholder = "Buscar..." }: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2
                                   text-slate-400 dark:text-[#545d68]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border pl-8 pr-3 py-1.5 text-xs transition-colors
                   border-slate-200 bg-white text-slate-700 placeholder:text-slate-400
                   focus:outline-none focus:ring-2 focus:ring-slate-200
                   dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#cdd9e5] dark:placeholder:text-[#545d68]
                   dark:focus:ring-violet-500/20 dark:focus:border-violet-500/50"
      />
    </div>
  );
}
