import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash });
    generateToken(res, user._id);
    res.status(201).json({ message: "User created", user: { id: user._id, name, email } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    generateToken(res, user._id);
    res.json({ message: "Login successful", user: { id: user._id, name: user.name, email } });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out successfully" });
};
