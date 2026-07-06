"use client";

import type {
  GraphOrganizationTreeNode,
  OrganizationUnit,
} from "../types/organization.types";

interface OrganizationNodeProps {
  unit?: OrganizationUnit;
  node?: GraphOrganizationTreeNode;
  expandedIds: Set<string>;
  selectedUnitId: string;
  searchTerm: string;
  onToggle: (unitId: string) => void;
  onSelect: (unitId: string) => void;
  isRoot?: boolean;
}

function getInitials(value: string) {
  const normalizedValue = value.trim();

  const parts = normalizedValue
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "ED";
}

function nodeMatchesSearch(
  value: GraphOrganizationTreeNode | OrganizationUnit,
  searchTerm: string
) {
  if (!searchTerm) {
    return false;
  }

  const searchableValues =
    "displayName" in value
      ? [
          value.displayName,
          value.jobTitle,
          value.email,
          value.department,
          value.officeLocation,
        ]
      : [
          value.name,
          value.leader,
          value.description,
          value.contactEmail,
          value.location,
        ];

  return searchableValues
    .filter((item): item is string => Boolean(item))
    .some((item) => item.toLowerCase().includes(searchTerm));
}

export function OrganizationNode({
  unit,
  node,
  expandedIds,
  selectedUnitId,
  searchTerm,
  onToggle,
  onSelect,
  isRoot = false,
}: OrganizationNodeProps) {
  const currentNode = node ?? unit;

  if (!currentNode) {
    return null;
  }

  const isGraphNode = "displayName" in currentNode;

  const id = currentNode.id;
  const name = isGraphNode ? currentNode.displayName : currentNode.name;
  const role = isGraphNode ? currentNode.jobTitle : currentNode.leader;
  const department = isGraphNode ? currentNode.department : undefined;
  const photoUrl = isGraphNode ? currentNode.photoUrl : undefined;
  const children = currentNode.children ?? [];

  const hasChildren = children.length > 0;
  const childrenCount = children.length;
  const isExpanded = expandedIds.has(id);
  const isMatched = nodeMatchesSearch(currentNode, searchTerm);
  const isSelected = selectedUnitId === id;

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
          onClick={() => onSelect(id)}
          aria-label={`Ver detalle de ${name}`}
        >
          <div className="organization-node-card__avatar">
            {photoUrl ? (
              <img src={photoUrl} alt={name} />
            ) : (
              <span>{getInitials(name)}</span>
            )}
          </div>

          <div className="organization-node-card__content">
            <div className="organization-node-card__eyebrow">
              {isRoot ? "Dirección" : hasChildren ? "Líder" : "Colaborador"}
            </div>

            <h3>{name}</h3>

            {role && <p>{role}</p>}

            <div className="organization-node-card__meta">
              {department && <span>{department}</span>}
              {hasChildren && <span>{childrenCount} personas</span>}
            </div>
          </div>
        </button>

        {hasChildren && (
          <button
            type="button"
            className="organization-node-card__toggle"
            onClick={(event) => {
              event.stopPropagation();
              onToggle(id);
            }}
            aria-label={isExpanded ? "Contraer equipo" : "Ver equipo"}
          >
            {isExpanded ? "−" : "+"}
          </button>
        )}
      </article>

      {hasChildren && isExpanded && (
        <div className="organization-node__children">
          {children.map((child) =>
            isGraphNode ? (
              <OrganizationNode
                key={child.id}
                node={child as GraphOrganizationTreeNode}
                expandedIds={expandedIds}
                selectedUnitId={selectedUnitId}
                searchTerm={searchTerm}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ) : (
              <OrganizationNode
                key={child.id}
                unit={child as OrganizationUnit}
                expandedIds={expandedIds}
                selectedUnitId={selectedUnitId}
                searchTerm={searchTerm}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}