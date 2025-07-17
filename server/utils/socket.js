const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();
const server = http.createServer(app);

const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

const io = new Server(server, {
  cors: {
    origin: [
      "https://mesdo.vercel.app",
      "https://mesdo-health-care-u5s9.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  }

  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on(
    "send-message",
    async ({ conversationId, sender, receiver, message, category }) => {
      const newMessage = await Message.create({
        conversationId,
        sender,
        receiver,
        message,
        category,
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message,
        lastMessageTime: new Date(),
      });

      io.to(conversationId).emit("receive-message", newMessage);
    }
  );

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });
});

module.exports = { io, app, server };
