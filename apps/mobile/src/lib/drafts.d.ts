export type LocalDraft = {
  id: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  manualLocation?: string;
  latitude?: number;
  longitude?: number;
  photoUri?: string;
  state: 'LOCAL' | 'SYNCING' | 'FAILED';
  createdAt: string;
};
export declare function saveDraft(draft: LocalDraft): void;
export declare function listDrafts(): LocalDraft[];
export declare function deleteDraft(id: string): void;
