import { useEffect } from "react";
import useShipmentStore from "../store/useShipmentStore";

const ACTIVITY_COLORS = [
  "var(--clay-pink)",
  "var(--clay-teal)",
  "var(--clay-ochre)",
  "var(--clay-lavender)",
  "var(--clay-peach)",
  "var(--clay-mint)",
];

export default function ActivityFeed() {
  const { activities, fetchShipments } = useShipmentStore();

  useEffect(() => {
    fetchShipments();
  }, []);

  return (
    <div
      style={{
        background: "var(--clay-surface-card)",
        borderRadius: "var(--r-lg)",
        padding: "24px",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--clay-ink)",
            margin: 0,
            letterSpacing: "-0.2px",
          }}
        >
          Recent Activity
        </h2>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "var(--clay-muted)",
          }}
        >
          Live
        </span>
      </div>

      {/* Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {activities.slice(0, 8).map((item, index) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: "14px",
              paddingBottom: "16px",
              marginBottom: "16px",
              borderBottom:
                index < Math.min(activities.length, 8) - 1
                  ? "1px solid var(--clay-hairline)"
                  : "none",
            }}
          >
            {/* Colored dot */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: ACTIVITY_COLORS[index % ACTIVITY_COLORS.length],
                  marginTop: "4px",
                }}
              />
              {index < Math.min(activities.length, 8) - 1 && (
                <div
                  style={{
                    width: "1.5px",
                    flex: 1,
                    background: "var(--clay-hairline)",
                    marginTop: "6px",
                    minHeight: "24px",
                  }}
                />
              )}
            </div>

            {/* Text */}
            <p
              style={{
                fontSize: "14px",
                fontWeight: 400,
                color: "var(--clay-body)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
