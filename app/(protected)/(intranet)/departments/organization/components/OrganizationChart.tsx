"use client";

import { useMemo, useState } from "react";
import type { OrganizationUnit } from "../types/organization.types";
import { OrganizationNode } from "./OrganizationNode";
import { OrganizationContactPanel } from "./OrganizationContactPanel";

interface OrganizationChartProps {
  structure: OrganizationUnit;
}

function flattenUnits(unit: OrganizationUnit): OrganizationUnit[] {
  return [unit, ...(unit.children?.flatMap(flattenUnits) ?? [])];
}

export function OrganizationChart({ structure }: OrganizationChartProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState(structure.id);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set([structure.id])
  );

  const allUnits = useMemo(() => flattenUnits(structure), [structure]);

  const selectedUnit =
    allUnits.find((unit) => unit.id === selectedUnitId) ?? structure;

  const allExpandableIds = useMemo(
    () =>
      allUnits
        .filter((unit) => unit.children && unit.children.length > 0)
        .map((unit) => unit.id),
    [allUnits]
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const handleToggle = (unitId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }

      return next;
    });
  };

  const handleSelect = (unitId: string) => {
    setSelectedUnitId(unitId);
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(allExpandableIds));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set([structure.id]));
    setSelectedUnitId(structure.id);
  };

  return (
    <section className="organization-chart">
      <div className="organization-chart__toolbar">
        <label className="organization-chart__search">
          <span>Buscar</span>
          <input
            type="search"
            placeholder="Buscar área, líder o descripción..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        <div className="organization-chart__actions">
          <button type="button" onClick={handleExpandAll}>
            Expandir todo
          </button>

          <button type="button" onClick={handleCollapseAll}>
            Contraer todo
          </button>
        </div>
      </div>

      <div className="organization-chart__workspace">
        <div className="organization-chart__canvas">
          <OrganizationNode
            unit={structure}
            isRoot
            expandedIds={expandedIds}
            selectedUnitId={selectedUnitId}
            searchTerm={normalizedSearch}
            onToggle={handleToggle}
            onSelect={handleSelect}
          />
        </div>

        <OrganizationContactPanel unit={selectedUnit} />
      </div>
    </section>
  );
}