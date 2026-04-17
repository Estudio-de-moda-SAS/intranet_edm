/**
 * @module ComplianceDocumentsSection
 * Sección de documentos del módulo de cumplimiento — carpeta SARLAFT.
 * SERVER COMPONENT
 */

import { getLegalFolderDocuments }  from "@/lib/graph/departments/legal.sharepoint.service";
import { CUMPLIMIENTO_FOLDERS }     from "../config/legalSharepointFolders";
import { SharePointFolderViewer }   from "./SharepointFolderViewer";
import { ShieldAlert }              from "lucide-react";
import type { AccessLevel }         from "@/lib/roles";

interface Props {
  accessLevel: AccessLevel;
}

export default async function ComplianceDocumentsSection({ accessLevel }: Props) {
  const folder = CUMPLIMIENTO_FOLDERS[0];
  if (!folder) return null;

  const documents = await getLegalFolderDocuments(folder.siteRelativePath);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 border border-violet-200">
          <ShieldAlert size={14} className="text-violet-700" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            Documentos SARLAFT
          </h2>
          <p className="text-[11px] text-slate-400 leading-tight">
            Carpetas de SharePoint · Compliance
          </p>
        </div>
      </div>

      <SharePointFolderViewer
        folder={folder}
        documents={documents}
        accessLevel={accessLevel}
      />
    </section>
  );
}