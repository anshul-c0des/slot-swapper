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
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold ml-6">Welcome, <span className="text-blue-400">{user?.name
      ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
      : ""}</span></h1>

      <Calendar />

      <h2 className="mt-6 text-xl font-semibold ml-6 text-blue-400">Your Events:</h2>
      <ul className="mt-2 my-2">
        {events.map((e) => (
          <li key={e._id} className="border p-2 my-2 rounded-lg ml-6 border-blue-500 bg-blue-50/50">
            <span className="font-semibold text-blue-700">{e.title}</span> --  
            <span className="text-gray-600">
              {new Date(e.startTime).toLocaleString([], {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })} 
              {" "}to{" "} 
              {new Date(e.endTime).toLocaleString([], {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
