import { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CalendarModal from "./CalendarModal";
import axiosClient from "../api/axiosClient";
import socket from "../socket";
import toast from "react-hot-toast";

const localizer = momentLocalizer(moment);   // date parsing for react-big-calendar
export default function Calendar() {
  const [events, setEvents] = useState([]);   // events to display
  const [modalOpen, setModalOpen] = useState(false);   // modal toggle
  const [selectedDate, setSelectedDate] = useState(null);   // current selected date
  const [selectedEvent, setSelectedEvent] = useState(null);   // current selected event
  const [currentDate, setCurrentDate] = useState(new Date());   // current date for nav
  const [currentView, setCurrentView] = useState("month");   // current view for nav

  const fetchEvents = async () => {   // fetch all user events
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

  useEffect(() => {   // event update listener
    socket.on("eventUpdated", (updatedEvent) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === (updatedEvent.id || updatedEvent._id)
            ? {
                ...e,
                ...updatedEvent,
                id: updatedEvent.id || updatedEvent._id,
                title: updatedEvent.title,
                start: new Date(updatedEvent.startTime || updatedEvent.start),
                end: new Date(updatedEvent.endTime || updatedEvent.end),
                status: updatedEvent.status,
              }
            : e
        )
      );
      toast.success(`Event updated: ${updatedEvent.title}`);
    });

    socket.on("swapResponseUpdate", ({ mySlot, theirSlot, status }) => {
      fetchEvents();
      toast.success(`Swap ${status.toLowerCase()}`);
    });

    return () => {
      socket.off("eventUpdated");
      socket.off("swapResponseUpdate");
    };
  }, []);

  const handleSelectSlot = (slotInfo) => {   // restrict event creation in past
    const now = new Date();
    const clickedDate = slotInfo.start;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(
      clickedDate.getFullYear(),
      clickedDate.getMonth(),
      clickedDate.getDate()
    );
    if (selectedDay < today) {
      toast.error("Cannot create events in the past");
      return;
    }

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
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="p-6">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        selectable
        view={currentView}
        onView={(view) => setCurrentView(view)}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        eventPropGetter={(event) => {
          let backgroundColor = "#2f79ba";
          if (event.status === "SWAPPABLE") backgroundColor = "#44d80e";
          if (event.status === "SWAP_PENDING") backgroundColor = "#e3bc10";
          return { style: { backgroundColor, color: "white" } };
        }}
      />

      {modalOpen && (
        <CalendarModal
          open={modalOpen}
          setOpen={handleCloseModal}
          date={selectedDate}
          onEventAdded={handleEventAdded}
          event={selectedEvent}
        />
      )}
    </div>
  );
}
