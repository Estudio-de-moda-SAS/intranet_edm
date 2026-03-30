"use client";

// ─────────────────────────────────────────────────────────────────────────────
// EmployeeCard.tsx — Tarjeta individual de empleado
// "use client" por: hover states, modal trigger, clipboard
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Employee } from "../types";
import { DEPARTMENT_COLORS } from "../mockEmployees";

interface Props {
  employee: Employee;
  onSelect: (employee: Employee) => void;
  viewMode: "grid" | "list";
}

const STATUS_CONFIG = {
  active:   { label: "Activo",     color: "#10b981", bg: "#d1fae5" },
  remote:   { label: "Remoto",     color: "#3b82f6", bg: "#dbeafe" },
  vacation: { label: "Vacaciones", color: "#f59e0b", bg: "#fef3c7" },
  away:     { label: "Ausente",    color: "#6b7280", bg: "#f3f4f6" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function AvatarPlaceholder({ name, department, size = 56 }: { name: string; department: string; size?: number }) {
  const color = DEPARTMENT_COLORS[department] ?? "#1e3a5f";
  const initials = getInitials(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}dd, ${color}88)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.3,
        flexShrink: 0,
        letterSpacing: "0.05em",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {initials}
    </div>
  );
}

export function EmployeeCard({ employee, onSelect, viewMode }: Props) {
  const [copied, setCopied] = useState(false);
  const status = STATUS_CONFIG[employee.status];
  const deptColor = DEPARTMENT_COLORS[employee.department] ?? "#1e3a5f";

  function copyEmail() {
    navigator.clipboard.writeText(employee.mail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (viewMode === "list") {
    return (
      <div
        onClick={() => onSelect(employee)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "0.875rem 1.25rem",
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #e8ecf0",
          cursor: "pointer",
          transition: "all 0.18s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = `${deptColor}55`;
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 16px rgba(0,0,0,0.08)`;
          (e.currentTarget as HTMLDivElement).style.transform = "translateX(2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#e8ecf0";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)";
        }}
      >
        {/* Avatar */}
        <AvatarPlaceholder name={employee.displayName} department={employee.department} size={44} />

        {/* Info principal */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>
              {employee.displayName}
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "999px",
                background: status.bg,
                color: status.color,
              }}
            >
              {status.label}
            </span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "2px" }}>
            {employee.jobTitle}
            <span style={{ margin: "0 0.4rem", color: "#d1d5db" }}>·</span>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: deptColor,
                background: `${deptColor}12`,
                padding: "1px 6px",
                borderRadius: "4px",
              }}
            >
              {employee.department}
            </span>
          </div>
        </div>

        {/* Contacto */}
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "0.78rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <IconMail size={13} />
            {employee.mail}
          </span>
          {employee.mobilePhone && (
            <span style={{ fontSize: "0.78rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <IconPhone size={13} />
              {employee.mobilePhone}
            </span>
          )}
          {employee.officeLocation && (
            <span style={{ fontSize: "0.78rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <IconLocation size={13} />
              {employee.city}
            </span>
          )}
        </div>

        {/* Flecha */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "#9ca3af", flexShrink: 0 }}>
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={() => onSelect(employee)}
      style={{
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid #e8ecf0",
        padding: "1.5rem",
        cursor: "pointer",
        transition: "all 0.22s ease",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${deptColor}66`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px ${deptColor}22`;
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#e8ecf0";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Acento de color superior */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${deptColor}, ${deptColor}55)`,
          borderRadius: "16px 16px 0 0",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <AvatarPlaceholder name={employee.displayName} department={employee.department} size={52} />
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: "999px",
            background: status.bg,
            color: status.color,
            whiteSpace: "nowrap",
          }}
        >
          {status.label}
        </span>
      </div>

      {/* Nombre y cargo */}
      <div>
        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827", lineHeight: 1.3, fontFamily: "'DM Sans', sans-serif" }}>
          {employee.displayName}
        </div>
        <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "3px" }}>{employee.jobTitle}</div>
        <div
          style={{
            display: "inline-block",
            marginTop: "6px",
            fontSize: "0.7rem",
            fontWeight: 600,
            color: deptColor,
            background: `${deptColor}12`,
            padding: "2px 8px",
            borderRadius: "4px",
          }}
        >
          {employee.department}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "#f0f2f5" }} />

      {/* Contacto */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <ContactRow icon={<IconMail size={13} />} value={employee.mail} />
        {employee.mobilePhone && <ContactRow icon={<IconPhone size={13} />} value={employee.mobilePhone} />}
        {employee.businessPhone && (
          <ContactRow
            icon={<IconOfficePhone size={13} />}
            value={`${employee.businessPhone}${employee.extension ? ` Ext. ${employee.extension}` : ""}`}
          />
        )}
        {employee.officeLocation && (
          <ContactRow icon={<IconLocation size={13} />} value={employee.officeLocation} />
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
        <button
          onClick={(e) => { e.stopPropagation(); copyEmail(); }}
          style={{
            flex: 1,
            padding: "0.45rem 0",
            fontSize: "0.75rem",
            fontWeight: 600,
            background: copied ? "#d1fae5" : "#f4f6f9",
            color: copied ? "#059669" : "#374151",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.15s",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {copied ? "¡Copiado!" : "Copiar email"}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(employee); }}
          style={{
            flex: 1,
            padding: "0.45rem 0",
            fontSize: "0.75rem",
            fontWeight: 600,
            background: deptColor,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Ver perfil
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ContactRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
      <span style={{ color: "#9ca3af", marginTop: "1px", flexShrink: 0 }}>{icon}</span>
      <span
        style={{
          fontSize: "0.75rem",
          color: "#6b7280",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Inline SVG icons ─────────────────────────────────────────────────────────

function IconMail({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 6l7 4 7-4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconPhone({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M5.5 2H4a2 2 0 00-2 2c0 5.523 4.477 10 10 10a2 2 0 002-2v-1.5a1 1 0 00-1-1l-2-.5a1 1 0 00-1 .3l-.8.8A8.003 8.003 0 015.4 6.3l.8-.8a1 1 0 00.3-1L6 2.5a1 1 0 00-1-1z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconOfficePhone({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 5h6M5 8h4M5 11h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconLocation({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5A4.5 4.5 0 013.5 6c0 3 4.5 8.5 4.5 8.5S12.5 9 12.5 6A4.5 4.5 0 008 1.5z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}