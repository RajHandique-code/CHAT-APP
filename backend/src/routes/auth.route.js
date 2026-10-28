import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

const sign = (user) =>
  jwt.sign({ id: String(user._id), username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (user) => ({ id: String(user._id), username: user.username });

router.post("/signup", async (req, res) => {
  const username = (req.body.username || "").trim();
  const password = req.body.password || "";
  if (username.length < 3) return res.status(400).json({ error: "Username needs at least 3 characters" });
  if (password.length < 6) return res.status(400).json({ error: "Password needs at least 6 characters" });
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "Username is already taken" });
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  const username = (req.body.username || "").trim();
  const password = req.body.password || "";
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Wrong username or password" });
  }
  res.json({ token: sign(user), user: publicUser(user) });
});

export default router;
