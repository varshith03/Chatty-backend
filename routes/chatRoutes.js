const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {accessChat,fetchChats, createGroupChat, renameGroup, addMemberToGroup, removeMemberFromGroup} = require("../controllers/chatController");
const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect,fetchChats);
router.route("/group").post(protect,createGroupChat);
router.route("/rename-group").put(protect,renameGroup);
router.route("/group-add").put(protect,addMemberToGroup);
router.route("/group-remove").put(protect,removeMemberFromGroup);

module.exports = router;
