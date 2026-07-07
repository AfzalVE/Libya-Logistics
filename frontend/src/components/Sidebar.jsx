import {
  FaWarehouse,
  FaUsers,
  FaBox,
  FaChartBar,
  FaCog,
  FaHome,
  FaTruck,
  FaSignOutAlt
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const links = [
  { icon: <FaHome />,     label: "Dashboard",  path: "/" },
  { icon: <FaWarehouse />,label: "Warehouses", path: "/warehouses" },
  { icon: <FaUsers />,    label: "Users",      path: "/users" },
  { icon: <FaBox />,      label: "Shipments",  path: "/shipments" },
  { icon: <FaChartBar />, label: "Reports",    path: "/reports" },
  { icon: <FaCog />,      label: "Settings",   path: "/settings" },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const roleName = user?.role?.name || "Super Admin";
  const isAdmin = roleName === "Super Admin";
  const warehouseCode = user?.warehouse?.code || "ALL";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredLinks = links.filter(link => {
    if (link.path === "/warehouses" || link.path === "/users") {
      return isAdmin;
    }
    return true;
  });

  const getInitials = (name) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <aside style={{
      position: "fixed",
      left: 0, top: 0,
      height: "100vh",
      width: "280px",
      background: "var(--clay-teal)",
      display: "flex",
      flexDirection: "column",
      zIndex: 50,
    }}>

      {/* Logo */}
      <div style={{
        padding: "28px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>

          {/* Logo badge — ochre accent */}
          <div style={{
            height: "48px", width: "48px",
            borderRadius: "14px",
            background: "var(--clay-ochre)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--clay-ink)",
            flexShrink: 0,
          }}>
            <FaTruck size={20} />
          </div>

          <div>
            <h1 style={{
              fontWeight: 600,
              fontSize: "16px",
              color: "#ffffff",
              lineHeight: "1.2",
              margin: 0,
            }}>
              Libya Logistics
            </h1>
            <p style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.45)",
              marginTop: "3px",
              fontWeight: 500,
              letterSpacing: "0.3px",
            }}>
              {roleName}
            </p>
          </div>

        </div>
      </div>

      {/* Quick Stats / Context */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>

          {[
            { label: "Role Portal", value: roleName.split(" ")[1] || roleName },
            { label: "Warehouse", value: warehouseCode },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: "10px",
              padding: "12px 14px",
            }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 500, margin: 0 }}>
                {label}
              </p>
              <h3 style={{
                fontSize: "16px", fontWeight: 600, color: "#ffffff",
                letterSpacing: "-0.5px", marginTop: "4px", marginBottom: 0,
                textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"
              }}>
                {value}
              </h3>
            </div>
          ))}

        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 16px", overflowY: "auto" }}>

        <p style={{
          fontSize: "11px", fontWeight: 600, letterSpacing: "1.2px",
          textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
          padding: "0 8px", marginBottom: "10px", marginTop: "4px",
        }}>
          Navigation
        </p>

        {filteredLinks.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 14px",
              borderRadius: "12px",
              marginBottom: "4px",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "14px",
              transition: "background 0.15s ease, color 0.15s ease",
              background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
              color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "32px", height: "32px",
                  borderRadius: "8px",
                  background: isActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                  fontSize: "14px",
                  flexShrink: 0,
                  transition: "background 0.15s ease, color 0.15s ease",
                }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <span style={{
                    marginLeft: "auto",
                    width: "6px", height: "6px",
                    borderRadius: "50%",
                    background: "var(--clay-ochre)",
                    flexShrink: 0,
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}

      </nav>

      {/* Footer User Card & Logout */}
      <div style={{
        padding: "16px 20px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "12px 14px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "12px",
        }}>

          <div style={{
            height: "40px", width: "40px",
            borderRadius: "50%",
            background: "var(--clay-lavender)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "14px",
            color: "var(--clay-ink)",
            flexShrink: 0,
          }}>
            {getInitials(user?.name)}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontWeight: 600, fontSize: "14px",
              color: "#ffffff", margin: 0,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {user?.name || "Loading..."}
            </p>
            <p style={{
              fontSize: "12px", color: "rgba(255,255,255,0.4)",
              marginTop: "2px", margin: 0,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {user?.email || "..."}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "none",
            borderRadius: "12px",
            color: "#ff6b5a",
            padding: "12px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "13px",
            transition: "background 0.15s ease"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)"}
        >
          <FaSignOutAlt />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
}