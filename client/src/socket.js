import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
  withCredentials: true,
  autoConnect: false,
});

export default socket;
