import express from "express";
import Event from "../models/Event.js";
import { verifyToken } from "../middleware/auth.js";
import { notifyUser } from "../server.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res, next) => {
  try {
    const events = await Event.find({ userId: req.user.id });
    res.json(events);
  } catch (err) {
    next(err);
  }
});

router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { title, startTime, endTime } = req.body;
    const event = new Event({ title, startTime, endTime, userId: req.user.id });
    await event.save();
    res.json(event);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.userId.equals(req.user.id))
      return res.status(403).json({ message: "Forbidden" });

    Object.assign(event, req.body);
    await event.save();

    if (event.status === "SWAPPABLE") {
      notifyUser(null, "newSwappableSlot", { slot: event });
    }

    notifyUser(event.userId, "eventUpdated", event);

    res.json(event);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!event.userId.equals(req.user.id))
      return res.status(403).json({ message: "Forbidden" });

    await event.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
