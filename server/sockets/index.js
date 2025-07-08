const Notification = require("../models/Notification");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    // Join room for a user
    // socket.on("join", (userId) => {
    //   socket.join(userId); // user-specific room
    //   console.log(`User ${userId} joined room`);
    // });

    // // Emit notification
    // socket.on("send-notification", async ({ recipientId, type, fromUser, fromName }) => {
    //   const newNotification = new Notification({
    //     recipient: recipientId,
    //     type,
    //     data: { fromUser, fromName }
    //   });
    //   await newNotification.save();

    //   io.to(recipientId).emit("new-notification", {
    //     _id: newNotification._id,
    //     type,
    //     data: { fromUser, fromName },
    //     createdAt: newNotification.createdAt
    //   });
    // });

    // socket.on("disconnect", () => {
    //   console.log("Client disconnected");
    // });
  });
};
