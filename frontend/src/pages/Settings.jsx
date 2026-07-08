import { useState } from "react";
import PageHeader from "../components/PageHeader";
import useAuthStore from "../store/useAuthStore";
import api from "../services/api";

export default function Settings() {
  const { user, updateUserProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form States
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    setProfileSubmitting(true);

    try {
      const response = await api.put(`/settings/${user._id}/profile`, {
        name,
        email,
        phone,
      });

      if (response.data.success) {
        setProfileSuccess(response.data.message || "Profile updated successfully");
        // Update Zustand store and localStorage
        updateUserProfile(response.data.user);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setPasswordSubmitting(true);

    try {
      const response = await api.put(`/settings/${user._id}/password`, {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        setPasswordSuccess(response.data.message || "Password updated successfully");
        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your personal account profile and security settings"
      />

      <div className="flex flex-col lg:flex-row gap-8 max-w-[960px]">
        {/* Navigation Sidebar / Tabs */}
        <div className="w-full lg:w-[240px] flex flex-row lg:flex-col gap-2 border-b lg:border-b-0 lg:border-r border-clay-hairline pb-4 lg:pb-0 lg:pr-4 flex-shrink-0">
          <button
            onClick={() => setActiveTab("profile")}
            className="flex-1 lg:flex-none text-left p-3 rounded-lg font-medium text-sm transition-all"
            style={{
              background: activeTab === "profile" ? "var(--clay-surface-soft)" : "none",
              color: activeTab === "profile" ? "var(--clay-ink)" : "var(--clay-muted)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className="flex-1 lg:flex-none text-left p-3 rounded-lg font-medium text-sm transition-all"
            style={{
              background: activeTab === "security" ? "var(--clay-surface-soft)" : "none",
              color: activeTab === "security" ? "var(--clay-ink)" : "var(--clay-muted)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Security & Password
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div
              style={{
                background: "var(--clay-canvas)",
                borderRadius: "var(--r-lg)",
                border: "1.5px solid var(--clay-hairline)",
                padding: "32px",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--clay-ink)", margin: "0 0 4px 0" }}>
                Profile Information
              </h3>
              <p style={{ fontSize: "13px", color: "var(--clay-muted)", margin: "0 0 24px 0" }}>
                Update your account's profile details.
              </p>

              {profileSuccess && (
                <div style={{
                  background: "rgba(16, 185, 129, 0.08)", border: "1.5px solid var(--clay-mint)",
                  color: "var(--clay-mint)", borderRadius: "var(--r-md)", padding: "10px 14px",
                  marginBottom: "20px", fontSize: "13px", fontWeight: 500
                }}>
                  {profileSuccess}
                </div>
              )}

              {profileError && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.08)", border: "1.5px solid var(--clay-error)",
                  color: "var(--clay-error)", borderRadius: "var(--r-md)", padding: "10px 14px",
                  marginBottom: "20px", fontSize: "13px", fontWeight: 500
                }}>
                  {profileError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="clay-input"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="clay-input"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="clay-input"
                    placeholder="e.g. +218 91 123 4567"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-clay-hairline">
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--clay-muted-soft)", textTransform: "uppercase" }}>
                      Role
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user?.role?.name || "No Role"}
                      className="clay-input"
                      style={{ opacity: 0.6, cursor: "not-allowed" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--clay-muted-soft)", textTransform: "uppercase" }}>
                      Assigned Location
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user?.warehouse ? `${user.warehouse.name} (${user.warehouse.code})` : "All (System)"}
                      className="clay-input"
                      style={{ opacity: 0.6, cursor: "not-allowed" }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    className="clay-btn-primary"
                    disabled={profileSubmitting}
                    style={{ minWidth: "150px" }}
                  >
                    {profileSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div
              style={{
                background: "var(--clay-canvas)",
                borderRadius: "var(--r-lg)",
                border: "1.5px solid var(--clay-hairline)",
                padding: "32px",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--clay-ink)", margin: "0 0 4px 0" }}>
                Security & Password
              </h3>
              <p style={{ fontSize: "13px", color: "var(--clay-muted)", margin: "0 0 24px 0" }}>
                Ensure your account is using a secure password.
              </p>

              {passwordSuccess && (
                <div style={{
                  background: "rgba(16, 185, 129, 0.08)", border: "1.5px solid var(--clay-mint)",
                  color: "var(--clay-mint)", borderRadius: "var(--r-md)", padding: "10px 14px",
                  marginBottom: "20px", fontSize: "13px", fontWeight: 500
                }}>
                  {passwordSuccess}
                </div>
              )}

              {passwordError && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.08)", border: "1.5px solid var(--clay-error)",
                  color: "var(--clay-error)", borderRadius: "var(--r-md)", padding: "10px 14px",
                  marginBottom: "20px", fontSize: "13px", fontWeight: 500
                }}>
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="clay-input"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="clay-input"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--clay-muted)", textTransform: "uppercase" }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="clay-input"
                  />
                </div>

                <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    className="clay-btn-primary"
                    disabled={passwordSubmitting}
                    style={{ minWidth: "150px" }}
                  >
                    {passwordSubmitting ? "Update Password" : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "var(--clay-canvas)",
        border: "1px solid var(--clay-hairline)",
        borderRadius: "var(--r-lg)",
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "var(--clay-muted)",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
          marginTop: "6px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div
      style={{
        background: "var(--clay-canvas)",
        border: "1px solid var(--clay-hairline)",
        borderRadius: "var(--r-lg)",
        padding: "24px",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "20px",
        }}
      >
        {title}
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "13px",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        className="clay-input"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
