import { Routes, Route, Navigate } from "react-router-dom";
import { SearchProvider } from './contexts/SearchContext';
import { TimezoneProvider } from './contexts/TimezoneContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';

import Dashboard from "./pages/Dashboard";
import LockersPage from "./pages/LockersPage";
import ResidentsPage from "./pages/ResidentsPage";
import EventsPage from "./pages/EventsPage";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/Login";

/** ProtectedRoute: redirects to /login if no valid token found in localStorage */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <TimezoneProvider>
          <SearchProvider>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />

              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/lockers" element={<ProtectedRoute><LockersPage /></ProtectedRoute>} />
              <Route path="/residents" element={<ProtectedRoute><ResidentsPage /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SearchProvider>
        </TimezoneProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
