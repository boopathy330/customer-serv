const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const TransactionSchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    productId: [
      { type: Schema.Types.ObjectId, ref: "Product", required: true },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
