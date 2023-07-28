const express = require("express");
const { MongoClient } = require("mongodb");
let app = express();
let http = require("http").Server(app);

const client = new MongoClient(
  "mongodb+srv://aankit8295:DJagXLVVaQuksRxx@cluster0.bcgvgzy.mongodb.net/?retryWrites=true&w=majority"
);

async function connectToDB() {
  try {
    const dbClient = await client.connect();
    console.log("Connected to MongoDB Atlas");
    const db = dbClient.db("data");
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

app.get("/", function (req, res) {
  console.log("Server-running");
});

let io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// let socketIds = {};
let users = [];

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  const db = await connectToDB();

  const messageCollection = db.collection("messages");

  socket.on("join", (roomsId) => {
    if (users.find((user) => user.socketId === socket.id)) {
      const user = users.find((user) => user.socketId === socket.id);
      if (user.roomId === roomsId) return;
      socket.leave(user.roomId);
      users = users.filter((user) => user.socketId !== socket.id);
      const updateUser = { socketId: socket.id, roomId: roomsId };
      users.push(updateUser);
      return socket.join(roomsId);
    } else {
      const newUser = { socketId: socket.id, roomId: roomsId };
      users.push(newUser);
      return socket.join(roomsId);
    }
  });

  socket.on("private_message", async (data) => {
    const userRoomId = users.filter(
      (user) =>
        user.roomId === [data.messageTo, data.messageBy].sort().join("-")
    );
    console.log(userRoomId);
    userRoomId.forEach((id) =>
      io.sockets.in(id.roomId).emit("recieve_message", data)
    );
    // const updateSender = {
    //   [`messages.${data.messageBy}`]: data,
    // };

    // const updateReciever = {
    //   [`messages.${data.messageTo}`]: data,
    // };

    // messageCollection.findOneAndUpdate(
    //   { userName: data.messageTo },
    //   { $push: updateSender }
    // );

    // messageCollection.findOneAndUpdate(
    //   { userName: data.messageBy },
    //   { $push: updateReciever }
    // );
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
    console.log("A user disconnected", socket.id);
  });
});

http.listen(3001, function () {
  console.log("server running");
});
