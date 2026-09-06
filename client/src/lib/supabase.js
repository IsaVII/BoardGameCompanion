import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Catch the common misconfig: URL pasted into the key field (or vice versa).
if (anonKey && /^https?:\/\//.test(anonKey)) {
  throw new Error(
    'VITE_SUPABASE_ANON_KEY looks like a URL. It should be the project\'s anon/publishable ' +
      'API key (Supabase dashboard → Project Settings → API Keys), not the project URL.',
  );
}
if (url && !/^https?:\/\//.test(url)) {
  throw new Error('VITE_SUPABASE_URL must be the full https:// project URL.');
}

/** True when the app is configured to use Supabase (accounts + shared groups). */
export const cloudEnabled = Boolean(url && anonKey);

export const supabase = cloudEnabled
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
