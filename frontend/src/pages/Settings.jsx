import PageHeader from "../components/PageHeader";

const FIELD_GROUPS = [
  {
    label: "Company Name",
    key:   "company",
    value: "Libya Logistics",
    type:  "text",
  },
  {
    label: "Phone Number",
    key:   "phone",
    value: "+218900000000",
    type:  "tel",
  },
  {
    label: "Admin Email",
    key:   "email",
    value: "admin@libya.com",
    type:  "email",
  },
  {
    label: "Shipment Prefix",
    key:   "prefix",
    value: "LIB",
    type:  "text",
  },
];

export default function Settings() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="System configuration and preferences"
      />

      <div style={{ maxWidth: "680px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Settings form card */}
        <div style={{
          background: "var(--clay-canvas)",
          borderRadius: "var(--r-lg)",
          border: "1.5px solid var(--clay-hairline)",
          padding: "32px",
        }}>
          <p style={{
            fontSize: "12px", fontWeight: 600, letterSpacing: "1.2px",
            textTransform: "uppercase", color: "var(--clay-muted)",
            margin: "0 0 24px 0",
          }}>
            General Settings
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {FIELD_GROUPS.map(({ label, key, value, type }) => (
              <div key={key}>
                <label style={{
                  display: "block",
                  fontSize: "13px", fontWeight: 600,
                  color: "var(--clay-ink)",
                  marginBottom: "8px",
                  letterSpacing: "0.1px",
                }}>
                  {label}
                </label>
                <input
                  type={type}
                  defaultValue={value}
                  className="clay-input"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action band */}
        <div style={{
          background: "var(--clay-surface-soft)",
          borderRadius: "var(--r-lg)",
          border: "1.5px solid var(--clay-hairline)",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--clay-ink)", margin: "0 0 2px 0" }}>
              Save Changes
            </p>
            <p style={{ fontSize: "13px", color: "var(--clay-muted)", margin: 0 }}>
              Changes will be applied immediately.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="clay-btn-secondary">
              Discard
            </button>
            <button className="clay-btn-primary">
              Save Settings
            </button>
          </div>
        </div>

      </div>
    </>
  );
}