import { auth } from './firebase';
const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/v1';
const demo = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await auth?.currentUser?.getIdToken();
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${baseUrl}${path}`, { ...init, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(demo ? { 'X-CivicPulse-Demo': 'true' } : {}), ...init.headers } });
    if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.message ?? 'Something went wrong'); }
    return response.json() as Promise<T>;
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw new Error('CivicPulse could not reach the local API within 12 seconds. The report will be saved on this device.');
    throw error;
  } finally { clearTimeout(timeout); }
}
