import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import socket from "../../socket";
import SwapRequestModal from "../../components/SwapRequestModal";

export default function Marketplace() {
  const [slots, setSlots] = useState([]);
  const { user } = useAuth();
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const fetchSlots = async () => {
    try {
      const res = await axiosClient.get("/swappable-slots");
      setSlots(res.data.filter((s) => s.userId !== user._id));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMySwappableSlots = async () => {
    const res = await axiosClient.get("/events");
    setMySwappableSlots(res.data.filter((e) => e.status === "SWAPPABLE"));
  };

  useEffect(() => {
    fetchSlots();
    fetchMySwappableSlots();

    socket.on("newSwappableSlot", (slot) => {
      if (slot.userId !== user._id) setSlots((prev) => [...prev, slot]);
    });

    socket.on("swapResponseUpdate", ({ mySlotId, theirSlotId, status }) => {
      setSlots((prev) => prev.filter((s) => s._id !== theirSlotId));
      fetchMySwappableSlots();
      alert(`Swap ${status.toLowerCase()}!`);
    });

    return () => {
      socket.off("newSwappableSlot");
      socket.off("swapResponseUpdate");
    };
  }, []);

  const requestSwap = async (theirSlotId) => {
    if (mySwappableSlots.length === 0) return alert("No swappable slots to offer.");

    const mySlotId = mySwappableSlots[0]._id;
    await axiosClient.post("/swap-request", { mySlotId, theirSlotId });
    alert("Swap request sent!");
    const theirSlot = slots.find(s => s._id === theirSlotId);
    if (theirSlot) {
      socket.emit("newSwapRequest", { receiverId: theirSlot.userId });
    }
  };

  const handleRequestSwap = (theirSlotId) => {
    setSelectedSlotId(theirSlotId);
    setModalOpen(true);
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
              onClick={() => requestSwap(slot._id)}
            >
              Request Swap
            </button>
          </li>
        ))}
      </ul>
      <SwapRequestModal
        open={modalOpen}
        setOpen={setModalOpen}
        theirSlotId={selectedSlotId}
      />
    </div>
  );
}
