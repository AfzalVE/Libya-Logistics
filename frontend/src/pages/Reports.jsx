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
  }, []);

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

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Generate and export operational reports"
      />

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
