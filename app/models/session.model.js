const mongoose = require("mongoose");

const sessionSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    refreshToken: { type: String, required: true, index: { unique: true } },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Session", sessionSchema);
