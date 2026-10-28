import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Message from "./models/Message.js";
import Room from "./models/Room.js";

export default function setupSocket(io) {
  io.use((socket, next) => {
    try {
      socket.user = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (roomId) => {
      const room = String(roomId);
      socket.join(room);
      socket.to(room).emit("userJoined", { roomId: room, username: socket.user.username });
    });

    socket.on("leaveRoom", (roomId) => {
      const room = String(roomId);
      socket.leave(room);
      socket.to(room).emit("userLeft", { roomId: room, username: socket.user.username });
    });

    socket.on("sendMessage", async ({ roomId, text }) => {
      const room = String(roomId);
      const clean = String(text || "").trim().slice(0, 2000);
      if (!clean || !socket.rooms.has(room) || !mongoose.isValidObjectId(room)) return;
      try {
        const exists = await Room.exists({ _id: room });
        if (!exists) return;
        const msg = await Message.create({
          room,
          user: socket.user.id,
          username: socket.user.username,
          text: clean,
        });
        io.to(room).emit("newMessage", {
          _id: String(msg._id),
          room,
          user: socket.user.id,
          username: socket.user.username,
          text: clean,
          createdAt: msg.createdAt.toISOString(),
        });
      } catch {
        socket.emit("messageError", "Message could not be sent");
      }
    });
  });
}
