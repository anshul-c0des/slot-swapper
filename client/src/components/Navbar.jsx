import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isLogin = location.pathname === "/login";
  const isSignup = location.pathname === "/signup";

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-100/70 backdrop-blur-sm px-4 sm:px-6 md:px-8 py-3 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 md:gap-6">
        <Link
          to={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-bold text-xl sm:text-2xl md:text-3xl text-blue-500"
        >
          <img src="/logo.png" alt="LOGO" className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="max-w-[100px] sm:max-w-[150px]">SlotSwapper</span>
        </Link>

        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-4 text-sm sm:text-base md:text-lg font-semibold">
          {user && (
            <>
              {["dashboard", "marketplace", "requests"].map((path) => (
                <Link
                  key={path}
                  to={`/${path}`}
                  className={`border-2 border-transparent px-2 sm:px-3 py-1 rounded-full transition text-blue-500 ${
                    location.pathname === `/${path}`
                      ? "bg-blue-500 text-white border-blue-500"
                      : "hover:bg-blue-100/60"
                  }`}
                >
                  {path.charAt(0).toUpperCase() + path.slice(1)}
                </Link>
              ))}
            </>
          )}
        </div>

        <div className="flex gap-2 sm:gap-4 items-center">
          {user ? (
            <button
              onClick={logout}
              className="bg-red-100/60 text-red-500 border-2 border-transparent px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base rounded-full font-semibold hover:bg-red-500 hover:text-white hover:border-red-500 transition"
            >
              Logout
            </button>
          ) : !isHome ? (
            isLogin ? (
              <Link
                to="/signup"
                className="bg-blue-100 text-blue-500 border-2 border-transparent px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base rounded-full font-semibold hover:bg-blue-500 hover:text-white hover:border-blue-500 transition"
              >
                Sign Up
              </Link>
            ) : isSignup ? (
              <Link
                to="/login"
                className="bg-blue-100 text-blue-500 border-2 border-transparent px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base rounded-full font-semibold hover:bg-blue-500 hover:text-white hover:border-blue-500 transition"
              >
                Login
              </Link>
            ) : null
          ) : null}
        </div>
      </div>
    </nav>
  );
}
