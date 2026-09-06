import { createSlice, createEntityAdapter, nanoid } from '@reduxjs/toolkit';
import { seed } from '../../data/initialState';

const adapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});

const slice = createSlice({
  name: 'plays',
  initialState: adapter.getInitialState(undefined, seed.plays),
  reducers: {
    playLogged: {
      reducer: adapter.addOne,
      prepare: (play) => ({
        payload: {
          id: nanoid(),
          date: new Date().toISOString().slice(0, 10),
          minutes: 0,
          playerIds: [],
          winnerIds: [],
          cooperativeWin: false,
          notes: '',
          ...play,
        },
      }),
    },
    playUpdated: adapter.updateOne,
    playRemoved: adapter.removeOne,
  },
});

export const { playLogged, playUpdated, playRemoved } = slice.actions;
export const playsSelectors = adapter.getSelectors((s) => s.plays);
export default slice.reducer;
