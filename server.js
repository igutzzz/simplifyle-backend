import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("message", (message) => {
    console.log(message);
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("join", (data) => {
    console.log(data);
    socket.broadcast.emit("join", data);
  });

  socket.on("send", (data) => {
    console.log(data);
    socket.broadcast.emit("recieved", data);
  });
});

server.listen(PORT, () => {
  console.log(`server running at port ${PORT}`);
});
