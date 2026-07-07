import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    code: {
      type: String,
      unique: true,
      required: true
    },

    city: String,

    address: String,

    phone: String,

    managerName: String,

    latitude: Number,

    longitude: Number,

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    }
  },
  {
    timestamps: true
  }
);

warehouseSchema.index({
  city: 1
});

export default mongoose.model(
  "Warehouse",
  warehouseSchema
);