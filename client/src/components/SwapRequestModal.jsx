import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function SwapRequestModal({ open, setOpen, theirSlotId }) {
  const { user } = useAuth();
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  useEffect(() => {
    if (!open) return;
    const fetchMySwappableSlots = async () => {
      try {
        const res = await axiosClient.get("/events");
        setMySwappableSlots(
          res.data.filter((e) => e.status === "SWAPPABLE")
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchMySwappableSlots();
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return alert("Select one of your swappable slots!");
    try {
      await axiosClient.post("/swap-request", {
        mySlotId: selectedSlot,
        theirSlotId,
      });
      alert("Swap request sent!");
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error sending swap request");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Request Swap</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label>Select your slot to offer:</label>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">-- Select Slot --</option>
            {mySwappableSlots.map((slot) => (
              <option key={slot._id} value={slot._id}>
                {slot.title} — {new Date(slot.startTime).toLocaleString()} to{" "}
                {new Date(slot.endTime).toLocaleString()}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded border hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
