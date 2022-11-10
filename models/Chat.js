import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
 
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: {
      text: { type: String },
      time: { type: Date, default: Date.now },
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    },
    isGroup: {  type: Boolean, default: false },
    name: { type: String },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId,  },
    groupAvatar: {
      type: String,   
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
