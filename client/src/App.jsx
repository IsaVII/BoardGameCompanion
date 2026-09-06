import { Routes, Route, Navigate } from 'react-router-dom';

import AppShell from './components/AppShell';
import DashboardPage from './pages/DashboardPage';
import CollectionPage from './pages/CollectionPage';
import PickerPage from './pages/PickerPage';
import PlaysPage from './pages/PlaysPage';
import LendingPage from './pages/LendingPage';
import WishlistPage from './pages/WishlistPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
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
