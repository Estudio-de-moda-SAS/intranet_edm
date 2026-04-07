"use client";

type Option = { value: string; label: string };

type FilterSelectProps = {
  value:    string;
  onChange: (value: string) => void;
  options:  Option[];
};

export default function FilterSelect({ value, onChange, options }: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border px-2 py-1.5 text-xs transition-colors cursor-pointer
                 border-slate-200 bg-white text-slate-600
                 focus:outline-none focus:ring-2 focus:ring-slate-200
                 dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#adbac7]
                 dark:focus:ring-violet-500/20 dark:focus:border-violet-500/50"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

