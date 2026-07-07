export default function PageHeader({
  title,
  subtitle,
  buttonText,
  onButtonClick,
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: "32px",
    }}>

      <div>
        {/* Section label */}
        <p style={{
          fontSize: "12px", fontWeight: 600,
          letterSpacing: "1.2px", textTransform: "uppercase",
          color: "var(--clay-muted)", margin: "0 0 8px 0",
        }}>
          Libya Logistics
        </p>

        {/* Display heading */}
        <h1 style={{
          fontSize: "40px", fontWeight: 500,
          lineHeight: 1.1, letterSpacing: "-1px",
          color: "var(--clay-ink)",
          margin: 0,
        }}>
          {title}
        </h1>

        {subtitle && (
          <p style={{
            fontSize: "16px", fontWeight: 400,
            color: "var(--clay-muted)", marginTop: "6px",
            lineHeight: 1.5, margin: "6px 0 0 0",
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {buttonText && (
        <button
          className="clay-btn-primary"
          onClick={onButtonClick}
          style={{ marginLeft: "24px" }}
        >
          {buttonText}
        </button>
      )}

    </div>
  );
}