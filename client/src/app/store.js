import { configureStore } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';
import groupsReducer from '../features/groups/groupsSlice';
import collectionReducer from '../features/collection/collectionSlice';
import playsReducer from '../features/plays/playsSlice';
import lendingReducer from '../features/lending/lendingSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import playersReducer from '../features/players/playersSlice';
import uiReducer from '../features/ui/uiSlice';

// The data provider (Supabase or localStorage) is the source of truth; Redux is
// session + normalized cache, so no redux-persist here.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupsReducer,
    games: collectionReducer,
    plays: playsReducer,
    loans: lendingReducer,
    wishlist: wishlistReducer,
    players: playersReducer,
    ui: uiReducer,
  },
});
