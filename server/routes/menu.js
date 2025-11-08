const express = require("express");
const MenuItem = require("../models/MenuItem");
const router = express.Router();

// Add Menu Item
router.post("/add", async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    await item.save();
    res.json({ ok: true, item });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Get All Menu Items
router.get("/all", async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json({ ok: true, items });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Delete Item
router.delete("/delete/:id", async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Update Item
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ ok: true, item: updated });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

module.exports = router;
