"use client";

import type { OrganizationUnit } from "../types/organization.types";

interface OrganizationNodeProps {
  unit: OrganizationUnit;
  expandedIds: Set<string>;
  selectedUnitId: string;
  searchTerm: string;
  onToggle: (unitId: string) => void;
  onSelect: (unitId: string) => void;
  isRoot?: boolean;
}

function unitMatchesSearch(unit: OrganizationUnit, searchTerm: string) {
  if (!searchTerm) {
    return false;
  }

  return [
    unit.name,
    unit.leader,
    unit.description,
    unit.contactEmail,
    unit.location,
  ]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(searchTerm));
}

function getInitials(value: string) {
  const normalizedValue = value.trim();

  const knownAcronyms: Record<string, string> = {
    "gerencia general": "GG",
    tecnología: "TI",
    "talento humano": "TH",
    comercial: "CO",
    logística: "LG",
    finanzas: "FI",
    jurídico: "JU",
    desarrollo: "DE",
    "mesa de ayuda": "MA",
    selección: "SE",
    bienestar: "BI",
    tiendas: "TD",
    "e-commerce": "EC",
    ecommerce: "EC",
  };

  const acronym = knownAcronyms[normalizedValue.toLowerCase()];

  if (acronym) {
    return acronym;
  }

  const parts = normalizedValue
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "ED";
}

export function OrganizationNode({
  unit,
  expandedIds,
  selectedUnitId,
  searchTerm,
  onToggle,
  onSelect,
  isRoot = false,
}: OrganizationNodeProps) {
  const hasChildren = Boolean(unit.children?.length);
  const childrenCount = unit.children?.length ?? 0;
  const isExpanded = expandedIds.has(unit.id);
  const isMatched = unitMatchesSearch(unit, searchTerm);
  const isSelected = selectedUnitId === unit.id;

  return (
    <div
      className={[
        "organization-node",
        isRoot ? "organization-node--root" : "",
        hasChildren ? "organization-node--has-children" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <article
        className={[
          "organization-node-card",
          isRoot ? "organization-node-card--root" : "",
          isMatched ? "organization-node-card--matched" : "",
          isSelected ? "organization-node-card--selected" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          type="button"
          className="organization-node-card__main"
          onClick={() => onSelect(unit.id)}
          aria-label={`Ver detalle de ${unit.name}`}
        >
          <div className="organization-node-card__avatar">
            {getInitials(unit.name)}
          </div>

          <div className="organization-node-card__content">
            <div className="organization-node-card__eyebrow">
              {isRoot ? "Dirección" : hasChildren ? "Área" : "Equipo"}
            </div>

            <h3>{unit.name}</h3>

            {unit.leader && <p>{unit.leader}</p>}

            <div className="organization-node-card__meta">
              {typeof unit.employeeCount === "number" && (
                <span>{unit.employeeCount} colab.</span>
              )}

              {hasChildren && <span>{childrenCount} subáreas</span>}
            </div>
          </div>
        </button>

        {hasChildren && (
          <button
            type="button"
            className="organization-node-card__toggle"
            onClick={(event) => {
              event.stopPropagation();
              onToggle(unit.id);
            }}
            aria-label={isExpanded ? "Contraer equipo" : "Ver equipo"}
          >
            {isExpanded ? "−" : "+"}
          </button>
        )}
      </article>

      {hasChildren && isExpanded && (
        <div className="organization-node__children">
          {unit.children?.map((child) => (
            <OrganizationNode
              key={child.id}
              unit={child}
              expandedIds={expandedIds}
              selectedUnitId={selectedUnitId}
              searchTerm={searchTerm}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}