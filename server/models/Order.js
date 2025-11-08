// server/models/Order.js
const mongoose = require("mongoose");

/**
 * Daily token reset design (Option A):
 * - orderDate is stored as midnight (00:00:00) of the day the order is placed
 * - tokenNumber increments per day: 1,2,3...
 * - token = `QB-${tokenNumber}`
 * - Unique per-day constraint on (orderDate, tokenNumber)
 */

const OrderItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },

  items: { type: [OrderItemSchema], required: true },
  total: { type: Number, required: true },

  status: { type: String, enum: ["Pending","Preparing","Ready","Completed"], default: "Pending" },

  // Daily token fields
  orderDate: { type: Date, required: true },        // truncated to midnight
  tokenNumber: { type: Number, required: true },     // 1,2,3...
  token: { type: String, required: true },           // "QB-<tokenNumber>"

  createdAt: { type: Date, default: Date.now }
});

// unique per-day token (prevents duplicates)
OrderSchema.index({ orderDate: 1, tokenNumber: 1 }, { unique: true });

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
