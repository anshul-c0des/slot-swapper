import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

const userSocketMap = new Map();

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  socket.on("register", (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`Registered user ${userId} with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
    for (const [uid, sid] of userSocketMap.entries()) {
      if (sid === socket.id) userSocketMap.delete(uid);
    }
  });
});

export const notifyUser = (userId, event, data) => {
  if (!userId) {
    io.emit(event, data);
    return;
  }
  const idStr = userId.toString ? userId.toString() : userId;
  const socketId = userSocketMap.get(idStr);
  if (socketId) io.to(socketId).emit(event, data);
};



// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
