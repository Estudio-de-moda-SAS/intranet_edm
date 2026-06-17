"use client";

import { useEffect, useState } from "react";
import type { OrganizationUnit } from "../types/organization.types";
import {
  getGraphUserByEmail,
  getGraphUserPhotoUrl,
  type GraphOrganizationUser,
} from "../services/organizationGraph.service";

interface UseOrganizationGraphProfileResult {
  enrichedUnit: OrganizationUnit;
  graphUser: GraphOrganizationUser | null;
  loading: boolean;
  error: string | null;
}

export function useOrganizationGraphProfile(
  unit: OrganizationUnit
): UseOrganizationGraphProfileResult {
  const [graphUser, setGraphUser] = useState<GraphOrganizationUser | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const graphEmail = unit.graphUserEmail ?? unit.contactEmail;

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadGraphProfile() {
      if (!graphEmail) {
        setGraphUser(null);
        setPhotoUrl(null);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const user = await getGraphUserByEmail(graphEmail);

        if (cancelled) return;

        setGraphUser(user);

        const photo = await getGraphUserPhotoUrl(graphEmail);

        if (cancelled) {
          if (photo) URL.revokeObjectURL(photo);
          return;
        }

        objectUrl = photo;
        setPhotoUrl(photo);
      } catch (err) {
        if (cancelled) return;

        console.warn("[OrganizationGraph] Error cargando perfil:", err);
        setError("No se pudo cargar la información desde Microsoft Graph.");
        setGraphUser(null);
        setPhotoUrl(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGraphProfile();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [graphEmail]);

const enrichedUnit: OrganizationUnit = {
  ...unit,
  ...(graphUser?.id && { graphUserId: graphUser.id }),
  ...(graphUser?.displayName && { graphDisplayName: graphUser.displayName }),
  ...(graphUser?.jobTitle && { graphJobTitle: graphUser.jobTitle }),
  ...(graphUser?.department && { graphDepartment: graphUser.department }),
  ...(graphUser?.officeLocation && {
    graphOfficeLocation: graphUser.officeLocation,
    location: graphUser.officeLocation,
  }),
  ...(photoUrl && { graphPhotoUrl: photoUrl }),
  ...((graphUser?.mail ?? graphUser?.userPrincipalName ?? unit.contactEmail) && {
    contactEmail: graphUser?.mail ?? graphUser?.userPrincipalName ?? unit.contactEmail,
  }),
};

  return {
    enrichedUnit,
    graphUser,
    loading,
    error,
  };
}