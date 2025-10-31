import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password);
      navigate("/dashboard");
      toast.success("Account created successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Signup failed!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen -mt-17 bg-linear-to-br from-blue-300 via-cyan-600 to-blue-600 pt-10 pb-16">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md text-gray-800">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-4">
          Sign Up
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Create your account to start swapping calendar events
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
          <button
            type="submit"
            className="bg-blue-200/60 text-blue-500 cursor-pointer border-2 border-transparent font-semibold py-2.5 rounded-lg hover:bg-blue-500 hover:border-blue-500 hover:text-white transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:underline font-semibold"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
