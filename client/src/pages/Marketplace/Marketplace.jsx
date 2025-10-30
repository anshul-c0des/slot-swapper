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
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Marketplace - Swappable Slots</h2>
      {slots.length === 0 && <p>No swappable slots available.</p>}
      <ul>
        {slots.map((slot) => (
          <li key={slot._id} className="border p-2 my-1 rounded flex justify-between">
            <span>
              {slot.title} — {new Date(slot.startTime).toLocaleString()} to{" "}
              {new Date(slot.endTime).toLocaleString()} (Owner: {slot.userId})
            </span>
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
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
