// server/routes/order.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

/** Helpers **/
function todayMidnight(d = new Date()) {
  const t = new Date(d);
  t.setHours(0,0,0,0);
  return t;
}

/**
 * Compute next token number for today:
 * Finds the maximum tokenNumber for today's orderDate and returns +1
 */
async function getNextTokenNumber() {
  const od = todayMidnight();
  const latest = await Order.findOne({ orderDate: od }).sort({ tokenNumber: -1 }).lean();
  return latest ? latest.tokenNumber + 1 : 1;
}

/** ---------------------------
 * STUDENT: Place Order
 * Body: { studentId, studentName, items: [{itemId, name, price, qty}], total }
 * Returns: { ok, order }
 * -------------------------- */
router.post("/place", async (req, res) => {
  try {
    const { studentId, studentName, items, total } = req.body;

    if (!studentId || !studentName) {
      return res.json({ ok: false, error: "Missing student info" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ ok: false, error: "No items provided" });
    }
    if (typeof total !== "number" || total <= 0) {
      return res.json({ ok: false, error: "Invalid total" });
    }

    // optional: verify current item prices from DB (to prevent tampering)
    const ids = items.map(i => i.itemId);
    const dbItems = await MenuItem.find({ _id: { $in: ids } }).lean();

    let recomputedTotal = 0;
    const normalized = items.map(i => {
      const found = dbItems.find(d => String(d._id) === String(i.itemId));
      if (!found) return null;
      const qty = Math.max(1, Number(i.qty || 1));
      recomputedTotal += found.price * qty;
      return {
        itemId: found._id,
        name: found.name,
        price: found.price,
        qty
      };
    }).filter(Boolean);

    if (normalized.length === 0) {
      return res.json({ ok: false, error: "No valid items" });
    }

    // If you want to trust frontend total, comment next line
    const finalTotal = recomputedTotal;

    // token for today
    const od = todayMidnight();
    const tokenNumber = await getNextTokenNumber();
    const token = `QB-${tokenNumber}`;

    const order = await Order.create({
      studentId,
      studentName,
      items: normalized,
      total: finalTotal,
      status: "Pending",
      orderDate: od,
      tokenNumber,
      token
    });

    return res.json({ ok: true, order });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
});

/** ---------------------------
 * STUDENT: My Orders
 * GET /api/orders/me/:studentId
 * -------------------------- */
router.get("/me/:studentId", async (req, res) => {
  try {
    const orders = await Order.find({ studentId: req.params.studentId })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ ok: true, orders });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
});

/** ---------------------------
 * STAFF: View All Orders (newest first)
 * -------------------------- */
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, orders });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
});

/** ---------------------------
 * STAFF: Update Status (one click)
 * Body: { status }
 * -------------------------- */
router.patch("/status/:id", async (req, res) => {
  try {
    const allowed = ["Pending","Preparing","Ready","Completed"];
    const { status } = req.body || {};
    if (!allowed.includes(status)) {
      return res.json({ ok: false, error: "Invalid status" });
    }
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    return res.json({ ok: true, updated });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
});

/** ---------------------------
 * DASHBOARD STATS
 * -------------------------- */
router.get("/stats/today", async (req, res) => {
  try {
    const od = todayMidnight();
    const count = await Order.countDocuments({ orderDate: od });
    return res.json({ ok: true, todayOrders: count });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
});

router.get("/stats/pending", async (req, res) => {
  try {
    const count = await Order.countDocuments({ status: "Pending" });
    return res.json({ ok: true, pending: count });
  } catch (err) {
    return res.json({ ok: false, error: err.message });
  }
});

module.exports = router;
