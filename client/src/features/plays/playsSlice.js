import { createEntityFeature } from '../createEntityFeature';

const feature = createEntityFeature('plays', {
  sortComparer: (a, b) => b.date.localeCompare(a.date),
  prepare: (input) => ({
    date: new Date().toISOString().slice(0, 10),
    minutes: 0,
    playerIds: [],
    winnerIds: [],
    cooperativeWin: false,
    notes: '',
    ...input,
  }),
});

export const {
  fetchAll: fetchPlays,
  addItem: logPlay,
  editItem: editPlay,
  removeItem: removePlay,
} = feature.actions;
export const playsSelectors = feature.selectors;
export default feature.reducer;
