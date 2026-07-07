import mongoose from "mongoose";

const settingSchema =
  new mongoose.Schema(
    {
      companyName: String,

      logo: String,

      email: String,

      phone: String,

      address: String,

      shipmentPrefix: {
        type: String,
        default: "LY"
      },

      timezone: {
        type: String,
        default:
          "Africa/Tripoli"
      },

      currency: {
        type: String,
        default: "LYD"
      }
    },
    {
      timestamps: true
    }
  );

export default mongoose.model(
  "Setting",
  settingSchema
);