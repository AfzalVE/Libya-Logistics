import useToastStore from "../store/useToastStore";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "360px",
        width: "100%",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        const bg = isSuccess
          ? "rgba(34, 197, 94, 0.08)"
          : isError
          ? "rgba(239, 68, 68, 0.08)"
          : "rgba(10, 10, 10, 0.04)";

        const border = isSuccess
          ? "1.5px solid var(--clay-success, #22c55e)"
          : isError
          ? "1.5px solid var(--clay-error, #ef4444)"
          : "1.5px solid var(--clay-hairline)";

        const color = isSuccess
          ? "var(--clay-success, #22c55e)"
          : isError
          ? "var(--clay-error, #ef4444)"
          : "var(--clay-ink)";

        return (
          <div
            key={toast.id}
            className="clay-toast"
            style={{
              pointerEvents: "auto",
              background: "var(--clay-canvas)",
              borderRadius: "var(--r-md)",
              border: border,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              boxShadow: "0 10px 30px rgba(10,10,10,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: color, display: "flex", alignItems: "center", fontSize: "16px" }}>
                {isSuccess && <FaCheckCircle />}
                {isError && <FaExclamationCircle />}
                {!isSuccess && !isError && <FaInfoCircle />}
              </span>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--clay-ink)",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "none",
                border: "none",
                color: "var(--clay-muted)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                borderRadius: "4px",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--clay-surface-soft)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <FaTimes size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
