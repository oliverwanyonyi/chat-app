import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    creator:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
    },
    name: {
      type: String,
      required: true,
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: {
      text:{type:String},time:{type:Date,default:Date.now}
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
