const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  allMessages,
  uploadImage,
} = require("../controllers/messageController");

const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/upload-image").post(protect, uploadImage);
router.route("/:chatId").get(protect, allMessages);

module.exports = router;
