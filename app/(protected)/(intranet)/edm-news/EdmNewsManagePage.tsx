// app/(protected)/(intranet)/edm-news/EdmNewsManagePage.tsx
"use client";

import { useState } from "react";
import { ShieldAlert, Plus } from "lucide-react";
import {
  useEdmNewsAdminList,
  useSaveAviso,
  useSetAvisoStatus,
  useDeleteAviso,
} from "./hooks/useEdmNewsAdmin";
import { EdmNewsAdminList } from "./components/EdmNewsAdminList";
import { EdmNewsAdminForm } from "./components/EdmNewsAdminForm";
import type { EdmNewsAdminItem, AvisoFormValues } from "./types/edmNews";

export function EdmNewsManagePage() {
  const { data: items, isLoading, error } = useEdmNewsAdminList();
  const saveAviso = useSaveAviso();
  const setStatus = useSetAvisoStatus();
  const deleteAviso = useDeleteAviso();

  const [editing, setEditing] = useState<EdmNewsAdminItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  // ── Estado de carga ──────────────────────────────────────────────
  if (isLoading) {
    return <div className="p-8 text-sm text-slate-400">Cargando...</div>;
  }

  // ── Sin autorización (401/403) ───────────────────────────────────
  const status = (error as (Error & { status?: number }) | undefined)?.status;
  if (status === 401 || status === 403) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center p-8">
        <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-[#e6edf3]">
          No tienes acceso a esta sección
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          La gestión de EDM News está reservada para personas autorizadas. Si crees que
          deberías tener acceso, contacta a quien administra este módulo.
        </p>
      </div>
    );
  }

  // ── Otro tipo de error ───────────────────────────────────────────
  if (error) {
    return <div className="p-8 text-sm text-red-500">Ocurrió un error al cargar los avisos.</div>;
  }

  function handleCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function handleEdit(item: EdmNewsAdminItem) {
    setEditing(item);
    setShowForm(true);
  }

  function handleSubmit(values: AvisoFormValues) {
  saveAviso.mutate(
    editing ? { id: editing.id, values } : { values },
    { onSuccess: () => setShowForm(false) },
  );
}
  function handleToggleStatus(item: EdmNewsAdminItem) {
    setStatus.mutate({
      id: item.id,
      status: item.status === "publicado" ? "borrador" : "publicado",
    });
  }

  function handleDelete(item: EdmNewsAdminItem) {
    if (!confirm(`¿Eliminar "${item.title}"? Esta acción no se puede deshacer.`)) return;
    deleteAviso.mutate(item.id);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-[#e6edf3]">Gestión de EDM News</h1>
          <p className="text-sm text-slate-500">Crea, edita, publica y elimina los avisos del Home.</p>
        </div>
        {!showForm && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo aviso
          </button>
        )}
      </div>

      {showForm && (
        <EdmNewsAdminForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          isSaving={saveAviso.isPending}
        />
      )}

      <EdmNewsAdminList
        items={items ?? []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        busyId={setStatus.isPending || deleteAviso.isPending ? (editing?.id ?? null) : null}
      />
    </div>
  );
}