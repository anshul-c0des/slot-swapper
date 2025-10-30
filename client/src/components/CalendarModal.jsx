import { useState } from "react";
import Modal from "./Modal";
import axiosClient from "../api/axiosClient";

export default function CalendarModal({ open, setOpen, date, onEventAdded, event }) {
  const [title, setTitle] = useState(event?.title || "");
  const [startTime, setStartTime] = useState( event ? event.start.toISOString().slice(0, 16) : date.toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(event ? event.end.toISOString().slice(0, 16) : date.toISOString().slice(0, 16));
  const [swappable, setSwappable] = useState(event?.status || "SWAPPABLE");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (event) {
        await axiosClient.put(`/events/${event.id}`, {
          title,
          startTime,
          endTime,
          status: swappable ? "SWAPPABLE" : "BUSY",
        });
      } else {
        await axiosClient.post("/events", {
          title,
          startTime,
          endTime,
          status: swappable ? "SWAPPABLE" : "BUSY",
        });
      }
      onEventAdded();
    } catch (err) {
      console.error(err);
    }
  };
  

  return (
    <Modal open={open} setOpen={setOpen} title="Add Event">
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Event Title"
          className="border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label>
          Start Time:
          <input
            type="datetime-local"
            className="border p-2 rounded w-full"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </label>
        <label>
          End Time:
          <input
            type="datetime-local"
            className="border p-2 rounded w-full"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </label>
        <label className="flex items-center gap-2">
            <input
            type="checkbox"
            checked={swappable}
            onChange={(e) => setSwappable(e.target.checked)}
            />
            Mark as Swappable
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
        >
          Add Event
        </button>
      </form>
    </Modal>
  );
}
