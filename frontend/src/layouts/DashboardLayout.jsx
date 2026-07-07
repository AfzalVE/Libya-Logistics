import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--clay-canvas)" }}>

      <Sidebar />

      <div style={{ marginLeft: "280px", flex: 1, display: "flex", flexDirection: "column" }}>

        <Topbar />

        <main style={{ flex: 1, padding: "32px 40px", background: "var(--clay-canvas)" }}>
          <Outlet />
        </main>

      </div>

    </div>
  );
}