import Chat from "../models/Chat.js";

export const createChat = async (req, res, next) => {
  try {
    const chatExists = await Chat.findOne({
      users: { $all: [req.query.from, req.query.to] },
    })
      .populate("users", ["username", "email", "avatar", "bio", "createdAt"])
      .sort({ updatedAt: -1 });
    if (chatExists) {
      console.log("exists");
      res.status(200).json(chatExists);
    } else {
      const chat = await Chat.create({
        creator: req.query.from,
        name: req.body.name,
        users: [req.query.from, req.query.to],
      });
      const newChat = await Chat
        .populate("users", ["username", "email", "avatar", "bio", "createdAt"])
        .sort({ updatedAt: -1 });
      res.json(newChat);
    }
  } catch (error) {
    next(error);
  }
};

export const getUserChats = async (req, res, next) => {
  try {
    const userchats = await Chat.find({ users: { $in: [req.params.id] } })
      .populate("users", ["username", "email", "avatar", "bio", "createdAt"])
      .sort({ updatedAt: -1 });
    if (userchats) {
      res.status(200).json(userchats);
    } else {
      res.status(404).json({
        message: "No chat found",
      });
    }
  } catch (error) {
    next(error);
  }
};
