import express from "express";
import SwapRequest from "../models/SwapRequest.js";
import { protect } from "../middleware/authMiddleware.js";
import { notifyUser } from "../server.js";
import Event from "../models/Event.js";

const router = express.Router();

// --- Incoming Requests ---
router.get("/incoming", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const requests = await SwapRequest.find({ receiverId: userId, status: "PENDING" })
      .populate("mySlotId theirSlotId")
      .populate("requesterId", "name")
      .populate("receiverId", "name"); 

    const formatted = requests.map(req => ({
      ...req._doc,
      mySlot: req.mySlotId,
      theirSlot: req.theirSlotId,
      requesterName: req.requesterId?.name,
      receiverName: req.receiverId?.name,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
});
router.get("/outgoing", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const requests = await SwapRequest.find({ requesterId: userId, status: "PENDING"  })
      .populate("mySlotId theirSlotId")
      .populate("requesterId", "name")
      .populate("receiverId", "name");

    const formatted = requests.map(req => ({
      ...req._doc,
      mySlot: req.mySlotId,
      theirSlot: req.theirSlotId,
      requesterName: req.requesterId?.name,
      receiverName: req.receiverId?.name,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

router.post("/swap-response/:requestId", protect, async (req, res, next) => {
  try {
    const { accepted } = req.body;
    const { requestId } = req.params;

    const request = await SwapRequest.findById(requestId)
      .populate("mySlotId theirSlotId")
      .populate("requesterId", "name")
      .populate("receiverId", "name");

    if (!request) return res.status(404).json({ message: "Request not found" });

    if (accepted) {
      const tempUserId = request.mySlotId.userId;
      request.mySlotId.userId = request.theirSlotId.userId;
      request.theirSlotId.userId = tempUserId;

      request.mySlotId.status = "BUSY";
      request.theirSlotId.status = "BUSY";

      await request.mySlotId.save();
      await request.theirSlotId.save();

      request.status = "ACCEPTED";
    } else {
      request.mySlotId.status = "SWAPPABLE";
      request.theirSlotId.status = "SWAPPABLE";

      await request.mySlotId.save();
      await request.theirSlotId.save();

      request.status = "REJECTED";
    }

    await request.save();

    const updatedMySlot = await Event.findById(request.mySlotId._id);
    const updatedTheirSlot = await Event.findById(request.theirSlotId._id);

    // Notify requester
    notifyUser(request.requesterId._id.toString(), "swapResponseUpdate", {
      mySlot: updatedMySlot,
      theirSlot: updatedTheirSlot,
      status: request.status,
    });

    // Notify receiver
    notifyUser(request.receiverId._id.toString(), "swapResponseUpdate", {
      mySlot: updatedMySlot,
      theirSlot: updatedTheirSlot,
      status: request.status,
    });

    res.json({
      ...request._doc,
      mySlot: request.mySlotId,
      theirSlot: request.theirSlotId,
      requesterName: request.requesterId?.name,
      receiverName: request.receiverId?.name,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/history", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const requests = await SwapRequest.find({
      $and: [
        { status: { $in: ["ACCEPTED", "REJECTED"] } },
        { $or: [{ requesterId: userId }, { receiverId: userId }] },
      ],
    })
      .populate("mySlotId theirSlotId")
      .populate("requesterId", "name")
      .populate("receiverId", "name");

    const formatted = requests.map(req => ({
      ...req._doc,
      mySlot: req.mySlotId,
      theirSlot: req.theirSlotId,
      requesterName: req.requesterId?.name,
      receiverName: req.receiverId?.name,
      type: req.requesterId.equals(userId) ? "sent" : "received",
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

export default router;
