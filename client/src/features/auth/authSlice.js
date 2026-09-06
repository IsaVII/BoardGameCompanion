import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { provider, isCloud } from '../../lib/db';

function userFromSession(session) {
  if (!session?.user) return null;
  const u = session.user;
  const username = u.user_metadata?.username;
  return {
    id: u.id,
    email: u.email,
    username,
    displayName: u.user_metadata?.display_name || username || u.email?.split('@')[0] || 'You',
  };
}

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  const session = await provider.getSession();
  return userFromSession(session);
});

export const signIn = createAsyncThunk('auth/signIn', ({ identifier, password }) =>
  provider.signIn(identifier, password),
);

export const signUp = createAsyncThunk('auth/signUp', ({ email, password, username }) =>
  provider.signUp(email, password, username),
);

export const signOut = createAsyncThunk('auth/signOut', () => provider.signOut());

export const deleteAccount = createAsyncThunk('auth/deleteAccount', () => provider.deleteAccount());

const slice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    // 'local' skips the login screen entirely
    status: isCloud ? 'unknown' : 'ready',
    error: null,
  },
  reducers: {
    sessionChanged: (state, action) => {
      state.user = userFromSession(action.payload);
      state.status = 'ready';
    },
  },
  extraReducers: (b) => {
    b.addCase(bootstrapAuth.fulfilled, (s, a) => {
      s.user = a.payload;
      s.status = 'ready';
    });
    b.addCase(bootstrapAuth.rejected, (s) => { s.status = 'ready'; });
    [signIn, signUp, signOut, deleteAccount].forEach((thunk) => {
      b.addCase(thunk.pending, (s) => { s.error = null; });
      b.addCase(thunk.rejected, (s, a) => { s.error = a.error.message; });
    });
    b.addCase(signOut.fulfilled, (s) => { s.user = null; });
  },
});

export const { sessionChanged } = slice.actions;
export const selectUser = (s) => s.auth.user;
export const selectAuthStatus = (s) => s.auth.status;
export const selectAuthError = (s) => s.auth.error;
export default slice.reducer;
