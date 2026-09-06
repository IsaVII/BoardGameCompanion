import { createSlice, createEntityAdapter, nanoid } from '@reduxjs/toolkit';
import { seed } from '../../data/initialState';

const adapter = createEntityAdapter({
  sortComparer: (a, b) => a.title.localeCompare(b.title),
});

const slice = createSlice({
  name: 'collection',
  initialState: adapter.getInitialState(undefined, seed.games),
  reducers: {
    gameAdded: {
      reducer: adapter.addOne,
      prepare: (game) => ({
        payload: {
          id: nanoid(),
          categories: [],
          condition: 'good',
          estimatedValue: 0,
          notes: '',
          thumbnail: '',
          bggId: null,
          acquiredAt: new Date().toISOString().slice(0, 10),
          weight: 2,
          mood: 'strategy',
          minPlayers: 1,
          maxPlayers: 4,
          minTime: 30,
          maxTime: 60,
          ...game,
        },
      }),
    },
    gamesImported: (state, action) => {
      adapter.addMany(
        state,
        action.payload.map((g) => ({ id: nanoid(), ...g })),
      );
    },
    gameUpdated: adapter.updateOne,
    gameRemoved: adapter.removeOne,
    collectionCleared: adapter.removeAll,
  },
});

export const {
  gameAdded,
  gamesImported,
  gameUpdated,
  gameRemoved,
  collectionCleared,
} = slice.actions;

export const collectionSelectors = adapter.getSelectors((s) => s.collection);
export default slice.reducer;
