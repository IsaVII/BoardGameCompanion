import { Routes, Route, Navigate } from 'react-router-dom';

import { useAppSelector } from './app/hooks';
import { selectUser, selectAuthStatus } from './features/auth/authSlice';
import { selectActiveGroupId } from './features/groups/groupsSlice';
import { useAuthBootstrap } from './features/auth/useAuthBootstrap';
import { useGroupData } from './features/groups/useGroupData';
import { isCloud } from './lib/db';

import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CollectionPage from './pages/CollectionPage';
import PickerPage from './pages/PickerPage';
import PlaysPage from './pages/PlaysPage';
import LendingPage from './pages/LendingPage';
import WishlistPage from './pages/WishlistPage';
import SettingsPage from './pages/SettingsPage';

function Splash({ children }) {
  return <div className="grid min-h-screen place-items-center text-sm text-slate-400">{children}</div>;
}

export default function App() {
  useAuthBootstrap();
  useGroupData();

  const status = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectUser);
  const groupId = useAppSelector(selectActiveGroupId);

  if (status !== 'ready') return <Splash>Loading…</Splash>;
  if (isCloud && !user) return <LoginPage />;
  if (!groupId) return <Splash>Setting up your shelf…</Splash>;

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/picker" element={<PickerPage />} />
        <Route path="/plays" element={<PlaysPage />} />
        <Route path="/lending" element={<LendingPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
