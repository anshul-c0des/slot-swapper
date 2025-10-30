import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Calendar from "../../components/Calendar";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await axiosClient.get("/events");
      setEvents(res.data);
    };
    fetchEvents();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <button
        onClick={logout}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>

      <Calendar />

      <h2 className="mt-6 text-xl font-semibold">Your Events:</h2>
      <ul className="mt-2">
        {events.map((e) => (
          <li key={e._id} className="border p-2 my-1 rounded">
            {e.title} — {new Date(e.startTime).toLocaleString()} to {new Date(e.endTime).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
