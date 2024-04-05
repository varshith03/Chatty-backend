const jwt = require("jsonwebtoken");
const User = require("../models/Users.model.js");
const asyncHandler = require("express-async-handler");
const { model } = require("mongoose");

//checks wheather user is logged in or not
const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, tekon failed");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("You are not logged in!");
  }
});

module.exports = { protect };
