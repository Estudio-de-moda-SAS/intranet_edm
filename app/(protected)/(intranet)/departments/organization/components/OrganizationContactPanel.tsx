"use client";

import type { OrganizationUnit } from "../types/organization.types";
import { useOrganizationGraphProfile } from "../hooks/useOrganizationGraphProfile";

interface OrganizationContactPanelProps {
  unit: OrganizationUnit;
}

export function OrganizationContactPanel({
  unit,
}: OrganizationContactPanelProps) {
  const { enrichedUnit, loading, error } = useOrganizationGraphProfile(unit);

  const hasChildren = Boolean(enrichedUnit.children?.length);

  const displayName = enrichedUnit.graphDisplayName ?? enrichedUnit.name;
  const displayRole = enrichedUnit.graphJobTitle ?? enrichedUnit.leader;
  const displayLocation =
    enrichedUnit.graphOfficeLocation ?? enrichedUnit.location;
  const displayEmail = enrichedUnit.contactEmail;

  return (
    <aside className="organization-contact-panel">
      <div className="organization-contact-panel__header">
        <div className="organization-contact-panel__avatar">
          {enrichedUnit.graphPhotoUrl ? (
            <img
              src={enrichedUnit.graphPhotoUrl}
              alt={displayName}
            />
          ) : (
            <span>{displayName.charAt(0)}</span>
          )}
        </div>

        <div>
          <span>
            {loading
              ? "Consultando Microsoft 365"
              : "Área seleccionada"}
          </span>

          <h3>{displayName}</h3>

          {displayRole && <p>{displayRole}</p>}
        </div>
      </div>

      {error && (
        <div className="organization-contact-panel__notice">
          Información mostrada desde datos internos. Graph no respondió para
          este contacto.
        </div>
      )}

      {enrichedUnit.description && (
        <p className="organization-contact-panel__description">
          {enrichedUnit.description}
        </p>
      )}

      <div className="organization-contact-panel__meta">
        {enrichedUnit.parentName && (
          <div>
            <span>Reporta a</span>
            <strong>{enrichedUnit.parentName}</strong>
          </div>
        )}

        {displayLocation && (
          <div>
            <span>Ubicación</span>
            <strong>{displayLocation}</strong>
          </div>
        )}

        {displayEmail && (
          <div>
            <span>Correo</span>
            <strong>{displayEmail}</strong>
          </div>
        )}

        {typeof enrichedUnit.employeeCount === "number" && (
          <div>
            <span>Equipo</span>
            <strong>{enrichedUnit.employeeCount} colaboradores aprox.</strong>
          </div>
        )}
      </div>

      {hasChildren && (
        <div className="organization-contact-panel__children">
          <span>Subáreas / equipos asociados</span>

          <div>
            {enrichedUnit.children?.map((child) => (
              <small key={child.id}>{child.name}</small>
            ))}
          </div>
        </div>
      )}

      <div className="organization-contact-panel__actions">
        {displayEmail ? (
          <a href={`mailto:${displayEmail}`}>
            Enviar correo
          </a>
        ) : (
          <button type="button" disabled>
            Correo no disponible
          </button>
        )}

        {enrichedUnit.teamsUrl ? (
          <a
            href={enrichedUnit.teamsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Abrir Teams
          </a>
        ) : (
          <button type="button" disabled>
            Teams no disponible
          </button>
        )}
      </div>
    </aside>
  );
}