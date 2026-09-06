import { cloudEnabled } from '../supabase';
import { supabaseProvider } from './supabaseProvider';
import { localProvider } from './localProvider';

/** The active data provider. Chosen once at load from env config. */
export const provider = cloudEnabled ? supabaseProvider : localProvider;

export const isCloud = provider.mode === 'cloud';
