import { useState, useEffect } from "react";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import TableCard from "../components/TableCard";
import StatusBadge from "../components/StatusBadge";
import useAuthStore from "../store/useAuthStore";
import { FaChevronDown } from "react-icons/fa";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user: loggedInUser } = useAuthStore();

  const isAdmin = loggedInUser?.role?.name === "Super Admin";
  const isManager = loggedInUser?.role?.name === "Warehouse Manager";
  const isOperator = loggedInUser?.role?.name === "Warehouse Operator";

  function canEdit(targetUser) {
    const targetRole = targetUser.role?.name;
    if (isAdmin) return true;
    if (isManager && targetRole === "Warehouse Operator") return true;
    return false;
  }

  function canChangeRole(targetUser) {
    const targetRole = targetUser.role?.name;

    if (isAdmin && targetRole !== "Super Admin") {
      return true;
    }

    if (isManager && targetRole === "Warehouse Operator") {
      return true;
    }

    return false;
  }

  function canToggleStatus(targetUser) {
    const targetRole = targetUser.role?.name;

    if (isAdmin && targetRole !== "Super Admin") {
      return true;
    }

    if (isManager && targetRole === "Warehouse Operator") {
      return true;
    }

    return false;
  }

  function canDelete(targetUser) {
    const targetRole = targetUser.role?.name;

    if (isAdmin && targetRole !== "Super Admin") {
      return true;
    }

    return false;
  }

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWarehouse, setEditWarehouse] = useState("");
  const [editRole, setEditRole] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, whRes, rolesRes] = await Promise.all([
        api.get("/users"),
        api.get("/warehouses"),
        api.get("/users/roles"),
      ]);
      // console.log(usersRes.data)
      setUsers(usersRes.data);
      setWarehouses(whRes.data);
      setRoles(rolesRes.data);

      // Select first role/warehouse as default in form
      if (rolesRes.data.length > 0) setSelectedRole(rolesRes.data[0]._id);
      if (whRes.data.length > 0) setSelectedWarehouse(whRes.data[0]._id);
    } catch (err) {
      console.error("Error fetching users data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Find role object
      const roleObj = roles.find((r) => r._id === selectedRole);
      const isSuperAdminRole = roleObj?.name === "Super Admin";

      const payload = {
        name,
        email,
        password,
        role: selectedRole,
        warehouse: isSuperAdminRole ? undefined : selectedWarehouse,
      };

      const response = await api.post("/users", payload);
      if (response.data.success) {
        setShowModal(false);
        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  // Determine if selected role needs a warehouse assignment
  const roleObj = roles.find((r) => r._id === selectedRole);
  const requiresWarehouse = roleObj?.name !== "Super Admin";

  const editRoleObj = roles.find((r) => r._id === editRole);
  const editRequiresWarehouse = editRoleObj?.name !== "Super Admin";

  const openEditModal = (user) => {
    setEditingUser(user);

    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPhone(user.phone || "");
    setEditWarehouse(user.warehouse?._id || "");
    setEditRole(user.role?._id || "");

    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      const selectedRoleObj = roles.find((r) => r._id === editRole);
      const isSuperAdminRole = selectedRoleObj?.name === "Super Admin";

      await api.put(`/users/${editingUser._id}`, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        warehouse: isSuperAdminRole ? undefined : editWarehouse,
        role: editRole,
      });

      setShowEditModal(false);
      setEditingUser(null);

      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/users/${userId}/status`);

      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleRoleChange = async (user) => {
    const currentRole = user.role?.name;

    const nextRole =
      currentRole === "Warehouse Operator"
        ? "Warehouse Manager"
        : "Warehouse Operator";

    try {
      await api.patch(`/users/${user._id}/role`, {
        roleName: nextRole,
      });

      fetchData();
    } catch (err) {
      alert("Failed to change role");
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm("Delete this user?");

    if (!confirmed) return;

    try {
      await api.delete(`/users/${userId}`);

      fetchData();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Manage system users and permissions"
        buttonText={isAdmin ? "Add User" : null}
        onButtonClick={() => setShowModal(true)}
      />

      {loading ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--clay-muted)",
          }}
        >
          Loading users...
        </div>
      ) : (
        <TableCard>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1.5px solid var(--clay-hairline)",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--clay-muted)",
                margin: "0 0 2px 0",
              }}
            >
              Directory
            </p>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--clay-ink)",
                margin: 0,
                letterSpacing: "-0.2px",
              }}
            >
              System Users
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="clay-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Assigned Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 500, color: "var(--clay-ink)" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "var(--clay-lavender)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "var(--clay-ink)",
                            flexShrink: 0,
                          }}
                        >
                          {u.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "var(--r-xs)",
                          background: "var(--clay-surface-soft)",
                          color: "var(--clay-muted)",
                        }}
                      >
                        {u.role?.name || "No Role"}
                      </span>
                    </td>
                    <td style={{ color: "var(--clay-muted)" }}>
                      {u.role?.name === "Super Admin"
                        ? "All (System)"
                        : u.warehouse
                          ? `${u.warehouse.name} (${u.warehouse.code})`
                          : "Unassigned"}
                    </td>
                    <td>
                      <StatusBadge
                        status={u.status === "ACTIVE" ? "Active" : "Inactive"}
                      />
                    </td>
                    <td>
                      <div style={{ position: "relative" }}>
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === u._id ? null : u._id)}
                          className="clay-btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                        >
                          Actions <FaChevronDown size={10} />
                        </button>
                        {activeMenuId === u._id && (
                          <>
                            <div
                              onClick={() => setActiveMenuId(null)}
                              style={{ position: "fixed", inset: 0, zIndex: 90 }}
                            />
                            <div style={{
                              position: "absolute",
                              right: 0,
                              top: "100%",
                              marginTop: "4px",
                              background: "var(--clay-canvas)",
                              borderRadius: "8px",
                              border: "1.5px solid var(--clay-hairline)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              zIndex: 100,
                              minWidth: "140px",
                              display: "flex",
                              flexDirection: "column",
                              padding: "4px",
                            }}>
                              {canEdit(u) && (
                                <button
                                  onClick={() => {
                                    openEditModal(u);
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
                                  Edit Profile
                                </button>
                              )}
                              {canToggleStatus(u) && (
                                <button
                                  onClick={() => {
                                    handleToggleStatus(u._id);
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
                                  {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                                </button>
                              )}
                              {canDelete(u) && (
                                <button
                                  onClick={() => {
                                    handleDeleteUser(u._id);
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
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableCard>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(10, 10, 10, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="p-6 sm:p-8 w-full max-w-[520px] bg-[var(--clay-canvas)] rounded-[var(--r-xl)] border-[1.5px] border-clay-hairline mx-4"
          >
            <h3
              style={{
                fontSize: "24px",
                fontWeight: 600,
                letterSpacing: "-0.5px",
                margin: "0 0 8px 0",
              }}
            >
              Add User
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--clay-muted)",
                margin: "0 0 24px 0",
              }}
            >
              Create a new user account with role-based access.
            </p>

            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1.5px solid var(--clay-error)",
                  color: "var(--clay-error)",
                  borderRadius: "var(--r-md)",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--clay-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="clay-input"
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--clay-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@libya.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="clay-input"
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--clay-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="clay-input"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--clay-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="clay-select"
                  >
                    {roles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: requiresWarehouse
                        ? "var(--clay-muted)"
                        : "var(--clay-muted-soft)",
                      textTransform: "uppercase",
                    }}
                  >
                    Assigned Warehouse
                  </label>
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="clay-select"
                    disabled={!requiresWarehouse}
                    style={{ opacity: requiresWarehouse ? 1 : 0.5 }}
                  >
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
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
                  {submitting ? "Adding..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="p-6 sm:p-8 w-full max-w-[520px] bg-[var(--clay-canvas)] rounded-[var(--r-xl)] border-[1.5px] border-clay-hairline mx-4"
          >
            <h3
              style={{
                marginBottom: "20px",
              }}
            >
              Edit User
            </h3>

            <form
              onSubmit={handleUpdateUser}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <input
                className="clay-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Name"
              />

              <input
                className="clay-input"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Email"
              />

              <input
                className="clay-input"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Phone"
              />

              <select
                className="clay-select"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <select
                className="clay-select"
                value={editWarehouse}
                onChange={(e) => setEditWarehouse(e.target.value)}
                disabled={!editRequiresWarehouse}
                style={{ opacity: editRequiresWarehouse ? 1 : 0.5 }}
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "12px",
                }}
              >
                <button
                  type="button"
                  className="clay-btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="clay-btn-primary"
                  style={{ flex: 1 }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
