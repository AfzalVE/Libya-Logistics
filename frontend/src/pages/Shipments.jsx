import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import useAuthStore from "../store/useAuthStore";

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();

  const isOperator = user?.role?.name === "Warehouse Operator";
  const isManager = user?.role?.name === "Warehouse Manager";
  const userWarehouseId = user?.warehouse?._id;

  // Form states for booking
  const [destWarehouseId, setDestWarehouseId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderMobile, setSenderMobile] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [senderNationalId, setSenderNationalId] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverMobile, setReceiverMobile] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverNationalId, setReceiverNationalId] = useState("");
  const [goodsDescription, setGoodsDescription] = useState("");
  const [packageCount, setPackageCount] = useState(1);
  const [weight, setWeight] = useState(1);
  const [declaredValue, setDeclaredValue] = useState(100);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/shipments");
      setShipments(res.data);
    } catch (err) {
      console.error("Error fetching shipments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await api.get("/warehouses");
      setWarehouses(res.data);
      if (res.data.length > 0) {
        // Select first warehouse that isn't the operator's own
        const other = res.data.find((w) => w._id !== userWarehouseId);
        setDestWarehouseId(other?._id || res.data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching warehouses:", err);
    }
  };

  useEffect(() => {
    fetchShipments();
    fetchWarehouses();
  }, [userWarehouseId]);

  // Helper to ensure customer exists or create it
  const getOrCreateCustomer = async (name, mobile, address, nationalId) => {
    try {
      // Get all customers and see if mobile matches
      const res = await api.get("/customers");
      const found = res.data.find((c) => c.mobile === mobile);
      if (found) return found._id;

      // Create new customer
      const createRes = await api.post("/customers", {
        name,
        mobile,
        address,
        nationalId,
      });
      return createRes.data.customer._id;
    } catch (err) {
      console.error("Error getting/creating customer:", err);
      throw new Error(
        "Failed to register customer: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleBookShipment = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!userWarehouseId) {
      setError(
        "Your account is not assigned to a warehouse. You cannot book shipments.",
      );
      setSubmitting(false);
      return;
    }

    try {
      // Ensure customers are registered
      const senderId = await getOrCreateCustomer(
        senderName,
        senderMobile,
        senderAddress,
        senderNationalId,
      );
      const receiverId = await getOrCreateCustomer(
        receiverName,
        receiverMobile,
        receiverAddress,
        receiverNationalId,
      );

      // Book shipment
      const payload = {
        originWarehouse: userWarehouseId,
        destinationWarehouse: destWarehouseId,
        senderCustomer: senderId,
        receiverCustomer: receiverId,
        goodsDescription,
        packageCount,
        weight,
        declaredValue,
        bookedBy: user._id,
      };

      const res = await api.post("/shipments", payload);
      if (res.data.success) {
        setShowModal(false);
        // Clear form fields
        setSenderName("");
        setSenderMobile("");
        setSenderAddress("");
        setSenderNationalId("");
        setReceiverName("");
        setReceiverMobile("");
        setReceiverAddress("");
        setReceiverNationalId("");
        setGoodsDescription("");
        setPackageCount(1);
        setWeight(1);
        setDeclaredValue(100);
        fetchShipments();
      }
    } catch (err) {
      setError(err.message || "Failed to book shipment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStore = async (shipmentId) => {
    try {
      await api.patch(`/shipments/${shipmentId}/status`, {
        status: "STORED",
        warehouse: userWarehouseId,
        remarks: "Stored in origin warehouse",
        updatedBy: user._id,
      });
      fetchShipments();
    } catch (err) {
      alert(
        "Failed to update status: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  return (
    <>
      <PageHeader
        title="Shipments"
        subtitle="Manage and track all active shipments"
        buttonText={isOperator ? "Book Shipment" : null}
        onButtonClick={() => setShowModal(true)}
      />

      {loading ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--clay-muted)",
          }}
        >
          Loading shipments...
        </div>
      ) : (
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
                <th>Shipment No</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Current Loc</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => {
                const canStore =
                  isOperator &&
                  s.currentStatus === "BOOKED" &&
                  s.originWarehouse?._id === userWarehouseId;

                return (
                  <tr key={s._id}>
                    <td>
                      <Link
                        to={`/shipments/${s._id}`}
                        style={{
                          fontWeight: 600,
                          color: "var(--clay-ink)",
                          textDecoration: "none",
                          fontFamily: "monospace",
                          fontSize: "13px",
                          borderBottom: "1.5px solid transparent",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderBottomColor =
                            "var(--clay-ink)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderBottomColor =
                            "transparent")
                        }
                      >
                        {s.shipmentNumber}
                      </Link>
                    </td>
                    <td>{s.senderCustomer?.name}</td>
                    <td>{s.receiverCustomer?.name}</td>
                    <td>{s.originWarehouse?.city}</td>
                    <td>{s.destinationWarehouse?.city}</td>
                    <td>{s.currentWarehouse?.name || "Transit"}</td>
                    <td>
                      <StatusBadge status={s.currentStatus} />
                    </td>
                    <td>
                      {canStore ? (
                        <button
                          onClick={() => handleQuickStore(s._id)}
                          className="clay-btn-primary"
                          style={{
                            height: "30px",
                            fontSize: "11px",
                            padding: "0 12px",
                            borderRadius: "8px",
                          }}
                        >
                          Store in Wh
                        </button>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <Link
                            to={`/shipments/${s._id}`}
                            className="clay-btn-secondary"
                            style={{
                              height: "30px",
                              fontSize: "11px",
                              padding: "0 12px",
                              borderRadius: "8px",
                              display: "inline-flex",
                              alignItems: "center",
                              textDecoration: "none",
                            }}
                          >
                            Manage Flow
                          </Link>

                          {s.currentStatus === "COMPLETED" && (
                            <button
                              onClick={() =>
                                window.open(
                                  `${import.meta.env.VITE_API_URL}/shipments/${s._id}/invoice`,
                                  "_blank",
                                )
                              }
                              className="clay-btn-primary"
                              style={{
                                height: "30px",
                                fontSize: "11px",
                                padding: "0 12px",
                                borderRadius: "8px",
                              }}
                            >
                              Invoice
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Book Shipment Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(10, 10, 10, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "var(--clay-canvas)",
              padding: "32px",
              borderRadius: "var(--r-xl)",
              width: "100%",
              maxWidth: "780px",
              border: "1.5px solid var(--clay-hairline)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3
              style={{
                fontSize: "24px",
                fontWeight: 600,
                letterSpacing: "-0.5px",
                margin: "0 0 4px 0",
              }}
            >
              Book New Shipment
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--clay-muted)",
                margin: "0 0 20px 0",
              }}
            >
              Origin locked to:{" "}
              <strong style={{ color: "var(--clay-ink)" }}>
                {user?.warehouse?.name}
              </strong>
            </p>

            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1.5px solid var(--clay-error)",
                  color: "var(--clay-error)",
                  borderRadius: "var(--r-md)",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleBookShipment}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Destination */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--clay-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Destination Warehouse
                </label>
                <select
                  value={destWarehouseId}
                  onChange={(e) => setDestWarehouseId(e.target.value)}
                  className="clay-select"
                  style={{ width: "100%" }}
                >
                  {warehouses
                    .filter((w) => w._id !== userWarehouseId)
                    .map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name} ({w.city})
                      </option>
                    ))}
                </select>
              </div>

              {/* Sender & Receiver Forms side-by-side */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                {/* Sender Column */}
                <div
                  style={{
                    background: "var(--clay-surface-soft)",
                    padding: "16px",
                    borderRadius: "var(--r-lg)",
                    border: "1px solid var(--clay-hairline)",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--clay-ink)",
                      margin: "0 0 12px 0",
                      borderBottom: "1.5px solid var(--clay-hairline)",
                      paddingBottom: "6px",
                    }}
                  >
                    Sender Details
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Name"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="clay-input"
                      style={{ height: "38px", fontSize: "14px" }}
                    />
                    <input
                      type="text"
                      placeholder="Mobile"
                      required
                      value={senderMobile}
                      onChange={(e) => setSenderMobile(e.target.value)}
                      className="clay-input"
                      style={{ height: "38px", fontSize: "14px" }}
                    />
                    <input
                      type="text"
                      placeholder="National ID"
                      required
                      value={senderNationalId}
                      onChange={(e) => setSenderNationalId(e.target.value)}
                      className="clay-input"
                      style={{ height: "38px", fontSize: "14px" }}
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      required
                      value={senderAddress}
                      onChange={(e) => setSenderAddress(e.target.value)}
                      className="clay-input"
                      style={{ height: "38px", fontSize: "14px" }}
                    />
                  </div>
                </div>

                {/* Receiver Column */}
                <div
                  style={{
                    background: "var(--clay-surface-soft)",
                    padding: "16px",
                    borderRadius: "var(--r-lg)",
                    border: "1px solid var(--clay-hairline)",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--clay-ink)",
                      margin: "0 0 12px 0",
                      borderBottom: "1.5px solid var(--clay-hairline)",
                      paddingBottom: "6px",
                    }}
                  >
                    Receiver Details
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Name"
                      required
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="clay-input"
                      style={{ height: "38px", fontSize: "14px" }}
                    />
                    <input
                      type="text"
                      placeholder="Mobile"
                      required
                      value={receiverMobile}
                      onChange={(e) => setReceiverMobile(e.target.value)}
                      className="clay-input"
                      style={{ height: "38px", fontSize: "14px" }}
                    />
                    <input
                      type="text"
                      placeholder="National ID"
                      required
                      value={receiverNationalId}
                      onChange={(e) => setReceiverNationalId(e.target.value)}
                      className="clay-input"
                      style={{ height: "38px", fontSize: "14px" }}
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      required
                      value={receiverAddress}
                      onChange={(e) => setReceiverAddress(e.target.value)}
                      className="clay-input"
                      style={{ height: "38px", fontSize: "14px" }}
                    />
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div
                style={{
                  background: "var(--clay-surface-soft)",
                  padding: "16px",
                  borderRadius: "var(--r-lg)",
                  border: "1px solid var(--clay-hairline)",
                }}
              >
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--clay-ink)",
                    margin: "0 0 12px 0",
                    borderBottom: "1.5px solid var(--clay-hairline)",
                    paddingBottom: "6px",
                  }}
                >
                  Goods & Package Details
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    gap: "10px",
                    alignItems: "flex-end",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "var(--clay-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Electronics, Clothes"
                      required
                      value={goodsDescription}
                      onChange={(e) => setGoodsDescription(e.target.value)}
                      className="clay-input"
                      style={{ height: "38px", fontSize: "14px" }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "var(--clay-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Pkgs
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={packageCount}
                      onChange={(e) => setPackageCount(Number(e.target.value))}
                      className="clay-input"
                      style={{ height: "38px", fontSize: "14px" }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "var(--clay-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      required
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="clay-input"
                      style={{ height: "38px", fontSize: "14px" }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "var(--clay-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Value (LYD)
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={declaredValue}
                      onChange={(e) => setDeclaredValue(Number(e.target.value))}
                      className="clay-input"
                      style={{ height: "38px", fontSize: "14px" }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="clay-btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? "Booking..." : "Book Shipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
