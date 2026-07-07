import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },

    remarks: String,

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const pickupSchema = new mongoose.Schema(
  {
    receiverName: String,

    receiverPhone: String,

    nationalId: String,

    pickupDate: Date,

    remarks: String,

    signaturePath: String,

    photoPath: String,

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    _id: false,
  }
);

const shipmentSchema = new mongoose.Schema(
  {
    shipmentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    barcode: {
      type: String,
      unique: true,
      sparse: true,
    },

    qrCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    bookingDate: {
      type: Date,
      default: Date.now,
    },

    originWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    destinationWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    senderCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    receiverCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    goodsDescription: {
      type: String,
      trim: true,
    },

    packageCount: {
      type: Number,
      default: 1,
      min: 1,
    },

    weight: {
      type: Number,
      default: 0,
      min: 0,
    },

    declaredValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    remarks: String,

    currentStatus: {
      type: String,
      enum: [
        "BOOKED",
        "STORED",
        "READY_FOR_DISPATCH",
        "DISPATCHED",
        "IN_TRANSIT",
        "RECEIVED",
        "READY_FOR_PICKUP",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "BOOKED",
    },

    currentWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },

    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    statusHistory: [statusHistorySchema],

    pickup: pickupSchema,
  },
  {
    timestamps: true,
  }
);

shipmentSchema.index({
  shipmentNumber: "text",
});

shipmentSchema.index({
  currentStatus: 1,
});

shipmentSchema.index({
  bookingDate: -1,
});

shipmentSchema.index({
  currentStatus: 1,
  bookingDate: -1,
});

export default mongoose.models.Shipment ||
  mongoose.model("Shipment", shipmentSchema);
