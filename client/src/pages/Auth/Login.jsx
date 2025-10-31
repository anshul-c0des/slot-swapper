import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
      toast.success("Logged in successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Login failed!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen -mt-17 bg-linear-to-br from-blue-300 via-cyan-600 to-blue-600">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md text-gray-800">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-4">
          Login
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Access your calendar and manage your swap events
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            className="bg-blue-200/60 text-blue-500 cursor-pointer border-2 border-transparent font-semibold py-2.5 rounded-lg hover:bg-blue-500 hover:border-blue-500 hover:text-white transition "
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-blue-600 hover:underline font-semibold"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
