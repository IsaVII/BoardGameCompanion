import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  fetchGames, addGame, editGame, removeGame, importGames, collectionSelectors,
} from './collectionSlice';
import { localProvider } from '../../lib/db/localProvider';

function makeStore() {
  return configureStore({ reducer: { games: reducer } });
}

async function groupId() {
  return (await localProvider.listGroups())[0].id;
}

describe('collectionSlice (against localProvider)', () => {
  let store;
  let gid;

  beforeEach(async () => {
    localStorage.clear();
    localProvider._reset();
    gid = await groupId();
    store = makeStore();
  });

  it('fetches the seeded shelf, sorted by title', async () => {
    await store.dispatch(fetchGames(gid));
    const titles = collectionSelectors.selectAll(store.getState());
    expect(store.getState().games.status).toBe('ready');
    expect(titles.length).toBeGreaterThan(0);
    expect(titles.map((g) => g.title)).toEqual([...titles.map((g) => g.title)].sort((a, b) => a.localeCompare(b)));
  });

  it('adds a game with prepared defaults', async () => {
    const { payload } = await store.dispatch(addGame({ groupId: gid, input: { title: 'New Game' } }));
    expect(payload).toMatchObject({ title: 'New Game', mood: 'strategy', condition: 'good', weight: 2 });
    expect(collectionSelectors.selectById(store.getState(), payload.id)).toBeDefined();
  });

  it('edits and removes a game', async () => {
    const { payload } = await store.dispatch(addGame({ groupId: gid, input: { title: 'Temp' } }));
    await store.dispatch(editGame({ groupId: gid, id: payload.id, changes: { title: 'Renamed' } }));
    expect(collectionSelectors.selectById(store.getState(), payload.id).title).toBe('Renamed');

    await store.dispatch(removeGame({ groupId: gid, id: payload.id }));
    expect(collectionSelectors.selectById(store.getState(), payload.id)).toBeUndefined();
  });

  it('bulk-imports records and refetches', async () => {
    await store.dispatch(fetchGames(gid));
    const before = collectionSelectors.selectTotal(store.getState());
    await store.dispatch(importGames({
      groupId: gid,
      records: [{ title: 'Imported A' }, { title: 'Imported B' }],
    }));
    expect(collectionSelectors.selectTotal(store.getState())).toBe(before + 2);
  });
});
