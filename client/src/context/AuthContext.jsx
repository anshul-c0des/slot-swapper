import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";
import socket from "../socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  useEffect(() => {
    if(!user) return;

    if(!socket.connected){
      socket.connect();
    }
    socket.emit("register", user._id || user.id);

    socket.on("newRequest", (data) => {
      toast.success(data.message);
    });

    socket.on("responseUpdate", (data) => {
      toast.success(data.message);
    });
    return () => {
      socket.off("newRequest");
      socket.off("responseUpdate");
    };
  }, [user]);

  const login = async (email, password) => {
    const res = await axiosClient.post("/auth/login", { email, password });
    setUser(res.data.user);
  };

  const signup = async (name, email, password) => {
    const res = await axiosClient.post("/auth/signup", { name, email, password });
    setUser(res.data.user);
  };

  const logout = async () => {
    await axiosClient.post("/auth/logout");
    socket.disconnect();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
