import { Routes, Route, Navigate } from "react-router-dom";
import { SearchProvider } from './contexts/SearchContext';
import { TimezoneProvider } from './contexts/TimezoneContext';

import Dashboard from "./pages/Dashboard";
import LockersPage from "./pages/LockersPage";
import ResidentsPage from "./pages/ResidentsPage";
import EventsPage from "./pages/EventsPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <TimezoneProvider>
      <SearchProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lockers" element={<LockersPage />} />
          <Route path="/residents" element={<ResidentsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SearchProvider>
    </TimezoneProvider>
  );
}
