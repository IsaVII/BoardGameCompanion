import { useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { provider, isCloud } from '../../lib/db';
import { bootstrapAuth, sessionChanged } from './authSlice';

/** Load the current session once and keep it in sync with the provider. */
export function useAuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(bootstrapAuth());
    if (!isCloud) return undefined;
    return provider.onAuthChange((session) => dispatch(sessionChanged(session)));
  }, [dispatch]);
}
