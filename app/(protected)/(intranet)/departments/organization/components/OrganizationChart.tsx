"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Maximize2,
  Minimize2,
  MinusSquare,
  PlusSquare,
  Search,
} from "lucide-react";
import type { GraphOrganizationTreeNode } from "../types/organization.types";
import { getGraphUsersSample } from "../services/organizationGraph.service";
import { getGraphOrganizationTree } from "../services/organizationGraphTree.service";
import { OrganizationFlowChart } from "./OrganizationFlowChart";
import { OrganizationContactPanel } from "./OrganizationContactPanel";
import { ToolbarIconButton } from "./ToolbarIconButton";

interface OrganizationChartProps {
  rootUserEmail: string;
  maxDepth?: number;
}

// ---------------------------------------------------------------------------
// Skeleton de carga — dibuja la silueta de un organigrama (nodo raíz +
// líneas conectoras + nodos hijos) usando el mismo lenguaje visual (shimmer,
// paleta morada, radios) que el resto del módulo, en vez de un texto plano.
// ---------------------------------------------------------------------------

function OrganizationChartSkeletonNode({
  root = false,
}: {
  root?: boolean;
}) {
  return (
    <div
      className={
        root
          ? "organization-chart__loading-node organization-chart__loading-node--root"
          : "organization-chart__loading-node"
      }
    >
      <div className="organization-chart__loading-avatar" />
      <div className="organization-chart__loading-lines">
        <div className="organization-chart__loading-bar organization-chart__loading-bar--wide" />
        <div className="organization-chart__loading-bar organization-chart__loading-bar--narrow" />
      </div>
    </div>
  );
}

function OrganizationChartSkeleton() {
  return (
    <div className="organization-chart__loading">
      <OrganizationChartSkeletonNode root />

      <div className="organization-chart__loading-connector--vertical" />

      <div className="organization-chart__loading-branches">
        <div className="organization-chart__loading-branch-line" />
        <div className="organization-chart__loading-branch-row">
          {[0, 1, 2].map((index) => (
            <div key={index} className="organization-chart__loading-branch">
              <OrganizationChartSkeletonNode />
            </div>
          ))}
        </div>
      </div>

      <div className="organization-chart__loading-status">
        <span className="organization-chart__loading-dots">
          <span />
          <span />
          <span />
        </span>
        Armando la estructura organizacional
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers de árbol
// ---------------------------------------------------------------------------

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
  if (currentNode.id === targetId) return parentNode;

  for (const child of currentNode.children) {
    const result = findParentNode(child, targetId, currentNode);
    if (result) return result;
  }

  return null;
}

function getExpandableNodeIds(node: GraphOrganizationTreeNode): string[] {
  return [
    ...(node.children.length > 0 ? [node.id] : []),
    ...node.children.flatMap(getExpandableNodeIds),
  ];
}

function getAncestorIds(
  currentNode: GraphOrganizationTreeNode,
  targetId: string,
  path: string[] = []
): string[] | null {
  if (currentNode.id === targetId) return path;

  for (const child of currentNode.children) {
    const result = getAncestorIds(child, targetId, [...path, currentNode.id]);
    if (result) return result;
  }

  return null;
}

function normalizeSearchValue(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function nodeMatchesSearch(node: GraphOrganizationTreeNode, searchTerm: string) {
  const normalizedSearch = normalizeSearchValue(searchTerm);

  if (!normalizedSearch) return false;

  return [
    node.displayName,
    node.jobTitle,
    node.email,
    node.department,
    node.officeLocation,
  ].some((value) => normalizeSearchValue(value).includes(normalizedSearch));
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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

        if (cancelled) return;

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
        if (cancelled) return;

        setTree(null);
        setSelectedNodeId(null);
        setExpandedIds(new Set());
        setError("No se pudo cargar la estructura organizacional.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrganizationTree();

    return () => {
      cancelled = true;
    };
  }, [rootUserEmail, maxDepth]);

  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

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

  const searchResults = useMemo(() => {
    const normalizedSearch = searchTerm.trim();

    if (!normalizedSearch) return [];

    return allNodes
      .filter((node) => nodeMatchesSearch(node, normalizedSearch))
      .slice(0, 8);
  }, [allNodes, searchTerm]);

  const hasSearchTerm = searchTerm.trim().length > 0;

  const navigateToNode = (nodeId: string) => {
    if (!tree) return;

    const ancestorIds = getAncestorIds(tree, nodeId) ?? [];

    setExpandedIds((current) => {
      const next = new Set(current);

      ancestorIds.forEach((ancestorId) => {
        next.add(ancestorId);
      });

      return next;
    });

    setSelectedNodeId(nodeId);
  };

  const handleSelect = (nodeId: string) => {
    navigateToNode(nodeId);
  };

  const handleClosePanel = () => setSelectedNodeId(null);

  const handleToggle = (nodeId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);

      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(allExpandableIds));
  };

  const handleCollapseAll = () => {
    if (!tree) return;

    setExpandedIds(new Set([tree.id]));
    setSelectedNodeId(null);
    setSearchTerm("");
    setIsSearchOpen(false);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen((current) => !current);
  };

  const handleSearchSelect = (nodeId: string) => {
    navigateToNode(nodeId);
    setIsSearchOpen(false);
  };

  if (loading) {
    return (
      <section className="organization-chart">
        <OrganizationChartSkeleton />
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
    <section
      className={[
        "organization-chart",
        isFullscreen ? "organization-chart--fullscreen" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="organization-chart__toolbar">
        <div className="organization-chart__search">
          <div className="organization-chart__search-control relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              placeholder="Buscar persona, cargo, correo o departamento..."
              value={searchTerm}
              onFocus={() => {
                setIsSearchOpen(true);
                setIsSearchFocused(true);
              }}
              onBlur={() => setIsSearchFocused(false)}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setIsSearchOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsSearchOpen(false);
                }

                if (event.key === "Enter" && searchResults[0]) {
                  handleSearchSelect(searchResults[0].id);
                }
              }}
              style={{
                paddingLeft: "2.5rem",
                boxShadow: isSearchFocused
                  ? "0 0 0 4px rgba(196, 181, 253, 0.35)"
                  : "none",
              }}
              className="h-11 w-full min-w-0 rounded-full border-none bg-slate-100/80 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white"
            />

            {isSearchOpen && hasSearchTerm && (
              <div className="organization-chart__search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      className="organization-chart__search-result"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleSearchSelect(node.id);
                      }}
                    >
                      <strong>{node.displayName}</strong>

                      <span>
                        {node.jobTitle ||
                          node.department ||
                          node.email ||
                          "Sin cargo registrado"}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="organization-chart__search-empty">
                    No se encontraron coincidencias.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="organization-chart__actions">
          <ToolbarIconButton
            label="Expandir todo"
            icon={<PlusSquare />}
            onClick={handleExpandAll}
          />

          <ToolbarIconButton
            label="Contraer todo"
            icon={<MinusSquare />}
            onClick={handleCollapseAll}
          />

          <ToolbarIconButton
            label={
              isFullscreen
                ? "Salir de pantalla completa"
                : "Pantalla completa"
            }
            icon={isFullscreen ? <Minimize2 /> : <Maximize2 />}
            onClick={handleToggleFullscreen}
            active={isFullscreen}
            variant="primary"
          />
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
                onNavigate={navigateToNode}
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