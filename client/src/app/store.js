import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import collectionReducer from '../features/collection/collectionSlice';
import playsReducer from '../features/plays/playsSlice';
import lendingReducer from '../features/lending/lendingSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import playersReducer from '../features/players/playersSlice';
import uiReducer from '../features/ui/uiSlice';

const rootReducer = combineReducers({
  collection: collectionReducer,
  plays: playsReducer,
  lending: lendingReducer,
  wishlist: wishlistReducer,
  players: playersReducer,
  ui: uiReducer,
});

const persistConfig = {
  key: 'shelf-v1',
  storage,
  whitelist: ['collection', 'plays', 'lending', 'wishlist', 'players'],
};

export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PURGE'],
      },
    }),
});

export const persistor = persistStore(store);
