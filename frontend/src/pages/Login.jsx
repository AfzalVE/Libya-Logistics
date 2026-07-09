import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { FaTruck, FaLock, FaEnvelope } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, quickLogin, error, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      navigate("/");
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    const res = await quickLogin(demoEmail);
    if (res.success) {
      navigate("/");
    }
  };

  const demoAccounts = [
    { name: "Super Admin", email: "admin@libya.com", badge: "Super Admin", color: "var(--clay-pink)", text: "#fff" },
    { name: "Tripoli Operator", email: "operator.tripoli@libya.com", badge: "Operator (TRI)", color: "var(--clay-lavender)", text: "var(--clay-ink)" },
    { name: "Benghazi Manager", email: "manager.benghazi@libya.com", badge: "Manager (BEN)", color: "var(--clay-ochre)", text: "var(--clay-ink)" },
    { name: "Tripoli Manager", email: "manager.tripoli@libya.com", badge: "Manager (TRI)", color: "var(--clay-mint)", text: "var(--clay-ink)" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--clay-canvas)",
      padding: "24px"
    }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-[1040px] bg-[var(--clay-surface-soft)] rounded-[var(--r-xl)] border-[1.5px] border-clay-hairline overflow-hidden shadow-[0_8px_32px_rgba(10,10,10,0.04)]">
        {/* Left Panel: Branding & Details */}
        <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-clay-teal text-white p-12">
          {/* Background circles */}
          <div style={{
            position: "absolute", right: "-40px", top: "-40px",
            width: "200px", height: "200px", borderRadius: "50%",
            background: "var(--clay-ochre)", opacity: 0.15, pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute", left: "-60px", bottom: "-60px",
            width: "250px", height: "250px", borderRadius: "50%",
            background: "var(--clay-pink)", opacity: 0.12, pointerEvents: "none"
          }} />

          {/* Logo Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", zIndex: 1 }}>
            <div style={{
              height: "52px", width: "52px",
              borderRadius: "14px",
              background: "var(--clay-ochre)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--clay-ink)"
            }}>
              <FaTruck size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>
                Libya Logistics
              </h1>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0, fontWeight: 500 }}>
                Warehouse & Shipment tracking
              </p>
            </div>
          </div>

          {/* Core content description */}
          <div style={{ margin: "48px 0", zIndex: 1 }}>
            <h2 style={{
              fontSize: "36px", fontWeight: 500,
              lineHeight: 1.15, letterSpacing: "-1px",
              marginBottom: "16px"
            }}>
              Core-to-Destination Tracking Flow
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>
              An interactive workflow orchestrator connecting Super Admins, operators booking shipments at origin, and managers routing parcels to their final delivery point.
            </p>

            <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { title: "Super Admin Setup", desc: "Initialize warehouses and user roles." },
                { title: "Operator Booking", desc: "Book and store shipments locally." },
                { title: "Manager Operations", desc: "Dispatch, track in transit, receive, and complete pickup." },
              ].map((step, idx) => (
                <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{
                    width: "24px", height: "24px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 700, flexShrink: 0
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 2px 0" }}>{step.title}</h4>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", margin: 0 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", zIndex: 1 }}>
            &copy; 2026 Libya Logistics. Powered by Clay Design.
          </div>

          {/* Signature Clay Mountains background */}
          <svg viewBox="0 0 400 120" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.15, pointerEvents: "none", zIndex: 0 }}>
            <path d="M0,120 L80,50 L160,100 L240,30 L320,90 L400,40 L400,120 Z" fill="var(--clay-ochre)" />
            <path d="M0,120 L100,70 L200,110 L280,60 L360,100 L400,70 L400,120 Z" fill="var(--clay-pink)" />
          </svg>
        </div>

        {/* Right Panel: Login Form & Quick Access */}
        <div className="flex flex-col justify-center bg-[var(--clay-canvas)] p-6 sm:p-12">
          <div>
            <h2 style={{
              fontSize: "32px", fontWeight: 500,
              letterSpacing: "-0.8px", color: "var(--clay-ink)",
              margin: "0 0 8px 0"
            }}>
              Sign In
            </h2>
            <p style={{ fontSize: "15px", color: "var(--clay-muted)", margin: "0 0 28px 0" }}>
              Access your warehouse portal.
            </p>
          </div>

          {error && (
            <div style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1.5px solid var(--clay-error)",
              borderRadius: "var(--r-md)",
              padding: "12px 16px",
              color: "var(--clay-error)",
              fontSize: "14px",
              marginBottom: "20px",
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <FaEnvelope style={{
                  position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                  color: "var(--clay-muted-soft)"
                }} />
                <input
                  type="email"
                  placeholder="name@libya.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="clay-input"
                  style={{ paddingLeft: "38px" }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <FaLock style={{
                  position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                  color: "var(--clay-muted-soft)"
                }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="clay-input"
                  style={{ paddingLeft: "38px" }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="clay-btn-primary"
              style={{ width: "100%", height: "46px", marginTop: "8px" }}
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In to Portal"}
            </button>
          </form>

          {/* Quick Switcher Section */}
          <div style={{
            marginTop: "36px",
            borderTop: "1.5px solid var(--clay-hairline)",
            paddingTop: "24px"
          }}>
            <p style={{
              fontSize: "11px", fontWeight: 600, letterSpacing: "1px",
              textTransform: "uppercase", color: "var(--clay-muted)",
              margin: "0 0 16px 0"
            }}>
              Demo Quick-Login (Switch Roles instantly)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleQuickLogin(acc.email)}
                  style={{
                    background: "var(--clay-surface-card)",
                    border: "1.5px solid var(--clay-hairline)",
                    borderRadius: "var(--r-md)",
                    padding: "10px 12px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "border-color 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "6px"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--clay-ink)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--clay-hairline)"}
                >
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--clay-ink)" }}>
                    {acc.name}
                  </span>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    alignSelf: "flex-start",
                    background: acc.color,
                    color: acc.text,
                    padding: "2px 6px",
                    borderRadius: "4px"
                  }}>
                    {acc.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
