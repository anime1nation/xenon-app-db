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

io.on("connection", function (socket) {
  console.log("user connected");
  socket.on("disconnect", function () {
    console.log("user left");
  });
});

http.listen(3001, function () {
  console.log("server running");
});
