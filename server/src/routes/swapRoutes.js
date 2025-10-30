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

    const swapRequest = new SwapRequest({
      requesterId: req.user.id,
      receiverId: theirSlot.userId,
      mySlotId,
      theirSlotId,
    });

    await swapRequest.save();

    mySlot.status = "SWAP_PENDING";
    theirSlot.status = "SWAP_PENDING";
    await mySlot.save();
    await theirSlot.save();

    notifyUser(theirSlot.userId, "swapRequest", {
      message: "You have a new swap request!",
      request: swapRequest,
    });

    res.json(swapRequest);
  } catch (err) {
    next(err);
  }
});

router.post("/swap-response/:requestId", verifyToken, async (req, res, next) => {
  try {
    const { accepted } = req.body;

    const swapRequest = await SwapRequest.findById(req.params.requestId);
    if (!swapRequest) return res.status(404).json({ message: "Request not found" });

    if (!swapRequest.receiverId.equals(req.user.id))
      return res.status(403).json({ message: "Forbidden" });

    const mySlot = await Event.findById(swapRequest.mySlotId);
    const theirSlot = await Event.findById(swapRequest.theirSlotId);

    if (!accepted) {
      swapRequest.status = "REJECTED";
      await swapRequest.save();

      await Event.updateMany(
        { _id: { $in: [swapRequest.mySlotId, swapRequest.theirSlotId] } },
        { status: "SWAPPABLE" }
      );

      notifyUser(swapRequest.requesterId, "responseUpdate", {
        message: "Your swap request was rejected.",
        requestId: swapRequest._id,
        status: "REJECTED",
      });

      return res.json(swapRequest);
    }

    // Swap users
    const tempUserId = mySlot.userId;
    mySlot.userId = theirSlot.userId;
    theirSlot.userId = tempUserId;

    mySlot.status = "BUSY";
    theirSlot.status = "BUSY";

    await mySlot.save();
    await theirSlot.save();

    swapRequest.status = "ACCEPTED";
    await swapRequest.save();

    notifyUser(swapRequest.requesterId, "responseUpdate", {
      message: "Your swap request was accepted!",
      requestId: swapRequest._id,
      status: "ACCEPTED",
    });

    res.json(swapRequest);
  } catch (err) {
    next(err);
  }
});

export default router;
