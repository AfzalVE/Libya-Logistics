import { useState, useEffect } from "react";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import TableCard from "../components/TableCard";
import StatusBadge from "../components/StatusBadge";
import useAuthStore from "../store/useAuthStore";
import useToastStore from "../store/useToastStore";
import { FaChevronDown } from "react-icons/fa";

const ACCENT_COLORS = [
  "var(--clay-teal)",
  "var(--clay-ochre)",
  "var(--clay-lavender)",
  "var(--clay-pink)",
  "var(--clay-mint)"
];

export default function Warehouses() {
  const { addToast } = useToastStore();
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

  // Edit states
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editManagerName, setEditManagerName] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [activeMenuId, setActiveMenuId] = useState(null);

  const openEditModal = (w) => {
    setEditingWarehouse(w);
    setEditName(w.name || "");
    setEditCode(w.code || "");
    setEditCity(w.city || "");
    setEditAddress(w.address || "");
    setEditPhone(w.phone || "");
    setEditManagerName(w.managerName || "");
    setEditStatus(w.status || "ACTIVE");
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await api.put(`/warehouses/${editingWarehouse._id}`, {
        name: editName,
        code: editCode.toUpperCase(),
        city: editCity,
        address: editAddress,
        phone: editPhone,
        managerName: editManagerName,
        status: editStatus
      });
      if (response.data.success) {
        setShowEditModal(false);
        setEditingWarehouse(null);
        addToast("Warehouse updated successfully!", "success");
        fetchWarehouses();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update warehouse";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (warehouseId) => {
    const confirmed = window.confirm("Are you sure you want to delete this warehouse location?");
    if (!confirmed) return;
    try {
      await api.delete(`/warehouses/${warehouseId}`);
      addToast("Warehouse deleted successfully!", "success");
      fetchWarehouses();
    } catch (err) {
      addToast("Failed to delete warehouse", "error");
    }
  };

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
        addToast("Warehouse created successfully!", "success");
        fetchWarehouses();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create warehouse";
      setError(msg);
      addToast(msg, "error");
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} style={{
              background: "var(--clay-canvas)",
              borderRadius: "var(--r-md)",
              padding: "20px 24px",
              border: "1.5px solid var(--clay-hairline)",
              borderLeft: "5px solid var(--clay-hairline)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              height: "170px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="clay-skeleton" style={{ width: "44px", height: "44px", borderRadius: "8px" }} />
                <div className="clay-skeleton" style={{ width: "70px", height: "24px", borderRadius: "var(--r-pill)" }} />
              </div>
              <div className="clay-skeleton" style={{ width: "60%", height: "18px", marginTop: "8px" }} />
              <div className="clay-skeleton" style={{ width: "40%", height: "14px", marginTop: "4px" }} />
              <div className="clay-skeleton" style={{ width: "50%", height: "14px", marginTop: "2px" }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Warehouse cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {warehouses.map(({ code, name, city, managerName, status }, i) => {
              const accentColors = [
                "var(--clay-teal)",
                "var(--clay-pink)",
                "var(--clay-lavender)",
                "var(--clay-peach)",
                "var(--clay-ochre)",
              ];
              const accentColor = accentColors[i % accentColors.length];
              return (
                <div key={code} style={{
                  background: "var(--clay-canvas)",
                  borderRadius: "var(--r-md)",
                  padding: "20px 24px",
                  position: "relative",
                  overflow: "hidden",
                  border: "1.5px solid var(--clay-hairline)",
                  borderLeft: `5px solid ${accentColor}`,
                  boxShadow: "0 4px 12px rgba(10,10,10,0.02)",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "8px",
                      background: "var(--clay-surface-soft)",
                      border: "1.5px solid var(--clay-hairline)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: "13px",
                      color: "var(--clay-ink)",
                    }}>
                      {code}
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--clay-ink)", margin: "0 0 6px 0", letterSpacing: "-0.2px" }}>
                    {name}
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--clay-body)", margin: "0 0 4px 0", fontWeight: 500 }}>
                    {city}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--clay-muted)", margin: 0, fontWeight: 500 }}>
                    Manager: <span style={{ color: "var(--clay-ink)", fontWeight: 600 }}>{managerName || "Unassigned"}</span>
                  </p>
                </div>
              );
            })}
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
            <div className="overflow-x-auto">
              <table className="clay-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Warehouse</th>
                    <th>City</th>
                    <th>Manager</th>
                    <th>Status</th>
                    {isAdmin && <th>Actions</th>}
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
                      {isAdmin && (
                        <td>
                          <div style={{ position: "relative" }}>
                            <button 
                              onClick={() => setActiveMenuId(activeMenuId === w._id ? null : w._id)} 
                              className="clay-btn-secondary"
                              style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                            >
                              Actions <FaChevronDown size={10} />
                            </button>
                            {activeMenuId === w._id && (
                              <>
                                <div 
                                  onClick={() => setActiveMenuId(null)}
                                  style={{ position: "fixed", inset: 0, zIndex: 90 }}
                                />
                                <div style={{
                                  position: "absolute",
                                  right: 0,
                                  top: "100%",
                                  marginTop: "6px",
                                  background: "var(--clay-canvas)",
                                  borderRadius: "var(--r-md)",
                                  border: "1.5px solid var(--clay-ink)",
                                  boxShadow: "0 8px 24px rgba(10,10,10,0.08)",
                                  zIndex: 100,
                                  minWidth: "130px",
                                  display: "flex",
                                  flexDirection: "column",
                                  padding: "6px",
                                  animation: "clay-scale-in 0.15s ease both"
                                }}>
                                  <button
                                    onClick={() => {
                                      openEditModal(w);
                                      setActiveMenuId(null);
                                    }}
                                    style={{
                                      padding: "8px 12px",
                                      textAlign: "left",
                                      background: "none",
                                      border: "none",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      fontSize: "12px",
                                      fontWeight: 500,
                                      color: "var(--clay-ink)",
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = "var(--clay-surface-soft)"}
                                    onMouseLeave={(e) => e.target.style.background = "none"}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDelete(w._id);
                                      setActiveMenuId(null);
                                    }}
                                    style={{
                                      padding: "8px 12px",
                                      textAlign: "left",
                                      background: "none",
                                      border: "none",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      fontSize: "12px",
                                      fontWeight: 500,
                                      color: "#ef4444",
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = "rgba(239, 68, 68, 0.08)"}
                                    onMouseLeave={(e) => e.target.style.background = "none"}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          <div 
            className="p-6 sm:p-8 w-full max-w-[540px] bg-[var(--clay-canvas)] rounded-[var(--r-xl)] border-[1.5px] border-clay-hairline mx-4"
          >
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      {/* Edit Warehouse Modal */}
      {showEditModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(10, 10, 10, 0.4)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div 
            className="p-6 sm:p-8 w-full max-w-[540px] bg-[var(--clay-canvas)] rounded-[var(--r-xl)] border-[1.5px] border-clay-hairline mx-4"
          >
            <h3 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.5px", margin: "0 0 8px 0" }}>
              Edit Warehouse
            </h3>
            <p style={{ fontSize: "14px", color: "var(--clay-muted)", margin: "0 0 24px 0" }}>
              Update logistics location details.
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

            <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                    Warehouse Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="e.g. MIS"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
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
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="clay-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Misrata"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
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
                    value={editManagerName}
                    onChange={(e) => setEditManagerName(e.target.value)}
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
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="clay-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +218 91 123 4567"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="clay-input"
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="clay-select"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingWarehouse(null);
                  }}
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
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}