import mongoose from "mongoose";

const notificationSchema =
  new mongoose.Schema({
    user: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    title: String,

    message: String,

    type: String,

    isRead: {
      type: Boolean,
      default: false
    }
  });

export default mongoose.model(
  "Notification",
  notificationSchema
);