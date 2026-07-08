import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    companyName: String,

    logo: String,

    email: String,

    phone: String,

    address: String,

    shipmentPrefix: {
      type: String,
      default: "LY",
    },

    timezone: {
      type: String,
      default: "Africa/Tripoli",
    },

    currency: {
      type: String,
      default: "LYD",
    },

    security: {
      passwordMinLength: {
        type: Number,
        default: 8,
      },

      maxLoginAttempts: {
        type: Number,
        default: 5,
      },

      sessionTimeoutMinutes: {
        type: Number,
        default: 60,
      },
    },

    shipment: {
      autoGenerateTracking: {
        type: Boolean,
        default: true,
      },

      defaultStatus: {
        type: String,
        default: "RECEIVED",
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Setting", settingSchema);
