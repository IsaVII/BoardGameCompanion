import { createAsyncThunk } from '@reduxjs/toolkit';
import { createEntityFeature } from '../createEntityFeature';
import { provider } from '../../lib/db';

const feature = createEntityFeature('games', {
  sortComparer: (a, b) => a.title.localeCompare(b.title),
  prepare: (input) => ({
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
    ...input,
  }),
});

/** Bulk insert from a BGG import, then refetch the shelf. */
export const importGames = createAsyncThunk(
  'games/import',
  async ({ groupId, records }, { dispatch }) => {
    for (const record of records) {
      // eslint-disable-next-line no-await-in-loop
      await provider.create('games', groupId, record);
    }
    return dispatch(fetchGames(groupId));
  },
);

export const {
  fetchAll: fetchGames,
  addItem: addGame,
  editItem: editGame,
  removeItem: removeGame,
  cleared: gamesCleared,
} = feature.actions;
export const collectionSelectors = feature.selectors;
export default feature.reducer;
