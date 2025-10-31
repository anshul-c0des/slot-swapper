import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import socket from "../socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // current user
  const [loading, setLoading] = useState(true);   // loading state

  useEffect(() => {   // fetch logged in user on mount
    const fetchUser = async () => {
      try {
        const res = await axiosClient.get("/auth/me");
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {   // initialise socket listeners on mount
    if (!user) return;

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("register", user._id || user.id);

    socket.on("newSwapRequest", (data) => {   // listens for new request
      toast.success(data.message);
    });

    socket.on("swapResponseUpdate", (data) => {   // listens for event update
      toast.success(
        data.message || `Swap ${data?.status?.toLowerCase?.() || "update"}`
      );
    });
    return () => {
      socket.off("newSwapRequest");
      socket.off("swapResponseUpdate");
    };
  }, [user]);

  const login = async (email, password) => {
    const res = await axiosClient.post("/auth/login", { email, password });
    setUser(res.data.user);
  };

  const signup = async (name, email, password) => {
    const res = await axiosClient.post("/auth/signup", {
      name,
      email,
      password,
    });
    setUser(res.data.user);
  };

  const logout = async () => {
    await axiosClient.post("/auth/logout");
    socket.disconnect();
    toast.success("Logged out successfully!");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
