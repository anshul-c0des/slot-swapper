import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-r from-blue-500 to-indigo-600 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to SlotSwapper</h1>
      <p className="mb-6 text-lg">Swap your calendar events with peers in real-time!</p>
      <div className="flex gap-4">
        <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200">Login</Link>
        <Link to="/signup" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200">Sign Up</Link>
      </div>
    </div>
  );
}
