const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const dotenv = require("dotenv");
const { generateFakeAddress } = require("../utils/generateFakeWalletAddress");



const router = express.Router();
dotenv.config();

const generateToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// ✅ Initiate Google OAuth (🚀 Fix: Added this route)
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ Google OAuth Callback (🚀 Fix: Changed redirect to JSON)
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const { displayName, email, id } = req.user;
      const isVerified = email.verified;

      if (!isVerified)
        return res
          .status(400)
          .json({ message: "Verify email with Google first." });

      let user = await User.findOne({ email });

      if (user && !user.googleId)
        return res.status(400).json({ message: "Use password login instead." });
      if (user && user.googleId !== id)
        return res
          .status(400)
          .json({ message: "Another Google account exists with this email." });

      if (!user) {
        // userId for the smart contract
        user = new User({
          name: displayName,
          email,
          googleId: id,
          wallet: generateFakeAddress(),
        });
        await user.save();
      }

      const token = generateToken(user);
      res
        .cookie("token", token, { httpOnly: true })
        .json({ message: "Google Login Successful", token });
    } catch (error) {
      console.log(error);

      console.error("Google OAuth Error:", error);
      res.redirect("/login");
    }
  }
);

// ✅ Manual Registration
router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!password)
    return res.status(400).json({ message: "Password is required" });

  let user = await User.findOne({ email });
  if (user) {
    if (user.googleId)
      return res
        .status(400)
        .json({ message: "Email registered via Google. Log in with Google." });
    return res
      .status(400)
      .json({ message: "Email already registered. Please log in." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user = new User({
    name,
    email,
    phone,
    password: hashedPassword,
    hasPassword: true,
    wallet: generateFakeAddress(),
  });
  await user.save();

  const token = generateToken(user);
  res
    .cookie("token", token, { httpOnly: true })
    .status(201)
    .json({ message: "User registered", token });
});

// ✅ Manual Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not found" });
  if (user.googleId && !user.hasPassword)
    return res.status(400).json({ message: "Use Google login" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = generateToken(user);
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({ message: "Login successful", token,user});
});

// ✅ Set Password for Google Users
router.post("/set-password", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not found" });
  if (!user.googleId)
    return res.status(400).json({ message: "Password already set" });

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.hasPassword = true;
  await user.save();

  res.status(200).json({ message: "Password set successfully" });
});

module.exports = router;

// 🟢 Logout (Clears JWT Cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax'
  });
  res.status(200).json({ message: 'Logged out successfully' });
});