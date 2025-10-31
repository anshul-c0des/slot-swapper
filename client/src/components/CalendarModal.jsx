import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import socket from "../socket";
import toast from "react-hot-toast";

export default function CalendarModal({
  open,
  setOpen,
  date,
  onEventAdded,
  event,
}) {
  const isEditMode = !!event;   // whether to add or edit event
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("BUSY");

  useEffect(() => {
    if (!open) return;
    if (isEditMode) {
      setTitle(event.title || "");
      setStartTime(
        event.start ? new Date(event.start).toISOString().slice(0, 16) : ""
      );
      setEndTime(
        event.end ? new Date(event.end).toISOString().slice(0, 16) : ""
      );
      setStatus(event.status || "BUSY");
    } else if (date) {
      const pad = (num) => num.toString().padStart(2, "0");
      const localISO = (date) =>
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
          date.getDate()
        )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
      setStartTime(localISO(date));
      setEndTime(localISO(date));
      setTitle("");
      setStatus("BUSY");
    }
  }, [open, event, date, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        const res = await axiosClient.put(`/events/${event.id}`, {
          title,
          startTime,
          endTime,
          status,
        });
        toast.success("Event updated!");
        socket.emit("eventUpdated", res.data);
      } else {
        const res = await axiosClient.post("/events", {
          title,
          startTime,
          endTime,
        });
        toast.success("Event created!");
        socket.emit("eventUpdated", res.data);
      }
      onEventAdded();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  const handleMarkSwappable = async () => {
    if (!isEditMode) return;
    try {
      const res = await axiosClient.put(`/events/${event.id}`, {
        ...event,
        status: "SWAPPABLE",
      });
      toast.success("Event marked as SWAPPABLE!");
      socket.emit("eventUpdated", res.data);
      onEventAdded();
      setOpen(false);
    } catch (err) {
      toast.error("Failed to mark as SWAPPABLE");
    }
  };

  const handleDelete = async () => {
    if (!isEditMode) return;
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await axiosClient.delete(`/events/${event.id}`);
      toast.success("Event deleted!");
      socket.emit("eventUpdated", { id: event.id, deleted: true });
      onEventAdded();
      setOpen(false);
    } catch (err) {
      toast.error("Failed to delete event");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 pointer-events-auto" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-96 max-w-full -translate-x-1/2 -translate-y-1/2 bg-gray-50 rounded-md p-6 shadow-lg z-50">
          <Dialog.Title className="text-2xl font-semibold mb-4 text-center text-blue-400">
            {isEditMode ? "Edit Event" : "Add Event"}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-md pb-1 font-medium ">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border w-full px-2 py-1 rounded focus:outline-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-md pb-1 font-medium">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border w-full px-2 py-1 rounded focus:outline-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-md pb-1 font-medium">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border w-full px-2 py-1 rounded focus:outline-blue-400"
                required
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              {isEditMode && (
                <>
                  <button
                    type="button"
                    onClick={handleMarkSwappable}
                    className="bg-green-100 text-green-500 px-3 py-1 mt-2 font-semibold transition cursor-pointer rounded-full border-2 border-transparent text-sm hover:bg-green-500 hover:border-green-500 hover:text-white"
                  >
                    Mark SWAPPABLE
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-100 text-red-500 px-3 py-1 mt-2 font-semibold text-sm transition cursor-pointer rounded-full border-2 border-transparent hover:bg-red-500 hover:border-red-500 hover:text-white"
                  >
                    Delete
                  </button>
                </>
              )}
              <button
                type="submit"
                className="text-blue-500 bg-blue-100 px-3 py-1 mt-2 font-semibold transition cursor-pointer rounded-full text-sm border-2 border-transparent hover:bg-blue-500 hover:border-blue-500 hover:text-white"
              >
                {isEditMode ? "Update" : "Create"}
              </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full hover:bg-gray-200 w-8 h-8">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
