import mongoose from "mongoose";

const customerSchema =
  new mongoose.Schema(
    {
      name: String,

      mobile: {
        type: String,
        index: true
      },

      alternateMobile: String,

      address: String,

      nationalId: String,

      email: String,

      notes: String
    },
    {
      timestamps: true
    }
  );

export default mongoose.model(
  "Customer",
  customerSchema
);