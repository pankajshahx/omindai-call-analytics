const authService = require("../services/authService");

exports.signup = async (req, res) => {
  try {
    const { username, password } = req.body;
    await authService.signup(username, password);
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const { user, token } = await authService.login(username, password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
      sameSite: "strict",
    });

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(401).json({ error: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
};

exports.profile = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
