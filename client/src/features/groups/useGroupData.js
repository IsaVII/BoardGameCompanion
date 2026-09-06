import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { provider } from '../../lib/db';
import { selectUser } from '../auth/authSlice';
import { fetchGroups, selectActiveGroupId } from './groupsSlice';
import { fetchGames } from '../collection/collectionSlice';
import { fetchPlays } from '../plays/playsSlice';
import { fetchLoans } from '../lending/lendingSlice';
import { fetchWishlist } from '../wishlist/wishlistSlice';
import { fetchPlayers } from '../players/playersSlice';

const FETCHERS = [fetchGames, fetchPlays, fetchLoans, fetchWishlist, fetchPlayers];

/** Loads the group list once signed in, then (re)loads all domain data
 *  whenever the active group changes, and subscribes to realtime updates. */
export function useGroupData() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const groupId = useAppSelector(selectActiveGroupId);

  useEffect(() => {
    if (user) dispatch(fetchGroups());
  }, [dispatch, user]);

  useEffect(() => {
    if (!groupId) return undefined;
    FETCHERS.forEach((fetch) => dispatch(fetch(groupId)));
    return provider.subscribe(groupId, () => {
      FETCHERS.forEach((fetch) => dispatch(fetch(groupId)));
    });
  }, [dispatch, groupId]);
}
