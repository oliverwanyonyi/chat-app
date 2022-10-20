import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import { errorHandler, notFound } from "./middlewares/error.js";
import mongoose from "mongoose";

const app = express();

// middlewares

dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// endpoints

app.use("/api/users", userRoutes);
app.use("/api/message", messageRoutes);

// error handling

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`server connetced on port ${port}`);
  dbConnectoion();
});

async function dbConnectoion() {
  const connected = await mongoose.connect(process.env.MONGO_URI);
  console.log(`mongodb Connected on host ${connected.connection.host}`);
}
// origin: "https://talktoo.netlify.app",
// origin: "http://localhost:3000",

const io = new Server(server, {
  cors: {
    origin: "https://talktoo.netlify.app",
  },
});
let users = new Map();
io.on("connection", (socket) => {
  console.log("user conneted");
  socket.on("join", (data) => {
    console.log("joined");
    users.set(data.userId, { ...data, socketId: socket.id });
    let newUsers = [];
    for (const user of users) {
      newUsers.push(user[1]);
    }
    io.emit("newUsers", newUsers);

    socket.on("typing", (data) => {
      let receiver = users.get(data.to).socketId;
      console.log("from" + data.from, "receiver" + receiver);
      socket
        .to(receiver)
        .emit("user-typing", { text: data.text, from: data.from });
    });
    socket.on("typing-stopped", (data) => {
      let receiver = users.get(data.to).socketId;
      socket.to(receiver).emit("stopped-typing");
    });
    socket.on("message-sent", (data) => {
      let receiver = users.get(data.to).socketId;
      if (receiver) {
        socket.to(receiver).emit("message-received", {
          message: {
            message: data.message,
            fromSelf: false,
            from: data.from,
          },
        });
        socket.to(receiver).emit("new-notification", {
          text: `new unread message from ${users.get(data.from).username}`,
          from: data.from,
          count: 1,
        });
      }
    });
  });

  socket.on("disconnect", () => {
    let newUsers = [];
    for (const user of users) {
      newUsers.push(user[1]);
    }

    const userIndex = newUsers.findIndex((user) => user.socketId === socket.id);
    if (userIndex !== -1) {
      newUsers[userIndex].online = false;
      io.emit("newUsers", newUsers);

      socket.disconnect();
    }
  });
});
