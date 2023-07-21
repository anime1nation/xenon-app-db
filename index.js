const express = require("express");
let app = express();
let http = require("http").Server(app);
let io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.get("/", function (req, res) {
  console.log("Server-running");
});

let users = {};

io.on("connection", function (socket) {
  console.log("user connected", socket.id);

  socket.on("join", (userId) => {
    users[userId] = socket.id;
  });

  socket.on("private_message", (data) => {
    const receiverSocketId = users[data.messageTo];
    const senderSocketId = users[data.messageBy];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("private_message", data);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("private_message", data);
    }
  });

  socket.on("disconnect", () => {
    const disconnectedUserId = Object.keys(users).find(
      (key) => users[key] === socket.id
    );
    if (disconnectedUserId) {
      delete users[disconnectedUserId];
      console.log("User disconnected:", socket.id);
    }
  });
});

http.listen(3001, function () {
  console.log("server running");
});
