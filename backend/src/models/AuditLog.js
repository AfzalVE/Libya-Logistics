import mongoose from "mongoose";

const auditLogSchema =
  new mongoose.Schema({
    user: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    module: String,

    action: String,

    recordId: String,

    oldValues: Object,

    newValues: Object,

    ipAddress: String,

    userAgent: String
  });

export default mongoose.model(
  "AuditLog",
  auditLogSchema
);