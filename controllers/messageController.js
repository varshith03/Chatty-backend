const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/usersModel");
const Chat = require("../models/chatModel");

// @desc    send message
// @route   POST /api/messages
// @access  Protected

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (content === "" || !chatId) return res.status(400);

  var newMessage = { sender: req.user._id, content: content, chat: chatId };
  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name profile_pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "profile_pic name email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email profile_pic")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, allMessages };
