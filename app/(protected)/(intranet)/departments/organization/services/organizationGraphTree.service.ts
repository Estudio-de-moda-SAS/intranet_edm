import {
  getGraphUserByEmail,
  getGraphUserDirectReports,
  getGraphUserPhotoUrl,
} from "./organizationGraph.service";

import type { GraphOrganizationTreeNode } from "../types/organization.types";

const DEFAULT_MAX_DEPTH = 5;

async function buildNode(
  email: string,
  depth: number,
  maxDepth: number
): Promise<GraphOrganizationTreeNode | null> {
  console.log("[ORG TREE] Building node:", { email, depth, maxDepth });

  if (depth > maxDepth) {
    console.log("[ORG TREE] Max depth reached:", email);
    return null;
  }

  const user = await getGraphUserByEmail(email);

  console.log("[ORG TREE] User found:", email, user);

  if (!user) {
    return null;
  }

  const photoUrl = await getGraphUserPhotoUrl(email);
  const reports = await getGraphUserDirectReports(email);

  console.log("[ORG TREE] Direct reports:", {
    email,
    count: reports.length,
    reports,
  });

  const childrenResults = await Promise.all(
    reports.map(async (report) => {
      const reportEmail = report.mail ?? report.userPrincipalName;

      if (!reportEmail) {
        console.warn("[ORG TREE] Report sin correo:", report);
        return null;
      }

      return buildNode(reportEmail, depth + 1, maxDepth);
    })
  );

  const children = childrenResults.filter(
    (child): child is GraphOrganizationTreeNode => child !== null
  );

  return {
    id: user.id,
    displayName: user.displayName ?? "",
    jobTitle: user.jobTitle,
    email: user.mail ?? user.userPrincipalName,
    department: user.department,
    officeLocation: user.officeLocation,
    photoUrl: photoUrl ?? undefined,
    children,
  };
}

export async function getGraphOrganizationTree(
  rootEmail: string,
  maxDepth = DEFAULT_MAX_DEPTH
): Promise<GraphOrganizationTreeNode | null> {
  console.log("[ORG TREE] Root email:", rootEmail);

  const tree = await buildNode(rootEmail, 0, maxDepth);

  console.log("[ORG TREE] Result:", tree);

  return tree;
}