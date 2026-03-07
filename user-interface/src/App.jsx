import { Routes, Route, Navigate } from "react-router-dom";

import Accesschoice from "./pages/UserInterface/Accesschoice";
import DeliveryAccess from "./pages/UserInterface/DeliveryAccess";
import PickupAccess from "./pages/UserInterface/PickupAccess";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/access" replace />} />
      <Route path="/access" element={<Accesschoice />} />
      <Route path="/access/delivery" element={<DeliveryAccess />} />
      <Route path="/access/pickup" element={<PickupAccess />} />

      <Route path="*" element={<Navigate to="/access" replace />} />
    </Routes>
  );
}
