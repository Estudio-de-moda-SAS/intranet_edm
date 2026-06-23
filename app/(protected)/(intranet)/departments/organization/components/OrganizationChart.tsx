"use client";

import { useEffect, useMemo, useState } from "react";
import type { GraphOrganizationTreeNode } from "../types/organization.types";
import { getGraphOrganizationTree } from "../services/organizationGraphTree.service";
import { OrganizationNode } from "./OrganizationNode";
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
        setSelectedNodeId(graphTree.id);
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

  const allNodes = useMemo(
    () => (tree ? flattenNodes(tree) : []),
    [tree]
  );

  const selectedNode =
    allNodes.find((node) => node.id === selectedNodeId) ?? tree;

  const parentNode =
    tree && selectedNode
      ? findParentNode(tree, selectedNode.id)
      : null;

  const allExpandableIds = useMemo(
    () =>
      allNodes
        .filter((node) => node.children.length > 0)
        .map((node) => node.id),
    [allNodes]
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();

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

  const handleSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(allExpandableIds));
  };

  const handleCollapseAll = () => {
    if (!tree) {
      return;
    }

    setExpandedIds(new Set([tree.id]));
    setSelectedNodeId(tree.id);
  };

  if (loading) {
    return (
      <section className="organization-chart">
        <div className="organization-chart__empty">
          Cargando estructura organizacional desde Microsoft Graph...
        </div>
      </section>
    );
  }

  if (error || !tree || !selectedNode) {
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

      <div className="organization-chart__workspace">
        <div className="organization-chart__canvas">
          <OrganizationNode
            node={tree}
            isRoot
            expandedIds={expandedIds}
            selectedUnitId={selectedNode.id}
            searchTerm={normalizedSearch}
            onToggle={handleToggle}
            onSelect={handleSelect}
          />
        </div>

        <OrganizationContactPanel
          node={selectedNode}
          parentNode={parentNode}
        />
      </div>
    </section>
  );
}