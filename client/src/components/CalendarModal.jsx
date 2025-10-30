import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import socket from "../socket";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom"

export default function CalendarModal({ open, setOpen, date, onEventAdded, event }) {
  const isEditMode = !!event;
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("BUSY");

  useEffect(() => {
    if (!open) return;
    if (isEditMode) {
      setTitle(event.title || "");
      setStartTime(event.start ? new Date(event.start).toISOString().slice(0, 16) : "");
      setEndTime(event.end ? new Date(event.end).toISOString().slice(0, 16) : "");
      setStatus(event.status || "BUSY");
    } else if (date) {
      const pad = (num) => num.toString().padStart(2, "0");
      const localISO = (date) =>
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
        const res = await axiosClient.put(`/events/${event.id}`, { title, startTime, endTime, status });
        toast.success("Event updated!");
        socket.emit("eventUpdated", res.data);
      } else {
        const res = await axiosClient.post("/events", { title, startTime, endTime });
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
      const res = await axiosClient.put(`/events/${event.id}`, { ...event, status: "SWAPPABLE" });
      toast.success("Event marked as SWAPPABLE!");
      socket.emit("eventUpdated", res.data);
      onEventAdded();
      setOpen(false);
    } catch (err) {
      console.error(err);
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
      console.error(err);
      toast.error("Failed to delete event");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 pointer-events-auto" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-96 max-w-full -translate-x-1/2 -translate-y-1/2 bg-white rounded-md p-6 shadow-lg z-50">
          <Dialog.Title className="text-xl font-semibold mb-4">{isEditMode ? "Edit Event" : "Add Event"}</Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="border w-full px-2 py-1 rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Start Time</label>
              <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="border w-full px-2 py-1 rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium">End Time</label>
              <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="border w-full px-2 py-1 rounded" required />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              {isEditMode && (
                <>
                  <button type="button" onClick={handleMarkSwappable} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Mark SWAPPABLE</button>
                  <button type="button" onClick={handleDelete} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                </>
              )}
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{isEditMode ? "Update" : "Create"}</button>
            </div>

          </form>

          <Dialog.Close asChild>
            <button className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full hover:bg-gray-200 w-6 h-6">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
