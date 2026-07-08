import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import useAuthStore from "../store/useAuthStore";
import {
  FaArrowLeft,
  FaTruck,
  FaMapMarkerAlt,
  FaFileAlt,
} from "react-icons/fa";

const DOT_COLORS = {
  BOOKED: "var(--clay-lavender)",
  STORED: "var(--clay-mint)",
  READY_FOR_DISPATCH: "var(--clay-peach)",
  DISPATCHED: "var(--clay-ochre)",
  IN_TRANSIT: "var(--clay-pink)",
  RECEIVED: "var(--clay-teal)",
  READY_FOR_PICKUP: "var(--clay-coral)",
  COMPLETED: "var(--clay-success)",
};

export default function ShipmentDetails() {
  const { id } = useParams();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  // Dialog modals
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);

  // Dispatch form inputs
  const [dispatchRemarks, setDispatchRemarks] = useState("");

  // Pickup form inputs
  const [pickupName, setPickupName] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");
  const [pickupNationalId, setPickupNationalId] = useState("");
  const [pickupRemarks, setPickupRemarks] = useState("");

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/shipments/${id}`);
      setShipment(res.data);

      // Pre-fill pickup form with receiver's details
      if (res.data) {
        setPickupName(res.data.receiverCustomer?.name || "");
        setPickupPhone(res.data.receiverCustomer?.mobile || "");
        setPickupNationalId(res.data.receiverCustomer?.nationalId || "");
      }
    } catch (err) {
      console.error("Error fetching shipment details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipmentDetails();
  }, [id]);

  const updateShipmentStatus = async (newStatus, extraData = {}) => {
    try {
      await api.patch(`/shipments/${id}/status`, {
        status: newStatus,
        warehouse: user?.warehouse?._id,
        remarks: extraData.remarks || `Status transitioned to ${newStatus}`,
        updatedBy: user?._id,
        pickup: extraData.pickup,
      });
      fetchShipmentDetails();
    } catch (err) {
      alert(
        "Failed to update status: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "var(--clay-muted)",
        }}
      >
        Loading shipment tracking details...
      </div>
    );
  }

  if (!shipment) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3 style={{ color: "var(--clay-error)" }}>Shipment Not Found</h3>
        <Link
          to="/shipments"
          className="clay-btn-secondary"
          style={{
            marginTop: "16px",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaArrowLeft /> Back to Shipments
        </Link>
      </div>
    );
  }

  // Permissions and Context Helpers
  const userWarehouseId = user?.warehouse?._id;
  const isOperator = user?.role?.name === "Warehouse Operator";
  const isManager = user?.role?.name === "Warehouse Manager";
  const isSuperAdmin = user?.role?.name === "Super Admin";

  const isAtOrigin = userWarehouseId === shipment.originWarehouse?._id;
  const isAtDestination =
    userWarehouseId === shipment.destinationWarehouse?._id;

  const currentStatus = shipment.currentStatus;

  // Determine current active flow controls based on role and status
  const canStore = isOperator && currentStatus === "BOOKED" && isAtOrigin;
  const canDispatch = isManager && currentStatus === "STORED" && isAtOrigin;
  const canTransit = isManager && currentStatus === "DISPATCHED";
  const canReceive =
    isManager && currentStatus === "IN_TRANSIT" && isAtDestination;
  const canReadyPickup =
    isManager && currentStatus === "RECEIVED" && isAtDestination;
  const canCompletePickup =
    isManager && currentStatus === "READY_FOR_PICKUP" && isAtDestination;

  // Format date nicely
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) +
      " – " +
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const downloadInvoice = () => {
    window.open(
      `${import.meta.env.VITE_API_URL}/shipments/${id}/invoice`,
      "_blank",
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Back button */}
      <div>
        <Link
          to="/shipments"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--clay-muted)",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          <FaArrowLeft /> Back to list
        </Link>
      </div>

      {/* Header Card */}
      <div
        style={{
          background: "var(--clay-surface-soft)",
          borderRadius: "var(--r-xl)",
          border: "1.5px solid var(--clay-hairline)",
          padding: "36px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: "absolute",
            right: "-30px",
            top: "-40px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "var(--clay-ochre)",
            opacity: 0.12,
            pointerEvents: "none",
          }}
        />

        <div>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "var(--clay-muted)",
              margin: "0 0 10px 0",
            }}
          >
            Parcels Registry
          </p>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 600,
              letterSpacing: "-0.5px",
              lineHeight: 1.15,
              color: "var(--clay-ink)",
              margin: "0 0 6px 0",
              fontFamily: "monospace",
            }}
          >
            {shipment.shipmentNumber}
          </h1>
          <p
            style={{ fontSize: "15px", color: "var(--clay-muted)", margin: 0 }}
          >
            Currently at:{" "}
            <strong style={{ color: "var(--clay-ink)" }}>
              {shipment.currentWarehouse?.name || "In Transit / Carrier"}
            </strong>
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignItems: "flex-end",
            }}
          >
            <StatusBadge status={currentStatus} />

            {currentStatus === "COMPLETED" && (
              <button
                onClick={downloadInvoice}
                className="clay-btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaFileAlt />
                Download Invoice
              </button>
            )}

            <span
              style={{
                fontSize: "12px",
                color: "var(--clay-muted-soft)",
              }}
            >
              Booked: {new Date(shipment.bookingDate).toLocaleDateString()}
            </span>
          </div>
          <span style={{ fontSize: "12px", color: "var(--clay-muted-soft)" }}>
            Booked: {new Date(shipment.bookingDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Core Flow Action Panels */}
      {(canStore ||
        canDispatch ||
        canTransit ||
        canReceive ||
        canReadyPickup ||
        canCompletePickup) && (
        <div
          style={{
            background: "var(--clay-surface-card)",
            borderRadius: "var(--r-lg)",
            padding: "24px 28px",
            borderLeft: "5px solid var(--clay-pink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h4
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--clay-ink)",
                margin: "0 0 4px 0",
              }}
            >
              Action Required
            </h4>
            <p
              style={{
                fontSize: "14px",
                color: "var(--clay-muted)",
                margin: 0,
              }}
            >
              You have the appropriate permissions at this warehouse location to
              execute the next flow transition.
            </p>
          </div>

          <div>
            {canStore && (
              <button
                onClick={() =>
                  updateShipmentStatus("STORED", {
                    remarks:
                      "Shipment processed and stored at origin warehouse",
                  })
                }
                className="clay-btn-primary"
              >
                Mark Stored in Warehouse
              </button>
            )}
            {canDispatch && (
              <button
                onClick={() => setShowDispatchModal(true)}
                className="clay-btn-primary"
              >
                Dispatch from Warehouse
              </button>
            )}
            {canTransit && (
              <button
                onClick={() =>
                  updateShipmentStatus("IN_TRANSIT", {
                    remarks: "Shipment departed warehouse in transit",
                  })
                }
                className="clay-btn-primary"
              >
                Mark In Transit
              </button>
            )}
            {canReceive && (
              <button
                onClick={() =>
                  updateShipmentStatus("RECEIVED", {
                    remarks: "Shipment received at destination warehouse hub",
                  })
                }
                className="clay-btn-primary"
              >
                Receive at Destination
              </button>
            )}
            {canReadyPickup && (
              <button
                onClick={() =>
                  updateShipmentStatus("READY_FOR_PICKUP", {
                    remarks: "Shipment cataloged and ready for customer pickup",
                  })
                }
                className="clay-btn-primary"
              >
                Mark Ready for Pickup
              </button>
            )}
            {canCompletePickup && (
              <button
                onClick={() => setShowPickupModal(true)}
                className="clay-btn-primary"
              >
                Release to Customer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Info Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
        }}
      >
        {[
          {
            label: "Origin Location",
            value: `${shipment.originWarehouse?.name} (${shipment.originWarehouse?.city})`,
            color: "var(--clay-teal)",
          },
          {
            label: "Destination Hub",
            value: `${shipment.destinationWarehouse?.name} (${shipment.destinationWarehouse?.city})`,
            color: "var(--clay-ochre)",
          },
          {
            label: "Sender Customer",
            value: `${shipment.senderCustomer?.name} (${shipment.senderCustomer?.mobile})`,
            color: "var(--clay-lavender)",
          },
          {
            label: "Receiver Customer",
            value: `${shipment.receiverCustomer?.name} (${shipment.receiverCustomer?.mobile})`,
            color: "var(--clay-pink)",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "var(--clay-canvas)",
              borderRadius: "var(--r-lg)",
              border: "1.5px solid var(--clay-hairline)",
              padding: "20px 24px",
              borderTop: `4px solid ${color}`,
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--clay-muted)",
                margin: "0 0 8px 0",
              }}
            >
              {label}
            </p>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--clay-ink)",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {value}
            </h3>
          </div>
        ))}
      </div>

      {/* Main Grid: Info Details & Track Timeline */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "24px",
        }}
      >
        {/* Left: Package details */}
        <div
          style={{
            background: "var(--clay-canvas)",
            borderRadius: "var(--r-lg)",
            border: "1.5px solid var(--clay-hairline)",
            padding: "28px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "var(--clay-ink)",
                margin: "0 0 16px 0",
              }}
            >
              Package & Shipment Specifications
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--clay-muted)",
                    margin: "0 0 4px 0",
                  }}
                >
                  Goods Description
                </p>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--clay-ink)",
                    margin: 0,
                  }}
                >
                  {shipment.goodsDescription || "Not specified"}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--clay-muted)",
                    margin: "0 0 4px 0",
                  }}
                >
                  Package Count
                </p>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--clay-ink)",
                    margin: 0,
                  }}
                >
                  {shipment.packageCount} box(es)
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--clay-muted)",
                    margin: "0 0 4px 0",
                  }}
                >
                  Total Weight
                </p>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--clay-ink)",
                    margin: 0,
                  }}
                >
                  {shipment.weight} kg
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--clay-muted)",
                    margin: "0 0 4px 0",
                  }}
                >
                  Declared Value
                </p>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--clay-ink)",
                    margin: 0,
                  }}
                >
                  {shipment.declaredValue} LYD
                </p>
              </div>
            </div>
          </div>

          {shipment.pickup && shipment.currentStatus === "COMPLETED" && (
            <div
              style={{
                background: "var(--clay-surface-soft)",
                padding: "20px",
                borderRadius: "var(--r-md)",
                border: "1.5px solid var(--clay-hairline)",
              }}
            >
              <h4
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--clay-ink)",
                  margin: "0 0 12px 0",
                }}
              >
                Delivery Release Receipt
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <p
                    style={{ color: "var(--clay-muted)", margin: "0 0 2px 0" }}
                  >
                    Collected By
                  </p>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "var(--clay-ink)",
                      margin: 0,
                    }}
                  >
                    {shipment.pickup.receiverName}
                  </p>
                </div>
                <div>
                  <p
                    style={{ color: "var(--clay-muted)", margin: "0 0 2px 0" }}
                  >
                    Phone Number
                  </p>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "var(--clay-ink)",
                      margin: 0,
                    }}
                  >
                    {shipment.pickup.receiverPhone}
                  </p>
                </div>
                <div>
                  <p
                    style={{ color: "var(--clay-muted)", margin: "0 0 2px 0" }}
                  >
                    National Verification ID
                  </p>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "var(--clay-ink)",
                      margin: 0,
                    }}
                  >
                    {shipment.pickup.nationalId}
                  </p>
                </div>
                <div>
                  <p
                    style={{ color: "var(--clay-muted)", margin: "0 0 2px 0" }}
                  >
                    Release Date
                  </p>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "var(--clay-ink)",
                      margin: 0,
                    }}
                  >
                    {formatDate(shipment.pickup.pickupDate)}
                  </p>
                </div>
              </div>
              {shipment.pickup.remarks && (
                <div
                  style={{
                    marginTop: "12px",
                    borderTop: "1px solid var(--clay-hairline)",
                    paddingTop: "8px",
                  }}
                >
                  <p
                    style={{
                      color: "var(--clay-muted)",
                      fontSize: "12px",
                      margin: "0 0 2px 0",
                    }}
                  >
                    Pickup Remarks
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--clay-ink)",
                      margin: 0,
                      fontStyle: "italic",
                    }}
                  >
                    "{shipment.pickup.remarks}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Timeline Tracking */}
        <div
          style={{
            background: "var(--clay-canvas)",
            borderRadius: "var(--r-lg)",
            border: "1.5px solid var(--clay-hairline)",
            padding: "28px 32px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: "var(--clay-muted)",
              margin: "0 0 6px 0",
            }}
          >
            Audit Log
          </p>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "-0.3px",
              color: "var(--clay-ink)",
              margin: "0 0 24px 0",
            }}
          >
            Movement History
          </h2>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {shipment.statusHistory.map((item, index) => {
              const dotColor = DOT_COLORS[item.status] || "var(--clay-muted)";
              return (
                <div key={index} style={{ display: "flex", gap: "20px" }}>
                  {/* Dot & Line */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flexShrink: 0,
                      width: "20px",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: dotColor,
                        border: "2.5px solid var(--clay-canvas)",
                        boxShadow: `0 0 0 2px ${dotColor}`,
                        flexShrink: 0,
                        zIndex: 1,
                      }}
                    />
                    {index < shipment.statusHistory.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          width: "2px",
                          background: "var(--clay-hairline)",
                          minHeight: "45px",
                          marginTop: "4px",
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div
                    style={{
                      paddingBottom:
                        index < shipment.statusHistory.length - 1
                          ? "24px"
                          : "0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "3px",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "var(--clay-ink)",
                          margin: 0,
                        }}
                      >
                        {item.status}
                      </h4>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--clay-muted-soft)",
                        }}
                      >
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--clay-muted)",
                        margin: "0 0 2px 0",
                      }}
                    >
                      Location: {item.warehouse?.name || "Carrier / Fleet"}
                    </p>
                    {item.remarks && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--clay-muted-soft)",
                          margin: "0 0 2px 0",
                        }}
                      >
                        Remarks: {item.remarks}
                      </p>
                    )}
                    {item.updatedBy && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--clay-muted-soft)",
                          margin: 0,
                          fontStyle: "italic",
                        }}
                      >
                        Updated by: {item.updatedBy.name}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && (
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
              maxWidth: "480px",
              border: "1.5px solid var(--clay-hairline)",
            }}
          >
            <h3
              style={{
                fontSize: "22px",
                fontWeight: 600,
                letterSpacing: "-0.5px",
                margin: "0 0 8px 0",
              }}
            >
              Dispatch Shipment
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--clay-muted)",
                margin: "0 0 20px 0",
              }}
            >
              Authorize shipment dispatch. This transitions the status to{" "}
              <strong>DISPATCHED</strong>.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--clay-muted)",
                  textTransform: "uppercase",
                }}
              >
                Transit Vehicle & Driver details
              </label>
              <input
                type="text"
                placeholder="e.g. Truck TRK-902, Driver Salem Ali"
                value={dispatchRemarks}
                onChange={(e) => setDispatchRemarks(e.target.value)}
                className="clay-input"
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setShowDispatchModal(false)}
                className="clay-btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDispatchModal(false);
                  updateShipmentStatus("DISPATCHED", {
                    remarks: `Dispatched: ${dispatchRemarks}`,
                  });
                }}
                className="clay-btn-primary"
                style={{ flex: 1 }}
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Pickup / Complete Modal */}
      {showPickupModal && (
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
              maxWidth: "520px",
              border: "1.5px solid var(--clay-hairline)",
            }}
          >
            <h3
              style={{
                fontSize: "22px",
                fontWeight: 600,
                letterSpacing: "-0.5px",
                margin: "0 0 8px 0",
              }}
            >
              Release to Customer
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--clay-muted)",
                margin: "0 0 20px 0",
              }}
            >
              Please verify recipient identity details before completing the
              release.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowPickupModal(false);
                updateShipmentStatus("COMPLETED", {
                  remarks: `Released to recipient: ${pickupRemarks}`,
                  pickup: {
                    receiverName: pickupName,
                    receiverPhone: pickupPhone,
                    nationalId: pickupNationalId,
                    remarks: pickupRemarks,
                  },
                });
              }}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
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
                  Receiver Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Recipient name"
                  value={pickupName}
                  onChange={(e) => setPickupName(e.target.value)}
                  className="clay-input"
                />
              </div>

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
                  Receiver Phone
                </label>
                <input
                  type="text"
                  required
                  placeholder="Recipient mobile"
                  value={pickupPhone}
                  onChange={(e) => setPickupPhone(e.target.value)}
                  className="clay-input"
                />
              </div>

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
                  Verification National ID / Passport
                </label>
                <input
                  type="text"
                  required
                  placeholder="Recipient National ID number"
                  value={pickupNationalId}
                  onChange={(e) => setPickupNationalId(e.target.value)}
                  className="clay-input"
                />
              </div>

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
                  Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Signature verified, cash on delivery collected"
                  value={pickupRemarks}
                  onChange={(e) => setPickupRemarks(e.target.value)}
                  className="clay-input"
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowPickupModal(false)}
                  className="clay-btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-primary"
                  style={{ flex: 1 }}
                >
                  Complete Pickup & Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
