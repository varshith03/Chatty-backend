const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const cors = require("cors");

dotenv.config();
connectDB();
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json()); //to accept json data

// express js api
app.get("/", (req, res) => {
  res.send("api is running");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server Started on PORT ${PORT}`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("connected socket io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (roomID) => {
    socket.join(roomID);
    console.log("User Joined room: " + roomID);
  });

  socket.on("typing", (roomID) => socket.in(roomID).emit("typing"));
  socket.on("stop typing", (roomID) => socket.in(roomID).emit("stop typing"));

  // socket.on("new message", (newMessageReceived) => {
  //   var chat = newMessageReceived.chat;

  //   if (!chat.users) return;

  //   chat.users.forEach((user) => {
  //     if (user._id == newMessageReceived.sender._id) return;

  //     socket.in(user._id).emit("message received", newMessageReceived);
  //   });
  // });

  socket.on("new message", (messageData) => {
    const { sender, content, image, chat } = messageData;

    // Emit the message to the appropriate group or user
    if (chat.isGroupChat) {
      // Emit message to all sockets in the chat except the sender's socket
      const senderID = sender._id;
      chat.users.forEach((user) => {
        if (user._id !== senderID) {
          socket.to(user._id).emit("message received", {
            sender,
            content,
            image,
            chat,
          });
        }
      });
    } else {
      // For one-on-one chat, emit message to the receiver only
      const receiverID = chat.users.find(
        (user) => user._id !== sender._id
      )?._id;
      if (receiverID) {
        socket.to(receiverID).emit("message received", {
          sender,
          content,
          image,
          chat,
        });
      }
    }
  });

  socket.off("setup", (userData) => {
    console.log("user disconnected");
    socket.leave(userData._id);
    socket.disconnect();
  });
});
