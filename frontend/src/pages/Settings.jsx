import { useEffect, useState } from "react";

import PageHeader from "../components/PageHeader";
import api from "../services/api";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState({
    users: 0,
    warehouses: 0,
    shipments: 0,
    activeUsers: 0,
  });

  const [form, setForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    shipmentPrefix: "",
    currency: "",
    timezone: "",

    security: {
      passwordMinLength: 8,
      maxLoginAttempts: 5,
      sessionTimeoutMinutes: 60,
    },

    shipment: {
      autoGenerateTracking: true,
      defaultStatus: "RECEIVED",
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [settingsRes, statsRes] = await Promise.all([
        api.get("/api/settings"),
        api.get("/api/settings/stats"),
      ]);

      setForm(settingsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      await api.put("/api/settings", form);

      alert("Settings saved successfully");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="System configuration and preferences"
      />

      {/* Stats */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <StatCard title="Users" value={stats.users} />

        <StatCard title="Active Users" value={stats.activeUsers} />

        <StatCard title="Warehouses" value={stats.warehouses} />

        <StatCard title="Shipments" value={stats.shipments} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxWidth: "900px",
        }}
      >
        {/* Company */}

        <SectionCard title="Company Settings">
          <Input
            label="Company Name"
            value={form.companyName || ""}
            onChange={(value) =>
              setForm({
                ...form,
                companyName: value,
              })
            }
          />

          <Input
            label="Email"
            value={form.email || ""}
            onChange={(value) =>
              setForm({
                ...form,
                email: value,
              })
            }
          />

          <Input
            label="Phone"
            value={form.phone || ""}
            onChange={(value) =>
              setForm({
                ...form,
                phone: value,
              })
            }
          />

          <Input
            label="Address"
            value={form.address || ""}
            onChange={(value) =>
              setForm({
                ...form,
                address: value,
              })
            }
          />

          <Input
            label="Currency"
            value={form.currency || ""}
            onChange={(value) =>
              setForm({
                ...form,
                currency: value,
              })
            }
          />

          <Input
            label="Timezone"
            value={form.timezone || ""}
            onChange={(value) =>
              setForm({
                ...form,
                timezone: value,
              })
            }
          />
        </SectionCard>

        {/* Shipment */}

        <SectionCard title="Shipment Settings">
          <Input
            label="Shipment Prefix"
            value={form.shipmentPrefix || ""}
            onChange={(value) =>
              setForm({
                ...form,
                shipmentPrefix: value,
              })
            }
          />

          <Input
            label="Default Status"
            value={form.shipment?.defaultStatus || ""}
            onChange={(value) =>
              setForm({
                ...form,
                shipment: {
                  ...form.shipment,
                  defaultStatus: value,
                },
              })
            }
          />

          <label>
            <input
              type="checkbox"
              checked={form.shipment?.autoGenerateTracking}
              onChange={(e) =>
                setForm({
                  ...form,
                  shipment: {
                    ...form.shipment,
                    autoGenerateTracking: e.target.checked,
                  },
                })
              }
            />{" "}
            Auto Generate Tracking
          </label>
        </SectionCard>

        {/* Security */}

        <SectionCard title="Security Settings">
          <Input
            type="number"
            label="Password Minimum Length"
            value={form.security?.passwordMinLength}
            onChange={(value) =>
              setForm({
                ...form,
                security: {
                  ...form.security,
                  passwordMinLength: Number(value),
                },
              })
            }
          />

          <Input
            type="number"
            label="Maximum Login Attempts"
            value={form.security?.maxLoginAttempts}
            onChange={(value) =>
              setForm({
                ...form,
                security: {
                  ...form.security,
                  maxLoginAttempts: Number(value),
                },
              })
            }
          />

          <Input
            type="number"
            label="Session Timeout (Minutes)"
            value={form.security?.sessionTimeoutMinutes}
            onChange={(value) =>
              setForm({
                ...form,
                security: {
                  ...form.security,
                  sessionTimeoutMinutes: Number(value),
                },
              })
            }
          />
        </SectionCard>

        {/* Save */}

        <div>
          <button
            className="clay-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
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
