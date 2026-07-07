const STATUS_CONFIG = {
  // Database uppercase status keys
  BOOKED: { dot: "var(--clay-lavender)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Booked" },
  STORED: { dot: "var(--clay-mint)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Stored" },
  READY_FOR_DISPATCH: { dot: "var(--clay-peach)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Ready Dispatch" },
  DISPATCHED: { dot: "var(--clay-ochre)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Dispatched" },
  IN_TRANSIT: { dot: "var(--clay-pink)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "In Transit" },
  RECEIVED: { dot: "var(--clay-teal)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Received" },
  READY_FOR_PICKUP: { dot: "var(--clay-coral)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Ready Pickup" },
  COMPLETED: { dot: "#22c55e", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Completed" },
  
  // Mixed case fallback keys
  Booked: { dot: "var(--clay-lavender)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Booked" },
  Stored: { dot: "var(--clay-mint)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Stored" },
  "Ready Dispatch": { dot: "var(--clay-peach)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Ready Dispatch" },
  Dispatched: { dot: "var(--clay-ochre)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Dispatched" },
  "In Transit": { dot: "var(--clay-pink)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "In Transit" },
  Received: { dot: "var(--clay-teal)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Received" },
  "Ready Pickup": { dot: "var(--clay-coral)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Ready Pickup" },
  Completed: { dot: "#22c55e", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Completed" },
  
  // Account Status
  Active: { dot: "#22c55e", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Active" },
  ACTIVE: { dot: "#22c55e", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Active" },
  INACTIVE: { dot: "var(--clay-error)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Inactive" },
  Inactive: { dot: "var(--clay-error)", bg: "var(--clay-surface-card)", text: "var(--clay-ink)", label: "Inactive" }
};

const DEFAULT_CONFIG = {
  dot: "var(--clay-muted-soft)",
  bg: "var(--clay-surface-card)",
  text: "var(--clay-ink)",
  label: "Unknown"
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { ...DEFAULT_CONFIG, label: status };

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "7px",
      padding: "5px 12px",
      background: cfg.bg,
      color: cfg.text,
      fontSize: "13px",
      fontWeight: 500,
      borderRadius: "9999px",
      whiteSpace: "nowrap",
      border: "1px solid var(--clay-hairline)",
    }}>
      <span style={{
        width: "7px", height: "7px",
        borderRadius: "50%",
        background: cfg.dot,
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
}