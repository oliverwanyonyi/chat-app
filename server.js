import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

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
app.use("/api/chat", chatRoutes);

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
    origin: "https://talktoo.netlify.app"
  },
});
let users = new Map();
io.on("connection", (socket) => {
  console.log("user conneted");
  socket.on("join", (data) => {
    // console.log("joined");
    users.set(data.userId, { ...data, socketId: socket.id });

    let newUsers = [];
    for (const user of users) {
      newUsers.push(user[1]);
    }

    io.emit("newUsers", newUsers);

    socket.on("typing", (data) => {
      if (data.groupTyping) {
        const receivers = [];
        for (const id of data.to) {
          if (users.get(id)) {
            receivers.push(users.get(id).socketId);
          }
        }
        receivers.map((receiver) =>
          socket.to(receiver).emit("user-typing", {
            text: data.text,
            from: data.from,
            chatId: data.chatId,
          })
        );
      } else {
        let receiver = users.get(data.to);
        if (receiver) {
          socket.to(receiver.socketId).emit("user-typing", {
            text: data.text,
            from: data.from,
            chatId: data.chatId,
          });
        }
      }
    });
    socket.on("typing-stopped", (data) => {
      if (data.groupTyping) {
        const receivers = [];

        for (const id of data.to) {
         
          if (users.get(id)) {
            receivers.push(users.get(id).socketId);
          }
        }
        receivers.map((receiver) =>
          socket.to(receiver).emit("stopped-typing", { from: data.from })
        );
      } else {
        let receiver = users.get(data.to);
        if (receiver) {
          socket
            .to(receiver.socketId)
            .emit("stopped-typing", { from:data.from });
        }
      }
    });
    socket.on("message-sent", (data) => {
      if (data.groupMessage) {
        const receivers = [];

        for (const id of data.to) {
          if (users.get(id)) {
            receivers.push(users.get(id).socketId);
          }
        }

        receivers.map((receiver) =>{
          socket.to(receiver).emit("message-received", {
            message: {
              message:data.message,
              fromSelf: false,
              sender:data.sender,
              updatedAt: data.updatedAt,
              chatId: data.chatId,
            },
          })
          socket.to(receiver).emit("new-notification", {
            chatId: data.chatId,
            text: `new unread message from ${users.get(data.sender).username}`,
            count: 1,
            to: data.to,
            createdAt: new Date(),
          });
        }
        );
      } else {
        let receiver = users.get(data.to);

        if (receiver) {
          socket.to(receiver.socketId).emit("message-received", {
            message: {
              message: data.message,
              fromSelf: false,
              updatedAt: data.updatedAt,
              chatId: data.chatId,
            },
          });

          socket.to(receiver.socketId).emit("new-notification", {
            chatId: data.chatId,
            text: `new unread message from ${users.get(data.sender).username}`,
            count: 1,
            to: data.to,
            createdAt: new Date(),
          });
        }
      }
    });
    socket.on('group-created',(data)=>{
      console.log(data)
      const activeMembers = [];

      for (const id of data.chat.members){
        if(users.get(id)){
          activeMembers.push(users.get(id).socketId)
        }
      }
      activeMembers.map(member=>socket.to(member).emit('new-group',data))
    })
  });
  socket.on('user-removed',(data)=>{
    console.log(data)
    const activeMembers = [];

      for (const id of data.users){
        if(users.get(id)){
          activeMembers.push(users.get(id).socketId)
        }
      }

      activeMembers.map(m=> socket.to(m).emit('removed',data))
   
  })
  socket.on("disconnect", () => {
    let newUsers = [];
    for (const user of users) {
      newUsers.push(user[1]);
    }

    newUsers = newUsers.filter((user) => user.socketId !== socket.id);

    io.emit("newUsers", newUsers);

    socket.disconnect();
  });
});
