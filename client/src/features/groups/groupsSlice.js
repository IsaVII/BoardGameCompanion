import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { provider } from '../../lib/db';

const ACTIVE_KEY = 'shelf-active-group';

export const fetchGroups = createAsyncThunk('groups/fetch', () => provider.listGroups());

export const createGroup = createAsyncThunk('groups/create', async (name, { dispatch }) => {
  const id = await provider.createGroup(name);
  await dispatch(fetchGroups());
  return id;
});

export const joinGroup = createAsyncThunk('groups/join', async (code, { dispatch }) => {
  const id = await provider.joinGroup(code);
  await dispatch(fetchGroups());
  return id;
});

export const renameGroup = createAsyncThunk('groups/rename', async ({ groupId, name }, { dispatch }) => {
  await provider.renameGroup(groupId, name);
  await dispatch(fetchGroups());
});

export const leaveGroup = createAsyncThunk('groups/leave', async (groupId, { dispatch }) => {
  await provider.leaveGroup(groupId);
  await dispatch(fetchGroups());
  return groupId;
});

export const createInvite = createAsyncThunk('groups/invite', (groupId) =>
  provider.createInvite(groupId),
);

const slice = createSlice({
  name: 'groups',
  initialState: {
    list: [],
    activeId: localStorage.getItem(ACTIVE_KEY) || null,
    status: 'idle',
    error: null,
  },
  reducers: {
    activeGroupSet: (state, action) => {
      state.activeId = action.payload;
      try {
        localStorage.setItem(ACTIVE_KEY, action.payload);
      } catch {
        /* ignore */
      }
    },
    groupsReset: (state) => {
      state.list = [];
      state.activeId = null;
      state.status = 'idle';
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchGroups.pending, (s) => { s.status = 'loading'; });
    b.addCase(fetchGroups.fulfilled, (s, a) => {
      s.list = a.payload;
      s.status = 'ready';
      if (!s.activeId || !a.payload.some((g) => g.id === s.activeId)) {
        s.activeId = a.payload[0]?.id ?? null;
      }
    });
    b.addCase(fetchGroups.rejected, (s, a) => {
      s.status = 'error';
      s.error = a.error.message;
    });
    b.addCase(createGroup.fulfilled, (s, a) => { s.activeId = a.payload; });
    b.addCase(joinGroup.fulfilled, (s, a) => { s.activeId = a.payload; });
  },
});

export const { activeGroupSet, groupsReset } = slice.actions;
export const selectGroups = (s) => s.groups.list;
export const selectActiveGroupId = (s) => s.groups.activeId;
export const selectActiveGroup = (s) => s.groups.list.find((g) => g.id === s.groups.activeId) || null;
export default slice.reducer;
