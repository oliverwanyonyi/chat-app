import Message from "../models/Message.js";

export const createMessage = async (req, res, next) => {
  
  try {
    const { from, to, message } = req.body;
    const createdMessage = await Message.create({
    text: message,
      users: [from, to],
      sender: from,
    });
    if (createdMessage) {
      return res.json({
        message: "Message stored in database",
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

export const getMessages = async (req,res,next) => {
    
  try {
    const { from, to } = req.query;
  
    let messages = await Message.find({users:{$all:[from,to]}}).sort({ updatedAt: 1 });
    
     
    messages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.text,
      };
    });
   
    return res.status(200).json(messages);
  } catch (err) {
    console.log(err)
  }
};