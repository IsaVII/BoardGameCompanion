import { createEntityFeature } from '../createEntityFeature';

const feature = createEntityFeature('players', {
  sortComparer: (a, b) => a.name.localeCompare(b.name),
  prepare: (input) => ({ linkedUserId: null, ...input }),
});

export const {
  fetchAll: fetchPlayers,
  addItem: addPlayer,
  editItem: editPlayer,
  removeItem: removePlayer,
} = feature.actions;
export const playersSelectors = feature.selectors;
export default feature.reducer;
