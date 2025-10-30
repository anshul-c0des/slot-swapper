import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

export default function SwapRequestModal({ open, setOpen, theirSlot, onRequestSent }) {
  const [mySlots, setMySlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (open) fetchMySlots();
  }, [open]);

  const fetchMySlots = async () => {
    try {
      const res = await axiosClient.get("/events");
      setMySlots(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your slots");
    }
  };

  const handleSendRequest = async () => {
    if (!selectedSlot) return toast.error("Select one of your slots");
    try {
      if (selectedSlot.status !== "SWAPPABLE") {
        return toast.error("You can only swap slots that are swappable.");
      }
      
      if (theirSlot.status !== "SWAPPABLE") {
        return toast.error("The other slot is not swappable.");
      }
      console.log("Sending swap request:", {
        mySlotId: selectedSlot?._id,
        theirSlotId: theirSlot?._id
      });
      await axiosClient.post("/swap-request", {
        mySlotId: selectedSlot._id,
        theirSlotId: theirSlot._id,
      });
      toast.success("Swap request sent!");
      onRequestSent();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send swap request");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 w-96 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow">
        <Dialog.Title className="text-lg font-semibold mb-4">Request Swap</Dialog.Title>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {mySlots.map(slot => (
            <div
              key={slot._id}
              className={`border p-2 rounded cursor-pointer ${selectedSlot?._id === slot._id ? "bg-blue-100" : ""}`}
              onClick={() => setSelectedSlot(slot)}
            >
              {slot.title}
              {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="bg-gray-200 px-3 py-1 rounded" onClick={() => setOpen(false)}>Cancel</button>
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleSendRequest}>Send Request</button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
