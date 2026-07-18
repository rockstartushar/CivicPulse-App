import * as SQLite from 'expo-sqlite';

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

const db = SQLite.openDatabaseSync('civicpulse.db');
db.execSync('CREATE TABLE IF NOT EXISTS drafts (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL)');

export function saveDraft(draft: LocalDraft) { db.runSync('INSERT OR REPLACE INTO drafts (id,payload,updated_at) VALUES (?,?,?)', draft.id, JSON.stringify(draft), new Date().toISOString()); }
export function listDrafts() { return db.getAllSync<{ payload: string }>('SELECT payload FROM drafts ORDER BY updated_at DESC').map((row) => JSON.parse(row.payload) as LocalDraft); }
export function deleteDraft(id: string) { db.runSync('DELETE FROM drafts WHERE id = ?', id); }
