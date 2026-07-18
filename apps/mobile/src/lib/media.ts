import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { api } from './api';
type Intent = { uploadUrl: string; apiKey: string; timestamp: number; folder: string; publicId: string; signature: string };
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export async function persistCapturedPhoto(uri: string) {
  const clean = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.84, format: ImageManipulator.SaveFormat.JPEG });
  const directory = `${FileSystem.documentDirectory}civicpulse-captures/`; await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const localUri = `${directory}${Date.now()}.jpg`; await FileSystem.copyAsync({ from: clean.uri, to: localUri });
  return localUri;
}
export async function uploadCapturedPhoto(reportId: string, uri: string) {
  // Re-encoding captured pixels creates a fresh JPEG without camera EXIF metadata.
  const clean = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.84, format: ImageManipulator.SaveFormat.JPEG });
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) try {
    const intent = await api<Intent & { demo?: boolean }>(`/reports/${reportId}/media/intent`, { method: 'POST' });
    if (intent.demo) {
      const localUri = await persistCapturedPhoto(clean.uri);
      return api(`/reports/${reportId}/media`, { method: 'POST', body: JSON.stringify({ cloudinaryPublicId: `demo/${reportId}/${Date.now()}`, secureUrl: localUri, contentType: 'image/jpeg' }) });
    }
    const body = new FormData(); body.append('file', { uri: clean.uri, type: 'image/jpeg', name: 'civicpulse-capture.jpg' } as never); body.append('api_key', intent.apiKey); body.append('timestamp', String(intent.timestamp)); body.append('folder', intent.folder); body.append('public_id', intent.publicId); body.append('signature', intent.signature);
    const response = await fetch(intent.uploadUrl, { method: 'POST', body }); if (!response.ok) throw new Error('Photo upload failed');
    const uploaded = await response.json() as { public_id: string; secure_url: string };
    return api(`/reports/${reportId}/media`, { method: 'POST', body: JSON.stringify({ cloudinaryPublicId: uploaded.public_id, secureUrl: uploaded.secure_url, contentType: 'image/jpeg' }) });
  } catch (error) { lastError = error; if (attempt < 2) await delay(1000 * (attempt + 1)); }
  throw lastError instanceof Error ? lastError : new Error('Photo upload failed after retries');
}
