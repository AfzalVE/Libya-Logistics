import { FaSearch, FaBell, FaUserCircle, FaBars, FaSun, FaMoon, FaChevronDown } from "react-icons/fa";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Topbar({ onToggleSidebar }) {
  const { user, quickLogin } = useAuthStore();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
  });

  const [showSwitcher, setShowSwitcher] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const getInitials = (name) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const currentRole = user?.role?.name || "Super Admin";

  const demoAccounts = [
    { label: "Super Admin", email: "admin@libya.com", badgeColor: "var(--clay-pink)" },
    { label: "Tripoli Operator", email: "operator.tripoli@libya.com", badgeColor: "var(--clay-lavender)" },
    { label: "Tripoli Manager", email: "manager.tripoli@libya.com", badgeColor: "var(--clay-mint)" },
    { label: "Benghazi Operator", email: "operator.benghazi@libya.com", badgeColor: "var(--clay-peach)" },
    { label: "Benghazi Manager", email: "manager.benghazi@libya.com", badgeColor: "var(--clay-ochre)" },
  ];

  return (
    <header 
      className="px-4 md:px-10"
      style={{
        background: "var(--clay-canvas)",
        borderBottom: "1.5px solid var(--clay-hairline)",
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >

      {/* Left — Hamburger + Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-2 rounded-md hover:bg-[var(--clay-surface-soft)] text-[var(--clay-muted)] flex items-center"
          style={{ border: "none", background: "none", cursor: "pointer" }}
        >
          <FaBars size={20} />
        </button>
        <div>
          <p style={{
            fontSize: "12px", fontWeight: 600,
            letterSpacing: "1.2px", textTransform: "uppercase",
            color: "var(--clay-muted)", margin: 0,
          }}>
            Libya Logistics
          </p>
          <h2 style={{
            fontSize: "18px", fontWeight: 600,
            letterSpacing: "-0.3px", color: "var(--clay-ink)",
            margin: "2px 0 0 0", lineHeight: 1.3,
          }}>
            {currentRole} Dashboard
          </h2>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

        {/* Demo Switcher Widget */}
        {(() => {
          const currentAcc = demoAccounts.find(acc => acc.email === user?.email) || demoAccounts[0];
          return (
            <div className="hidden lg:flex" style={{ alignItems: "center", gap: "8px", position: "relative" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                Switch User:
              </span>
              <button
                onClick={() => setShowSwitcher(!showSwitcher)}
                className="clay-btn-secondary"
                style={{
                  height: "38px",
                  fontSize: "13px",
                  padding: "0 16px",
                  minWidth: "260px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  background: "var(--clay-canvas)",
                  border: "1.5px solid var(--clay-ink)",
                  borderRadius: "var(--r-md)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: currentAcc.badgeColor }} />
                  {currentAcc.label}
                </span>
                <FaChevronDown size={10} style={{ color: "var(--clay-muted)" }} />
              </button>

              {showSwitcher && (
                <>
                  <div onClick={() => setShowSwitcher(false)} style={{ position: "fixed", inset: 0, zIndex: 90 }} />
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: "90px",
                    marginTop: "6px",
                    background: "var(--clay-canvas)",
                    borderRadius: "var(--r-md)",
                    border: "1.5px solid var(--clay-ink)",
                    boxShadow: "0 8px 24px rgba(10,10,10,0.08)",
                    zIndex: 100,
                    width: "280px",
                    display: "flex",
                    flexDirection: "column",
                    padding: "6px",
                    animation: "clay-scale-in 0.15s ease both",
                  }}>
                    {demoAccounts.map((acc) => (
                      <button
                        key={acc.email}
                        onClick={async () => {
                          setShowSwitcher(false);
                          await quickLogin(acc.email);
                          navigate("/");
                        }}
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          background: "none",
                          border: "none",
                          borderRadius: "var(--r-xs)",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--clay-surface-soft)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                      >
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--clay-ink)", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: acc.badgeColor }} />
                          {acc.label}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--clay-muted)" }}>{acc.email}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* Divider */}
        <div className="hidden lg:block" style={{
          width: "1.5px",
          height: "28px",
          background: "var(--clay-hairline)",
        }} />

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            position: "relative",
            height: "38px", width: "38px",
            borderRadius: "var(--r-md)",
            border: "1.5px solid var(--clay-hairline)",
            background: "var(--clay-canvas)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            color: "var(--clay-muted)",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--clay-surface-soft)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--clay-canvas)"}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <FaSun size={14} style={{ color: "var(--clay-ochre)" }} /> : <FaMoon size={14} />}
        </button>

        {/* Notification Bell */}
        <button
          style={{
            position: "relative",
            height: "38px", width: "38px",
            borderRadius: "var(--r-md)",
            border: "1.5px solid var(--clay-hairline)",
            background: "var(--clay-canvas)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            color: "var(--clay-muted)",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--clay-surface-soft)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--clay-canvas)"}
        >
          <FaBell size={14} />
          {/* Notification dot */}
          <span style={{
            position: "absolute", top: "9px", right: "9px",
            width: "6px", height: "6px",
            borderRadius: "50%",
            background: "var(--clay-coral)",
            border: "1.5px solid var(--clay-canvas)",
          }} />
        </button>

        {/* Divider */}
        <div style={{
          width: "1.5px", height: "28px",
          background: "var(--clay-hairline)",
        }} />

        {/* User Card */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

          <div style={{
            height: "36px", width: "36px",
            borderRadius: "50%",
            background: ["var(--clay-lavender)", "var(--clay-peach)", "var(--clay-pink)", "var(--clay-ochre)", "var(--clay-mint)"][(user?.name?.length || 0) % 5],
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "13px",
            color: "var(--clay-ink)",
            flexShrink: 0,
            border: "1.5px solid var(--clay-ink)"
          }}>
            {getInitials(user?.name)}
          </div>

          <div className="hidden sm:block">
            <p style={{
              fontWeight: 600, fontSize: "14px",
              color: "var(--clay-ink)", margin: 0, lineHeight: 1.2,
            }}>
              {user?.name || "Guest"}
            </p>
            <p style={{
              fontSize: "11px", color: "var(--clay-muted)",
              margin: 0, lineHeight: 1.4,
            }}>
              {user?.email || "No Email"}
            </p>
          </div>

        </div>

      </div>

    </header>
  );
}