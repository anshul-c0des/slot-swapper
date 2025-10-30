import { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CalendarModal from "./CalendarModal";
import axiosClient from "../api/axiosClient";
import socket from "../socket";
import toast from "react-hot-toast";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const localizer = momentLocalizer(moment);

  const fetchEvents = async () => {
    try {
      const res = await axiosClient.get("/events");
      const formatted = res.data.map((e) => ({
        id: e._id,
        title: e.title,
        start: new Date(e.startTime),
        end: new Date(e.endTime),
        status: e.status,
      }));
      setEvents(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    socket.on("eventUpdated", (updatedEvent) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === updatedEvent._id ? { ...e, ...updatedEvent } : e))
      );
      toast.success(`Event updated: ${updatedEvent.title}`);
    });
  
    return () => {
      socket.off("eventUpdated");
    };
  }, []);

  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setModalOpen(true);
  };

  const handleEventAdded = () => {
    fetchEvents();
    setModalOpen(false);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  }

  return (
    <div className="p-6">
      <BigCalendar
        localizer={localizer} // <-- fixed
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />
      {modalOpen && (
        <CalendarModal
          open={modalOpen}
          setOpen={setModalOpen}
          date={selectedDate}
          onEventAdded={handleEventAdded}
          event={selectedEvent}
        />
      )}
    </div>
  );
}
