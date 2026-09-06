import { buildSeed } from './seed';

// Built once per session; redux-persist overrides this on rehydrate for
// returning users, so seed data only shows on a truly fresh install.
export const seed = buildSeed();
