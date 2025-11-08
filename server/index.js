const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('./models/User');
const Contact = require('./models/Contact');

const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/order');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quickbite';
const JWT_SECRET = process.env.JWT_SECRET || 'quickbite-demo-secret';

app.use(cors({ origin: true }));
app.use(bodyParser.json());

// DB
mongoose.connect(MONGO_URI).then(()=>console.log('Connected to MongoDB')).catch(e=>console.error('Mongo error:', e));

// auth middleware
function auth(req, res, next){
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token){ req.user=null; return next(); }
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
  }catch(e){ req.user=null; }
  next();
}
app.use(auth);

// health
app.get('/api/health', (req, res)=> res.json({ ok:true, time: new Date().toISOString() }));

// contact
app.post('/api/contact', async (req,res)=>{
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error:'name, email and message are required' });
  const doc = await Contact.create({ name, email, message });
  res.status(201).json({ ok:true, item: doc.toJSON() });
});

// register
app.post('/api/register', async (req,res)=>{
  const { name, email, password, phone, role } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error:'name, email and password required' });
  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) return res.status(409).json({ error:'email already registered' });
  const hash = await bcrypt.hash(String(password), 10);
  const user = await User.create({ name, email: String(email).toLowerCase(), phone: phone||'', passwordHash: hash, role: role==='staff' ? 'staff' : 'student' });
  const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn:'7d' });
  res.status(201).json({ ok:true, user: { id:user._id.toString(), name:user.name, email:user.email, role:user.role }, token });
});

// login
app.post('/api/login', async (req,res)=>{
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error:'email and password required' });
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(401).json({ error:'invalid credentials' });
  const match = await bcrypt.compare(String(password), user.passwordHash);
  if (!match) return res.status(401).json({ error:'invalid credentials' });
  const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn:'7d' });
  res.json({ ok:true, user: { id:user._id.toString(), name:user.name, email:user.email, role:user.role }, token });
});

// STAFF LOGIN API  
const STAFF_USERNAME = "canteenadmin";
const STAFF_PASSWORD = "staff@123";

app.post("/api/staff/login", async (req, res) => {
  const { username, password } = req.body;

  if (username === STAFF_USERNAME && password === STAFF_PASSWORD) {
    const token = jwt.sign(
      { role: "staff", username: STAFF_USERNAME },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      ok: true,
      role: "staff",
      token
    });
  }

  return res.status(401).json({ ok: false, error: "Invalid staff credentials" });
});


// routers
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// debug
app.get('/api/_debug/users', async (req,res)=> res.json(await User.find().select('-passwordHash -__v').sort({createdAt:-1}).lean()));
app.get('/api/_debug/contacts', async (req,res)=> res.json(await Contact.find().sort({createdAt:-1}).lean()));

app.listen(PORT, ()=>console.log(`QuickBite backend listening on port ${PORT}`));

// MENU SCHEMA
const menuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String
});


app.post("/api/menu/add", async (req, res) => {
  const { name, price, description } = req.body;

  try {
    await MenuItem.create({ name, price, description });
    res.json({ ok: true, message: "Item added!" });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.get("/api/menu/list", async (req, res) => {
  const items = await MenuItem.find();
  res.json({ ok: true, items });
});

app.use("/api/orders", require("./routes/order"));

// server/index.js
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files from project root (adjust if your files are in different folder)
app.use(express.static(path.join(__dirname, '..')));

// If using API routes, require them here:
// const apiRouter = require('./routes/api');
// app.use('/api', apiRouter);

// Fallback for SPA / direct html file requests (optional)
app.get('*', (req, res) => {
  // If you want index.html for all unknown routes (frontend router)
  // res.sendFile(path.join(__dirname, '..', 'index.html'));

  // Otherwise let static serve requested HTML (so no action needed)
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
