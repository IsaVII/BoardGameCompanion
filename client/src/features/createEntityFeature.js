import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit';
import { provider } from '../lib/db';

/**
 * Builds a normalized slice backed by the active data provider (Supabase or
 * local). One of these per domain entity — see features/*\/slice.js.
 *
 * @param {string} name        entity key ('games', 'plays', ...)
 * @param {object} opts
 * @param {Function} [opts.sortComparer]
 * @param {Function} [opts.prepare]  fill defaults on create: (input) => record
 */
export function createEntityFeature(name, { sortComparer, prepare = (x) => x } = {}) {
  const adapter = createEntityAdapter({ sortComparer });

  const fetchAll = createAsyncThunk(`${name}/fetchAll`, (groupId) =>
    provider.list(name, groupId),
  );

  const addItem = createAsyncThunk(`${name}/add`, ({ groupId, input }) =>
    provider.create(name, groupId, prepare(input)),
  );

  const editItem = createAsyncThunk(`${name}/edit`, async ({ groupId, id, changes }, { getState }) => {
    const current = getState()[name].entities[id];
    return provider.update(name, groupId, id, { ...current, ...changes });
  });

  const removeItem = createAsyncThunk(`${name}/remove`, async ({ groupId, id }) => {
    await provider.remove(name, groupId, id);
    return id;
  });

  const slice = createSlice({
    name,
    initialState: adapter.getInitialState({ status: 'idle', error: null }),
    reducers: {
      cleared: (state) => {
        adapter.removeAll(state);
        state.status = 'idle';
      },
    },
    extraReducers: (b) => {
      b.addCase(fetchAll.pending, (s) => { s.status = 'loading'; });
      b.addCase(fetchAll.fulfilled, (s, a) => {
        adapter.setAll(s, a.payload);
        s.status = 'ready';
      });
      b.addCase(fetchAll.rejected, (s, a) => {
        s.status = 'error';
        s.error = a.error.message;
      });
      b.addCase(addItem.fulfilled, adapter.addOne);
      b.addCase(editItem.fulfilled, adapter.setOne);
      b.addCase(removeItem.fulfilled, adapter.removeOne);
    },
  });

  return {
    reducer: slice.reducer,
    actions: { ...slice.actions, fetchAll, addItem, editItem, removeItem },
    selectors: adapter.getSelectors((s) => s[name]),
  };
}
