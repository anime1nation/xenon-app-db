const express = require("express");
// const { MongoClient, ObjectId } = require("mongodb");
let app = express();
let http = require("http").Server(app);

// const client = new MongoClient(
//   "mongodb+srv://aankit8295:DJagXLVVaQuksRxx@cluster0.bcgvgzy.mongodb.net/?retryWrites=true&w=majority"
// );

// async function connectToDB() {
//   try {
//     const dbClient = await client.connect();
//     console.log("Connected to MongoDB Atlas");
//     const db = dbClient.db("data");
//     return db;
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//   }
// }
app.get("/", function (req, res) {
  console.log("Server-running");
});

let io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = {};

io.on("connection", async function (socket) {
  console.log("user connected", socket.id);

  // const db = await connectToDB();

  // const defaultMessages = await db
  //   .collection("messages")
  //   .findOne({ _id: new ObjectId("64bab88a0ff59d6e048ba043") });

  socket.on("join", (userId) => {
    users[userId] = socket.id;
  });

  socket.on("private_message", async (data) => {
    const receiverSocketId = users[data.messageTo];
    const senderSocketId = users[data.messageBy];
    if (receiverSocketId) {
      // const updateQuery = {
      //   [`messages.${encryptEmail}`]: [],
      // };

      // await db
      //   .collection("messages")
      //   .findOneAndUpdate(
      //     { _id: new ObjectId("64bab88a0ff59d6e048ba043") },
      //     { $set: updateQuery }
      //   );
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
