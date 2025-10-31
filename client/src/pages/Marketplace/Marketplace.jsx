import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import socket from "../../socket";
import SwapRequestModal from "../../components/SwapRequestModal";

export default function Marketplace() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedTheirSlot, setSelectedTheirSlot] = useState(null);

  const fetchSlots = async () => {
    try {
      const res = await axiosClient.get("/swappable-slots");
      setSlots(res.data.filter((s) => s.userId !== user._id));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMySwappableSlots = async () => {
    try {
      const res = await axiosClient.get("/events");
      setMySwappableSlots(res.data.filter((e) => e.status === "SWAPPABLE"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchSlots();
    fetchMySwappableSlots();

    socket.on("newSwappableSlot", ({ slot }) => {
      if (slot?.userId !== user._id) {
        fetchSlots();
      }
    });

    socket.on("swapResponseUpdate", ({ mySlot, theirSlot, status }) => {
      fetchSlots();
      fetchMySwappableSlots();
    });

    return () => {
      socket.off("newSwappableSlot");
      socket.off("swapResponseUpdate");
    };
  }, [user]);

  const handleRequestSwapClick = (slot) => {
    setSelectedTheirSlot(slot);
    setSwapModalOpen(true);
  };

  return (
    <div className="p-6 bg-gray-50/30 h-[calc(100vh-5rem)]">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Marketplace - Swappable Slots</h2>
      {slots.length === 0 && <p className="text-gray-500 mt-2 text-lg">No swappable slots available. Check back later...</p>}
      <ul>
        {slots.map((slot) => (
          <li key={slot._id} className="border border-blue-400 hover:bg-blue-50 shadow-xs px-3 py-2 my-1 rounded-xl flex justify-between text-gray-700">
            <span>
              <span className="font-semibold text-gray-800 text-lg">{slot.title}</span> —  
              {new Date(slot.startTime).toLocaleString([], {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })} 
              {" "}to{" "} 
              {new Date(slot.endTime).toLocaleString([], {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })} <span className="text-gray-400">(OwnerId: {slot.userId})</span>
            </span>
            <button
              className="bg-blue-100 rounded-full font-semibold border-2 border-transparent text-blue-500 px-2 py-1  hover:bg-blue-500 hover:border-blue-500 hover:text-white cursor-pointer transition"
              onClick={() => handleRequestSwapClick(slot)}
            >
              Request Swap
            </button>
          </li>
        ))}
      </ul>

      <SwapRequestModal
        open={swapModalOpen}
        setOpen={setSwapModalOpen}
        theirSlot={selectedTheirSlot}
        onRequestSent={() => {
          fetchSlots();
          fetchMySwappableSlots();
        }}
      />
    </div>
  );
}
