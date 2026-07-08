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
} from "recharts";
import api from "../services/api";
import StatCard from "../components/StatCard";
import ActivityFeed from "../components/ActivityFeed";
import StatusBadge from "../components/StatusBadge";

// Clay chart colors
const PIE_COLORS = ["#ff4d8b", "#1a3a3a", "#e8b94a", "#b8a4ed", "#ffb084", "#a4d4c5"];

function HeroStat({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--clay-muted)", margin: "0 0 4px 0" }}>
        {label}
      </p>
      <h2 style={{
        fontSize: "32px", fontWeight: 600,
        letterSpacing: "-1px", color: "var(--clay-ink)",
        margin: 0, lineHeight: 1,
      }}>
        {value}
      </h2>
    </div>
  );
}

function QuickCard({ label, value, accent }) {
  return (
    <div style={{
      background: "var(--clay-surface-card)",
      borderRadius: "var(--r-lg)",
      padding: "20px 24px",
      borderLeft: `4px solid ${accent}`,
      display: "flex", flexDirection: "column", gap: "8px",
    }}>
      <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "var(--clay-muted)", margin: 0 }}>
        {label}
      </p>
      <h2 style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.8px", color: "var(--clay-ink)", margin: 0 }}>
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartsRes, shipmentsRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/charts"),
        api.get("/shipments")
      ]);
      // console.log(shipmentsRes.data)

      setStats(statsRes.data);

      // Format chart data for PieChart
      const formattedChart = chartsRes.data.map(item => ({
        name: item._id || "UNKNOWN",
        value: item.count
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
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--clay-muted)" }}>Loading dashboard metrics...</div>;
  }

  // Calculate pending (anything not completed)
  const pendingCount = stats.totalShipments - stats.completed;

  // Pie chart fallback if no data
  const pieData = statusDistribution.length > 0 ? statusDistribution : [
    { name: "No Data", value: 1 }
  ];

  // Bar chart of status counts
  const barData = statusDistribution.map(item => ({
    status: item.name,
    count: item.value
  }));

  const warehousePerformance = [
    { warehouse: "Tripoli Central", shipments: stats.totalShipments, delivered: stats.completed, performance: "97%" },
    { warehouse: "Benghazi Main", shipments: Math.floor(stats.totalShipments * 0.4), delivered: Math.floor(stats.completed * 0.4), performance: "96%" },
    { warehouse: "Misrata Hub", shipments: Math.floor(stats.totalShipments * 0.25), delivered: Math.floor(stats.completed * 0.25), performance: "95%" },
  ];

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
        <div style={{
          position: "absolute", right: "80px", top: "-40px",
          width: "220px", height: "220px", borderRadius: "50%",
          background: "var(--clay-ochre)", opacity: 0.12, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: "0px", bottom: "-60px",
          width: "180px", height: "180px", borderRadius: "50%",
          background: "var(--clay-pink)", opacity: 0.1, pointerEvents: "none",
        }} />

        <p style={{
          fontSize: "12px", fontWeight: 600, letterSpacing: "1.5px",
          textTransform: "uppercase", color: "var(--clay-muted)", margin: "0 0 12px 0",
        }}>
          Operations Overview
        </p>

        <h1 style={{
          fontSize: "40px", fontWeight: 500,
          lineHeight: 1.1, letterSpacing: "-1px",
          color: "var(--clay-ink)", margin: "0 0 8px 0",
          maxWidth: "640px",
        }}>
          Logistics Operations Overview
        </h1>

        <p style={{
          fontSize: "16px", fontWeight: 400,
          color: "var(--clay-muted)", margin: "0 0 36px 0",
        }}>
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
        <StatCard title="Total Bookings" value={stats.totalShipments} change="12%" icon="shipments" variantIndex={0} />
        <StatCard title="Active Cargo" value={pendingCount} change="4%" icon="pending" variantIndex={1} />
        <StatCard title="In Transit" value={stats.transit} change="8%" icon="transit" variantIndex={2} />
        <StatCard title="Ready Pickup" value={stats.pickup} change="5%" icon="warehouse" variantIndex={3} />
        <StatCard title="Completed" value={stats.completed} change="15%" icon="completed" variantIndex={4} />
      </div>

      {/* Quick Tonal Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickCard label="Active Parcels" value={pendingCount} accent="var(--clay-pink)" />
        <QuickCard label="Released Today" value={stats.completed} accent="var(--clay-mint)" />
        <QuickCard label="Awaiting Pickup" value={stats.pickup} accent="var(--clay-peach)" />
        <QuickCard label="Total Hubs" value={stats.warehouses} accent="var(--clay-lavender)" />
      </div>

      {/* Charts + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_360px] gap-5">

        {/* Pie Chart */}
        <div style={{
          background: "var(--clay-canvas)",
          borderRadius: "var(--r-lg)",
          border: "1.5px solid var(--clay-hairline)",
          padding: "24px",
          height: "340px",
        }}>
          <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "var(--clay-muted)", margin: "0 0 4px 0" }}>
            Distribution
          </p>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--clay-ink)", margin: "0 0 20px 0", letterSpacing: "-0.2px" }}>
            Shipment Status Share
          </h3>
          <ResponsiveContainer width="100%" height="75%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={95}
                innerRadius={40}
                paddingAngle={3}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
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
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div style={{
          background: "var(--clay-canvas)",
          borderRadius: "var(--r-lg)",
          border: "1.5px solid var(--clay-hairline)",
          padding: "24px",
          height: "340px",
        }}>
          <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "var(--clay-muted)", margin: "0 0 4px 0" }}>
            Lifecycle Count
          </p>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--clay-ink)", margin: "0 0 20px 0", letterSpacing: "-0.2px" }}>
            Shipments per Lifecycle Stage
          </h3>
          <ResponsiveContainer width="100%" height="75%">
            <BarChart data={barData} barSize={28}>
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: "var(--clay-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--clay-muted)" }} axisLine={false} tickLine={false} />
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
              <Bar dataKey="count" fill="var(--clay-pink)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2 xl:col-span-1">
          <ActivityFeed />
        </div>

      </div>

      {/* Warehouse Performance Table */}
      <div style={{
        background: "var(--clay-canvas)",
        borderRadius: "var(--r-lg)",
        border: "1.5px solid var(--clay-hairline)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "20px 24px",
          borderBottom: "1.5px solid var(--clay-hairline)",
        }}>
          <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "var(--clay-muted)", margin: "0 0 2px 0" }}>
            Summary
          </p>
          <h2 style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.2px", color: "var(--clay-ink)", margin: 0 }}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--clay-mint)" }} />
                      <span style={{ fontWeight: 500, color: "var(--clay-ink)" }}>{w.warehouse}</span>
                    </div>
                  </td>
                  <td>{w.shipments.toLocaleString()}</td>
                  <td>{w.delivered.toLocaleString()}</td>
                  <td>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "4px 12px",
                      background: "var(--clay-surface-card)",
                      borderRadius: "999px",
                      fontSize: "13px", fontWeight: 600,
                      color: "var(--clay-ink)",
                      border: "1px solid var(--clay-hairline)",
                    }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
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
      <div style={{
        background: "var(--clay-canvas)",
        borderRadius: "var(--r-lg)",
        border: "1.5px solid var(--clay-hairline)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "20px 24px",
          borderBottom: "1.5px solid var(--clay-hairline)",
        }}>
          <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "var(--clay-muted)", margin: "0 0 2px 0" }}>
            Latest Registry
          </p>
          <h3 style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.2px", color: "var(--clay-ink)", margin: 0 }}>
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
                    <span style={{ fontWeight: 600, color: "var(--clay-ink)", fontFamily: "monospace", fontSize: "13px" }}>
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