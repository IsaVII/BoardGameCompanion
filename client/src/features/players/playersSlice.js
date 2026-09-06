import { createSlice, createEntityAdapter, nanoid } from '@reduxjs/toolkit';
import { seed } from '../../data/initialState';

const adapter = createEntityAdapter({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const slice = createSlice({
  name: 'players',
  initialState: adapter.getInitialState(undefined, seed.players),
  reducers: {
    playerAdded: {
      reducer: adapter.addOne,
      prepare: (name) => ({ payload: { id: nanoid(), name } }),
    },
    playerRenamed: adapter.updateOne,
    playerRemoved: adapter.removeOne,
  },
});

export const { playerAdded, playerRenamed, playerRemoved } = slice.actions;
export const playersSelectors = adapter.getSelectors((s) => s.players);
export default slice.reducer;
