// Optional sync layer. A no-op unless VITE_API_URL is configured, so the app
// runs fully offline by default (see ARCHITECTURE.md).

const BASE = import.meta.env.VITE_API_URL;

export const syncEnabled = Boolean(BASE);

async function req(path, options) {
  if (!BASE) throw new Error('Sync is not configured');
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export const api = {
  pull: () => req('/api/state'),
  push: (state) => req('/api/sync', { method: 'POST', body: JSON.stringify(state) }),
};
