import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      <div className="flex gap-6 items-center">
        <Link to={user ? "/dashboard" : "/"} className="font-bold text-lg">SlotSwapper</Link>
        {user && (
          <>
            <Link
              to="/dashboard"
              className={`hover:text-gray-300 ${location.pathname === "/dashboard" ? "underline" : ""}`}
            >
              Dashboard
            </Link>
            <Link
              to="/marketplace"
              className={`hover:text-gray-300 ${location.pathname === "/marketplace" ? "underline" : ""}`}
            >
              Marketplace
            </Link>
            <Link
              to="/requests"
              className={`hover:text-gray-300 ${location.pathname === "/requests" ? "underline" : ""}`}
            >
              Requests
            </Link>
          </>
        )}
      </div>
      <div>
        {user ? (
          <button
            onClick={logout}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">Login</Link>
        )}
      </div>
    </nav>
  );
}
