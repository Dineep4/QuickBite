// ===============================
// GLOBAL API URL
// ===============================
window.API_BASE_URL = "http://localhost:3000";

// ===============================
// API POST helper
// ===============================
async function apiPost(path, body) {
  const res = await fetch(window.API_BASE_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { ok: false, raw: text }; }
}

// ===============================
// STUDENT REGISTER
// ===============================
async function handleRegister() {
  const form = document.getElementById("registerForm");
  const msg = document.getElementById("registerMsg");

  msg.style.display = "block";
  msg.style.color = "gray";
  msg.textContent = "Creating account...";

  const fd = new FormData(form);

  const payload = {
    name: fd.get("name"),
    email: fd.get("email"),
    password: fd.get("password"),
    phone: fd.get("phone"),
    role: "student"
  };

  try {
    const json = await apiPost("/api/register", payload);

    if (json.ok) {
      msg.style.color = "green";
      msg.textContent = "Account created! Redirecting...";
      setTimeout(() => (window.location.href = "student-login.html"), 800);
    } else {
      msg.style.color = "red";
      msg.textContent = json.error || "Registration failed";
    }
  } catch (err) {
    msg.style.color = "red";
    msg.textContent = "Network error";
  }
}

// ===============================
// STUDENT LOGIN
// ===============================
async function handleLogin() {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");

  msg.style.display = "block";
  msg.textContent = "Checking...";

  const fd = new FormData(form);
  const payload = {
    email: fd.get("email"),
    password: fd.get("password")
  };

  try {
    const json = await apiPost("/api/login", payload);

    if (json.ok) {
      localStorage.setItem("qb_user", JSON.stringify(json.user));
      localStorage.setItem("qb_token", json.token);

      msg.style.color = "green";
      msg.textContent = "Login successful!";

      setTimeout(() => {
        window.location.href = "student-dashboard.html";
      }, 800);

    } else {
      msg.style.color = "red";
      msg.textContent = json.error || "Invalid credentials";
    }
  } catch {
    msg.style.color = "red";
    msg.textContent = "Network error";
  }
}


// ===============================
// STAFF LOGIN
// ===============================
async function handleStaffLogin() {
  const form = document.getElementById("staffLoginForm");
  const msg = document.getElementById("staffLoginMsg");

  msg.style.display = "block";
  msg.textContent = "Checking...";

  const fd = new FormData(form);

  const payload = {
    username: fd.get("username"),
    password: fd.get("password")
  };

  try {
    const json = await apiPost("/api/staff/login", payload);

    if (json.ok) {
      localStorage.setItem("staff_token", json.token);

      msg.style.color = "green";
      msg.textContent = "Login successful!";

      setTimeout(() => {
        window.location.href = "staff-dashboard.html"; 
      }, 800);

    } else {
      msg.style.color = "red";
      msg.textContent = json.error || "Invalid staff login";
    }
  } catch {
    msg.style.color = "red";
    msg.textContent = "Network error";
  }
}

async function addMenuItem() {
  const form = document.getElementById("staffMenuForm");
  const msg = document.getElementById("msg");

  const fd = new FormData(form);
  const payload = {
    name: fd.get("name"),
    price: Number(fd.get("price"))
  };

  msg.style.display = "block";
  msg.style.color = "gray";
  msg.textContent = "Adding item...";

  try {
    const json = await apiPost("/api/menu/add", payload);

    if (json.ok) {
      msg.style.color = "lightgreen";
      msg.textContent = "✅ Item added successfully!";

      // Reset form after adding
      form.reset();

      // Clear message after 1.5 seconds
      setTimeout(() => {
        msg.style.display = "none";
      }, 1500);

    } else {
      msg.style.color = "red";
      msg.textContent = json.error || "Failed to add item";
    }

  } catch (err) {
    msg.style.color = "red";
    msg.textContent = "Network error";
  }
}

const MenuItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  createdAt: { type: Date, default: Date.now }
});

router.get("/student/:id", async (req, res) => {
  try {
    const orders = await Order.find({ studentId: req.params.id })
      .sort({ createdAt: -1 });

    res.json({ ok: true, orders });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});
