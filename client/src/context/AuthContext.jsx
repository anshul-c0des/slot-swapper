import { createContext, useContext, useState } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

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
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
