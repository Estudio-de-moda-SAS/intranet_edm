"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { GraphOrganizationTreeNode } from "../types/organization.types";

interface OrganizationFlowChartProps {
  tree: GraphOrganizationTreeNode;
  selectedNodeId: string;
  expandedIds: Set<string>;
  onSelect: (nodeId: string) => void;
  onToggle: (nodeId: string) => void;
}

interface LayoutPosition {
  x: number;
  y: number;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 96;
const HORIZONTAL_GAP = 46;
const VERTICAL_GAP = 118;

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "ED";
}

function getVisibleChildren(
  node: GraphOrganizationTreeNode,
  expandedIds: Set<string>
) {
  return expandedIds.has(node.id) ? node.children : [];
}

function countVisibleLeaves(
  node: GraphOrganizationTreeNode,
  expandedIds: Set<string>
): number {
  const visibleChildren = getVisibleChildren(node, expandedIds);

  if (visibleChildren.length === 0) {
    return 1;
  }

  return visibleChildren.reduce(
    (total, child) => total + countVisibleLeaves(child, expandedIds),
    0
  );
}

function createFlowElements(
  node: GraphOrganizationTreeNode,
  depth: number,
  offsetX: number,
  parentId: string | null,
  expandedIds: Set<string>,
  nodes: Node[],
  edges: Edge[],
  onToggle: (nodeId: string) => void
): number {
  const visibleChildren = getVisibleChildren(node, expandedIds);
  const leafCount = countVisibleLeaves(node, expandedIds);

  const subtreeWidth =
    leafCount * NODE_WIDTH + Math.max(0, leafCount - 1) * HORIZONTAL_GAP;

  let currentX = offsetX;
  const childPositions: LayoutPosition[] = [];

  visibleChildren.forEach((child) => {
    const childWidth = createFlowElements(
      child,
      depth + 1,
      currentX,
      node.id,
      expandedIds,
      nodes,
      edges,
      onToggle
    );

    childPositions.push({
      x: currentX + childWidth / 2 - NODE_WIDTH / 2,
      y: (depth + 1) * (NODE_HEIGHT + VERTICAL_GAP),
    });

    currentX += childWidth + HORIZONTAL_GAP;
  });

  const x =
    childPositions.length > 0
      ? (childPositions[0]!.x +
          childPositions[childPositions.length - 1]!.x) /
        2
      : offsetX + subtreeWidth / 2 - NODE_WIDTH / 2;

  const y = depth * (NODE_HEIGHT + VERTICAL_GAP);

  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);

  nodes.push({
    id: node.id,
    position: { x, y },
    type: "default",
    draggable: true,
    data: {
      label: (
        <div className="organization-flow-node">
          <div className="organization-flow-node__avatar">
            {node.photoUrl ? (
              <img src={node.photoUrl} alt={node.displayName} />
            ) : (
              <span>{getInitials(node.displayName)}</span>
            )}
          </div>

          <div className="organization-flow-node__content">
            <strong>{node.displayName}</strong>

            {node.jobTitle && <span>{node.jobTitle}</span>}

            <div className="organization-flow-node__meta">
              {node.department && <small>{node.department}</small>}

              {hasChildren && (
                <small>
                  {node.children.length} persona
                  {node.children.length === 1 ? "" : "s"}
                </small>
              )}
            </div>
          </div>

          {hasChildren && (
            <button
              type="button"
              className="organization-flow-node__toggle"
              onClick={(event) => {
                event.stopPropagation();
                onToggle(node.id);
              }}
              aria-label={isExpanded ? "Contraer equipo" : "Ver equipo"}
            >
              {isExpanded ? "−" : "+"}
            </button>
          )}
        </div>
      ),
    },
  });

  if (parentId) {
    edges.push({
      id: `${parentId}-${node.id}`,
      source: parentId,
      target: node.id,
      type: "smoothstep",
    });
  }

  return subtreeWidth;
}

export function OrganizationFlowChart({
  tree,
  selectedNodeId,
  expandedIds,
  onSelect,
  onToggle,
}: OrganizationFlowChartProps) {
  const { nodes, edges } = useMemo(() => {
    const nextNodes: Node[] = [];
    const nextEdges: Edge[] = [];

    createFlowElements(
      tree,
      0,
      0,
      null,
      expandedIds,
      nextNodes,
      nextEdges,
      onToggle
    );

    return {
      nodes: nextNodes.map((node) => ({
        ...node,
        className:
          node.id === selectedNodeId
            ? "organization-flow-node-wrapper organization-flow-node-wrapper--selected"
            : "organization-flow-node-wrapper",
      })),
      edges: nextEdges,
    };
  }, [tree, expandedIds, selectedNodeId, onToggle]);

  return (
    <div className="organization-flow organization-flow--react">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView={false}
        defaultViewport={{ x: 120, y: 80, zoom: 1.05 }}
        minZoom={0.45}
        maxZoom={1.8}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        nodesDraggable
        onNodeClick={(_, node) => onSelect(node.id)}
      >
        <Background gap={22} size={1} />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}