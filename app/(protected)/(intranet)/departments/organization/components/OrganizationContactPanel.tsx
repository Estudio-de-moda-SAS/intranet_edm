"use client";

import { Building2, ChevronRight, Mail, MapPin } from "lucide-react";
import type {
  GraphOrganizationTreeNode,
  OrganizationUnit,
} from "../types/organization.types";
import { useOrganizationGraphProfile } from "../hooks/useOrganizationGraphProfile";

interface OrganizationContactPanelProps {
  unit?: OrganizationUnit;
  node?: GraphOrganizationTreeNode;
  parentNode?: GraphOrganizationTreeNode | null;
  onNavigate?: (nodeId: string) => void;
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "ED";
}

function buildFallbackUnit(node?: GraphOrganizationTreeNode): OrganizationUnit {
  return {
    id: node?.id ?? "empty-node",
    name: node?.displayName ?? "Sin selección",
    leader: node?.jobTitle,
    contactEmail: node?.email,
    location: node?.officeLocation,
    graphUserEmail: node?.email,
    graphUserId: node?.id,
    graphDisplayName: node?.displayName,
    graphJobTitle: node?.jobTitle,
    graphDepartment: node?.department,
    graphOfficeLocation: node?.officeLocation,
    graphPhotoUrl: node?.photoUrl,
  };
}

export function OrganizationContactPanel({
  unit,
  node,
  parentNode = null,
  onNavigate,
}: OrganizationContactPanelProps) {
  const fallbackUnit = unit ?? buildFallbackUnit(node);

  const { enrichedUnit, manager, directReports, loading, error } =
    useOrganizationGraphProfile(fallbackUnit);

  const graphMode = Boolean(node);

  const displayName =
    node?.displayName ?? enrichedUnit.graphDisplayName ?? enrichedUnit.name;

  const displayRole =
    node?.jobTitle ?? enrichedUnit.graphJobTitle ?? enrichedUnit.leader;

  const displayDepartment =
    node?.department ?? enrichedUnit.graphDepartment ?? enrichedUnit.name;

  const displayLocation =
    node?.officeLocation ??
    enrichedUnit.graphOfficeLocation ??
    enrichedUnit.location;

  const displayEmail = node?.email ?? enrichedUnit.contactEmail;
  const displayPhoto = node?.photoUrl ?? enrichedUnit.graphPhotoUrl;

  const reports = graphMode
    ? node?.children ?? []
    : directReports.map((report) => ({
        id: report.id,
        displayName: report.displayName ?? "Sin nombre",
        jobTitle: report.jobTitle,
        email: report.mail ?? report.userPrincipalName,
        department: report.department,
        officeLocation: report.officeLocation,
        photoUrl: report.photoUrl,
        children: [],
      }));

  const displayManager = graphMode
    ? parentNode
    : manager
      ? {
          id: manager.id,
          displayName: manager.displayName ?? "Sin nombre",
          jobTitle: manager.jobTitle,
        }
      : null;

  const hasStructureContent = Boolean(displayManager) || reports.length > 0;

  const teamsUrl = displayEmail
    ? `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(
        displayEmail
      )}`
    : null;

  const canNavigate = Boolean(onNavigate);

  return (
    <aside className="organization-contact-panel">
      <section className="organization-contact-panel__profile">
        <div className="organization-contact-panel__photo">
          {displayPhoto ? (
            <img src={displayPhoto} alt={displayName} />
          ) : (
            <span>{getInitials(displayName)}</span>
          )}
        </div>

        <div className="organization-contact-panel__identity">
          {loading && !graphMode ? (
            <>
              <span className="organization-contact-panel__skeleton organization-contact-panel__skeleton--title" />
              <span className="organization-contact-panel__skeleton organization-contact-panel__skeleton--text" />
            </>
          ) : (
            <>
              <h3>{displayName}</h3>
              {displayRole && <p>{displayRole}</p>}
              {displayDepartment && (
                <span className="organization-contact-panel__department-badge">
                  {displayDepartment}
                </span>
              )}
            </>
          )}
        </div>

        <div className="organization-contact-panel__stats">
          <div>
            <strong>{reports.length}</strong>
            <span>Reportes directos</span>
          </div>
        </div>
      </section>

      {error && !graphMode && (
        <div className="organization-contact-panel__notice">
          La información se muestra desde datos internos porque Microsoft Graph
          no respondió para este contacto.
        </div>
      )}

      <section className="organization-contact-panel__block">
        <div className="organization-contact-panel__info-list">
          {displayEmail && (
            <div className="organization-contact-panel__info-row">
              <span className="organization-contact-panel__info-icon">
                <Mail size={18} strokeWidth={1.9} />
              </span>

              <div>
                <span>Correo</span>
                <strong>{displayEmail}</strong>
              </div>
            </div>
          )}

          {displayDepartment && (
            <div className="organization-contact-panel__info-row">
              <span className="organization-contact-panel__info-icon">
                <Building2 size={18} strokeWidth={1.9} />
              </span>

              <div>
                <span>Departamento</span>
                <strong>{displayDepartment}</strong>
              </div>
            </div>
          )}

          {displayLocation && (
            <div className="organization-contact-panel__info-row">
              <span className="organization-contact-panel__info-icon">
                <MapPin size={18} strokeWidth={1.9} />
              </span>

              <div>
                <span>Ubicación</span>
                <strong>{displayLocation}</strong>
              </div>
            </div>
          )}
        </div>
      </section>

      {hasStructureContent && (
        <section className="organization-contact-panel__block">
          <div className="organization-contact-panel__structure">
            {displayManager && (
              <div className="organization-contact-panel__structure-group">
                <span className="organization-contact-panel__structure-label">
                  Reporta a
                </span>

                <button
                  type="button"
                  className="organization-contact-panel__person-row organization-contact-panel__person-row--clickable"
                  onClick={() => onNavigate?.(displayManager.id)}
                  disabled={!canNavigate}
                >
                  <div className="organization-contact-panel__person-avatar">
                    {getInitials(displayManager.displayName)}
                  </div>

                  <div>
                    <strong>{displayManager.displayName}</strong>
                    {displayManager.jobTitle && <p>{displayManager.jobTitle}</p>}
                  </div>

                  {canNavigate && (
                    <ChevronRight
                      className="organization-contact-panel__person-arrow"
                      size={16}
                      strokeWidth={2}
                    />
                  )}
                </button>
              </div>
            )}

            {reports.length > 0 && (
              <div className="organization-contact-panel__structure-group">
                <span className="organization-contact-panel__structure-label">
                  Personas a cargo
                </span>

                <div className="organization-contact-panel__reports">
                  {reports.map((report) => (
                    <button
                      key={report.id}
                      type="button"
                      className="organization-contact-panel__person-row organization-contact-panel__person-row--clickable"
                      onClick={() => onNavigate?.(report.id)}
                      disabled={!canNavigate}
                    >
                      <div className="organization-contact-panel__person-avatar">
                        {getInitials(report.displayName)}
                      </div>

                      <div>
                        <strong>{report.displayName}</strong>
                        {report.jobTitle && <p>{report.jobTitle}</p>}
                      </div>

                      {canNavigate && (
                        <ChevronRight
                          className="organization-contact-panel__person-arrow"
                          size={16}
                          strokeWidth={2}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="organization-contact-panel__actions">
        {displayEmail ? (
          <a href={`mailto:${displayEmail}`}>Enviar correo</a>
        ) : (
          <button type="button" disabled>
            Correo no disponible
          </button>
        )}

        {teamsUrl ? (
          <a href={teamsUrl} target="_blank" rel="noreferrer">
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