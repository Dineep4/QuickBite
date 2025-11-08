// ✅ Your UPI ID (change to your canteen UPI later)
const UPI_ID = "canteen123@oksbi";
const UPI_NAME = "College Canteen";

// ✅ Start UPI payment and then place order
async function startUPIPaymentAndPlaceOrder(cart) {
    if (!cart || cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let user = JSON.parse(localStorage.getItem("qb_user"));
    if (!user) {
        alert("Please login first.");
        return window.location.href = "student-login.html";
    }

    let totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    // ✅ Generate UPI URL
    const upiURL =
        `upi://pay?pa=${UPI_ID}` +
        `&pn=${encodeURIComponent(UPI_NAME)}` +
        `&am=${totalAmount}` +
        `&cu=INR`;

    // ✅ Open PhonePe / GPay / Paytm / BHIM
    window.location.href = upiURL;

    
    
}

// ✅ After payment, place order into backend
async function submitOrder(user, cart, totalAmount) {
    const payload = {
        studentId: user._id,
        studentName: user.name,
        items: cart.map(i => `${i.name} x${i.qty}`),
        total: totalAmount
    };

    const res = await fetch("http://localhost:3000/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.ok) {
        alert("✅ Order placed successfully!");
        localStorage.removeItem("qb_cart");
        window.location.href = "student-orders.html";
    } else {
        alert("❌ Failed: " + data.error);
    }
}
