import { Routes, Route, Navigate } from "react-router-dom";

import Accesschoice from "./pages/Access/Accesschoice";
import DeliveryAccess from "./pages/Access/DeliveryAccess";
import PickupAccess from "./pages/Access/PickupAccess";
import Dashboard from "./pages/Dashboard";
import LockersPage from "./pages/LockersPage";
import ResidentsPage from "./pages/ResidentsPage";
import EventsPage from "./pages/EventsPage";

export default function App() {
  const Settings = () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <p className="text-gray-500">System configuration placeholders...</p>
    </div>
  );
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/lockers" element={<LockersPage />} />
      <Route path="/residents" element={<ResidentsPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/settings" element={<Settings />} />

      <Route path="/access" element={<Accesschoice />} />
      <Route path="/access/delivery" element={<DeliveryAccess />} />
      <Route path="/access/pickup" element={<PickupAccess />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
