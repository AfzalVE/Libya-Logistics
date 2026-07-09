import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaWarehouse,
  FaClock
} from "react-icons/fa";

// Clay 6-color saturated feature card palette — cycle in order, no adjacent repeats
const CARD_VARIANTS = [
  {
    bg:      "var(--clay-pink)",
    fg:      "#ffffff",
    iconBg:  "rgba(255,255,255,0.2)",
    iconFg:  "#ffffff",
  },
  {
    bg:      "var(--clay-teal)",
    fg:      "#ffffff",
    iconBg:  "rgba(255,255,255,0.15)",
    iconFg:  "#ffffff",
  },
  {
    bg:      "var(--clay-lavender)",
    fg:      "var(--clay-ink)",
    iconBg:  "rgba(0,0,0,0.08)",
    iconFg:  "var(--clay-ink)",
  },
  {
    bg:      "var(--clay-peach)",
    fg:      "var(--clay-ink)",
    iconBg:  "rgba(0,0,0,0.08)",
    iconFg:  "var(--clay-ink)",
  },
  {
    bg:      "var(--clay-ochre)",
    fg:      "var(--clay-ink)",
    iconBg:  "rgba(0,0,0,0.1)",
    iconFg:  "var(--clay-ink)",
  },
];

const iconMap = {
  shipments: <FaBox size={20} />,
  transit:   <FaTruck size={20} />,
  completed: <FaCheckCircle size={20} />,
  warehouse: <FaWarehouse size={20} />,
  pending:   <FaClock size={20} />,
};

let cardCounter = 0;

export default function StatCard({
  title,
  value,
  change,
  icon,
  variantIndex,
}) {
  // Allow explicit variantIndex override, otherwise auto-increment
  const idx = variantIndex !== undefined
    ? variantIndex % CARD_VARIANTS.length
    : (cardCounter++) % CARD_VARIANTS.length;

  const v = CARD_VARIANTS[idx];

  return (
    <div
      className="clay-animate-fade-up clay-stat-card"
      style={{
        background:    v.bg,
        borderRadius:  "var(--r-xl)",
        padding:       "28px",
        display:       "flex",
        flexDirection: "column",
        gap:           "16px",
        position:      "relative",
        overflow:      "hidden",
        // Decorative circle for depth
      }}
    >
      {/* Decorative blob */}
      <div style={{
        position: "absolute",
        right: "-20px", bottom: "-20px",
        width: "100px", height: "100px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.07)",
        pointerEvents: "none",
      }} />

      {/* Top row: icon + change pill */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>

        <div style={{
          width: "44px", height: "44px",
          borderRadius: "12px",
          background: v.iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: v.iconFg,
        }}>
          {iconMap[icon]}
        </div>

        <span style={{
          fontSize: "12px", fontWeight: 600,
          letterSpacing: "0.2px",
          color: v.fg,
          opacity: 0.8,
          background: "rgba(255,255,255,0.15)",
          padding: "3px 10px",
          borderRadius: "999px",
        }}>
          ↑ {change}
        </span>

      </div>

      {/* Value */}
      <div>
        <h2 style={{
          fontSize: "36px", fontWeight: 600,
          letterSpacing: "-1.5px", lineHeight: 1,
          color: v.fg, margin: 0,
        }}>
          {value}
        </h2>
        <p style={{
          fontSize: "13px", fontWeight: 500,
          color: v.fg, opacity: 0.7,
          marginTop: "6px", margin: "6px 0 0 0",
        }}>
          {title}
        </p>
      </div>

    </div>
  );
}