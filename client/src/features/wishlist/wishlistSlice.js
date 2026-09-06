import { createSlice, createEntityAdapter, nanoid } from '@reduxjs/toolkit';
import { seed } from '../../data/initialState';

const priorityRank = { high: 0, medium: 1, low: 2 };

const adapter = createEntityAdapter({
  sortComparer: (a, b) =>
    (priorityRank[a.priority] ?? 3) - (priorityRank[b.priority] ?? 3) ||
    a.title.localeCompare(b.title),
});

const slice = createSlice({
  name: 'wishlist',
  initialState: adapter.getInitialState(undefined, seed.wishlist),
  reducers: {
    wishAdded: {
      reducer: adapter.addOne,
      prepare: (item) => ({
        payload: { id: nanoid(), priority: 'medium', estimatedPrice: 0, notes: '', ...item },
      }),
    },
    wishUpdated: adapter.updateOne,
    wishRemoved: adapter.removeOne,
  },
});

export const { wishAdded, wishUpdated, wishRemoved } = slice.actions;
export const wishlistSelectors = adapter.getSelectors((s) => s.wishlist);
export default slice.reducer;
