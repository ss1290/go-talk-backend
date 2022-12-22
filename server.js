import express from "express";
import { Server } from "socket.io";
import { chats } from "./data/data.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import colors from "colors";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
dotenv.config();
connectDB();

app.use(express.json());
app.use(cors());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);


// deployment

app.get("/", (req, res) => {
  res.send("API is running successfully");
});


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server listening on port ${PORT}`.yellow.bold)
);

const users = {};
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    orgin: "https://resplendent-crumble-b58d24.netlify.app",
  },
});

//socket.emit Creates events to send data
// socket.on listens for specific events to collect data
// socket.send Sends events of the name message
//You can call the join method on the socket to subscribe the socket to a given channel/room
io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);

    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users is not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
    socket.off("setup", () => {
      console.log("User Disconnected");
      socket.leave(userData._id);
    });
  });
});
