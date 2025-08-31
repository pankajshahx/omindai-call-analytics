const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "someverysecuresecret";

async function signup(username, password) {
  if (!username || !password) throw new Error("Username and password required");
  const existingUser = await User.findOne({ username });
  if (existingUser) throw new Error("Username already exists");

  const user = new User({ username, passwordHash: password });
  await user.save();
  return user;
}

async function login(username, password) {
  const user = await User.findOne({ username });
  if (!user) throw new Error("Invalid credentials");

  const valid = await user.comparePassword(password);
  if (!valid) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { userId: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  return { user, token };
}

async function getUserProfile(userId) {
  return User.findById(userId).select("-passwordHash"); // exclude passwordHash
}

module.exports = {
  signup,
  login,
  getUserProfile,
};
