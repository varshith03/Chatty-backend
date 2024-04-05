const socketIO = require("socket.io");
const dotenv = require("dotenv");

dotenv.config();

function initializeSocket(server) {
  const io = socketIO(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.CLIENT_URL,
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

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
}

module.exports = initializeSocket;
