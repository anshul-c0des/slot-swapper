import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";
import swapReqRoutes from "./routes/swapReqRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);   // auth routes
app.use("/api/events", eventRoutes);   // event routes
app.use("/api", swapRoutes);   // swap routes
app.use("/api", swapReqRoutes);   // swap request routes

// Error handler
app.use(errorHandler);

export default app;
