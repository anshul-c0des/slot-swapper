import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full -mt-17  flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-blue-300 via-cyan-600 to-blue-600 text-white pt-20">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 drop-shadow-lg">
          Welcome to <span className="text-blue-200">SlotSwapper</span>
        </h1>

        <p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed">
          Effortlessly swap your calendar events with peers in real-time.
          <br />
          Stay flexible, stay connected.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <Link
            to="/login"
            className="bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:bg-gray-100 transition transform hover:scale-105"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-linear-to-r from-blue-500 to-indigo-600 font-semibold px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 transition transform hover:scale-105"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
