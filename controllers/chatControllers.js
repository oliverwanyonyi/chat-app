import Chat from "../models/Chat.js";

export const createChat = async (req, res, next) => {
  try {
    // a chat exists if it's not a group chat and all the  users already in that chat
    const chatExists = await Chat.findOne({
      isGroup:false,$and:
     [ {users: { $elemMatch: { $eq: req.query.from } }},
      {users: { $elemMatch: { $eq: req.query.to } }}]
    })
      .populate("users", ["username", "email", "avatar", "bio", "createdAt"])
      .sort({ updatedAt: -1 });
    console.log(chatExists)

    if (chatExists) {
      
      res.status(200).json(chatExists);
    } else {
      const chat = await Chat.create({
        creator: req.query.from,
        users: [req.query.from, req.query.to],
        isGroup:false,
        groupAvatar:null,
      });
      const newChat = await Chat.findById(chat._id)
        .populate("users", ["username", "email", "avatar", "bio", "createdAt"])
        .sort({ updatedAt: -1 });
        console.log(newChat)
      res.status(201).json(newChat);
    }
  } catch (error) {
    next(error);
  }
};

export const getUserChats = async (req, res, next) => {
  try {
    const userchats = await Chat.find({users:{$elemMatch:{$eq:req.params.id}}})
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

export const createGroup = async (req, res, next) => {
  const admin = req.params.admin;
  const users = req.body.users;
  const groupName = req.body.groupName;
  const avatar = req.body.avatar;

  console.log(admin);
  try {
      const newGroup = await Chat.create({
        isGroup: true,
        groupAdmin: admin,
        users: [admin, ...users],
        name: groupName,
        groupAvatar:avatar
      });
      const group = await Chat.findById(newGroup._id).populate("users", ["username", "email", "avatar", "bio", "createdAt"])
      res.status(201).json(group)
  } catch (error) {
    next(error);
  }
};
