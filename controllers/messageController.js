const asyncHandler = require("express-async-handler");
const Message = require("../models/Message.model");
const User = require("../models/Users.model");
const Chat = require("../models/Chat.model");

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

// @desc    Upload image
// @route   POST /api/upload-image
// @access  Protected
const uploadImage = asyncHandler(async (req, res) => {
  const { chatId, imageURL } = req.body;

  try {
    var newMessage = {
      sender: req.user._id,
      image: imageURL,
      chat: chatId,
    };

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

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
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

module.exports = { sendMessage, allMessages, uploadImage };
