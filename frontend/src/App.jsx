import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Warehouses from "./pages/Warehouses";
import Users from "./pages/Users";
import Shipments from "./pages/Shipments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ShipmentDetails from "./pages/ShipmentDetails";
import Login from "./pages/Login";

import useAuthStore from "./store/useAuthStore";
import ToastContainer from "./components/ToastContainer";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.name === "Super Admin";
  return isAdmin ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
      
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/warehouses"
          element={
            <AdminRoute>
              <Warehouses />
            </AdminRoute>
          }
        />

        <Route
          path="/users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />

        <Route
          path="/shipments"
          element={<Shipments />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/shipments/:id"
          element={<ShipmentDetails />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;