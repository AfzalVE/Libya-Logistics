import PageHeader from "../components/PageHeader";

export default function Reports() {
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Generate and export operational reports"
      />

      {/* Filter card */}
      <div style={{
        background: "var(--clay-canvas)",
        borderRadius: "var(--r-lg)",
        border: "1.5px solid var(--clay-hairline)",
        padding: "32px",
        marginBottom: "24px",
      }}>
        <p style={{
          fontSize: "12px", fontWeight: 600, letterSpacing: "1.2px",
          textTransform: "uppercase", color: "var(--clay-muted)",
          margin: "0 0 20px 0",
        }}>
          Filter Options
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--clay-muted)", marginBottom: "6px" }}>
              Date Range
            </label>
            <input
              type="text"
              placeholder="e.g. Jul 2026"
              className="clay-input"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--clay-muted)", marginBottom: "6px" }}>
              Warehouse
            </label>
            <select className="clay-select" style={{ width: "100%" }}>
              <option>All Warehouses</option>
              <option>Tripoli</option>
              <option>Misrata</option>
              <option>Benghazi</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--clay-muted)", marginBottom: "6px" }}>
              Status
            </label>
            <select className="clay-select" style={{ width: "100%" }}>
              <option>All Statuses</option>
              <option>Completed</option>
              <option>In Transit</option>
              <option>Ready Pickup</option>
            </select>
          </div>
        </div>
      </div>

      {/* Export card */}
      <div style={{
        background: "var(--clay-surface-soft)",
        borderRadius: "var(--r-xl)",
        border: "1.5px solid var(--clay-hairline)",
        padding: "36px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative blob */}
        <div style={{
          position: "absolute", right: "60px", top: "-30px",
          width: "160px", height: "160px", borderRadius: "50%",
          background: "var(--clay-peach)", opacity: 0.2, pointerEvents: "none",
        }} />

        <div>
          <p style={{
            fontSize: "12px", fontWeight: 600, letterSpacing: "1.2px",
            textTransform: "uppercase", color: "var(--clay-muted)", margin: "0 0 8px 0",
          }}>
            Export
          </p>
          <h2 style={{
            fontSize: "32px", fontWeight: 500, letterSpacing: "-0.8px",
            color: "var(--clay-ink)", margin: "0 0 6px 0",
          }}>
            Generate Your Report
          </h2>
          <p style={{ fontSize: "16px", color: "var(--clay-muted)", margin: 0 }}>
            Download as PDF or export to Excel spreadsheet.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
          <button className="clay-btn-primary">
            Generate PDF
          </button>
          <button className="clay-btn-secondary">
            Export Excel
          </button>
        </div>
      </div>
    </>
  );
}