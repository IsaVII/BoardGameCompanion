import { createSelector } from '@reduxjs/toolkit';
import { collectionSelectors } from '../features/collection/collectionSlice';
import { playsSelectors } from '../features/plays/playsSlice';
import { lendingSelectors } from '../features/lending/lendingSlice';
import { wishlistSelectors } from '../features/wishlist/wishlistSlice';
import { playersSelectors } from '../features/players/playersSlice';

export const selectGames = collectionSelectors.selectAll;
export const selectPlays = playsSelectors.selectAll;
export const selectLoans = lendingSelectors.selectAll;
export const selectWishlist = wishlistSelectors.selectAll;
export const selectPlayers = playersSelectors.selectAll;

export const selectGameById = (id) => (s) => collectionSelectors.selectById(s, id);

export const selectPlayerNameMap = createSelector(selectPlayers, (players) =>
  Object.fromEntries(players.map((p) => [p.id, p.name])),
);

export const selectGameTitleMap = createSelector(selectGames, (games) =>
  Object.fromEntries(games.map((g) => [g.id, g.title])),
);

/** Plays joined with game + player names, newest first. */
export const selectPlayFeed = createSelector(
  [selectPlays, selectGameTitleMap, selectPlayerNameMap],
  (plays, titles, names) =>
    plays.map((p) => ({
      ...p,
      gameTitle: titles[p.gameId] ?? 'Removed game',
      playerNames: p.playerIds.map((id) => names[id] ?? '?'),
      winnerNames: p.winnerIds.map((id) => names[id] ?? '?'),
    })),
);
