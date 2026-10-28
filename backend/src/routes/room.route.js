import { Router } from "express";
import mongoose from "mongoose";
import protect from "../middleware/auth.middleware.js";
import Room from "../models/Room.js";
import Message from "../models/Message.js";

const router = Router();
router.use(protect);

router.get("/", async (_req, res) => {
  const rooms = await Room.find().sort({ name: 1 }).select("name");
  res.json(rooms);
});

router.post("/", async (req, res) => {
  const name = (req.body.name || "").trim();
  if (!name) return res.status(400).json({ error: "Room name is required" });
  try {
    const room = await Room.create({ name, createdBy: req.user.id });
    res.status(201).json({ _id: String(room._id), name: room.name });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "A room with that name already exists" });
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/:id/messages", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid room" });
  const messages = await Message.find({ room: req.params.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json(messages.reverse());
});

export default router;
