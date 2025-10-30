import express from "express";
import Event from "../models/Event.js";
import SwapRequest from "../models/SwapRequest.js";
import { verifyToken } from "../middleware/auth.js";
import { notifyUser } from "../server.js";

const router = express.Router();

router.get("/swappable-slots", verifyToken, async (req, res, next) => {
  try {
    const slots = await Event.find({
      status: "SWAPPABLE",
      userId: { $ne: req.user.id },
    });
    res.json(slots);
  } catch (err) {
    next(err);
  }
});

router.post("/swap-request", verifyToken, async (req, res, next) => {
  try {
    const { mySlotId, theirSlotId } = req.body;

    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(theirSlotId);

    if (!mySlot || !theirSlot)
      return res.status(404).json({ message: "One or both slots not found" });

    if (mySlot.status !== "SWAPPABLE" || theirSlot.status !== "SWAPPABLE")
      return res.status(400).json({ message: "Slots not swappable" });

    const swapRequest = await SwapRequest.create({
      requesterId: req.user.id,
      receiverId: theirSlot.userId,
      mySlotId,
      theirSlotId,
      status: "PENDING"
    });

    mySlot.status = "SWAP_PENDING";
    theirSlot.status = "SWAP_PENDING";
    await mySlot.save();
    await theirSlot.save();

    notifyUser(theirSlot.userId, "newSwapRequest", {
      message: "You have a new swap request!",
      request: swapRequest,
    });

    res.json(swapRequest);
  } catch (err) {
    next(err);
  }
});

export default router;
