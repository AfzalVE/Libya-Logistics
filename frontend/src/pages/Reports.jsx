import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import api from "../services/api";

export default function Reports() {
  const [report, setReport] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    warehouse: "",
    status: "",
  });

  const fetchWarehouses = async () => {
    try {
      const res = await api.get("/warehouses");
      setWarehouses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.warehouse) params.append("warehouse", filters.warehouse);
      if (filters.status) params.append("status", filters.status);

      const res = await api.get(`/reports?${params.toString()}`);

      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handlePdfDownload = () => {
    const params = new URLSearchParams();

    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);
    if (filters.warehouse) params.append("warehouse", filters.warehouse);
    if (filters.status) params.append("status", filters.status);

    window.open(
      `${import.meta.env.VITE_API_URL}/reports/pdf?${params.toString()}`,
      "_blank",
    );
  };

  const handleExcelDownload = () => {
    const params = new URLSearchParams();

    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);
    if (filters.warehouse) params.append("warehouse", filters.warehouse);
    if (filters.status) params.append("status", filters.status);

    window.open(
      `${import.meta.env.VITE_API_URL}/reports/excel?${params.toString()}`,
      "_blank",
    );
  };

  const applyPreset = (type) => {
    const today = new Date();

    let from = "";
    let to = "";

    if (type === "today") {
      from = today.toISOString().split("T")[0];
      to = from;
    }

    if (type === "7days") {
      const start = new Date();
      start.setDate(today.getDate() - 7);

      from = start.toISOString().split("T")[0];
      to = today.toISOString().split("T")[0];
    }

    if (type === "30days") {
      const start = new Date();
      start.setDate(today.getDate() - 30);

      from = start.toISOString().split("T")[0];
      to = today.toISOString().split("T")[0];
    }

    if (type === "month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);

      from = start.toISOString().split("T")[0];
      to = today.toISOString().split("T")[0];
    }

    setFilters((prev) => ({
      ...prev,
      from,
      to,
    }));
  };

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Generate and export operational reports"
      />

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          className="clay-btn-secondary"
          onClick={() => applyPreset("today")}
        >
          Today
        </button>

        <button
          className="clay-btn-secondary"
          onClick={() => applyPreset("7days")}
        >
          Last 7 Days
        </button>

        <button
          className="clay-btn-secondary"
          onClick={() => applyPreset("30days")}
        >
          Last 30 Days
        </button>

        <button
          className="clay-btn-secondary"
          onClick={() => applyPreset("month")}
        >
          This Month
        </button>
      </div>

      {/* FILTERS */}

      <div
        style={{
          background: "var(--clay-canvas)",
          borderRadius: "var(--r-lg)",
          border: "1.5px solid var(--clay-hairline)",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
            gap: "16px",
          }}
        >
          <input
            type="date"
            className="clay-input"
            value={filters.from}
            onChange={(e) =>
              setFilters({
                ...filters,
                from: e.target.value,
              })
            }
          />

          <input
            type="date"
            className="clay-input"
            value={filters.to}
            onChange={(e) =>
              setFilters({
                ...filters,
                to: e.target.value,
              })
            }
          />

          <select
            className="clay-select"
            value={filters.warehouse}
            onChange={(e) =>
              setFilters({
                ...filters,
                warehouse: e.target.value,
              })
            }
          >
            <option value="">All Warehouses</option>

            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>

          <select
            className="clay-select"
            value={filters.status}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value,
              })
            }
          >
            <option value="">All Statuses</option>

            <option value="BOOKED">BOOKED</option>

            <option value="STORED">STORED</option>

            <option value="READY_FOR_DISPATCH">READY_FOR_DISPATCH</option>

            <option value="DISPATCHED">DISPATCHED</option>

            <option value="IN_TRANSIT">IN_TRANSIT</option>

            <option value="RECEIVED">RECEIVED</option>

            <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>

            <option value="COMPLETED">COMPLETED</option>

            <option value="CANCELLED">CANCELLED</option>
          </select>

          <button onClick={handleApplyFilters} className="clay-btn-primary">
            Apply
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      {report?.summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {[
            {
              title: "Shipments",
              value: report.summary.totalShipments,
            },
            {
              title: "Weight (kg)",
              value: report.summary.totalWeight,
            },
            {
              title: "Value (LYD)",
              value: report.summary.totalValue,
            },
            {
              title: "Completed",
              value: report.summary.completed,
            },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                background: "var(--clay-canvas)",
                border: "1.5px solid var(--clay-hairline)",
                borderRadius: "var(--r-lg)",
                padding: "24px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "var(--clay-muted)",
                  fontSize: "12px",
                }}
              >
                {card.title}
              </p>

              <h2
                style={{
                  marginTop: "8px",
                }}
              >
                {card.value}
              </h2>
            </div>
          ))}
        </div>
      )}

      {report?.shipments?.length > 0 && (
        <div
          style={{
            background: "var(--clay-canvas)",
            border: "1.5px solid var(--clay-hairline)",
            borderRadius: "var(--r-lg)",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "20px",
            }}
          >
            Status Breakdown
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
              gap: "12px",
            }}
          >
            {[
              "BOOKED",
              "STORED",
              "READY_FOR_DISPATCH",
              "DISPATCHED",
              "IN_TRANSIT",
              "RECEIVED",
              "READY_FOR_PICKUP",
              "COMPLETED",
              "CANCELLED",
            ].map((status) => {
              const count = report.shipments.filter(
                (s) => s.currentStatus === status,
              ).length;

              return (
                <div
                  key={status}
                  style={{
                    padding: "16px",
                    border: "1px solid var(--clay-hairline)",
                    borderRadius: "var(--r-md)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--clay-muted)",
                    }}
                  >
                    {status}
                  </div>

                  <div
                    style={{
                      fontSize: "26px",
                      fontWeight: 600,
                    }}
                  >
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EXPORT */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <button onClick={handlePdfDownload} className="clay-btn-primary">
          Generate PDF
        </button>

        <button onClick={handleExcelDownload} className="clay-btn-secondary">
          Export Excel
        </button>
      </div>

      {/* TABLE */}

      <div
        style={{
          background: "var(--clay-canvas)",
          borderRadius: "var(--r-lg)",
          border: "1.5px solid var(--clay-hairline)",
          overflow: "hidden",
        }}
      >
        <table className="clay-table">
          <thead>
            <tr>
              <th>Shipment</th>
              <th>Date</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Weight</th>
              <th>Value</th>
            </tr>
          </thead>

          <tbody>
            {report?.shipments?.map((shipment) => (
              <tr key={shipment._id}>
                <td>{shipment.shipmentNumber}</td>

                <td>{new Date(shipment.bookingDate).toLocaleDateString()}</td>

                <td>{shipment.originWarehouse?.name}</td>

                <td>{shipment.destinationWarehouse?.name}</td>

                <td>{shipment.currentStatus}</td>

                <td>{shipment.weight}</td>

                <td>{shipment.declaredValue}</td>
              </tr>
            ))}

            {report?.shipments?.length > 0 && (
              <tr
                style={{
                  background: "var(--clay-surface-soft)",
                  fontWeight: 600,
                }}
              >
                <td colSpan="4">Totals</td>

                <td>{report.summary.totalShipments} shipments</td>

                <td>{report.summary.totalWeight} kg</td>

                <td>{report.summary.totalValue} LYD</td>
              </tr>
            )}

            {report?.shipments?.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                  }}
                >
                  No shipments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && (
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          Loading...
        </div>
      )}
    </>
  );
}
