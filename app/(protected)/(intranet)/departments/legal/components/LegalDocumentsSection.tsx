/**
 * @module LegalDocumentsSection
 * Sección de documentos del área jurídica — 4 visores de carpetas SharePoint.
 * SERVER COMPONENT
 */

import { getLegalFolderDocuments } from "@/lib/graph/departments/legal.sharepoint.service";
import { JURIDICO_FOLDERS }        from "../config/legalSharepointFolders";
import { SharePointFolderViewer }  from "./SharepointFolderViewer";
import { FolderOpen }              from "lucide-react";
import type { AccessLevel }        from "@/lib/roles";

interface Props {
  accessLevel: AccessLevel;
}

export default async function LegalDocumentsSection({ accessLevel }: Props) {
  const [docs0, docs1, docs2, docs3] = await Promise.all(
    JURIDICO_FOLDERS.map((folder) => getLegalFolderDocuments(folder.siteRelativePath))
  );

  const folderDocs = [docs0 ?? [], docs1 ?? [], docs2 ?? [], docs3 ?? []];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200">
          <FolderOpen size={14} className="text-emerald-700" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            Repositorios Documentales
          </h2>
          <p className="text-[11px] text-slate-400 leading-tight">
            Carpetas de SharePoint · Área Jurídica
          </p>
        </div>
        <div className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
          4 carpetas
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {JURIDICO_FOLDERS.map((folder, idx) => (
          <SharePointFolderViewer
            key={folder.id}
            folder={folder}
            documents={folderDocs[idx] ?? []}
            accessLevel={accessLevel}
          />
        ))}
      </div>
    </section>
  );
}