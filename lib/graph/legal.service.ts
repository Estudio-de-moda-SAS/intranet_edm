export type LegalDocumentCategory =
  | "contract_template"
  | "policy"
  | "power_of_attorney"
  | "regulatory"
  | "form";

export type LegalDocument = {
  id: string;
  title: string;
  category: LegalDocumentCategory;

  size: string;
  updatedAt: string;

  previewUrl?: string;
  downloadUrl?: string;

  restricted?: boolean;

  author?: string;
  version?: string;
};