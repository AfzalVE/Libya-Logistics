import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import api from "../services/api";
import StatCard from "../components/StatCard";
import ActivityFeed from "../components/ActivityFeed";
import StatusBadge from "../components/StatusBadge";

// Clay chart colors
const PIE_COLORS = [
  "#ff4d8b",
  "#1a3a3a",
  "#e8b94a",
  "#b8a4ed",
  "#ffb084",
  "#a4d4c5",
];

function HeroStat({ label, value }) {
  return (
    <div>
      <p
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--clay-muted)",
          margin: "0 0 4px 0",
        }}
      >
        {label}
      </p>
      <h2
        style={{
          fontSize: "32px",
          fontWeight: 600,
          letterSpacing: "-1px",
          color: "var(--clay-ink)",
          margin: 0,
          lineHeight: 1,
        }}
      >
        {value}
      </h2>
    </div>
  );
}

function QuickCard({ label, value, accent }) {
  return (
    <div
      style={{
        background: "var(--clay-surface-card)",
        borderRadius: "var(--r-lg)",
        padding: "20px 24px",
        borderLeft: `4px solid ${accent}`,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--clay-muted)",
          margin: 0,
        }}
      >
        {label}
      </p>
      <h2
        style={{
          fontSize: "28px",
          fontWeight: 600,
          letterSpacing: "-0.8px",
          color: "var(--clay-ink)",
          margin: 0,
        }}
      >
        {value}
      </h2>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalShipments: 0,
    warehouses: 0,
    users: 0,
    completed: 0,
    transit: 0,
    pickup: 0,
  });
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStageId, setSelectedStageId] = useState("BOOKED");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartsRes, shipmentsRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/charts"),
        api.get("/shipments"),
      ]);
      // console.log(shipmentsRes.data)

      setStats(statsRes.data);

      // Format chart data for PieChart
      const formattedChart = chartsRes.data.map((item) => ({
        name: item._id || "UNKNOWN",
        value: item.count,
      }));
      setStatusDistribution(formattedChart);

      // Get latest 5 shipments
      const shipments = shipmentsRes.data.data || [];

      setRecentShipments(shipments.slice(0, 5));
      //setRecentShipments(shipmentsRes.data.slice(0, 5));
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "var(--clay-muted)",
        }}
      >
        Loading dashboard metrics...
      </div>
    );
  }

  // Calculate pending (anything not completed)
  const pendingCount = stats.totalShipments - stats.completed;

  // Pie chart fallback if no data
  const pieData =
    statusDistribution.length > 0
      ? statusDistribution
      : [{ name: "No Data", value: 1 }];

  // Bar chart of status counts
  const barData = statusDistribution.map((item) => ({
    status: item.name,
    count: item.value,
  }));

  // Volume Trend mock data matching stats total
  const trendData = [
    {
      name: "Jul 01",
      count: Math.max(2, Math.floor(stats.totalShipments * 0.15)),
    },
    {
      name: "Jul 02",
      count: Math.max(3, Math.floor(stats.totalShipments * 0.28)),
    },
    {
      name: "Jul 03",
      count: Math.max(4, Math.floor(stats.totalShipments * 0.42)),
    },
    {
      name: "Jul 04",
      count: Math.max(2, Math.floor(stats.totalShipments * 0.55)),
    },
    {
      name: "Jul 05",
      count: Math.max(6, Math.floor(stats.totalShipments * 0.68)),
    },
    {
      name: "Jul 06",
      count: Math.max(5, Math.floor(stats.totalShipments * 0.75)),
    },
    {
      name: "Jul 07",
      count: Math.max(8, Math.floor(stats.totalShipments * 0.88)),
    },
    { name: "Jul 08", count: Math.max(10, stats.totalShipments) },
  ];

  // Warehouse comparison
  const warehouseComparisonData = [
    { name: "Tripoli Central", volume: stats.totalShipments },
    { name: "Benghazi Main", volume: Math.floor(stats.totalShipments * 0.4) },
    { name: "Misrata Hub", volume: Math.floor(stats.totalShipments * 0.25) },
  ];

  const warehousePerformance = [
    {
      warehouse: "Tripoli Central",
      shipments: stats.totalShipments,
      delivered: stats.completed,
      performance: "97%",
    },
    {
      warehouse: "Benghazi Main",
      shipments: Math.floor(stats.totalShipments * 0.4),
      delivered: Math.floor(stats.completed * 0.4),
      performance: "96%",
    },
    {
      warehouse: "Misrata Hub",
      shipments: Math.floor(stats.totalShipments * 0.25),
      delivered: Math.floor(stats.completed * 0.25),
      performance: "95%",
    },
  ];

  // Lifecycle stages definition
  const stages = [
    {
      id: "BOOKED",
      label: "Booked",
      color: "var(--clay-ochre)",
      desc: "Shipment has been registered by the sender operator.",
      tip: "Requires warehouse staff to receive and label the parcel.",
    },
    {
      id: "STORED",
      label: "Stored",
      color: "var(--clay-peach)",
      desc: "Parcel is stored in the origin warehouse inventory.",
      tip: "Needs to be placed in the dispatch queue when carrier is assigned.",
    },
    {
      id: "READY_FOR_DISPATCH",
      label: "Ready Dispatch",
      color: "var(--clay-lavender)",
      desc: "Parcel is packed and staged for transport.",
      tip: "Awaiting final loading onto vehicle.",
    },
    {
      id: "DISPATCHED",
      label: "Dispatched",
      color: "var(--clay-pink)",
      desc: "Parcel has left the origin warehouse.",
      tip: "Carrier is on their way to destination hub.",
    },
    {
      id: "IN_TRANSIT",
      label: "In Transit",
      color: "var(--clay-pink)",
      desc: "Currently in transit between Libyan hubs.",
      tip: "Real-time updates are streamed via barcodes.",
    },
    {
      id: "RECEIVED",
      label: "Received",
      color: "var(--clay-mint)",
      desc: "Arrived at the destination warehouse.",
      tip: "Sorting team must scan and move to pickup shelves.",
    },
    {
      id: "READY_FOR_PICKUP",
      label: "Ready Pickup",
      color: "var(--clay-coral)",
      desc: "Awaiting customer collection.",
      tip: "System automatically notified the recipient.",
    },
    {
      id: "COMPLETED",
      label: "Completed",
      color: "var(--clay-teal)",
      desc: "Successfully delivered and signed.",
      tip: "Transaction cycle complete.",
    },
  ];

  const selectedStage =
    stages.find((s) => s.id === selectedStageId) || stages[0];

  const getStatusCount = (statusId) => {
    const found = statusDistribution.find((item) => item.name === statusId);
    return found ? found.value : 0;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Hero Band */}
      <div
        className="clay-animate-fade-up p-6 sm:p-8 lg:p-[40px_48px]"
        style={{
          background: "var(--clay-surface-soft)",
          borderRadius: "var(--r-xl)",
          border: "1.5px solid var(--clay-hairline)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            right: "80px",
            top: "-40px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "var(--clay-ochre)",
            opacity: 0.12,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "0px",
            bottom: "-60px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "var(--clay-pink)",
            opacity: 0.1,
            pointerEvents: "none",
          }}
        />

        <p
          style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "var(--clay-muted)",
            margin: "0 0 12px 0",
          }}
        >
          Operations Overview
        </p>

        <h1
          style={{
            fontSize: "40px",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-1px",
            color: "var(--clay-ink)",
            margin: "0 0 8px 0",
            maxWidth: "640px",
          }}
        >
          Logistics Operations Overview
        </h1>

        <p
          style={{
            fontSize: "16px",
            fontWeight: 400,
            color: "var(--clay-muted)",
            margin: "0 0 36px 0",
          }}
        >
          Real-time tracking of active shipments across all Libyan transit hubs.
        </p>

        {/* Hero stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <HeroStat label="Active Warehouses" value={stats.warehouses} />
          <HeroStat label="Registered Staff" value={stats.users} />
          <HeroStat label="Active Shipments" value={pendingCount} />
          <HeroStat label="Success Rate" value="97.4%" />
        </div>
      </div>

      {/* KPI Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Bookings"
          value={stats.totalShipments}
          change="12%"
          icon="shipments"
          variantIndex={0}
        />
        <StatCard
          title="Active Cargo"
          value={pendingCount}
          change="4%"
          icon="pending"
          variantIndex={1}
        />
        <StatCard
          title="In Transit"
          value={stats.transit}
          change="8%"
          icon="transit"
          variantIndex={2}
        />
        <StatCard
          title="Ready Pickup"
          value={stats.pickup}
          change="5%"
          icon="warehouse"
          variantIndex={3}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          change="15%"
          icon="completed"
          variantIndex={4}
        />
      </div>

      {/* Quick Tonal Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickCard
          label="Active Parcels"
          value={pendingCount}
          accent="var(--clay-pink)"
        />
        <QuickCard
          label="Released Today"
          value={stats.completed}
          accent="var(--clay-mint)"
        />
        <QuickCard
          label="Awaiting Pickup"
          value={stats.pickup}
          accent="var(--clay-peach)"
        />
        <QuickCard
          label="Total Hubs"
          value={stats.warehouses}
          accent="var(--clay-lavender)"
        />
      </div>

      {/* Primary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pie Chart */}
        <div
          style={{
            background: "var(--clay-canvas)",
            borderRadius: "var(--r-lg)",
            border: "1.5px solid var(--clay-hairline)",
            padding: "24px",
            height: "340px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--clay-muted)",
              margin: "0 0 4px 0",
            }}
          >
            Distribution
          </p>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--clay-ink)",
              margin: "0 0 20px 0",
              letterSpacing: "-0.2px",
            }}
          >
            Shipment Status Share
          </h3>
          <ResponsiveContainer width="100%" height="75%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                innerRadius={50}
                paddingAngle={4}
              >
                {pieData.map((entry, index) => {
                  const colors = {
                    BOOKED: "var(--clay-lavender)",
                    STORED: "var(--clay-mint)",
                    READY_FOR_DISPATCH: "var(--clay-peach)",
                    DISPATCHED: "var(--clay-ochre)",
                    IN_TRANSIT: "var(--clay-pink)",
                    RECEIVED: "var(--clay-teal)",
                    READY_FOR_PICKUP: "var(--clay-coral)",
                    COMPLETED: "#22c55e",
                  };
                  return (
                    <Cell
                      key={index}
                      fill={
                        colors[entry.name] ||
                        PIE_COLORS[index % PIE_COLORS.length]
                      }
                    />
                  );
                })}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--clay-canvas)",
                  border: "1.5px solid var(--clay-hairline)",
                  borderRadius: "var(--r-md)",
                  fontSize: "13px",
                  boxShadow: "none",
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  paddingTop: "10px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Area Chart */}
        <div
          style={{
            background: "var(--clay-canvas)",
            borderRadius: "var(--r-lg)",
            border: "1.5px solid var(--clay-hairline)",
            padding: "24px",
            height: "340px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--clay-muted)",
              margin: "0 0 4px 0",
            }}
          >
            Registrations
          </p>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--clay-ink)",
              margin: "0 0 20px 0",
              letterSpacing: "-0.2px",
            }}
          >
            Shipment Booking Trend
          </h3>
          <ResponsiveContainer width="100%" height="75%">
            <AreaChart data={trendData}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--clay-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--clay-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--clay-canvas)",
                  border: "1.5px solid var(--clay-hairline)",
                  borderRadius: "var(--r-md)",
                  fontSize: "13px",
                  boxShadow: "none",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--clay-teal)"
                fill="var(--clay-mint)"
                fillOpacity={0.4}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div>
          <ActivityFeed />
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar Chart */}
        <div
          style={{
            background: "var(--clay-canvas)",
            borderRadius: "var(--r-lg)",
            border: "1.5px solid var(--clay-hairline)",
            padding: "24px",
            height: "340px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--clay-muted)",
              margin: "0 0 4px 0",
            }}
          >
            Lifecycle Count
          </p>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--clay-ink)",
              margin: "0 0 20px 0",
              letterSpacing: "-0.2px",
            }}
          >
            Shipments per Lifecycle Stage
          </h3>
          <ResponsiveContainer width="100%" height="75%">
            <BarChart data={barData} barSize={28}>
              <XAxis
                dataKey="status"
                tick={{ fontSize: 10, fill: "var(--clay-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--clay-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--clay-canvas)",
                  border: "1.5px solid var(--clay-hairline)",
                  borderRadius: "var(--r-md)",
                  fontSize: "13px",
                  boxShadow: "none",
                }}
                cursor={{ fill: "var(--clay-surface-soft)" }}
              />
              <Bar
                dataKey="count"
                fill="var(--clay-pink)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Warehouse Volume Comparison (Horizontal Bar Chart) */}
        <div
          style={{
            background: "var(--clay-canvas)",
            borderRadius: "var(--r-lg)",
            border: "1.5px solid var(--clay-hairline)",
            padding: "24px",
            height: "340px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--clay-muted)",
              margin: "0 0 4px 0",
            }}
          >
            Hub Volume
          </p>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--clay-ink)",
              margin: "0 0 20px 0",
              letterSpacing: "-0.2px",
            }}
          >
            Warehouse Hub Comparison
          </h3>
          <ResponsiveContainer width="100%" height="75%">
            <BarChart
              data={warehouseComparisonData}
              layout="vertical"
              barSize={24}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--clay-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{
                  fontSize: 11,
                  fill: "var(--clay-ink)",
                  fontWeight: 500,
                }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--clay-canvas)",
                  border: "1.5px solid var(--clay-hairline)",
                  borderRadius: "var(--r-md)",
                  fontSize: "13px",
                  boxShadow: "none",
                }}
                cursor={{ fill: "var(--clay-surface-soft)" }}
              />
              <Bar
                dataKey="volume"
                fill="var(--clay-lavender)"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Shipment Lifecycle Interactive Diagram */}
      <div
        style={{
          background: "var(--clay-canvas)",
          borderRadius: "var(--r-lg)",
          border: "1.5px solid var(--clay-hairline)",
          padding: "24px",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "var(--clay-muted)",
            margin: "0 0 4px 0",
          }}
        >
          Operational Orchestrator
        </p>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--clay-ink)",
            margin: "0 0 20px 0",
            letterSpacing: "-0.2px",
          }}
        >
          Interactive Shipment Lifecycle Flow
        </h3>

        {/* Stages Line */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            padding: "16px 0",
            justifyContent: "space-between",
            borderBottom: "1.5px solid var(--clay-hairline-soft)",
            marginBottom: "20px",
          }}
        >
          {stages.map((stage) => {
            const count = getStatusCount(stage.id);
            const isSelected = selectedStageId === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                style={{
                  flex: "1 1 120px",
                  background: isSelected
                    ? stage.color
                    : "var(--clay-surface-soft)",
                  color: isSelected
                    ? stage.color === "var(--clay-teal)" ||
                      stage.color === "var(--clay-pink)"
                      ? "#ffffff"
                      : "var(--clay-ink)"
                    : "var(--clay-body)",
                  border: isSelected
                    ? "1.5px solid var(--clay-ink)"
                    : "1.5px solid var(--clay-hairline)",
                  borderRadius: "var(--r-md)",
                  padding: "12px 16px",
                  cursor: "pointer",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>{stage.label}</span>
                <span
                  style={{
                    fontSize: "12px",
                    opacity: 0.8,
                    background: "rgba(0,0,0,0.06)",
                    padding: "2px 8px",
                    borderRadius: "999px",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Panel */}
        <div
          style={{
            background: "var(--clay-surface-card)",
            borderRadius: "var(--r-lg)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            borderLeft: `6px solid ${selectedStage.color}`,
          }}
        >
          <h4
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--clay-ink)",
              margin: 0,
            }}
          >
            Stage Detail: {selectedStage.label} (
            {getStatusCount(selectedStage.id)} items active)
          </h4>
          <p style={{ fontSize: "14px", color: "var(--clay-body)", margin: 0 }}>
            {selectedStage.desc}
          </p>
          <div
            style={{
              background: "var(--clay-canvas)",
              borderRadius: "var(--r-md)",
              padding: "12px 16px",
              fontSize: "13px",
              color: "var(--clay-muted)",
              border: "1.5px solid var(--clay-hairline)",
              fontWeight: 500,
            }}
          >
            <strong style={{ color: "var(--clay-ink)" }}>Operator Tip:</strong>{" "}
            {selectedStage.tip}
          </div>
        </div>
      </div>

      {/* Warehouse Performance Table */}
      <div
        style={{
          background: "var(--clay-canvas)",
          borderRadius: "var(--r-lg)",
          border: "1.5px solid var(--clay-hairline)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1.5px solid var(--clay-hairline)",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--clay-muted)",
              margin: "0 0 2px 0",
            }}
          >
            Summary
          </p>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "-0.2px",
              color: "var(--clay-ink)",
              margin: 0,
            }}
          >
            Hub Throughput performance
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="clay-table">
            <thead>
              <tr>
                <th>Warehouse</th>
                <th>Shipments Handled</th>
                <th>Completed Deliveries</th>
                <th>Fulfillment Performance</th>
              </tr>
            </thead>
            <tbody>
              {warehousePerformance.map((w) => (
                <tr key={w.warehouse}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "var(--clay-mint)",
                        }}
                      />
                      <span
                        style={{ fontWeight: 500, color: "var(--clay-ink)" }}
                      >
                        {w.warehouse}
                      </span>
                    </div>
                  </td>
                  <td>{w.shipments.toLocaleString()}</td>
                  <td>{w.delivered.toLocaleString()}</td>
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 12px",
                        background: "var(--clay-surface-card)",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--clay-ink)",
                        border: "1px solid var(--clay-hairline)",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#22c55e",
                        }}
                      />
                      {w.performance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Shipments Table */}
      <div
        style={{
          background: "var(--clay-canvas)",
          borderRadius: "var(--r-lg)",
          border: "1.5px solid var(--clay-hairline)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1.5px solid var(--clay-hairline)",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--clay-muted)",
              margin: "0 0 2px 0",
            }}
          >
            Latest Registry
          </p>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "-0.2px",
              color: "var(--clay-ink)",
              margin: 0,
            }}
          >
            Recent Shipment Enrolments
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="clay-table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentShipments.map((item) => (
                <tr key={item._id}>
                  <td>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--clay-ink)",
                        fontFamily: "monospace",
                        fontSize: "13px",
                      }}
                    >
                      {item.shipmentNumber}
                    </span>
                  </td>
                  <td>{item.senderCustomer?.name}</td>
                  <td>{item.receiverCustomer?.name}</td>
                  <td>
                    <StatusBadge status={item.currentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
