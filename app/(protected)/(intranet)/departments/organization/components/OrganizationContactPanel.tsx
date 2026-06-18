"use client";

import { Building2, Mail, MapPin } from "lucide-react";
import type { OrganizationUnit } from "../types/organization.types";
import { useOrganizationGraphProfile } from "../hooks/useOrganizationGraphProfile";

interface OrganizationContactPanelProps {
  unit: OrganizationUnit;
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "ED";
}

export function OrganizationContactPanel({ unit }: OrganizationContactPanelProps) {
  const { enrichedUnit, manager, directReports, loading, error } =
    useOrganizationGraphProfile(unit);

  const hasChildren = Boolean(enrichedUnit.children?.length);
  const hasStructureContent =
    Boolean(manager) || hasChildren || directReports.length > 0;

  const displayName = enrichedUnit.graphDisplayName ?? enrichedUnit.name;
  const displayRole = enrichedUnit.graphJobTitle ?? enrichedUnit.leader;
  const displayDepartment = enrichedUnit.graphDepartment ?? enrichedUnit.name;
  const displayLocation =
    enrichedUnit.graphOfficeLocation ?? enrichedUnit.location;
  const displayEmail = enrichedUnit.contactEmail;

  return (
    <aside className="organization-contact-panel">
      <section className="organization-contact-panel__profile">
        <div className="organization-contact-panel__photo">
          {enrichedUnit.graphPhotoUrl ? (
            <img src={enrichedUnit.graphPhotoUrl} alt={displayName} />
          ) : (
            <span>{getInitials(displayName)}</span>
          )}
        </div>

        <div className="organization-contact-panel__identity">
          {loading ? (
            <>
              <span className="organization-contact-panel__skeleton organization-contact-panel__skeleton--title" />
              <span className="organization-contact-panel__skeleton organization-contact-panel__skeleton--text" />
            </>
          ) : (
            <>
              <h3>{displayName}</h3>
              {displayRole && <p>{displayRole}</p>}
            </>
          )}
        </div>
      </section>

      {error && (
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
            {manager && (
              <div className="organization-contact-panel__structure-group">
                <span className="organization-contact-panel__structure-label">
                  Reporta a
                </span>

                <article className="organization-contact-panel__person-row">
                  <div className="organization-contact-panel__person-avatar">
                    {getInitials(manager.displayName ?? "ED")}
                  </div>

                  <div>
                    <strong>{manager.displayName}</strong>
                    {manager.jobTitle && <p>{manager.jobTitle}</p>}
                  </div>
                </article>
              </div>
            )}

            {directReports.length > 0 && (
              <div className="organization-contact-panel__structure-group">
                <span className="organization-contact-panel__structure-label">
                  Personas a cargo
                </span>

                <div className="organization-contact-panel__reports">
                  {directReports.map((report) => (
                    <article
                      key={report.id}
                      className="organization-contact-panel__person-row"
                    >
                      <div className="organization-contact-panel__person-avatar">
                        {getInitials(report.displayName ?? "ED")}
                      </div>

                      <div>
                        <strong>{report.displayName}</strong>
                        {report.jobTitle && <p>{report.jobTitle}</p>}
                      </div>
                    </article>
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

        {enrichedUnit.teamsUrl ? (
          <a href={enrichedUnit.teamsUrl} target="_blank" rel="noreferrer">
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