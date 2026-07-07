import mongoose from "mongoose";

const permissionSchema =
  new mongoose.Schema(
    {
      name: String,

      slug: {
        type: String,
        unique: true
      },

      module: String
    },
    {
      timestamps: true
    }
  );

export default mongoose.model(
  "Permission",
  permissionSchema
);