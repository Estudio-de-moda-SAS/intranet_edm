"use client";

import SearchInput  from "@/app/components/ui/search/SearchInput";
import FilterSelect from "./FilterSelect";

type Filter = {
  value:    string;
  onChange: (value: string) => void;
  options:  { value: string; label: string }[];
};

type FilterBarProps = {
  search:             string;
  setSearch:          (value: string) => void;
  searchPlaceholder?: string;
  filters?:           Filter[];
};

export default function FilterBar({
  search,
  setSearch,
  searchPlaceholder = "Buscar...",
  filters = [],
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-3
                    border-b border-slate-100 bg-slate-50/50
                    dark:border-[#21262d] dark:bg-[#1c2128]/40">
      <div className="flex-1">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={searchPlaceholder}
        />
      </div>

      {filters.map((filter, i) => (
        <FilterSelect
          key={i}
          value={filter.value}
          onChange={filter.onChange}
          options={filter.options}
        />
      ))}
    </div>
  );
}

