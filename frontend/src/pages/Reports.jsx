import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import api from "../services/api";

export default function Reports() {
  const [report, setReport] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    warehouse: "",
    status: "",
    search: "",
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
      if (filters.search) params.append("search", filters.search);

      params.append("page", page);
      params.append("limit", limit);
      const res = await api.get(`/reports?${params.toString()}`);
      // console.log(res.data)

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
  }, [filters, page]);

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleClearFilters = () => {
    setPage(1);
    setSearchTerm("");
    setFilters({
      from: "",
      to: "",
      warehouse: "",
      status: "",
      search: "",
    });
  };

  const handlePdfDownload = async () => {
    try {
      const params = new URLSearchParams();

      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.warehouse) params.append("warehouse", filters.warehouse);
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);

      const response = await api.get(`/reports/pdf?${params.toString()}`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(response.data);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Failed to download PDF report:", err);
    }
  };

  const handleExcelDownload = async () => {
    try {
      const params = new URLSearchParams();

      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.warehouse) params.append("warehouse", filters.warehouse);
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);

      const response = await api.get(`/reports/excel?${params.toString()}`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "shipment-report.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Failed to download Excel report:", err);
    }
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
          flexWrap: "wrap",
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
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Search reports by shipment number, barcode, recipient/sender name or phone..."
            className="clay-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            onClick={() => {
              setPage(1);
              setFilters(prev => ({ ...prev, search: searchTerm }));
            }}
            className="clay-btn-primary"
            style={{ height: "42px", padding: "0 24px" }}
          >
            Search
          </button>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4"
        >
          <input
            type="date"
            className="clay-input"
            value={filters.from}
            onChange={(e) => {
              setPage(1);
              setFilters({
                ...filters,
                from: e.target.value,
              })
            }}
          />

          <input
            type="date"
            className="clay-input"
            value={filters.to}
            onChange={(e) => {
              setPage(1);
              setFilters({
                ...filters,
                to: e.target.value,
              })
            }}
          />

          <select
            className="clay-select"
            value={filters.warehouse}
            onChange={(e) => {
              setPage(1);
              setFilters({
                ...filters,
                warehouse: e.target.value,
              })
            }}
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
            onChange={(e) => {
              setPage(1);
              setFilters({
                ...filters,
                status: e.target.value,
              })
            }}
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
          <button
            onClick={handleClearFilters}
            className="clay-btn-secondary"
          >
            Clear
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      {report?.summary && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
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
          ].map((card, idx) => {
            const variants = [
              { bg: "var(--clay-pink)", fg: "#ffffff", muted: "rgba(255,255,255,0.75)" },
              { bg: "var(--clay-teal)", fg: "#ffffff", muted: "rgba(255,255,255,0.75)" },
              { bg: "var(--clay-lavender)", fg: "var(--clay-ink)", muted: "rgba(10,10,10,0.6)" },
              { bg: "var(--clay-peach)", fg: "var(--clay-ink)", muted: "rgba(10,10,10,0.6)" },
            ];
            const v = variants[idx % variants.length];
            return (
              <div
                key={card.title}
                className="clay-animate-fade-up"
                style={{
                  background: v.bg,
                  color: v.fg,
                  borderRadius: "var(--r-xl)",
                  padding: "24px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute",
                  right: "-15px", bottom: "-15px",
                  width: "80px", height: "80px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  pointerEvents: "none"
                }} />
                <p
                  style={{
                    margin: 0,
                    color: v.muted,
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1px"
                  }}
                >
                  {card.title}
                </p>

                <h2
                  style={{
                    marginTop: "8px",
                    marginBottom: 0,
                    fontSize: "30px",
                    fontWeight: 600,
                    letterSpacing: "-1px"
                  }}
                >
                  {card.value}
                </h2>
              </div>
            );
          })}
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
        className="flex flex-col sm:flex-row gap-3 sm:justify-between mb-6"
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
        <div className="overflow-x-auto">
          <table className="clay-table">
            <thead>
              <tr>
                <th>Shipment</th>
                <th>Date</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Product Description</th>
                <th>Status</th>
                <th>Weight</th>
                <th>Value</th>
              </tr>
            </thead>

            <tbody>
              {(!report?.shipments || report.shipments.length === 0) && (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "var(--clay-muted)" }}>
                    No shipments found matching the current search query or filter presets.
                  </td>
                </tr>
              )}
              {report?.shipments?.map((shipment) => (
                <tr key={shipment._id}>
                  <td>{shipment.shipmentNumber}</td>

                  <td>{new Date(shipment.bookingDate).toLocaleDateString()}</td>

                  <td>{shipment.originWarehouse?.name}</td>

                  <td>{shipment.destinationWarehouse?.name}</td>

                  <td>{shipment.goodsDescription}</td>

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
                  <td colSpan="5">Totals</td>

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <button
          className="clay-btn-secondary"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          &lt;
        </button>

        <span>
          Page {report?.pagination?.page || 1} of{" "}
          {report?.pagination?.totalPages || 1}
        </span>

        <button
          className="clay-btn-secondary"
          disabled={
            page >= (report?.pagination?.totalPages || 1)
          }
          onClick={() => setPage((p) => p + 1)}
        >
          &gt;
        </button>
      </div>
    </>
  );
}
