import { FaSearch, FaBell, FaUserCircle, FaBars } from "react-icons/fa";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function Topbar({ onToggleSidebar }) {
  const { user, quickLogin } = useAuthStore();
  const navigate = useNavigate();

  const handleRoleSwitch = async (e) => {
    const email = e.target.value;
    if (email) {
      await quickLogin(email);
      navigate("/");
    }
  };

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
    { label: "Super Admin (admin@libya.com)", email: "admin@libya.com" },
    { label: "Tripoli Operator (operator.tripoli@libya.com)", email: "operator.tripoli@libya.com" },
    { label: "Tripoli Manager (manager.tripoli@libya.com)", email: "manager.tripoli@libya.com" },
    { label: "Benghazi Operator (operator.benghazi@libya.com)", email: "operator.benghazi@libya.com" },
    { label: "Benghazi Manager (manager.benghazi@libya.com)", email: "manager.benghazi@libya.com" },
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
        <div className="hidden lg:flex" style={{ alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
            Switch User:
          </span>
          <select
            value={user?.email || ""}
            onChange={handleRoleSwitch}
            className="clay-select"
            style={{
              height: "38px",
              fontSize: "13px",
              paddingTop: 0,
              paddingBottom: 0,
              minWidth: "260px",
              border: "1.5px solid var(--clay-ink)",
              borderRadius: "var(--r-md)",
              backgroundColor: "var(--clay-surface-soft)"
            }}
          >
            {demoAccounts.map((acc) => (
              <option key={acc.email} value={acc.email}>
                {acc.label}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="hidden lg:block" style={{
          width: "1.5px",
          height: "28px",
          background: "var(--clay-hairline)",
        }} />

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