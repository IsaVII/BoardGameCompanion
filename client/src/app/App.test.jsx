import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';
import groupsReducer from '../features/groups/groupsSlice';
import gamesReducer from '../features/collection/collectionSlice';
import playsReducer from '../features/plays/playsSlice';
import loansReducer from '../features/lending/lendingSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import playersReducer from '../features/players/playersSlice';
import uiReducer from '../features/ui/uiSlice';
import App from '../App';
import { localProvider } from '../lib/db/localProvider';

function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer, groups: groupsReducer, games: gamesReducer,
      plays: playsReducer, loans: loansReducer, wishlist: wishlistReducer,
      players: playersReducer, ui: uiReducer,
    },
  });
}

describe('App (local mode)', () => {
  beforeEach(() => {
    localStorage.clear();
    localProvider._reset();
  });

  it('boots straight into the dashboard with seeded data', async () => {
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeDefined();
    expect(await screen.findByText(/hrs at the table/)).toBeDefined();
    expect(await screen.findByText('Recent plays')).toBeDefined();
  });
});
