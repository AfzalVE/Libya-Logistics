export default function TableCard({ children }) {
  return (
    <div style={{
      background: "var(--clay-canvas)",
      borderRadius: "var(--r-lg)",
      border: "1.5px solid var(--clay-hairline)",
      overflow: "hidden",
    }}>
      {children}
    </div>
  );
}