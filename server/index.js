// ==========================
//  QuickBite Backend Server
// ==========================

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path'); // ✅ moved to top

const User = require('./models/User');
const Contact = require('./models/Contact');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/order');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quickbite';
const JWT_SECRET = process.env.JWT_SECRET || 'quickbite-demo-secret';

// Middleware
app.use(cors({ origin: true }));
app.use(bodyParser.json());

// Database Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((e) => console.error('❌ MongoDB connection error:', e));

// Auth Middleware
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
  } catch (e) {
    req.user = null;
  }
  next();
}
app.use(auth);

// Health Check
app.get('/api/health', (req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

// Contact API
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message)
    return res
      .status(400)
      .json({ error: 'name, email, and message are required' });
  const doc = await Contact.create({ name, email, message });
  res.status(201).json({ ok: true, item: doc.toJSON() });
});

// Register API
app.post('/api/register', async (req, res) => {
  const { name, email, password, phone, role } = req.body || {};
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ error: 'name, email and password are required' });

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) return res.status(409).json({ error: 'email already registered' });

  const hash = await bcrypt.hash(String(password), 10);
  const user = await User.create({
    name,
    email: String(email).toLowerCase(),
    phone: phone || '',
    passwordHash: hash,
    role: role === 'staff' ? 'staff' : 'student',
  });
  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.status(201).json({
    ok: true,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

// Login API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'email and password required' });

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  const match = await bcrypt.compare(String(password), user.passwordHash);
  if (!match) return res.status(401).json({ error: 'invalid credentials' });

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({
    ok: true,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

// STAFF LOGIN API  
const STAFF_USERNAME = 'canteenadmin';
const STAFF_PASSWORD = 'staff@123';

app.post('/api/staff/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === STAFF_USERNAME && password === STAFF_PASSWORD) {
    const token = jwt.sign(
      { role: 'staff', username: STAFF_USERNAME },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      ok: true,
      role: 'staff',
      token,
    });
  }

  return res.status(401).json({ ok: false, error: 'Invalid staff credentials' });
});

// Routers
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Debug Routes
app.get('/api/_debug/users', async (req, res) =>
  res.json(await User.find().select('-passwordHash -__v').sort({ createdAt: -1 }).lean())
);
app.get('/api/_debug/contacts', async (req, res) =>
  res.json(await Contact.find().sort({ createdAt: -1 }).lean())
);

// Serve static frontend files (✅ moved BEFORE app.listen)
app.use(express.static(path.join(__dirname, '../public')));

// Optional: redirect root (/) to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Server (✅ now last)
app.listen(PORT, () => console.log(`🚀 QuickBite backend running on port ${PORT}`));
