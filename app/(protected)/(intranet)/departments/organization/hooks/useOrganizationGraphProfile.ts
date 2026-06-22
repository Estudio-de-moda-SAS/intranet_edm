"use client";

import { useEffect, useState } from "react";
import type { OrganizationUnit } from "../types/organization.types";
import {
  getGraphUserByEmail,
  getGraphUserDirectReports,
  getGraphUserManager,
  getGraphUserPhotoUrl,
  type GraphOrganizationUser,
} from "../services/organizationGraph.service";

interface UseOrganizationGraphProfileResult {
  enrichedUnit: OrganizationUnit;
  graphUser: GraphOrganizationUser | null;
  manager: GraphOrganizationUser | null;
  directReports: GraphOrganizationUser[];
  loading: boolean;
  error: string | null;
}

export function useOrganizationGraphProfile(
  unit: OrganizationUnit
): UseOrganizationGraphProfileResult {
  const [graphUser, setGraphUser] = useState<GraphOrganizationUser | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [manager, setManager] = useState<GraphOrganizationUser | null>(null);
  const [directReports, setDirectReports] = useState<GraphOrganizationUser[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const graphEmail = unit.graphUserEmail ?? unit.contactEmail;

  useEffect(() => {
    let cancelled = false;

    async function loadGraphProfile() {
      setGraphUser(null);
      setPhotoUrl(null);
      setManager(null);
      setDirectReports([]);
      setError(null);

      if (!graphEmail) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        /**
         * Carga principal.
         *
         * Esta parte alimenta la ficha visible del panel:
         * - nombre,
         * - cargo,
         * - correo,
         * - ubicación,
         * - foto.
         *
         * Se resuelve primero para que el cambio de nodo se sienta inmediato,
         * especialmente cuando los datos ya existen en sessionStorage.
         */
        const [user, photo] = await Promise.all([
          getGraphUserByEmail(graphEmail),
          getGraphUserPhotoUrl(graphEmail),
        ]);

        if (cancelled) return;

        setGraphUser(user);
        setPhotoUrl(photo);
        setLoading(false);

        /**
         * Carga secundaria.
         *
         * Manager y directReports pueden tardar más o devolver 403 si la app
         * aún no tiene permisos adicionales en Entra ID. No deben bloquear la
         * ficha principal del colaborador.
         */
        const [graphManager, reports] = await Promise.all([
          getGraphUserManager(graphEmail),
          getGraphUserDirectReports(graphEmail),
        ]);

        if (cancelled) return;

        setManager(graphManager);
        setDirectReports(reports);
      } catch (err) {
        if (cancelled) return;

        console.warn("[OrganizationGraph] Error cargando perfil:", err);
        setError("No se pudo cargar la información desde Microsoft Graph.");
        setGraphUser(null);
        setPhotoUrl(null);
        setManager(null);
        setDirectReports([]);
        setLoading(false);
      }
    }

    loadGraphProfile();

    return () => {
      cancelled = true;
    };
  }, [graphEmail]);

  const contactEmail =
    graphUser?.mail ?? graphUser?.userPrincipalName ?? unit.contactEmail;

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
    ...(contactEmail && { contactEmail }),
  };

  return {
    enrichedUnit,
    graphUser,
    manager,
    directReports,
    loading,
    error,
  };
}