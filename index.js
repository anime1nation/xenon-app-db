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

let users = {};

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  const db = await connectToDB();

  const messageCollection = db.collection("messages");

  socket.on("join", (userId) => {
    users[userId] = socket.id;
  });

  socket.on("private_message", async (data) => {
    const updateSender = {
      [`messages.${data.messageBy}`]: data,
    };

    const updateReciever = {
      [`messages.${data.messageTo}`]: data,
    };

    messageCollection.findOneAndUpdate(
      { userName: data.messageTo },
      { $push: updateSender }
    );

    messageCollection.findOneAndUpdate(
      { userName: data.messageBy },
      { $push: updateReciever }
    );

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
