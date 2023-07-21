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
let messages = [];
let users = {};

io.on("connection", function (socket) {
  console.log("user connected", socket.id);

  socket.on("join", (userId) => {
    users[userId] = socket.id;
    console.log(users);
  });

  socket.on("private_message", (data) => {
    console.log(data.messageTo);
    console.log(users[data.messageTo]);
    const receiverSocketId = users[data.messageTo];
    const senderSocketId = users[data.messageBy];
    messages.push(data);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("private_message", messages);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("private_message", messages);
    }
  });

  socket.on("disconnect", () => {
    const disconnectedUserId = Object.keys(users).find(
      (key) => users[key] === socket.id
    );
    if (disconnectedUserId) {
      messages = [];
      delete users[disconnectedUserId];
      console.log("User disconnected:", socket.id);
    }
  });
});

http.listen(3001, function () {
  console.log("server running");
});
