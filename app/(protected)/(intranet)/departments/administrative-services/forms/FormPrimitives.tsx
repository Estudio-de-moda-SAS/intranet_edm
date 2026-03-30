// app/(protected)/(intranet)/departments/administrative/components/forms/FormPrimitives.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Primitivos de formulario reutilizables para los modales administrativos.
// Estética rose/slate coherente con AdminHomePage.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { forwardRef } from "react";
import { AlertCircle, ChevronDown, Check } from "lucide-react";

// ── FieldWrapper ──────────────────────────────────────────────────────────────

interface FieldWrapperProps {
  label:      string;
  hint?:      string;
  error?:     string;
  required?:  boolean;
  children:   React.ReactNode;
  className?: string;
}

export function FieldWrapper({
  label, hint, error, required, children, className = "",
}: FieldWrapperProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-600">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?:  React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, icon, className = "", ...props }, ref) => (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        className={`
          w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800
          placeholder:text-slate-300 transition-all duration-150
          focus:outline-none focus:ring-2 focus:bg-white
          disabled:cursor-not-allowed disabled:opacity-50
          ${icon ? "pl-9" : ""}
          ${error
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
            : "border-slate-200 focus:border-rose-300 focus:ring-rose-100"
          }
          ${className}
        `}
        {...props}
      />
    </div>
  ),
);
Input.displayName = "Input";

// ── Textarea ──────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      rows={3}
      className={`
        w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm
        text-slate-800 placeholder:text-slate-300 resize-none
        transition-all duration-150 focus:outline-none focus:ring-2 focus:bg-white
        disabled:cursor-not-allowed disabled:opacity-50
        ${error
          ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
          : "border-slate-200 focus:border-rose-300 focus:ring-rose-100"
        }
        ${className}
      `}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

// ── Select ────────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?:       boolean;
  placeholder?: string;
  options:      { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, placeholder, options, className = "", ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={`
          w-full appearance-none rounded-xl border bg-slate-50 px-3.5 py-2.5
          pr-9 text-sm text-slate-800 transition-all duration-150
          focus:outline-none focus:ring-2 focus:bg-white
          disabled:cursor-not-allowed disabled:opacity-50
          ${error
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
            : "border-slate-200 focus:border-rose-300 focus:ring-rose-100"
          }
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  ),
);
Select.displayName = "Select";

// ── CheckboxGroup ─────────────────────────────────────────────────────────────

interface CheckboxGroupProps {
  options:  { value: string; label: string; description?: string }[];
  value:    string[];
  onChange: (next: string[]) => void;
  error?:   string;
  cols?:    1 | 2;
}

export function CheckboxGroup({
  options, value, onChange, error, cols = 2,
}: CheckboxGroupProps) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div className={`grid gap-2 ${cols === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
      {options.map((opt) => {
        const checked = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`
              flex items-start gap-2.5 rounded-xl border p-3 text-left
              transition-all duration-150
              ${checked
                ? "border-rose-300 bg-rose-50"
                : "border-slate-200 bg-slate-50 hover:border-rose-200 hover:bg-rose-50/40"
              }
            `}
          >
            <span className={`
              mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border-2
              transition-colors
              ${checked
                ? "border-rose-600 bg-rose-600"
                : "border-slate-300 bg-white"
              }
            `}>
              {checked && <Check size={10} className="text-white" strokeWidth={3} />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-slate-800">{opt.label}</span>
              {opt.description && (
                <span className="block text-[11px] text-slate-400">{opt.description}</span>
              )}
            </span>
          </button>
        );
      })}
      {error && (
        <p className="col-span-full flex items-center gap-1 text-[11px] text-rose-600">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ── RadioGroup ────────────────────────────────────────────────────────────────

interface RadioGroupProps {
  options:  { value: string; label: string; description?: string; icon?: React.ReactNode }[];
  value:    string;
  onChange: (v: string) => void;
  error?:   string;
  cols?:    1 | 2 | 3;
}

export function RadioGroup({
  options, value, onChange, error, cols = 2,
}: RadioGroupProps) {
  const colClass = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" }[cols];

  return (
    <div className={`grid gap-2 ${colClass}`}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center
              transition-all duration-150
              ${selected
                ? "border-rose-300 bg-rose-50 shadow-sm"
                : "border-slate-200 bg-slate-50 hover:border-rose-200 hover:bg-rose-50/40"
              }
            `}
          >
            {opt.icon && (
              <span className={`${selected ? "text-rose-700" : "text-slate-400"} transition-colors`}>
                {opt.icon}
              </span>
            )}
            <span className={`text-xs font-semibold ${selected ? "text-rose-700" : "text-slate-700"}`}>
              {opt.label}
            </span>
            {opt.description && (
              <span className="text-[10px] text-slate-400 leading-tight">{opt.description}</span>
            )}
          </button>
        );
      })}
      {error && (
        <p className="col-span-full flex items-center gap-1 text-[11px] text-rose-600">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ── StepIndicator ─────────────────────────────────────────────────────────────

interface StepIndicatorProps {
  steps:   string[];
  current: number;       // 0-indexed
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const done    = i < current;
        const active  = i === current;
        const isLast  = i === steps.length - 1;
        return (
          <div key={i} className="flex items-center gap-0 flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span className={`
                flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold
                transition-all duration-300
                ${done    ? "bg-rose-600 text-white"
                : active  ? "bg-rose-100 text-rose-700 ring-2 ring-rose-300"
                :           "bg-slate-100 text-slate-400"
                }
              `}>
                {done ? <Check size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`text-[10px] font-medium whitespace-nowrap
                ${active ? "text-rose-700" : done ? "text-slate-600" : "text-slate-400"}
              `}>
                {label}
              </span>
            </div>
            {!isLast && (
              <div className={`
                h-px flex-1 mx-2 mb-4 transition-colors duration-300
                ${done ? "bg-rose-300" : "bg-slate-200"}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── SubmitButton ──────────────────────────────────────────────────────────────

interface SubmitButtonProps {
  loading:   boolean;
  label:     string;
  loadingLabel?: string;
  onClick?:  () => void;
  disabled?: boolean;
  variant?:  "primary" | "ghost";
}

export function SubmitButton({
  loading, label, loadingLabel, onClick, disabled, variant = "primary",
}: SubmitButtonProps) {
  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={loading || disabled}
        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium
          text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
      >
        {label}
      </button>
    );
  }
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={loading || disabled}
      className="flex items-center gap-2 rounded-xl bg-rose-700 px-5 py-2.5 text-sm
        font-semibold text-white shadow-sm transition-all hover:bg-rose-800
        disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2
          border-white/30 border-t-white" />
      )}
      {loading ? (loadingLabel ?? "Enviando…") : label}
    </button>
  );
}

// ── SuccessBanner ─────────────────────────────────────────────────────────────

interface SuccessBannerProps {
  title:    string;
  message:  string;
  id?:      string;
  onClose:  () => void;
  extra?:   React.ReactNode;
}

export function SuccessBanner({ title, message, id, onClose, extra }: SuccessBannerProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <Check size={28} className="text-emerald-600" strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-base font-bold text-slate-800">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
        {id && (
          <p className="mt-2 rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-600">
            {id}
          </p>
        )}
      </div>
      {extra}
      <button
        onClick={onClose}
        className="mt-1 rounded-xl bg-rose-700 px-6 py-2.5 text-sm font-semibold
          text-white transition-colors hover:bg-rose-800"
      >
        Cerrar
      </button>
    </div>
  );
}
