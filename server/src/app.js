import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS setup for secure cookies
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Routes
app.use("/api/auth", authRoutes);

// Error handler
app.use(errorHandler);

export default app;
