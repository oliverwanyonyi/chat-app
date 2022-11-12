import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

export const createMessage = async (req, res, next) => {
  try {
    const { from, chatId, message } = req.body;
    const createdMessage = await Message.create({
      text: message,
      sender: from,
      chatId,
    });
    if (createdMessage) {
      // console.log(createdMessage)
      const chat = await Chat.findById(chatId);
      chat.lastMessage = createdMessage._id;
      await chat.save();
    
      return res.json({
        message: createdMessage.text,
        updatedAt: createdMessage.updatedAt,
      });
    } else {
      return res.json({
        message: "something went wrong!",
      });
    }
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const { from } = req.query;
    let messages = await Message.find({ chatId }).sort({
      updatedAt: 1,
    });

    messages = messages.map((msg) => {
      return {
        sender: msg.sender,
        fromSelf: msg.sender.toString() === from.toString(),
        message: msg.text,
        updatedAt: msg.updatedAt,
      };
    });

    return res.status(200).json(messages);
  } catch (err) {
    console.log(err);
  }
};
