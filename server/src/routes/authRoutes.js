import express from "express";
import { signup, login, logout, getMe } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);   // register new user
router.post("/login", login);   // login existing user
router.post("/logout", verifyToken, logout);   // logout current user
router.get("/me", verifyToken, getMe);   // gets current logged in user

export default router;
