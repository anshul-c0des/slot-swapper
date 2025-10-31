import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

export default function SwapRequestModal({
  open,
  setOpen,
  theirSlot,
  onRequestSent,
}) {
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
        theirSlotId: theirSlot?._id,
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
      <Dialog.Content className="fixed top-1/2 left-1/2 w-160 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow">
        <Dialog.Title className="text-2xl font-semibold mb-4 text-center text-blue-400">
          Request Swap
        </Dialog.Title>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {mySlots.map((slot) => (
            <div
              key={slot._id}
              className={`border border-blue-400 p-2 rounded cursor-pointer ${
                selectedSlot?._id === slot._id ? "bg-blue-100" : ""
              }`}
              onClick={() => setSelectedSlot(slot)}
            >
              <span className="text-gray-800 font-semibold">
                {slot.title} --{" "}
              </span>
              {new Date(slot.startTime).toLocaleString([], {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              to{" "}
              {new Date(slot.endTime).toLocaleString([], {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="bg-gray-100 px-3 py-1 rounded-full transition border-2 border-transparent hover:bg-gray-300 hover:border-gray-300 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button
            className="bg-blue-100 text-blue-500 px-3 py-1 rounded-full transition border-2 border-transparent hover:bg-blue-500 hover:border-blue-500 hover:text-white font-semibold cursor-pointer"
            onClick={handleSendRequest}
          >
            Send Request
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
