import { useState, useEffect } from "react";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import TableCard from "../components/TableCard";
import StatusBadge from "../components/StatusBadge";
import useAuthStore from "../store/useAuthStore";

const ACCENT_COLORS = [
  "var(--clay-teal)",
  "var(--clay-ochre)",
  "var(--clay-lavender)",
  "var(--clay-pink)",
  "var(--clay-mint)"
];

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();
  const isAdmin = user?.role?.name === "Super Admin";

  // Form states
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [managerName, setManagerName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/warehouses");
      setWarehouses(response.data);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await api.post("/warehouses", {
        name,
        code: code.toUpperCase(),
        city,
        address,
        phone,
        managerName
      });
      if (response.data.success) {
        setShowModal(false);
        // Clear form
        setName("");
        setCode("");
        setCity("");
        setAddress("");
        setPhone("");
        setManagerName("");
        fetchWarehouses();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create warehouse");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Warehouses"
        subtitle="Manage warehouse locations and staff"
        buttonText={isAdmin ? "Add Warehouse" : null}
        onButtonClick={() => setShowModal(true)}
      />

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--clay-muted)" }}>
          Loading warehouses...
        </div>
      ) : (
        <>
          {/* Warehouse cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
            {warehouses.map(({ code, name, city, managerName, status }, i) => (
              <div key={code} style={{
                background: "var(--clay-canvas)",
                borderRadius: "var(--r-lg)",
                border: "1.5px solid var(--clay-hairline)",
                padding: "24px",
                borderTop: `4px solid ${ACCENT_COLORS[i % ACCENT_COLORS.length]}`,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "10px",
                    background: ACCENT_COLORS[i % ACCENT_COLORS.length],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "14px",
                    color: (i % ACCENT_COLORS.length) === 0 ? "#fff" : "var(--clay-ink)",
                  }}>
                    {code}
                  </div>
                  <StatusBadge status={status} />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--clay-ink)", margin: "0 0 4px 0" }}>
                  {name}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--clay-muted)", margin: "0 0 2px 0" }}>
                  {city}
                </p>
                <p style={{ fontSize: "13px", color: "var(--clay-muted-soft)", margin: 0 }}>
                  Manager: {managerName || "Unassigned"}
                </p>
              </div>
            ))}
          </div>

          {/* Full table */}
          <TableCard>
            <div style={{
              padding: "16px 20px",
              borderBottom: "1.5px solid var(--clay-hairline)",
            }}>
              <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "var(--clay-muted)", margin: "0 0 2px 0" }}>
                All Locations
              </p>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--clay-ink)", margin: 0, letterSpacing: "-0.2px" }}>
                Warehouse Directory
              </h2>
            </div>
            <table className="clay-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Warehouse</th>
                  <th>City</th>
                  <th>Manager</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map((w) => (
                  <tr key={w.code}>
                    <td>
                      <span style={{
                        fontWeight: 700, fontSize: "12px",
                        letterSpacing: "1px", textTransform: "uppercase",
                        color: "var(--clay-muted)",
                        fontFamily: "monospace",
                      }}>
                        {w.code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, color: "var(--clay-ink)" }}>{w.name}</td>
                    <td>{w.city}</td>
                    <td>{w.managerName || "Unassigned"}</td>
                    <td><StatusBadge status={w.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
        </>
      )}

      {/* Add Warehouse Modal */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(10, 10, 10, 0.4)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "var(--clay-canvas)", padding: "32px", borderRadius: "var(--r-xl)",
            width: "100%", maxWidth: "540px", border: "1.5px solid var(--clay-hairline)"
          }}>
            <h3 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.5px", margin: "0 0 8px 0" }}>
              Add Warehouse
            </h3>
            <p style={{ fontSize: "14px", color: "var(--clay-muted)", margin: "0 0 24px 0" }}>
              Create a new physical logistics location.
            </p>

            {error && (
              <div style={{
                background: "rgba(239, 68, 68, 0.08)", border: "1.5px solid var(--clay-error)",
                color: "var(--clay-error)", borderRadius: "var(--r-md)", padding: "10px 14px",
                marginBottom: "16px", fontSize: "13px", fontWeight: 500
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                    Warehouse Code (3 chars)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="e.g. MIS"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="clay-input"
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                    Warehouse Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Misrata Hub"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="clay-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Misrata"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="clay-input"
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                    Manager Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Omar Salem"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="clay-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                  Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Airport Road, Terminal 2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="clay-input"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. +218 91 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="clay-input"
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="clay-btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Save Warehouse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}