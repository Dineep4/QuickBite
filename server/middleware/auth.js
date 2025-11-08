const jwt = require("jsonwebtoken");
const JWT_SECRET = "QUICKBITE_SECRET";

module.exports = function (req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user; 
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
