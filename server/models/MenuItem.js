const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports =
  mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
