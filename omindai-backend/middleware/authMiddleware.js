const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "someverysecuresecret";

exports.authenticate = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user payload to request
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
