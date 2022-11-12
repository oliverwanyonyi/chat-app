import Chat from "../models/Chat.js";

export const createChat = async (req, res, next) => {
  try {
    // a chat exists if it's not a group chat and all the  users are already in that chat
    const chatExists = await Chat.findOne({
      isGroup: false,
      $and: [
        { users: { $elemMatch: { $eq: req.query.from } } },
        { users: { $elemMatch: { $eq: req.query.to } } },
      ],
    })
      .populate("users", ["username", "email", "avatar", "bio", "createdAt"])
      .populate("lastMessage", ["text", "updatedAt"])

    if (chatExists) {
      res.status(200).json(chatExists);
    } else {
      const chat = await Chat.create({
        users: [req.query.from, req.query.to],
        isGroup: false,
        groupAvatar: null,
      });
      const newChat = await Chat.findById(chat._id)
        .populate("users", ["username", "email", "avatar", "bio", "createdAt"])
        .populate("lastMessage", ["text", "updatedAt"]);
      res.status(201).json(newChat);
    }
  } catch (error) {
    next(error);
  }
};

export const getUserChats = async (req, res, next) => {
  try {
    const userchats = await Chat.find({
      users: { $elemMatch: { $eq: req.params.id } },
    })
      .populate("users", ["username", "email", "avatar", "bio", "createdAt"])
      .populate("lastMessage", ["text", "updatedAt"])
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

  try {
    const newGroup = await Chat.create({
      isGroup: true,
      groupAdmin: admin,
      users: [admin, ...users],
      name: groupName,
      groupAvatar: avatar,
    });
    const group = await Chat.findById(newGroup._id)
      .populate("users", ["username", "email", "avatar", "bio", "createdAt"])
      .populate("lastMessage", ["text", "updatedAt"]);
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  const groupAdmin = req.params.admin;
  const users = [...req.body.users, groupAdmin];
  const group = await Chat.findById(req.body.groupId);
  if (group.groupAdmin.toString() === groupAdmin) {
    for (const user of users) {
      if (!group.users.includes(user)) {
        group.users.push(user);
      }
    }
    req.body.groupName ? (group.name = req.body.groupName) : group.name;
    req.body.avatar ? (group.groupAvatar = req.body.avatar) : group.groupAvatar;
    try {
      let updatedGroup = await group.save();
      updatedGroup = await Chat.findById(updatedGroup._id).populate("users", [
        "username",
        "email",
        "avatar",
        "bio",
        "createdAt",
      ]);
      res.status(201).json(updatedGroup);
    } catch (error) {
      console.log(error);
      next(error);
    }
  } else {
    res.status(403);
    next(new Error("Only admin can updated the group"));
  }
};

export const removeFromGroup = async (req, res, next) => {
  const userToRemove = req.body.userId;
  try {
    let groupToUpdate = await Chat.findById(req.body.groupId);

    if (!groupToUpdate) {
      res.status(404);
      throw new Error("Chat with that id not found");
    }
    if (groupToUpdate.groupAdmin.toString() !== req.params.admin) {
      res.status(403);
      throw new Error("Only admins can update tis group");
    }
    if (groupToUpdate.users.length === 2) {
      res.status(400);
      throw new Error("A group cannot have less than 2 members");
    } else {
      groupToUpdate.users = groupToUpdate.users.filter(
        (user) => user._id.toString() !== userToRemove
      );
      await groupToUpdate.save();
      const updatedGroup = await Chat.findById(groupToUpdate._id).populate(
        "users",
        ["username", "email", "avatar", "bio", "createdAt"]
      );

      res.status(201).json(updatedGroup);
    }
  } catch (error) {
    next(error);
  }
};

export const leaveGroup = async (req, res, next) => {
  const user = req.params.id;
  try {
    const group = await Chat.findById(req.body.chatId);
    group.users = group.users.filter((u) => u._id.toString() !== user);
    await group.save();
    const savedChat = await Chat.findById(group._id)
      .populate("users", ["username", "email", "avatar", "bio", "createdAt"])
      .populate("lastMessage", ["text", "updatedAt"]);
    res.status(201).json(savedChat);
  } catch (err) {
    next(err);
  }
};
