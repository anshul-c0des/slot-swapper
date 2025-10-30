import express from "express";
import SwapRequest from "../models/SwapRequest.js";
import { protect } from "../middleware/authMiddleware.js";
import { notifyUser } from "../server.js";

const router = express.Router();

router.get("/incoming", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const requests = await SwapRequest.find({ receiverId: userId }).populate(
      "mySlotId theirSlotId"
    );
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

router.get("/outgoing", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const requests = await SwapRequest.find({ requesterId: userId }).populate(
      "mySlotId theirSlotId"
    );
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

router.post("/swap-response/:requestId", protect, async (req, res, next) => {
  try {
    const { accepted } = req.body;
    const { requestId } = req.params;

    const request = await SwapRequest.findById(requestId).populate(
      "mySlotId theirSlotId"
    );
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (accepted) {
      // Swap ownership
      const tempUserId = request.mySlotId.userId;
      request.mySlotId.userId = request.theirSlotId.userId;
      request.theirSlotId.userId = tempUserId;

      request.mySlotId.status = "BUSY";
      request.theirSlotId.status = "BUSY";

      await request.mySlotId.save();
      await request.theirSlotId.save();

      request.status = "ACCEPTED";
    } else {
      // Reset slots to SWAPPABLE
      request.mySlotId.status = "SWAPPABLE";
      request.theirSlotId.status = "SWAPPABLE";

      await request.mySlotId.save();
      await request.theirSlotId.save();

      request.status = "REJECTED";
    }

    await request.save();

    notifyUser(request.requesterId, "swapResponseUpdate", {
      mySlotId: request.mySlotId._id,
      theirSlotId: request.theirSlotId._id,
      status: request.status,
    });

    res.json(request);
  } catch (err) {
    next(err);
  }
});

export default router;
