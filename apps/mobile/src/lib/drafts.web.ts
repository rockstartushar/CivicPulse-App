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

const storageKey = 'civicpulse.web.drafts';
const read = (): LocalDraft[] => {
  try { return JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as LocalDraft[]; }
  catch { return []; }
};

export function saveDraft(draft: LocalDraft) {
  const drafts = read().filter((item) => item.id !== draft.id);
  window.localStorage.setItem(storageKey, JSON.stringify([draft, ...drafts]));
}
export function listDrafts() { return read(); }
export function deleteDraft(id: string) { window.localStorage.setItem(storageKey, JSON.stringify(read().filter((item) => item.id !== id))); }
