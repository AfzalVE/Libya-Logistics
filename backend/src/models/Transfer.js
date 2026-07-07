import mongoose from "mongoose";

const transferSchema = new mongoose.Schema(
  {
    transferNumber: {
      type: String,
      unique: true,
    },

    originWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },

    destinationWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },

    shipments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shipment",
      },
    ],

    vehicleNumber: String,

    driverName: String,

    driverPhone: String,

    dispatchDate: Date,

    receiveDate: Date,

    status: {
      type: String,
      enum: [
        "PENDING",
        "DISPATCHED",
        "COMPLETED",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Transfer",
  transferSchema
);