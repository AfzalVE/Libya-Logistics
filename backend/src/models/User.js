import mongoose from "mongoose";

const userSchema =
  new mongoose.Schema(
    {
      warehouse: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Warehouse"
      },

      role: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Role"
      },

      name: String,

      email: {
        type: String,
        unique: true
      },

      phone: String,

      password: String,

      status: {
        type: String,
        enum: [
          "ACTIVE",
          "SUSPENDED",
          "LOCKED"
        ],
        default: "ACTIVE"
      },

      lastLogin: Date,

      failedAttempts: {
        type: Number,
        default: 0
      },

      lockedUntil: Date
    },
    {
      timestamps: true
    }
  );

export default mongoose.model(
  "User",
  userSchema
);