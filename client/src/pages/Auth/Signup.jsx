import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(form.name, form.email, form.password);
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 p-6 shadow-lg rounded bg-white w-80"
      >
        <h2 className="text-xl font-semibold text-center">Sign Up</h2>
        <input
          name="name"
          placeholder="Name"
          className="border p-2"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          className="border p-2"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border p-2"
          value={form.password}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
