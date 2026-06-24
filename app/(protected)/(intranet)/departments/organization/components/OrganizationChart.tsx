"use client";

import { useEffect, useMemo, useState } from "react";
import type { GraphOrganizationTreeNode } from "../types/organization.types";
import { getGraphUsersSample } from "../services/organizationGraph.service";
import { getGraphOrganizationTree } from "../services/organizationGraphTree.service";
import { OrganizationFlowChart } from "./OrganizationFlowChart";
import { OrganizationContactPanel } from "./OrganizationContactPanel";

interface OrganizationChartProps {
  rootUserEmail: string;
  maxDepth?: number;
}

function flattenNodes(
  node: GraphOrganizationTreeNode
): GraphOrganizationTreeNode[] {
  return [node, ...node.children.flatMap(flattenNodes)];
}

function findParentNode(
  currentNode: GraphOrganizationTreeNode,
  targetId: string,
  parentNode: GraphOrganizationTreeNode | null = null
): GraphOrganizationTreeNode | null {
  if (currentNode.id === targetId) {
    return parentNode;
  }

  for (const child of currentNode.children) {
    const result = findParentNode(child, targetId, currentNode);

    if (result) {
      return result;
    }
  }

  return null;
}

function getExpandableNodeIds(node: GraphOrganizationTreeNode): string[] {
  return [
    ...(node.children.length > 0 ? [node.id] : []),
    ...node.children.flatMap(getExpandableNodeIds),
  ];
}

export function OrganizationChart({
  rootUserEmail,
  maxDepth = 5,
}: OrganizationChartProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tree, setTree] = useState<GraphOrganizationTreeNode | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrganizationTree() {
      try {
        setLoading(true);
        setError(null);

        const sampleUsers = await getGraphUsersSample();

        if (!cancelled) {
          const departmentCounts = sampleUsers.reduce(
            (acc, user) => {
              const department = user.department?.trim() || "SIN_DEPARTAMENTO";
              acc[department] = (acc[department] ?? 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          );

          console.table(departmentCounts);
        }

        const graphTree = await getGraphOrganizationTree(
          rootUserEmail,
          maxDepth
        );

        if (cancelled) {
          return;
        }

        if (!graphTree) {
          setTree(null);
          setSelectedNodeId(null);
          setExpandedIds(new Set());
          setError("No se pudo construir el organigrama desde Microsoft Graph.");
          return;
        }

        setTree(graphTree);
        setSelectedNodeId(null);
        setExpandedIds(new Set([graphTree.id]));
      } catch {
        if (cancelled) {
          return;
        }

        setTree(null);
        setSelectedNodeId(null);
        setExpandedIds(new Set());
        setError("No se pudo cargar la estructura organizacional.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrganizationTree();

    return () => {
      cancelled = true;
    };
  }, [rootUserEmail, maxDepth]);

  const allNodes = useMemo(() => (tree ? flattenNodes(tree) : []), [tree]);

  const selectedNode = selectedNodeId
    ? allNodes.find((node) => node.id === selectedNodeId) ?? null
    : null;

  const parentNode =
    tree && selectedNode ? findParentNode(tree, selectedNode.id) : null;

  const allExpandableIds = useMemo(
    () => (tree ? getExpandableNodeIds(tree) : []),
    [tree]
  );

  const handleSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleClosePanel = () => {
    setSelectedNodeId(null);
  };

  const handleToggle = (nodeId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }

      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(allExpandableIds));
  };

  const handleCollapseAll = () => {
    if (!tree) {
      return;
    }

    setExpandedIds(new Set([tree.id]));
    setSelectedNodeId(null);
  };

  if (loading) {
    return (
      <section className="organization-chart">
        <div className="organization-chart__empty">
          Cargando estructura organizacional...
        </div>
      </section>
    );
  }

  if (error || !tree) {
    return (
      <section className="organization-chart">
        <div className="organization-chart__empty">
          {error ?? "No hay información organizacional disponible."}
        </div>
      </section>
    );
  }

  return (
    <section className="organization-chart">
      <div className="organization-chart__toolbar">
        <label className="organization-chart__search">
          <span>Buscar</span>

          <input
            type="search"
            placeholder="Buscar persona, cargo, correo o departamento..."
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

      <div className="organization-chart__workspace organization-chart__workspace--with-panel">
        <div className="organization-chart__canvas">
          <OrganizationFlowChart
            tree={tree}
            selectedNodeId={selectedNode?.id ?? ""}
            expandedIds={expandedIds}
            onSelect={handleSelect}
            onToggle={handleToggle}
          />
        </div>

        <div className="organization-chart__panel-shell">
          {selectedNode ? (
            <>
              <button
                type="button"
                className="organization-chart__panel-close"
                onClick={handleClosePanel}
                aria-label="Cerrar panel de detalle"
              >
                ×
              </button>

              <OrganizationContactPanel
                node={selectedNode}
                parentNode={parentNode}
              />
            </>
          ) : (
            <aside className="organization-contact-panel organization-contact-panel--empty">
              <div className="organization-contact-panel__empty-state">
                <strong>Selecciona una persona</strong>
                <p>
                  Haz clic sobre una tarjeta del organigrama para consultar su
                  cargo, correo, ubicación y relaciones organizacionales.
                </p>
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}