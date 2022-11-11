import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const register = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      res.status(400)
      throw new Error("User with that email already exists")   
    }
    let user = await User.create({ ...req.body, password: hashedPassword });
    if (user) {
      res.status(201).json({
        user: {
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          id: user._id,
          createdAt: user.createdAt,
        },
        success: true,
      });
    } else {
      res.status(400)
      throw new Error("registration was unsuccesful")
    }
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user =
      (await User.findOne({ username: req.body.emailOrName })) ||
      (await User.findOne({ email: req.body.emailOrName }));

    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      res.status(200).json({
        user: {
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          id: user._id,
          createdAt: user.createdAt,
        },
        success: true,
      });
    } else {
      res.status(400);
      throw new Error("Invalid Email Or Password");
    }
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
 
  const bio = req.body.bio;
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (user) {
      user.bio = bio 
      user.username = req.body.username;
      user.email=req.body.email
      req.body.avatar
        ? (user.avatar = req.body.avatar)
        : (user.avatar = user.avatar);
      const updatedUser = await user.save();
      res.json({
        success: true,
        user: {
          bio: updatedUser.bio,
          avatar: updatedUser.avatar,
          username:updatedUser.username,
          email:updatedUser.email
        },
      });
    } else {
      res.status(400)
      throw new Error("Invalid UserId");
    }
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req, res) => {
  const searchTerm = req.query.search
    ? {
        username: {
          $regex: req.query.search,
          $options: "i",
        },
        _id: { $ne: req.params.id },
      }
    : {};
  const users = await User.find(searchTerm).select('-password');
  if (users) {
    res.status(200).json({
      users
    });
  } else {
    res.status(404).json({
      success: false,
      message: "user not found",
    });
  }
};

export const saveNotif = async (req, res, next) => {
  try {
    const { notif } = req.body;
    for(const userId of notif.to){
        
    const user = await User.findById(userId);

    let notifications = user.notifications;
    let exists = notifications.findIndex(
      (n) => n.chatId.toString() === notif.chatId
    );
    if (exists !== -1) {
      notifications[exists].count += 1;
      notifications[exists].createdAt = Date.now();
      user.notifications = notifications;
    } else {
      user.notifications.unshift({ ...notif, createdAt: Date.now() });
    }
     await user.save();
  }
  } catch (error) {
    next(error);
  }
};

export const clearReadNotifs = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);
    if (user) {
      let notifications = user.notifications;
      notifications = notifications.filter(
        (notif) => notif.chatId.toString() !== req.body.chatId
      );
      user.notifications = notifications;
      await user.save();
    }
  } catch (error) {
    next(error);
  }
};

export const getNotifs = async (req, res, next) => {
  const user = await User.findById(req.query.userId);

  if (user) {
    res.status(200).json(user.notifications);
  } else {
    res.status(400).json({
      message: "user with the id" + req.query.userId + "not found",
    });
  }
};
